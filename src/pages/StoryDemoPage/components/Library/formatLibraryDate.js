export default function formatLibraryDate(createdAt, id) {
  let date = createdAt ? new Date(createdAt) : null
  if ((!date || Number.isNaN(date.getTime())) && id) {
    const hex = String(id).slice(0, 8)
    const ms = parseInt(hex, 16) * 1000
    date = Number.isFinite(ms) ? new Date(ms) : null
  }
  if (!date || Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
