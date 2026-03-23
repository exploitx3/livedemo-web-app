import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import InjectedCheckoutForm from './CheckoutForm'

import Spinner from '../../components/Spinner/Spinner'
import { STRIPE_PUBLISHABLE } from '../../constants/stripe'
import CheckoutSelectCard from './CheckoutSelectCard'
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'

const stripePromise = loadStripe(STRIPE_PUBLISHABLE)


const Checkout = ({
                    setAutoPay,
                    selectedSubscription,
                    onPaymentMethodCreated,
                    userCardsData,
                    onCardSelected,
                    onPayWithUsedCard,
                    onFreeActivate,
                    userTopWorkspaceMember
                  }
) => {
  let [hasStripeLoaded, setHasStripeLoaded] = useState(false)
  let [hasStripeElementsLoaded, setHasStripeElementsLoaded] = useState(false)
  let freeActivate = userTopWorkspaceMember?.featureFlags ? !!userTopWorkspaceMember.featureFlags.freeActivate : false

  useEffect(() => {
    // Stripe is loaded via @stripe/stripe-js package
    setHasStripeLoaded(true)
  }, [])


  function onAllElementsLoaded() {
    setHasStripeElementsLoaded(true)
  }

  function renderCheckout() {


    if (!hasStripeLoaded || !hasStripeElementsLoaded) {


      return <React.Fragment>
        <Spinner/>
        <span style={{ display: 'none' }}>
           <Elements stripe={stripePromise}>
              <InjectedCheckoutForm
                onFreeActivate={onFreeActivate}
                onPaymentMethodCreated={onPaymentMethodCreated}
                onAllElementsLoaded={onAllElementsLoaded}
                selectedSubscription={selectedSubscription}
                setAutoPay={setAutoPay}
                freeActivate={freeActivate}
              />

              {/*<InjectedPaymentRequestForm/>*/}
            </Elements>
        </span>
      </React.Fragment>
    } else if (userCardsData.cards && userCardsData.cards.length !== 0) {


      return <S.CheckoutWithCardsWrapper>
        <CheckoutSelectCard onCardSelected={onCardSelected}
                            cards={userCardsData.cards}
                            defaultCardId={userCardsData.defaultCardId}
                            onPayWithUsedCard={onPayWithUsedCard}
                            selectedSubscription={selectedSubscription}
                            setAutoPay={setAutoPay}
        />

        <Elements stripe={stripePromise}>
            <InjectedCheckoutForm onPaymentMethodCreated={onPaymentMethodCreated}
                                  onFreeActivate={onFreeActivate}
                                  onAllElementsLoaded={onAllElementsLoaded}
                                  selectedSubscription={selectedSubscription}
                                  setAutoPay={setAutoPay}
                                  freeActivate={freeActivate}
            />


            {/*<InjectedPaymentRequestForm/>*/}
          </Elements>
      </S.CheckoutWithCardsWrapper>

    } else {

      return <S.CheckoutWithCardsWrapper>
        <Elements stripe={stripePromise}>
            <InjectedCheckoutForm onPaymentMethodCreated={onPaymentMethodCreated}
                                  onFreeActivate={onFreeActivate}
                                  onAllElementsLoaded={onAllElementsLoaded}
                                  selectedSubscription={selectedSubscription}
                                  freeActivate={freeActivate}
            />


            {/*<InjectedPaymentRequestForm/>*/}
          </Elements>
      </S.CheckoutWithCardsWrapper>
    }
  }

  if (!hasStripeLoaded) {
    return (<Spinner/>)
  } else {
    return <ErrorBoundary>
      {renderCheckout()}
    </ErrorBoundary>


  }


}


Checkout.propTypes = {
  setAutoPay: PropTypes.func.isRequired,
  selectedSubscription: PropTypes.string.isRequired,
  onPaymentMethodCreated: PropTypes.func.isRequired,
  userCardsData: PropTypes.object,
  onCardSelected: PropTypes.func,
  onPayWithUsedCard: PropTypes.func,
  onFreeActivate: PropTypes.func,
  userTopWorkspaceMember: PropTypes.object.isRequired
}

const S = {
  CheckoutWithCardsWrapper: styled.div`
    display: flex;
    justify-content: center;
`
}

export default Checkout
