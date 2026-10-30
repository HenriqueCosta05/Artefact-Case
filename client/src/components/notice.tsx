export type NoticeTone = "success" | "error";

export type NoticeMessage = { tone: NoticeTone; text: string };

const toneStyles: Record<NoticeTone, string> = {
  success: "border-cobalt/30 bg-cobalt/5 text-navy-ink",
  error: "border-magenta-deep/40 bg-magenta-deep/5 text-magenta-ink",
};

// Errors interrupt screen readers (role="alert"); successes are announced politely.
export const Notice = ({ notice, onDismiss }: { notice: NoticeMessage; onDismiss?: () => void }) => (
  <div
    role={notice.tone === "error" ? "alert" : "status"}
    className={`flex items-start justify-between gap-4 rounded-card border px-4 py-3 text-sm ${toneStyles[notice.tone]}`}
  >
    <p>{notice.text}</p>
    {onDismiss && (
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 font-medium underline underline-offset-4 hover:text-magenta-deep"
      >
        Fechar
      </button>
    )}
  </div>
);
