// Run with: node src/injectScript/themeHoverGlow.check.js
import assert from 'node:assert'
import { isHoverGlowEnabled } from './themeHoverGlow.js'

assert.strictEqual(isHoverGlowEnabled(null), true)
assert.strictEqual(isHoverGlowEnabled(undefined), true)
assert.strictEqual(isHoverGlowEnabled({}), true)
assert.strictEqual(isHoverGlowEnabled({ hoverGlow: true }), true)
assert.strictEqual(isHoverGlowEnabled({ hoverGlow: false }), false)

console.log('themeHoverGlow.check.js ok')
