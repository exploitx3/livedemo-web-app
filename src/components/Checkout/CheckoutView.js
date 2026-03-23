import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Checkout from './Checkout'
import CheckoutViewStates from '../../constants/CheckoutViewStates'
import ThreeDSecureView from './CheckoutViews/ThreeDSecureView'
import CheckoutFailed from './CheckoutViews/CheckoutFailed'
import CheckoutSuccessful from './CheckoutViews/CheckoutSuccessful'
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'

const CheckoutView = (props) => {

  const { state, onPaymentMethodCreated, setAutoPay, selectedSubscription, onPayWithUsedCard, onUsedCardSelected, onFreeActivate, threeDSecureUrl, on3DSCompleted, resetCheckout, setShowTransition, setSelectWorkspaceSelected, userCardsData, userTopWorkspaceMember } = props

  function renderCheckoutView(state) {

    switch (state) {
      case CheckoutViewStates.NOT_PAID:

        return <Checkout
                  userTopWorkspaceMember={userTopWorkspaceMember}
                  onFreeActivate={onFreeActivate}
                  onPaymentMethodCreated={onPaymentMethodCreated}
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
    </ErrorBoundary>)
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
