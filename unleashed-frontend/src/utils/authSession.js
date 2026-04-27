import Cookies from "js-cookie";

export const AUTH_SESSION_EVENT_KEY = "rockwear-auth-session-event";

const AUTH_COOKIE_NAMES = [
  "_auth",
  "_auth_type",
  "_auth_state",
  "_auth_refresh",
  "_auth_refresh_type",
  "_auth_refresh_state",
];

const AUTH_TAB_ID_KEY = "rockwear-auth-tab-id";

export const getCurrentAuthTabId = () => {
  let tabId = sessionStorage.getItem(AUTH_TAB_ID_KEY);

  if (!tabId) {
    tabId =
      window.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(AUTH_TAB_ID_KEY, tabId);
  }

  return tabId;
};

export const clearAuthCookies = () => {
  AUTH_COOKIE_NAMES.forEach((cookieName) => {
    Cookies.remove(cookieName);
    Cookies.remove(cookieName, { path: "/" });
    Cookies.remove(cookieName, {
      path: "/",
      domain: window.location.hostname,
    });
  });
};

export const notifyAuthSessionChanged = (type, payload = {}) => {
  localStorage.setItem(
    AUTH_SESSION_EVENT_KEY,
    JSON.stringify({
      type,
      ...payload,
      originTabId: getCurrentAuthTabId(),
      changedAt: Date.now(),
    })
  );
};

export const replaceAuthSession = (signIn, session, signOut = null) => {
  if (typeof signOut === "function") {
    signOut();
  }

  clearAuthCookies();
  const signedIn = signIn(session);

  if (signedIn) {
    notifyAuthSessionChanged("login", {
      role: session.userState?.role,
      username: session.userState?.username,
    });
  }

  return signedIn;
};
