const KEY = "ekp-scroll-to";

export function setScrollIntent(id: string) {
  try {
    sessionStorage.setItem(KEY, id);
  } catch {
    /* private mode */
  }
}

export function peekScrollIntent(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearScrollIntent() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* private mode */
  }
}
