/**
 * The only ordering constraint on screens: a delta ScreenPage must sit somewhere
 * after its base. Deltas reorder freely among themselves, and screenshots/videos/
 * other bases can go before, after, or between any of them.
 *
 * Given a drag from -> to over `screens`, returns `to` clamped to the nearest
 * position that keeps that constraint, so a drag is corrected instead of refused.
 */
export function clampScreenDragIndex(screens, from, to) {
  const dragged = screens[from]
  if (!dragged) {
    return to
  }

  if (dragged.recordingRole === 'delta' && dragged.baseScreenId) {
    const basePos = screens.findIndex((s) => String(s._id) === String(dragged.baseScreenId))

    return basePos >= 0 && to <= basePos ? basePos + 1 : to
  }

  if (dragged.recordingRole === 'base') {
    const firstDeltaPos = screens.findIndex(
      (s) => s.recordingRole === 'delta' && String(s.baseScreenId) === String(dragged._id)
    )
    if (firstDeltaPos >= 0 && to >= firstDeltaPos) {
      return Math.max(0, firstDeltaPos - 1)
    }
  }

  return to
}

export function reorderArray(array, from, to) {
  const newArray = [...array]
  newArray.splice(to, 0, newArray.splice(from, 1)[0])

  return newArray
}
