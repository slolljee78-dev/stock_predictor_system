export const DASHBOARD_HOME_PATH = "/dashboard";
export const DASHBOARD_MENU_PATH = "/dashboard";
const DASHBOARD_MENU_INTENT_KEY = "open-dashboard-menu";
const DASHBOARD_RETURN_SECTION_KEY = "dashboard-return-section";
const DASHBOARD_SCROLL_INTENT_KEY = "dashboard-scroll-intent";

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function requestDashboardMenu() {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(DASHBOARD_MENU_INTENT_KEY, "true");
}

export function consumeDashboardMenuRequest() {
  if (!canUseSessionStorage()) {
    return false;
  }

  const shouldOpen = window.sessionStorage.getItem(DASHBOARD_MENU_INTENT_KEY) === "true";
  if (shouldOpen) {
    window.sessionStorage.removeItem(DASHBOARD_MENU_INTENT_KEY);
  }

  return shouldOpen;
}

export function rememberDashboardSection(section: string) {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(DASHBOARD_RETURN_SECTION_KEY, section);
}

export function getRememberedDashboardSection() {
  if (!canUseSessionStorage()) {
    return null;
  }

  return window.sessionStorage.getItem(DASHBOARD_RETURN_SECTION_KEY);
}

export function requestDashboardSectionReturn(section?: string | null) {
  if (!canUseSessionStorage()) {
    return;
  }

  const targetSection = section ?? getRememberedDashboardSection();
  if (!targetSection) {
    return;
  }

  window.sessionStorage.setItem(DASHBOARD_SCROLL_INTENT_KEY, targetSection);
}

export function consumeDashboardSectionReturn() {
  if (!canUseSessionStorage()) {
    return null;
  }

  const section = window.sessionStorage.getItem(DASHBOARD_SCROLL_INTENT_KEY);
  if (section) {
    window.sessionStorage.removeItem(DASHBOARD_SCROLL_INTENT_KEY);
  }

  return section;
}

export function navigateToDashboardMenu(navigate: (path: string) => void) {
  requestDashboardMenu();
  navigate(DASHBOARD_MENU_PATH);
}

export function navigateToDashboardReturn(navigate: (path: string) => void, section?: string | null) {
  requestDashboardSectionReturn(section);
  navigate(DASHBOARD_HOME_PATH);
}

export function scrollRouteToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}
