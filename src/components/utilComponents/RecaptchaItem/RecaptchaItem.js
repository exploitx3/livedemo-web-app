import React from 'react'
import PropTypes from 'prop-types'
import ReactRecaptcha from 'react-recaptcha'
import config from '../../../config'
import ErrorBoundary from '../HOCs/ErrorBoundary'

class RecaptchaItem extends React.Component {
  constructor(props) {
    super(props)
  }

  verifyCallback = (result) => {
    console.log('verifyCallback', result)
    this.props.onVerify(result) // notify the form after verified
  }

  expireCallback= (result) => {
    console.log('expireCallback', result)
    this.props.onExpire(result) // notify the form after verified
  }

  render() {
    return (
      <ErrorBoundary>
        <ReactRecaptcha
      render="explicit"
      sitekey={config.CAPTCHA_SITE_KEY}
      onloadCallback={() => {
        console.log('loaded')
      }}
      verifyCallback={this.verifyCallback}
      expiredCallback={this.expireCallback}
      size={this.props.compact ? 'compact' : 'standard'}
    />
      </ErrorBoundary>)
  }
}

RecaptchaItem.propTypes = {
  onVerify: PropTypes.func.isRequired,
  onExpire: PropTypes.func.isRequired
}

export default RecaptchaItem
