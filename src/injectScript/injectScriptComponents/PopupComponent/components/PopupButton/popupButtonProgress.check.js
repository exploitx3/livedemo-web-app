// Run with: node src/injectScript/injectScriptComponents/PopupComponent/components/PopupButton/popupButtonProgress.check.js
import assert from 'node:assert'
import { getPopupButtonProgressWidth, getPopupButtonGlowRingColor, getPopupButtonEffectAccent } from './popupButtonProgress.js'

assert.strictEqual(getPopupButtonProgressWidth('none', 50), null)
assert.strictEqual(getPopupButtonProgressWidth(null, 50), null)
assert.strictEqual(getPopupButtonProgressWidth('progress', null), null)
assert.strictEqual(getPopupButtonProgressWidth('progress', ''), null)
assert.strictEqual(getPopupButtonProgressWidth('progress', 0), 0)
assert.strictEqual(getPopupButtonProgressWidth('progress', 47.5), 47.5)
assert.strictEqual(getPopupButtonProgressWidth('progress', 150), 100)
assert.strictEqual(getPopupButtonProgressWidth('progress', -10), 0)
assert.strictEqual(getPopupButtonProgressWidth('progress', 'nope'), 0)
assert.strictEqual(getPopupButtonProgressWidth('glow', 50), null)

assert.strictEqual(getPopupButtonGlowRingColor('#2142e7'), 'rgba(33, 66, 231, 0.55)')
assert.strictEqual(getPopupButtonGlowRingColor('#fff'), 'rgba(255, 255, 255, 0.55)')
assert.strictEqual(getPopupButtonGlowRingColor('rgb(255, 255, 255)'), 'rgba(255, 255, 255, 0.55)')
assert.strictEqual(getPopupButtonGlowRingColor(null), 'rgba(255, 255, 255, 0.55)')

assert.strictEqual(getPopupButtonEffectAccent('#4f46e5'), 'rgb(207, 205, 248)')
assert.strictEqual(getPopupButtonEffectAccent(null), 'rgb(207, 204, 248)')

console.log('popupButtonProgress.check.js ok')
