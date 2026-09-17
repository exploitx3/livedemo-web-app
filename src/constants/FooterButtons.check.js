// Run with: node src/constants/FooterButtons.check.js
import assert from 'node:assert'
import FooterButtons, { getFooterButtons } from './FooterButtons.js'

assert.strictEqual(getFooterButtons(null), FooterButtons.backAndNext)
assert.strictEqual(getFooterButtons({}), FooterButtons.backAndNext)
assert.strictEqual(getFooterButtons({ footerButtons: 'backAndNext' }), FooterButtons.backAndNext)
assert.strictEqual(getFooterButtons({ footerButtons: 'nextArrow' }), FooterButtons.nextArrow)
assert.strictEqual(getFooterButtons({ footerButtons: 'nope' }), FooterButtons.backAndNext)

console.log('FooterButtons.check.js ok')
