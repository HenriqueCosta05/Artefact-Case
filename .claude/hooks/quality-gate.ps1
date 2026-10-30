# Quality gate do projeto: liga os scripts globais de ~/.claude/hooks aos eventos do Claude Code.
#   SessionStart -> cleanup-codebase (-NoChecks): baseline de git status e ferramentas.
#   PostToolUse  -> registra os arquivos editados na sessão (a complexidade por edição já roda no hook global).
#   Stop         -> check-complexity nos arquivos editados + setup-tests para os que estão sem teste.
param(
    [Parameter(Mandatory)]
    [ValidateSet("SessionStart", "PostToolUse", "Stop")]
    [string]$Event
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)

$GlobalHooks = Join-Path $env:USERPROFILE ".claude\hooks"
$GlobalPrompts = Join-Path $env:USERPROFILE ".claude\prompts"
$ProjectDir = if ($env:CLAUDE_PROJECT_DIR) { $env:CLAUDE_PROJECT_DIR } else { (Get-Location).Path }
$StateDir = Join-Path $ProjectDir ".claude\.quality-gate"
$SourcePattern = '\.(js|mjs|cjs|ts|tsx|mts|cts|java|kt|kts)$'
$TestPattern = '(\.(test|spec)\.[^.]+$)|((Test|Tests)\.(java|kt)$)'

$payload = [Console]::In.ReadToEnd() | ConvertFrom-Json
$sessionFile = Join-Path $StateDir "$($payload.session_id).edited"

function Write-Json($object) {
    $object | ConvertTo-Json -Compress -Depth 5 | Write-Output
}

# O hook roda com -NoProfile; o Node vem do fnm, que só entra no PATH pelo profile.
function Initialize-Node {
    if (Get-Command npx -ErrorAction SilentlyContinue) { return }
    if (Get-Command fnm -ErrorAction SilentlyContinue) {
        fnm env --shell powershell | Out-String | Invoke-Expression
        fnm use default *> $null
    }
}

# TODO(human): decidir se um arquivo-fonte já tem teste correspondente.
function Test-HasTest([string]$SourceFile) {
    return $true
}

function Invoke-SessionStart {
    $outDir = Join-Path $ProjectDir "reports\cleanup"
    & (Join-Path $GlobalHooks "cleanup-codebase\cleanup-codebase.ps1") $ProjectDir `
        -PromptFile (Join-Path $GlobalPrompts "cleanup-codebase.md") `
        -OutDir $outDir -NoChecks *> $null

    Write-Json @{
        hookSpecificOutput = @{
            hookEventName     = "SessionStart"
            additionalContext = "Quality gate ativo. Baseline em reports/cleanup/cleanup-report.txt; " +
                "preserve as alterações listadas ali. Para uma limpeza, siga reports/cleanup/cleanup-task.md."
        }
    }
}

function Invoke-PostToolUse {
    $file = $payload.tool_input.file_path
    if (-not $file -or $file -notmatch $SourcePattern) { return }

    New-Item -ItemType Directory -Force -Path $StateDir | Out-Null
    Add-Content -LiteralPath $sessionFile -Value $file -Encoding utf8
}

# O ESLint 9 resolve binário e eslint.config.* a partir do cwd, então cada arquivo roda no seu pacote (ex.: client/).
function Get-PackageRoot([string]$File) {
    $dir = Split-Path -Parent $File
    while ($dir) {
        if (Test-Path -LiteralPath (Join-Path $dir "package.json")) { return $dir }
        $dir = Split-Path -Parent $dir
    }
    return $ProjectDir
}

function Get-ComplexityViolations([string[]]$Files) {
    Initialize-Node
    $script = Join-Path $GlobalHooks "check-complexity\check-complexity.ps1"
    foreach ($file in $Files) {
        Push-Location (Get-PackageRoot $file)
        try { $output = & $script $file -MaxComplexity 10 *>&1 | Out-String }
        finally { Pop-Location }
        if ($LASTEXITCODE -ne 0 -and $output -match 'complexity of \d+|CyclomaticComplex') {
            "${file}:`n$output"
        }
    }
}

function New-TestPrompts([string[]]$Files) {
    $outDir = Join-Path $ProjectDir "generated-tests"
    $script = Join-Path $GlobalHooks "setup-tests\setup-tests.ps1"
    foreach ($file in $Files) {
        & $script $file -OutDir $outDir `
            -PromptFile (Join-Path $GlobalPrompts "generate-tests.md") *> $null
    }
    Join-Path $outDir "prompts"
}

function Invoke-Stop {
    # Segunda passada no mesmo turno: libera para não prender o Claude em loop.
    if ($payload.stop_hook_active) { return }
    if (-not (Test-Path -LiteralPath $sessionFile)) { return }

    $files = @(Get-Content -LiteralPath $sessionFile |
        Sort-Object -Unique |
        Where-Object { Test-Path -LiteralPath $_ })
    Remove-Item -LiteralPath $sessionFile -Force

    $sources = @($files | Where-Object { $_ -notmatch $TestPattern })
    $problems = [System.Collections.Generic.List[string]]::new()

    $violations = @(Get-ComplexityViolations $files)
    if ($violations.Count -gt 0) {
        $problems.Add("Complexidade ciclomática acima de 10:`n$($violations -join "`n")")
    }

    $untested = @($sources | Where-Object { -not (Test-HasTest $_) })
    if ($untested.Count -gt 0) {
        $promptDir = New-TestPrompts $untested
        $problems.Add("Arquivos sem teste:`n  $($untested -join "`n  ")`n" +
            "Prompts gerados em $promptDir. Siga cada um (regras de ~/.claude/prompts/generate-tests.md) " +
            "e rode os testes antes de concluir.")
    }

    if ($problems.Count -gt 0) {
        Write-Json @{ decision = "block"; reason = "Quality gate:`n$($problems -join "`n`n")" }
    }
}

switch ($Event) {
    "SessionStart" { Invoke-SessionStart }
    "PostToolUse" { Invoke-PostToolUse }
    "Stop" { Invoke-Stop }
}
exit 0
