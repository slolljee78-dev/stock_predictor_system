export type PreviewUsage = {
  previewed: number;
  total: number;
  percent: number;
  remainingLocked: number;
  label: string;
};

export type PlanComparisonRow = {
  label: string;
  free: string;
  paid: string;
};

export const LOCKED_FEATURE_PLAN_ROWS: PlanComparisonRow[] = [
  {
    label: "Signal detail",
    free: "Limited preview",
    paid: "Full live buy and sell rationale",
  },
  {
    label: "Watchlist coverage",
    free: "Preview a few active names",
    paid: "Full watchlist coverage",
  },
  {
    label: "Auto trading",
    free: "Locked",
    paid: "Automated paper-trading rounds",
  },
];

export function getPreviewUsage(total: number, previewLimit: number): PreviewUsage {
  const safeTotal = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  const safeLimit = Number.isFinite(previewLimit) && previewLimit > 0 ? Math.floor(previewLimit) : 0;
  const previewed = Math.min(safeTotal, safeLimit);
  const remainingLocked = Math.max(0, safeTotal - previewed);
  const percent = safeTotal > 0 ? Math.round((previewed / safeTotal) * 100) : 0;

  const label = safeTotal === 0
    ? "No premium preview in use yet"
    : `${previewed} of ${safeTotal} premium items previewed`;

  return {
    previewed,
    total: safeTotal,
    percent,
    remainingLocked,
    label,
  };
}

export function getBlurredPreviewText(text: string, fallback: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return fallback;
  }

  return trimmed;
}
