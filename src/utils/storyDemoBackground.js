/**
 * Resolves outer demo chrome background from storyDemo.custom.background with
 * legacy fallback to custom.theme.backgroundColor.
 */

function resolveOuterPaddingPx(bg) {
  if (!bg) return 24
  const n = typeof bg.padding === 'number' ? bg.padding : Number(bg.padding)
  if (Number.isFinite(n) && n >= 0) return n
  return 24
}

export function resolveStoryDemoOuterBackground(storyDemo) {
  const bg = storyDemo && storyDemo.custom && storyDemo.custom.background
  const legacy =
    storyDemo &&
    storyDemo.custom &&
    storyDemo.custom.theme &&
    storyDemo.custom.theme.backgroundColor

  if (bg && bg.isActive !== false) {
    if (bg.backgroundType === 'wallpaper' && bg.wallpaperImage) {
      return {
        mode: 'wallpaper',
        wallpaperUrl: bg.wallpaperImage,
        blur: Math.max(0, Number(bg.backgroundBlur) || 0),
        padding: resolveOuterPaddingPx(bg)
      }
    }
    if (bg.backgroundColor) {
      return {
        mode: 'css',
        css: bg.backgroundColor,
        padding: resolveOuterPaddingPx(bg)
      }
    }
  }

  return {
    mode: 'css',
    css: legacy || '#FFFFFF',
    padding: resolveOuterPaddingPx(bg)
  }
}
