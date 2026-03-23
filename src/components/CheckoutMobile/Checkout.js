import React, { useState, useEffect, Fragment } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import Colors from '../../constants/mainColors'
import InjectedCheckoutForm from './CheckoutForm'
import InjectedPaymentRequestForm from './PaymentRequestForm'
import axios from '../../utils/axiosInstance'

import { PulseLoader } from 'react-spinners'

import { STRIPE_PUBLISHABLE } from '../../constants/stripe'
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'

const stripePromise = loadStripe(STRIPE_PUBLISHABLE)

const Checkout = ({ amount, setAutoPay, selectedSubscription, onPaymentMethodCreated, userTopWorkspaceMember, onFreeActivate, userCardsData, onCardSelected, onPayWithUsedCard }) => {
  let [hasStripeLoaded, setHasStripeLoaded] = useState(false)
  let [hasStripeElementsLoaded, setHasStripeElementsLoaded] = useState(false)
  let freeActivate = userTopWorkspaceMember.featureFlags ? !!userTopWorkspaceMember.featureFlags.freeActivate : false


  useEffect(() => {
    // Stripe is loaded via @stripe/stripe-js package
    setHasStripeLoaded(true)
  }, [])

  let description = 'Back up your Slack Workspace'

  console.log('key', STRIPE_PUBLISHABLE)


  function onAllElementsLoaded() {
    setHasStripeElementsLoaded(true)
  }

  function renderCheckout() {


    if (!hasStripeLoaded || !hasStripeElementsLoaded) {


      return <React.Fragment>
        <PulseLoader css={{ 'margin': '30% auto 0% auto' }} color={Colors.App.spinnerColor} size={15} speedMultiplier={0.5} />
        <span style={{ display: 'none' }}>
           <Elements stripe={stripePromise}>
              <InjectedCheckoutForm onPaymentMethodCreated={onPaymentMethodCreated}
                                    onFreeActivate={onFreeActivate}
                                    freeActivate={freeActivate}
                                    onAllElementsLoaded={onAllElementsLoaded}
                                    selectedSubscription={selectedSubscription}
                                    setAutoPay={setAutoPay}
              />

              {/*<InjectedPaymentRequestForm/>*/}
            </Elements>
        </span>
      </React.Fragment>
    } else {

      return <S.CheckoutWithCardsWrapper>
        <Elements stripe={stripePromise}>
            <InjectedCheckoutForm onPaymentMethodCreated={onPaymentMethodCreated}
                                  onFreeActivate={onFreeActivate}
                                  freeActivate={freeActivate}
                                  onAllElementsLoaded={onAllElementsLoaded}
                                  selectedSubscription={selectedSubscription}
            />


            {/*<InjectedPaymentRequestForm/>*/}
          </Elements>
      </S.CheckoutWithCardsWrapper>
    }
  }

  if (!hasStripeLoaded) {
    return (<PulseLoader css={{ 'margin': '0 auto' }} color={Colors.App.spinnerColor} size={15} speedMultiplier={0.5}/>)
  } else {
    return     <ErrorBoundary>
      {renderCheckout()}
    </ErrorBoundary>


  }


}


Checkout.propTypes = {
  amount: PropTypes.number
}

const S = {
  CheckoutWithCardsWrapper: styled.div`
    display: flex;
    justify-content: center;
`
}

export default Checkout
