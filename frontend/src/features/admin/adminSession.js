export const AUTH_KEY = 'hirehub_admin_auth';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

/**
 * Determines whether the exact demo administrator session is present.
 *
 * Returns:
 *   True only when the expected session value exists.
 */
export function isAuthenticated() {
  return window.sessionStorage.getItem(AUTH_KEY) === 'true';
}

/**
 * Validates static demo credentials and establishes a session on success.
 *
 * Args:
 *   username: Submitted administrator username.
 *   password: Submitted administrator password.
 * Returns:
 *   True when credentials are accepted.
 */
export function login(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    window.sessionStorage.setItem(AUTH_KEY, 'true');
    window.dispatchEvent(new Event('hirehub:auth-change'));
    return true;
  }
  return false;
}

/** Clears the demo session and notifies session-aware UI elements. */
export function logout() {
  window.sessionStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event('hirehub:auth-change'));
}
