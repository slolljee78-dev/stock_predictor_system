/**
 * Embeddable Live Signal Widget — /embed/signals
 *
 * A minimal, iframe-embeddable page showing the latest 5 signals.
 * Finance bloggers can embed this on their sites with a single <iframe> tag.
 * Includes a Vortextrade branding link that drives referral traffic.
 */

import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

export default function EmbedWidget() {
  const { data: signals, isLoading } = trpc.publicSignals.getToday.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // auto-refresh every 5 min
  });

  const top5 = signals?.slice(0, 5) ?? [];

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#0d1424",
        border: "1px solid rgba(100,116,139,0.3)",
        borderRadius: "12px",
        padding: "12px",
        minWidth: "280px",
        maxWidth: "400px",
        color: "#e2e8f0",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
          paddingBottom: "8px",
          borderBottom: "1px solid rgba(100,116,139,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Zap style={{ width: "14px", height: "14px", color: "#22d3ee" }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#22d3ee", letterSpacing: "0.05em" }}>
            LIVE SIGNALS
          </span>
        </div>
        <a
          href="https://vortextrade.manus.space"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "10px", color: "#64748b", textDecoration: "none" }}
        >
          by Vortextrade ↗
        </a>
      </div>

      {/* Signal rows */}
      {isLoading ? (
        <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b", fontSize: "12px" }}>
          Loading signals…
        </div>
      ) : top5.length === 0 ? (
        <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b", fontSize: "12px" }}>
          No signals yet today
        </div>
      ) : (
        top5.map((signal) => (
          <a
            key={signal.id}
            href={`https://vortextrade.manus.space/stocks/${signal.ticker}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 0",
              borderBottom: "1px solid rgba(100,116,139,0.12)",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(100,116,139,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#e2e8f0",
                  flexShrink: 0,
                }}
              >
                {signal.ticker.slice(0, 4)}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#f1f5f9" }}>
                  {signal.ticker}
                </div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>
                  {new Date(signal.createdAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: signal.confidenceScore >= 70 ? "#34d399" : "#94a3b8",
                }}
              >
                {signal.confidenceScore}%
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background:
                    signal.type === "buy"
                      ? "rgba(52,211,153,0.15)"
                      : "rgba(248,113,113,0.15)",
                  color: signal.type === "buy" ? "#34d399" : "#f87171",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                }}
              >
                {signal.type}
              </span>
            </div>
          </a>
        ))
      )}

      {/* Footer CTA */}
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <a
          href="https://vortextrade.manus.space/signals/today"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "11px",
            color: "#22d3ee",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          View all today's signals →
        </a>
      </div>
    </div>
  );
}
