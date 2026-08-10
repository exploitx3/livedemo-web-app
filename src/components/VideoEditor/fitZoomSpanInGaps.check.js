import assert from 'node:assert/strict'
import { fitZoomSpanInGaps } from './fitZoomSpanInGaps.js'

// empty timeline
assert.deepEqual(
  fitZoomSpanInGaps({ preferredStart: 1, preferredDuration: 2.5, videoDuration: 10, existingSpans: [] }),
  { startTime: 1, duration: 2.5 }
)

// click inside existing → place after it
assert.deepEqual(
  fitZoomSpanInGaps({
    preferredStart: 1,
    preferredDuration: 2.5,
    videoDuration: 10,
    existingSpans: [{ startTime: 0, duration: 2 }],
  }),
  { startTime: 2, duration: 2.5 }
)

// trim when extending into next span
assert.deepEqual(
  fitZoomSpanInGaps({
    preferredStart: 0,
    preferredDuration: 2.5,
    videoDuration: 10,
    existingSpans: [{ startTime: 1, duration: 2 }],
  }),
  { startTime: 0, duration: 1 }
)

// no room
assert.equal(
  fitZoomSpanInGaps({
    preferredStart: 0,
    preferredDuration: 2.5,
    videoDuration: 3,
    existingSpans: [{ startTime: 0, duration: 3 }],
  }),
  null
)

console.log('fitZoomSpanInGaps: ok')
