import type { ReactNode } from "react";
import { AlertCircle, CircleDashed, Inbox } from "lucide-react";

type StateTone = "empty" | "error" | "loading";

const stateIcon = {
  empty: Inbox,
  error: AlertCircle,
  loading: CircleDashed,
} as const;

export function AppStatePanel({
  tone = "empty",
  title,
  description,
  action,
  className = "",
}: {
  tone?: StateTone;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  const Icon = stateIcon[tone];

  return (
    <section className={`state-panel state-panel-${tone} ${className}`} aria-live={tone === "loading" ? "polite" : undefined}>
      <Icon className={`state-panel-icon ${tone === "loading" ? "animate-spin" : ""}`} aria-hidden="true" />
      <h2 className="state-panel-title">{title}</h2>
      <p className="state-panel-description">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
