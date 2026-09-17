const baseColors = {
  primaryColor: '#1070ff',
  primaryColorDarker: '#1060cd',
  secondaryColor: '#42e6ec',
  thirdColor: '#252424',
  fourthColor: '#c2c2c2',
  fifthColor: '#1E1F44',
  sixthColor: '#111827',
  secondaryColorDarker: '#3525d3',
}

// Mobbin-inspired charcoal: soft contrast, easy on the eyes.
const mobbinColors = {
  'ld-background': '#17191f',
  'ld-surface': '#1e2129',
  'ld-text': '#d7dae1',
  'ld-text-muted': '#98a0ad',
  'ld-spinner': '#d7dae1',
  'ld-border': '#2c313b',
  'ld-border-card': '#ffffff',
  'ld-dot': '#282d36',
  'ld-toast': '#313742',
  // Solid fills (hover, buttons): brand blue unchanged.
  'ld-primary': '#1070ff',
  'ld-primary-darker': '#1060cd',
  // Icon / link accent: lighter shade of the same hue, easier on dark chrome.
  'ld-primary-accent': '#61a1ff',
  'ld-primary-accent-darker': '#3880eb',
  'ld-step-shadow': '0 0 0 2px #1070ff, 0 4px 14px rgba(0, 0, 0, 0.35)',
  'ld-icon-invert': '1',
}

// null = light mode: no variables set, every themable export falls back.
export const THEMES = {
  light: null,
  mobbin: mobbinColors,
}

export const THEME_LABELS = {
  light: 'Light',
  mobbin: 'Dark',
}

const themable = (name, lightValue) => `var(--${name}, ${lightValue})`

export const primaryAlpha = (pct) =>
  `color-mix(in srgb, ${themable('ld-primary', baseColors.primaryColor)} ${pct}%, transparent)`

export const accentAlpha = (pct) =>
  `color-mix(in srgb, ${themable('ld-primary-accent', baseColors.primaryColor)} ${pct}%, transparent)`

const THEME_STORAGE_KEY = 'livedemo-dark-theme'
export const THEME_CHANGE_EVENT = 'livedemo-theme-change'

// Removed themes and the old boolean dark flag all resolve to mobbin.
const LEGACY_DARK = new Set(['1', 'dark', 'midnight', 'graphite', 'slate', 'forest', 'oled'])

export function getTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && LEGACY_DARK.has(stored)) return 'mobbin'
    return THEMES[stored] !== undefined ? stored : 'light'
  } catch (e) {
    return 'light'
  }
}

export function isDarkTheme() {
  return getTheme() !== 'light'
}

export function getThemePrimary() {
  const colors = THEMES[getTheme()]
  return (colors && colors['ld-primary']) || baseColors.primaryColor
}

export function setTheme(name) {
  const theme = THEMES[name] !== undefined ? name : 'light'
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch (e) {
    // localStorage unavailable (e.g. sandboxed iframe) - theme just won't persist
  }
  applyTheme(theme)
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme, dark: theme !== 'light' } }))
}

export function setDarkTheme(enabled) {
  setTheme(enabled ? 'mobbin' : 'light')
}

function applyTheme(name) {
  const style = document.documentElement.style
  const colors = THEMES[name]
  Object.keys(mobbinColors).forEach((key) => {
    if (colors) {
      style.setProperty(`--${key}`, colors[key])
    } else {
      style.removeProperty(`--${key}`)
    }
  })
  style.colorScheme = colors ? 'dark' : 'light'
}

if (typeof document !== 'undefined') {
  const initial = getTheme()
  if (initial !== 'light') applyTheme(initial)
}

export const stepSelectionShadow = themable(
  'ld-step-shadow',
  '0 0 0 2px #1070ff, 0 2px 10px rgba(16, 112, 255, 0.14)'
)

export const selectedRingCss = `
  background: var(--ld-surface, #ffffff);
  padding: 8px;
  box-shadow: ${stepSelectionShadow};
  --ld-border: ${themable('ld-primary', '#1070ff')};
`

export function isScreenStepSelected(currentStepIndex, calculatedStepIndex, stepCount) {
  const span = Math.max((stepCount ?? 0) - 1, 0)
  return currentStepIndex >= calculatedStepIndex && currentStepIndex <= calculatedStepIndex + span
}

export const selectedHeaderRingCss = `
  box-shadow: ${stepSelectionShadow};
  border-color: ${themable('ld-primary', '#1070ff')};
`

export default {
  App: {
    HomePage: {
      buttonInactive: baseColors.primaryColor,
      buttonActive: 'black',
      buttonText: '#c2c2c2',
      innerColon: baseColors.fourthColor,
      formBackground: themable('ld-surface', 'white'),
      inputText: themable('ld-text', baseColors.thirdColor),
      background: baseColors.secondaryColor,
    },
    ActivityPage: {
      stripesColor: '#076187',
    },
    sidebarColor: themable('ld-background', '#FFFFFF'),
    spinnerColor: themable('ld-spinner', '#2c2c2c'),
  },
  baseColors: baseColors,
  darkColors: mobbinColors,
  buttonInactive: baseColors.fourthColor,
  buttonActive: baseColors.secondaryColor,
  formBackground: baseColors.primaryColor,
  inputText: baseColors.fourthColor,
  background: baseColors.secondaryColor,
  primaryColor: themable('ld-primary', baseColors.primaryColor),
  primaryColorDarker: themable('ld-primary-darker', baseColors.primaryColorDarker),
  primaryAccentColor: themable('ld-primary-accent', baseColors.primaryColor),
  primaryAccentColorDarker: themable('ld-primary-accent-darker', baseColors.primaryColorDarker),
  secondaryColor: baseColors.secondaryColor,
  thirdColor: themable('ld-text', baseColors.thirdColor),
  fourthColor: baseColors.fourthColor,
  fifthColor: baseColors.fifthColor,
  surfaceColor: themable('ld-surface', 'white'),
  toastBackground: themable('ld-toast', '#111'),
  borderColor: themable('ld-border', 'black'),
  cardBorderColor: themable('ld-border-card', '#1070ff'),
  iconInvertFilter: 'invert(var(--ld-icon-invert, 0))',
  primaryText: themable('ld-text', '#1d1d1d'),
  secondaryText: themable('ld-text-muted', '#333'),
  thirdText: themable('ld-text-muted', 'rgba(37.994, 36.843, 36.843, 1)'),
  fontFamily: "'Roboto Mono', -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif",
  fontFamilyLexend: "'Lexend', -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif",
  fontFamilyRobotoMono: "Roboto Mono, system-ui, sans-serif",
}
