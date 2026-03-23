// CardSection.js
import React from 'react'
import { CardElement } from '@stripe/react-stripe-js'
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'

// You can customize your Elements to give it the look and feel of your site.
const createOptions = () => {
  return {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'Open Sans, sans-serif',
        letterSpacing: '0.025em',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#c23d4b',
      },
    }
  }
};

class CardSection extends React.Component {
  render() {
    return (
      <ErrorBoundary>

      <React.Fragment>
        <label>
          Card details
          <CardElement options={{ ...createOptions(), style: { base: { fontSize: '18px' } } }} />
        </label>
        <label>
          Name
          <input type="text" name='name'/>
        </label>
      </React.Fragment>
      </ErrorBoundary>
    )
  }
}

export default CardSection
