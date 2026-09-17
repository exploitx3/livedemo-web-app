import ButtonEffects from '../../../../../constants/ButtonEffects.js'

export const POPUP_BUTTON_PROGRESS_DURATION_S = 5

export function getPopupButtonProgressWidth(buttonEffect, audioProgress) {
  if (buttonEffect !== ButtonEffects.progress) return null
  if (audioProgress == null || audioProgress === '') return null
  const n = Number(audioProgress)
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, n))
}

function parseRgb(backgroundColor) {
  if (!backgroundColor) return null
  const s = String(backgroundColor).trim()
  const short = /^#([0-9a-fA-F]{3})$/.exec(s)
  if (short) return short[1].split('').map((c) => parseInt(c + c, 16))
  const full = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/.exec(s)
  if (full) {
    const n = parseInt(full[1], 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(s)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  return null
}

/** Ring color = button fill at ~0x33 alpha, matching --tw-ring-color: #xxxxxx33 */
export function getPopupButtonGlowRingColor(backgroundColor) {
  const rgb = parseRgb(backgroundColor)
  if (!rgb) return 'rgba(255, 255, 255, 0.55)'
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.55)`
}

/** Light tint of the button fill for ripple / spinner overlays. */
export function getPopupButtonEffectAccent(backgroundColor) {
  const rgb = parseRgb(backgroundColor)
  if (!rgb) return 'rgb(207, 204, 248)'
  const mix = 0.73
  return `rgb(${rgb.map((c) => Math.round(c + (255 - c) * mix)).join(', ')})`
}
