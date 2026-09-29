import { getStepAndScreenByStepIndex, getScreenIndex } from './helpers'

const demo = {
  screens: [
    { _id: 'b', index: 1, steps: [{ _id: 'b1' }] },
    { _id: 'a', index: 0, steps: [{ _id: 'a1' }, { _id: 'a2' }] },
  ],
}

test('step lookup follows screen.index, not array order', () => {
  expect(getStepAndScreenByStepIndex(0, demo).screen._id).toBe('a')
  expect(getStepAndScreenByStepIndex(2, demo).step._id).toBe('b1')
  expect(getScreenIndex('b', demo)).toBe(2)
  expect(demo.screens[0]._id).toBe('b')
})
