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

export default {
  App: {
    HomePage: {
      buttonInactive: baseColors.primaryColor,
      buttonActive: 'black',
      buttonText: '#c2c2c2',
      innerColon: baseColors.fourthColor,
      formBackground: 'white',
      inputText: baseColors.thirdColor,
      background: baseColors.secondaryColor,

    },
    ActivityPage: {
      stripesColor: '#076187',
    },
    sidebarColor: '#FFFFFF',
    spinnerColor: '#2c2c2c'
  },
  baseColors:baseColors,
  buttonInactive: baseColors.fourthColor,
  buttonActive: baseColors.secondaryColor,
  formBackground: baseColors.primaryColor,
  inputText: baseColors.fourthColor,
  background: baseColors.secondaryColor,
  primaryColor: baseColors.primaryColor,
  primaryColorDarker: baseColors.primaryColorDarker,
  secondaryColor: baseColors.secondaryColor,
  thirdColor: baseColors.thirdColor,
  fourthColor: baseColors.fourthColor,
  fifthColor: baseColors.fifthColor,
  primaryText: '#1d1d1d',
  secondaryText: '#333',
  thirdText: 'rgba(37.994, 36.843, 36.843, 1)',
  fontFamily: "'Roboto Mono', -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif",
  fontFamilyLexend: "'Lexend', -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif",
  fontFamilyRobotoMono: "Roboto Mono, system-ui, sans-serif"
}
