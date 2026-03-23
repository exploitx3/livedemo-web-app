/*
Hard-coded Error messages
 */
const Errors = {}



Errors.Authentication = {
  INVALID_EMAIL: 'Please provide a correct email address.',
  DUPLICATE_EMAIL: 'The email address is already taken.',
  PASSWORD_LESS_CHARACTERS: 'Password must have at least 8 characters.',
  NAME_MISSING: 'Please provide your name.',
  INVALID_FORM: 'Check the form for errors.',
  PROCESS_FORM: 'Could not process the form.',
  TAKEN_EMAIL: 'This email is already taken'
}


export default  Errors
