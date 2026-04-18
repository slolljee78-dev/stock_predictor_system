export type DashboardSignalFilter = "all" | "buy" | "sell";

export function buildSignalDashboardPath(filter: Exclude<DashboardSignalFilter, "all">) {
  return `/signals?type=${filter}`;
}

export function buildStockDetailPath(ticker: string) {
  return `/stock/${ticker}`;
}

export function getSignalFilterFromSearch(search: string): DashboardSignalFilter {
  const filter = new URLSearchParams(search).get("type");
  return filter === "buy" || filter === "sell" ? filter : "all";
}

export function scrollToDashboardSection(section: string) {
  if (typeof document === "undefined") {
    return false;
  }

  const target = document.querySelector(`[data-section="${section}"]`);
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}
