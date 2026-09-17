export default {
  backAndNext: 'backAndNext',
  nextArrow: 'nextArrow',
}

export function getFooterButtons(theme) {
  return theme && theme.footerButtons === 'nextArrow' ? 'nextArrow' : 'backAndNext'
}
