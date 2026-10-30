# ArtefactAI · Tarefas

Gerenciador de tarefas (CRUD) com **Next.js 16** no frontend e **tRPC 11** no backend, em um monorepo de npm workspaces.

```
ArtefactAI/
├── .claude/        hooks globais do Claude Code (quality gate)
├── server/         backend tRPC (Node 26, TypeScript executado nativamente)
└── client/         frontend Next.js 16 (App Router, SSR, TanStack Query)
```

## Instalação

### 1. Pré-requisitos

| Ferramenta | Versão | Para quê |
|---|---|---|
| Node.js | 24 ou superior | O servidor roda `.ts` direto por type stripping, sem build. Em versões antigas ele não sobe |
| npm | o que vem com o Node | Workspaces e o lockfile único da raiz |
| PowerShell 7 (`pwsh`) | opcional | Só para os hooks do Claude Code em `.claude/` |

Confira com `node -v` (deve mostrar `v24` ou mais). Se usa [fnm](https://github.com/Schniz/fnm) ou nvm, rode `fnm install 24` e depois `fnm use 24` antes de continuar.

### 2. Dependências

Na **raiz** do repositório (nunca dentro de `client/` ou `server/`):

```bash
npm install
```

Um único `npm install` instala os dois workspaces e liga `@artefactai/server` ao `client/` por symlink. Rodar `npm install` dentro de um workspace cria um segundo lockfile e quebra esse vínculo.

### 3. Rodar em desenvolvimento

```bash
SEED_TASKS=30 npm run dev
```

No PowerShell: `$env:SEED_TASKS=30; npm run dev`.

O comando sobe o servidor tRPC em `:4000` e o Next.js em `:3000`, com logs prefixados por `server` e `client`. Abra <http://localhost:3000>.

`SEED_TASKS` é opcional e cria tarefas de exemplo para testar o infinite scroll. Sem ele, a lista começa vazia. Os dados ficam em memória e somem quando o servidor reinicia.

### 4. Conferir a instalação

```bash
npm test && npm run lint && npm run typecheck
```

Os três devem terminar sem erro. É o mesmo critério usado antes de cada commit.

### 5. Build de produção

```bash
npm run build
npm run start --workspace server
npm run start --workspace client
```

Rode os dois `start` em terminais separados. Se o servidor não estiver em `http://localhost:4000/trpc`, defina `TRPC_SERVER_URL` **antes** do `build`, porque o rewrite é gravado no build.

### Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| `SyntaxError` ou `ERR_UNKNOWN_FILE_EXTENSION` ao subir o servidor | Node anterior ao 24 | Atualize o Node (passo 1) |
| `EADDRINUSE :3000` ou `:4000` | Porta ocupada | Encerre o processo ou use `PORT=4001` no servidor e `TRPC_SERVER_URL` no client |
| A lista mostra "Não foi possível carregar as tarefas" | Servidor tRPC fora do ar | Use `npm run dev` na raiz, que sobe os dois |
| `Cannot find module '@artefactai/server'` | `npm install` rodado dentro de um workspace | Apague os `node_modules`, mantenha só o `package-lock.json` da raiz e rode `npm install` na raiz |

| Script (na raiz) | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor tRPC (`:4000`) e o Next.js (`:3000`) juntos |
| `npm test` | Testes dos dois workspaces (Vitest) |
| `npm run lint` / `npm run typecheck` | ESLint e `tsc` em ambos |
| `npm run build` | Build de produção do client |

| Variável | Padrão | Onde |
|---|---|---|
| `PORT` | `4000` | porta do servidor tRPC |
| `SEED_TASKS` | `0` | quantidade de tarefas de exemplo |
| `TRPC_SERVER_URL` | `http://localhost:4000/trpc` | URL do servidor vista pelo Next.js. É lida no build para o rewrite, então defina antes de `npm run build` |

## Como funciona

```
navegador ──/trpc──▶ Next.js (rewrite) ──▶ servidor tRPC ──▶ repositório em memória
                         │
server components ───────┴── chamada direta (SSR) ──┘
```

**Backend (`server/`).** Cada tarefa tem `id` (UUID gerado), `titulo` (obrigatório), `descricao` (opcional) e `dataCriacao`. O router `task` expõe `list`, `byId`, `create`, `update` e `delete`.
- **Validação:** com zod, nas bordas. Título vazio ou só com espaços é rejeitado com `BAD_REQUEST`, e o erro traz `fieldErrors` por campo.
- **Erros de negócio:** viram `TRPCError`, por exemplo `NOT_FOUND` com a mensagem "Tarefa {id} não encontrada.".
- **Persistência:** fica atrás da interface `TaskRepository`. A implementação atual é em memória (os dados somem ao reiniciar o servidor) e pode ser trocada por um banco sem mexer no router.

**Frontend (`client/`).**
- **Listagem (`/`):** renderizada no servidor a cada requisição. O server component pré-carrega a primeira página com `prefetchInfiniteQuery` e a hidrata na query infinita do cliente, então o HTML já chega com as tarefas.
- **Rolagem e exclusão:** as próximas páginas carregam quando o fim da lista entra na tela (`IntersectionObserver`). Um botão "Carregar mais" serve de alternativa. A exclusão é feita na própria lista, em dois cliques (excluir → confirmar), com mensagem de sucesso ou de erro.
- **Criação e edição (`/tasks/new`, `/tasks/[id]/edit`):** um formulário só (`TaskForm`), com `useState` e validação antes do envio. Ele mostra tanto os erros do frontend quanto os do backend, e desativa o botão enquanto salva. A edição pré-carrega a tarefa no servidor; id inexistente ou inválido dá 404.

## Decisões

- **Backend como workspace próprio:** o client importa só o *tipo* `AppRouter` (`import type`), então nenhum código do servidor vai para o bundle do navegador.
- **Rewrite em vez de CORS:** o navegador fala com o mesmo domínio do Next.js, e a URL do servidor não fica exposta ao cliente.
- **superjson:** `dataCriacao` chega ao cliente como `Date`, não como string.
- **Cursor pela chave de ordenação:** o cursor da paginação usa a chave de ordenação (`dataCriacao:id`), não um offset. Excluir tarefas durante a rolagem não pula nem repete itens.
- **Fuso fixo nas datas:** as datas são formatadas em `America/Sao_Paulo` para o HTML do SSR e o do navegador serem idênticos, sem erro de hidratação.
- **Limites duplicados no client:** os limites de validação (`client/src/lib/task-rules.ts`) repetem os do servidor de propósito, para dar feedback imediato. O servidor continua sendo a fonte da verdade.

## Qualidade

- **Testes do servidor:** cobrem o repositório (paginação, inclusive após exclusões) e o router com `createCaller` (CRUD, título obrigatório, `NOT_FOUND`).
- **Testes do client:** cobrem as regras de validação e o formulário (bloqueio sem título, estado de envio, erro do backend, falha de rede).
- **Hooks do Claude Code:** os hooks em `.claude/` verificam a complexidade ciclomática (≤ 10) dos arquivos editados ao fim de cada turno.
- **Identidade visual:** a identidade visual está em [`client/DESIGN.md`](client/DESIGN.md).
