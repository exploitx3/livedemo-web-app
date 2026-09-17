// Self-check for the CSS-variable theming in mainColors.js.
// Run with: node src/constants/mainColors.check.js
import assert from 'node:assert'
import Colors, { THEMES, THEME_LABELS, getTheme, setTheme } from './mainColors.js'

const VAR_RE = /^var\(--(ld-[a-z-]+), (.+)\)$/

// Every themable export must reference a variable that exists in the dark palette.
const themableExports = {
  'App.HomePage.formBackground': Colors.App.HomePage.formBackground,
  'App.HomePage.inputText': Colors.App.HomePage.inputText,
  'App.sidebarColor': Colors.App.sidebarColor,
  'App.spinnerColor': Colors.App.spinnerColor,
  thirdColor: Colors.thirdColor,
  surfaceColor: Colors.surfaceColor,
  borderColor: Colors.borderColor,
  primaryText: Colors.primaryText,
  secondaryText: Colors.secondaryText,
  thirdText: Colors.thirdText,
  primaryColor: Colors.primaryColor,
  primaryColorDarker: Colors.primaryColorDarker,
}
for (const [name, value] of Object.entries(themableExports)) {
  const m = VAR_RE.exec(value)
  assert(m, `${name} should be var(--ld-*, fallback), got: ${value}`)
  assert(Colors.darkColors[m[1]], `${name} uses --${m[1]} but darkColors has no entry for it`)
  assert(m[2].trim().length > 0, `${name} has an empty light-mode fallback`)
}

// Every dark palette must declare the same keys with valid values, so switching
// themes never leaves a variable from the previous one behind.
// ld-icon-invert is a filter amount, not a color.
for (const [theme, palette] of Object.entries(THEMES)) {
  if (!palette) continue
  assert.deepStrictEqual(
    Object.keys(palette).sort(),
    Object.keys(Colors.darkColors).sort(),
    `THEMES['${theme}'] must declare the same keys as darkColors`
  )
  for (const [name, value] of Object.entries(palette)) {
    if (name === 'ld-icon-invert') {
      assert(/^(0|1|0?\.\d+)$/.test(value), `${theme}['${name}'] must be a 0-1 amount: ${value}`)
      continue
    }
    if (name === 'ld-step-shadow') {
      assert(typeof value === 'string' && value.length > 0, `${theme}['${name}'] must be a box-shadow value`)
      continue
    }
    assert(/^#[0-9a-fA-F]{3,8}$/.test(value), `${theme}['${name}'] is not a hex color: ${value}`)
  }
}

// Every theme is selectable from the menu, and vice versa.
assert.deepStrictEqual(Object.keys(THEME_LABELS), Object.keys(THEMES))

// Selecting a theme round-trips; unknown/legacy stored values degrade gracefully.
globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] ?? null },
  setItem(k, v) { this.store[k] = v },
}
globalThis.window = { dispatchEvent() {} }
globalThis.CustomEvent = class { constructor(type, init) { Object.assign(this, init) } }
globalThis.document = { documentElement: { style: { setProperty() {}, removeProperty() {} } } }

for (const name of Object.keys(THEMES)) {
  setTheme(name)
  assert.strictEqual(getTheme(), name)
}
setTheme('unknown-theme')
assert.strictEqual(getTheme(), 'light')
localStorage.setItem('livedemo-dark-theme', '1') // legacy boolean value
assert.strictEqual(getTheme(), 'mobbin')
localStorage.setItem('livedemo-dark-theme', 'dark') // removed theme name
assert.strictEqual(getTheme(), 'mobbin')
localStorage.setItem('livedemo-dark-theme', 'midnight')
assert.strictEqual(getTheme(), 'mobbin')
localStorage.setItem('livedemo-dark-theme', 'nonsense')
assert.strictEqual(getTheme(), 'light')

// Light-mode fallbacks must keep the original light palette (regression guard).
assert.strictEqual(Colors.App.sidebarColor, 'var(--ld-background, #FFFFFF)')
assert.strictEqual(Colors.primaryText, 'var(--ld-text, #1d1d1d)')
assert.strictEqual(Colors.primaryColor, 'var(--ld-primary, #1070ff)')
assert.strictEqual(Colors.primaryColorDarker, 'var(--ld-primary-darker, #1060cd)')

assert.strictEqual(THEMES.mobbin['ld-primary'], '#1070ff')
assert.strictEqual(THEMES.mobbin['ld-primary-darker'], '#1060cd')
assert.strictEqual(THEMES.mobbin['ld-primary-accent'], '#61a1ff')
assert.strictEqual(THEMES.mobbin['ld-primary-accent-darker'], '#3880eb')

console.log('mainColors.check.js: all assertions passed')
