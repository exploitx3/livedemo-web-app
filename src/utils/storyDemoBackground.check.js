// Self-check for resolveStoryDemoOuterBackground.
// Run with: node src/utils/storyDemoBackground.check.js
import assert from 'node:assert'
import { resolveStoryDemoOuterBackground } from './storyDemoBackground.js'

const isDefault = css => css.includes('var(--ld-dot') && css.includes('var(--ld-background')

// No custom config at all -> themable dotted default.
assert(isDefault(resolveStoryDemoOuterBackground({}).css))

// Background explicitly disabled -> default, even when a legacy theme color exists.
assert(isDefault(resolveStoryDemoOuterBackground({
  custom: { background: { isActive: false, backgroundColor: '#123456' }, theme: { backgroundColor: '#FFFFFF' } }
}).css))

// Legacy theme color still applies while there is no background config (migration).
assert.strictEqual(
  resolveStoryDemoOuterBackground({ custom: { theme: { backgroundColor: '#0000ff' } } }).css,
  '#0000ff'
)

// Enabled background wins.
assert.strictEqual(
  resolveStoryDemoOuterBackground({
    custom: { background: { isActive: true, backgroundColor: '#abcdef' }, theme: { backgroundColor: '#FFFFFF' } }
  }).css,
  '#abcdef'
)
assert.strictEqual(
  resolveStoryDemoOuterBackground({
    custom: { background: { isActive: true, backgroundType: 'wallpaper', wallpaperImage: 'http://x/y.png' } }
  }).mode,
  'wallpaper'
)

console.log('storyDemoBackground.check.js: all assertions passed')
