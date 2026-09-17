/** Missing / undefined = on, matching theme.hoverGlow default. */
export function isHoverGlowEnabled(theme) {
  return !theme || theme.hoverGlow !== false
}
