export const DASHBOARD_HOME_PATH = "/dashboard";
export const DASHBOARD_MENU_PATH = "/dashboard";
const DASHBOARD_MENU_INTENT_KEY = "open-dashboard-menu";

export function requestDashboardMenu() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(DASHBOARD_MENU_INTENT_KEY, "true");
}

export function consumeDashboardMenuRequest() {
  if (typeof window === "undefined") {
    return false;
  }

  const shouldOpen = window.sessionStorage.getItem(DASHBOARD_MENU_INTENT_KEY) === "true";
  if (shouldOpen) {
    window.sessionStorage.removeItem(DASHBOARD_MENU_INTENT_KEY);
  }

  return shouldOpen;
}

export function navigateToDashboardMenu(navigate: (path: string) => void) {
  requestDashboardMenu();
  navigate(DASHBOARD_MENU_PATH);
}

export function scrollRouteToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}
