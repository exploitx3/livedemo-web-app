import React, { useState, useEffect, Fragment } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
// CheckoutView doesn't directly use Stripe components, so no import needed
import Colors from '../../constants/mainColors'
import Checkout from './Checkout'
import axios from '../../utils/axiosInstance'

import { PulseLoader } from 'react-spinners'

import CheckoutViewStates from '../../constants/CheckoutViewStates'
import ThreeDSecureView from './CheckoutViews/ThreeDSecureView'
import CheckoutFailed from './CheckoutViews/CheckoutFailed'
import CheckoutSuccessful from './CheckoutViews/CheckoutSuccessful'
import CheckoutSelectCard from './CheckoutSelectCard'
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'

const CheckoutView = (props) => {

  const { state, onPaymentMethodCreated, setAutoPay, selectedSubscription, onPayWithUsedCard, userTopWorkspaceMember, onFreeActivate, onUsedCardSelected, threeDSecureUrl, on3DSCompleted, resetCheckout, setShowTransition, setSelectWorkspaceSelected, userCardsData } = props

  function renderCheckoutView(state) {

    switch (state) {
      case CheckoutViewStates.NOT_PAID:

        return <Checkout onPaymentMethodCreated={onPaymentMethodCreated}
                         onFreeActivate={onFreeActivate}
                         userTopWorkspaceMember={userTopWorkspaceMember}
                         onCardSelected={onUsedCardSelected}
                         userCardsData={userCardsData}
                         onPayWithUsedCard={onPayWithUsedCard}
                         selectedSubscription={selectedSubscription}
                         setAutoPay={setAutoPay}
        />

      case CheckoutViewStates.SUCCESSFUL:

        return <CheckoutSuccessful setShowTransition={setShowTransition}/>
      case CheckoutViewStates.THREE_DSECURE:

        return <ThreeDSecureView
          threeDSecureUrl={threeDSecureUrl}
          on3DSCompleted={on3DSCompleted}
        />
      case CheckoutViewStates.FAILED:
        resetCheckout()
        return <CheckoutFailed changeBackStep={props.changeBackStep}
                               setShowTransition={setShowTransition}
                               setSelectWorkspaceSelected={setSelectWorkspaceSelected}/>
      default:

        return (<Checkout
          onPaymentMethodCreated={onPaymentMethodCreated}
          onFreeActivate={onFreeActivate}
          userTopWorkspaceMember={userTopWorkspaceMember}
        />)
    }
  }

  //
  // useEffect(() => {
  //
  //
  // }, [])

  return (
    <ErrorBoundary>
      <React.Fragment>
        {renderCheckoutView(state)}
      </React.Fragment>
    </ErrorBoundary>
  )
}


CheckoutView.propTypes = {
  state: PropTypes.string
}

const S = {
  CheckoutWithCardsWrapper: styled.div`
    display: flex;
    justify-content: center;
`
}

function mapStateToProps(state) {

  return {
    authData: state.authReducer.authData
  }
}

export default connect(mapStateToProps)(CheckoutView)
