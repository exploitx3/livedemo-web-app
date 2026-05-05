const THUMB_BASE = 'https://livedemo-cdn.s3.us-east-1.amazonaws.com/backgrounds/thumbnails'
const FULL_BASE = 'https://livedemo-cdn.s3.us-east-1.amazonaws.com/backgrounds/resized'

function makeItems(prefix, count) {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, '0')
    return {
      thumbUrl: `${THUMB_BASE}/${prefix}_${n}_thumb.png`,
      fullUrl: `${FULL_BASE}/${prefix}_${n}_resized.jpg`
    }
  })
}

/** Six wallpaper families; thumbnails and full-size URLs follow CDN naming rules. */
export const WALLPAPER_CATEGORIES = [
  { id: 'spring', label: 'Spring', items: makeItems('bpxl_wp006', 30) },
  { id: 'sunset', label: 'Sunset', items: makeItems('bpxl_wp003', 30) },
  { id: 'radiant', label: 'Radiant', items: makeItems('bpxl_wp004', 30) },
  { id: 'energy', label: 'Energy', items: makeItems('bpxl_wp001', 30) },
  { id: 'iridescent', label: 'Iridescent', items: makeItems('bpxl_wp005', 30) },
  { id: 'midnight', label: 'Midnight', items: makeItems('bpxl_wp002', 30) }
]
