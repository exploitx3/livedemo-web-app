import React from 'react'
import {useStripe, PaymentRequestButtonElement} from '@stripe/react-stripe-js';
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'

const PaymentRequestForm = () => {
  const stripe = useStripe()
  const [canMakePayment, setCanMakePayment] = React.useState(false)
  const [paymentRequest, setPaymentRequest] = React.useState(null)

  React.useEffect(() => {
    if (!stripe) {
      return
    }

    // For full documentation of the available paymentRequest options, see:
    // https://stripe.com/docs/stripe.js#the-payment-request-object
    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Demo total',
        amount: 1000,
      },
    });

    pr.on('paymentmethod', ({complete, paymentMethod, ...data}) => {
      console.log('Received Stripe payment method: ', paymentMethod);
      console.log('Received customer information: ', data);
      complete('success');
    });

    setPaymentRequest(pr)

    pr.canMakePayment().then((result) => {
      setCanMakePayment(!!result);
    });

  }, [stripe])

  if (!canMakePayment || !paymentRequest) {
    return null
  }

  return (
    <ErrorBoundary>
      <PaymentRequestButtonElement
        paymentRequest={paymentRequest}
        className="PaymentRequestButton"
        options={{
          // For more details on how to style the Payment Request Button, see:
          // https://stripe.com/docs/elements/payment-request-button#styling-the-element
          style: {
            paymentRequestButton: {
              theme: 'light',
              height: '64px',
            },
          },
        }}
      />
    </ErrorBoundary>
  )
}

export default PaymentRequestForm
