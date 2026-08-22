export function isWatchlistRefreshing(states: boolean[]): boolean {
  return states.some(Boolean);
}

export function getWatchlistRefreshLabel(isRefreshing: boolean): string {
  return isRefreshing ? "Refreshing" : "Refresh";
}
