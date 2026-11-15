/**
 * motion.js
 * Utility for detecting prefers-reduced-motion media query and user motion preferences.
 */

export function getPrefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function subscribePrefersReducedMotion(callback) {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const listener = (event) => callback(event.matches);
  
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }
  return () => {};
}
