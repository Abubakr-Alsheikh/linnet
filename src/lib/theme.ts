/**
 * Theme preference. "system" follows prefers-color-scheme through CSS; an
 * explicit choice is stored in localStorage and applied as data-theme on
 * <html> by THEME_SCRIPT before first paint, so a returning visitor never
 * sees the wrong theme flash. The theme menu in the header reads and writes
 * it through the store below (`useSyncExternalStore`).
 */

export const THEME_CHOICES = ["light", "dark", "system"] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];

export const THEME_KEY = "linnet-theme";

/** Runs in <head> before the page paints. Keep it small and dependency-free. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return typeof value === "string" && (THEME_CHOICES as readonly string[]).includes(value);
}

const listeners = new Set<() => void>();

/** Subscribes to theme changes, from this tab and from other tabs. */
export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY) return;
    applyTheme(readStoredTheme());
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function readStoredTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") delete root.dataset.theme;
  else root.dataset.theme = choice;
}

/** The visitor's choice on the client. The server snapshot is always "system". */
export function getThemeChoice(): ThemeChoice {
  const applied = document.documentElement.dataset.theme;
  return applied === "light" || applied === "dark" ? applied : "system";
}

export function getServerThemeChoice(): ThemeChoice {
  return "system";
}

/** Applies a choice at once and remembers it. "system" forgets the override. */
export function setThemeChoice(choice: ThemeChoice) {
  applyTheme(choice);
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Private windows may refuse storage; the choice still applies to this page.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Netlify's free tier adds a line break and a comment to <head> on production
 * sites. React cannot match a whitespace text node there, so it discards the
 * server HTML and renders the whole page again (error #418). This runs before
 * hydration and removes those nodes. Found on Storefront Ops, 2026-10-31.
 */
export const HEAD_CLEANUP_SCRIPT =
  "for(const n of[...document.head.childNodes])if(n.nodeType===3&&!n.data.trim())n.remove()";
