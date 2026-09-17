// Run: node src/utils/screenOrder.check.mjs
import assert from 'node:assert/strict'
import { clampScreenDragIndex, reorderArray } from './screenOrder.js'

const base = { _id: 'b', recordingRole: 'base' }
const d1 = { _id: 'd1', recordingRole: 'delta', baseScreenId: 'b' }
const d2 = { _id: 'd2', recordingRole: 'delta', baseScreenId: 'b' }
const shot = { _id: 's', recordingRole: undefined }
const video = { _id: 'v', recordingRole: undefined }

const ids = (arr) => arr.map((s) => s._id).join(',')
const drag = (screens, from, to) =>
  reorderArray(screens, from, clampScreenDragIndex(screens, from, to))

// Invariant every case must satisfy: each delta sits after its base.
function assertDeltasAfterBase(order) {
  const pos = new Map(order.map((s, i) => [s._id, i]))
  for (const s of order) {
    if (s.recordingRole === 'delta') {
      assert.ok(pos.get(s._id) > pos.get(s.baseScreenId), `delta ${s._id} precedes its base in ${ids(order)}`)
    }
  }
}

// A delta dragged before its base is clamped to just after the base.
{
  const screens = [base, d1, d2, shot]
  assert.equal(ids(drag(screens, 2, 0)), 'b,d2,d1,s')
  assert.equal(ids(drag(screens, 1, 0)), 'b,d1,d2,s')
  assertDeltasAfterBase(drag(screens, 2, 0))
}

// Deltas reorder freely among themselves.
{
  const screens = [base, d1, d2, shot]
  assert.equal(ids(drag(screens, 1, 2)), 'b,d2,d1,s')
}

// A base cannot be dragged past its own deltas.
{
  const screens = [base, d1, d2, shot]
  assert.equal(ids(drag(screens, 0, 3)), 'b,d1,d2,s')
  assertDeltasAfterBase(drag(screens, 0, 3))
}

// A base with no deltas moves anywhere.
{
  const screens = [base, shot, video]
  assert.equal(ids(drag(screens, 0, 2)), 's,v,b')
}

// Screenshots/videos go before, between, and after chain members.
{
  const screens = [base, d1, d2, shot]
  assert.equal(ids(drag(screens, 3, 0)), 's,b,d1,d2')
  assert.equal(ids(drag(screens, 3, 1)), 'b,s,d1,d2')
  assert.equal(ids(drag(screens, 3, 2)), 'b,d1,s,d2')
  for (const to of [0, 1, 2, 3]) {
    assertDeltasAfterBase(drag(screens, 3, to))
  }
}

// Two independent chains stay valid when interleaved.
{
  const base2 = { _id: 'b2', recordingRole: 'base' }
  const d3 = { _id: 'd3', recordingRole: 'delta', baseScreenId: 'b2' }
  const screens = [base, d1, base2, d3]
  assertDeltasAfterBase(drag(screens, 3, 0))
  assertDeltasAfterBase(drag(screens, 2, 3))
  assert.equal(ids(drag(screens, 2, 0)), 'b2,b,d1,d3')
}

console.log('screenOrder checks passed')
