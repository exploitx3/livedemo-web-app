/**
 * Place a new zoom span at preferredStart with preferredDuration,
 * shifting/trimming so it does not overlap existing spans.
 * Returns null if no usable gap (duration < minDuration).
 */
export function fitZoomSpanInGaps({
  preferredStart,
  preferredDuration,
  videoDuration,
  existingSpans = [],
  minDuration = 0.3,
}) {
  let startTime = Math.max(0, Math.min(preferredStart, videoDuration))
  let duration = Math.min(preferredDuration, videoDuration - startTime)

  let sortedSpans = [...existingSpans].sort((a, b) => a.startTime - b.startTime)
  for (let i = 0; i < sortedSpans.length; i++) {
    let spanStart = Number(sortedSpans[i].startTime) || 0
    let spanEnd = spanStart + (Number(sortedSpans[i].duration) || 0)

    if (startTime >= spanEnd) {
      continue
    }

    if (startTime + duration <= spanStart) {
      break
    }

    if (startTime >= spanStart && startTime < spanEnd) {
      startTime = spanEnd
      duration = Math.min(preferredDuration, videoDuration - startTime)
      continue
    }

    duration = Math.min(duration, spanStart - startTime)
    break
  }

  for (let i = 0; i < sortedSpans.length; i++) {
    let spanStart = Number(sortedSpans[i].startTime) || 0
    let spanEnd = spanStart + (Number(sortedSpans[i].duration) || 0)
    if (startTime < spanEnd && startTime + duration > spanStart) {
      duration = Math.min(duration, spanStart - startTime)
    }
  }

  if (duration < minDuration) {
    return null
  }

  return { startTime, duration }
}
