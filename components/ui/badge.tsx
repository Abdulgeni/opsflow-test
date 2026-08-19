type Tone = "positive" | "progress" | "warning" | "inactive" | "negative";

const TONE_CLASSES: Record<Tone, string> = {
  positive: "bg-status-positive-bg text-status-positive-text",
  progress: "bg-status-progress-bg text-status-progress-text",
  warning: "bg-status-warning-bg text-status-warning-text",
  inactive: "bg-status-inactive-bg text-status-inactive-text",
  negative: "bg-status-negative-bg text-status-negative-text",
};

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}