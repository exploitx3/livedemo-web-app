// Runnable check for ZoomRegionEditor resize geometry.
//
// Two properties, both of which were broken:
//
// 1. The dragged edge must sit under the cursor. boxWidth/boxHeight are kept in
//    *rendered* px (measured off getBoundingClientRect), so applying
//    scaleMultiplier again when writing style.width made the edge drift.
//    scaleMultiplier is 1 whenever a span's stored editorWidth equals the
//    current innerWidth, which is why screenshots masked this.
//
// 2. What onChange persists must match what is actually in the DOM. The
//    left/top handles wrote el.style.transform but never updated
//    boxTransformX/Y, so a save reported the position from one event earlier.
//
// (The third fix -- pointermove + setPointerCapture so the rrweb iframe
// underneath cannot swallow the gesture -- is a DOM-event concern and is not
// simulated here.)
//
// Run: node zoomRegionResize.check.js

import assert from 'assert'

// Minimal stand-in for the DOM box. style drives the measured rect, exactly as
// in a browser, so a wrong write shows up in the next measurement.
function makeBox(containerLeft, width, transformX) {
  return {
    containerLeft,
    style: { width: `${width}px`, transform: `translate(${transformX}px, 0px)` },
    get transformX() {
      return parseFloat(this.style.transform.split('(')[1].split(',')[0])
    },
    get rect() {
      const w = parseFloat(this.style.width)
      const left = this.containerLeft + this.transformX
      return { left, width: w, right: left + w }
    },
  }
}

const CURSOR_PATH = [400, 460, 520, 480, 300, 250, 610]
// scaleMultiplier === 1 is the screenshot case that hid property 1.
const MULTIPLIERS = [1, 0.5, 1.5, 1366 / 1024]

// --- Property 1: bottomRight edge tracks the cursor -------------------------

function resizeBottomRight(box, clientX, scaleMultiplier, applyMultiplierAgain) {
  const boxWidth = clientX - box.rect.left
  box.style.width = (applyMultiplierAgain ? boxWidth * scaleMultiplier : boxWidth) + 'px'
}

for (const scaleMultiplier of MULTIPLIERS) {
  const fixed = makeBox(100, 300, 0)
  const buggy = makeBox(100, 300, 0)

  for (const clientX of CURSOR_PATH) {
    resizeBottomRight(fixed, clientX, scaleMultiplier, false)
    resizeBottomRight(buggy, clientX, scaleMultiplier, true)

    assert.strictEqual(
      fixed.rect.right,
      clientX,
      `scaleMultiplier=${scaleMultiplier}: right edge ${fixed.rect.right} did not follow cursor ${clientX}`
    )
    assert.ok(fixed.rect.width > 0, 'box collapsed during resize')
  }

  // Keep this check honest: the old code must actually differ when the
  // multiplier is not 1, and be identical when it is.
  const lastX = CURSOR_PATH[CURSOR_PATH.length - 1]
  if (scaleMultiplier === 1) {
    assert.strictEqual(buggy.rect.right, lastX, 'multiplier 1 should be unaffected')
  } else {
    assert.notStrictEqual(
      buggy.rect.right,
      lastX,
      `scaleMultiplier=${scaleMultiplier}: expected old code to drift, so this check has teeth`
    )
  }
}

// --- Property 2: topLeft saves the position it actually rendered ------------

// Mirrors the topLeft branch. `syncRefs` is the fix: assign the transform refs
// alongside the style write.
function resizeTopLeft(box, refs, clientX, syncRefs) {
  refs.transformX = box.transformX // readTransformIntoRefs

  const newBoxWidth = box.rect.right - clientX
  const offsetMarginX = newBoxWidth - refs.width
  const offsetX = refs.transformX - offsetMarginX

  refs.width = newBoxWidth
  if (syncRefs) {
    refs.transformX = offsetX
  }

  box.style.transform = `translate(${offsetX}px, 0px)`
  box.style.width = newBoxWidth + 'px'
}

for (const syncRefs of [true, false]) {
  const box = makeBox(100, 300, 50)
  const refs = { width: 300, transformX: 50 }

  for (const clientX of CURSOR_PATH) {
    resizeTopLeft(box, refs, clientX, syncRefs)

    // The left edge is what the topLeft handle drags, so it must track.
    assert.strictEqual(
      box.rect.left,
      clientX,
      `topLeft edge ${box.rect.left} did not follow cursor ${clientX}`
    )
  }

  // onChange persists refs.transformX; it has to equal the rendered transform.
  if (syncRefs) {
    assert.strictEqual(
      refs.transformX,
      box.transformX,
      'saved x does not match the rendered transform'
    )
  } else {
    assert.notStrictEqual(
      refs.transformX,
      box.transformX,
      'expected unsynced refs to lag, so this check has teeth'
    )
  }
}

console.log('OK: zoom region resize tracks the cursor and saves what it rendered')
