/**
 * Theme preference. "system" follows prefers-color-scheme through CSS; an
 * explicit choice is stored in localStorage and applied as data-theme on
 * <html> by THEME_SCRIPT before first paint, so a returning visitor never
 * sees the wrong theme flash. The toggle UI arrives with the page shell.
 */

export const THEME_CHOICES = ["light", "dark", "system"] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];

export const THEME_KEY = "linnet-theme";

/** Runs in <head> before the page paints. Keep it small and dependency-free. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;

/**
 * Netlify's free tier adds a line break and a comment to <head> on production
 * sites. React cannot match a whitespace text node there, so it discards the
 * server HTML and renders the whole page again (error #418). This runs before
 * hydration and removes those nodes. Found on Storefront Ops, 2026-10-31.
 */
export const HEAD_CLEANUP_SCRIPT =
  "for(const n of[...document.head.childNodes])if(n.nodeType===3&&!n.data.trim())n.remove()";
