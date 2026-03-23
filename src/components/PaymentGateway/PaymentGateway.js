import React, { Fragment, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'
//import { Col } from 'antd'

import Col from 'antd/es/col'
import 'antd/es/col/style'
import styled from 'styled-components'
import Colors from '../../constants/mainColors'

import CheckoutView from '../../components/Checkout/CheckoutView'
import axios from '../../utils/axiosInstance'

import CheckoutViewStates from '../../constants/CheckoutViewStates'
import ErrorBoundary from '../../components/utilComponents/HOCs/ErrorBoundary'
import * as authActions from '../../actions/authActions'
import { bindActionCreators } from 'redux'

const PaymentGateway = (props) => {
  let { authData } = props
  const [checkoutViewState, setCheckoutViewState] = useState(CheckoutViewStates.NOT_PAID)
  const [threeDSecureUrl, setThreeDSecureUrl] = useState('')
  const [chargeId, setChargeId] = useState('')
  const [userData, setUserData] = useState({})

  let [userCardsData, setUserCardsData] = useState('')

  let [selectedCardId, setSelectedCardId] = useState('')

  const PAYMENT_AMOUNT = 1
  const CURRENCY = 'USD'


  useEffect(() => {
    props.onInit()

    let authToken = props.authData.token
    props.authActions.authWithToken(authToken)
      .then(() => {


        return axios.get('/users/cards', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          })
          .then(respData => {


            setUserCardsData(respData.data)
            setSelectedCardId(respData.data.defaultCardId)
          })

      })


  }, [])

  useEffect(() => {
    setUserData(props.authData)

  }, [props.authData])

  const fromDollarToCent = amount => amount * 100
  const successPayment = req => {
    if (req.data['3dSecure']) {

      setChargeId(req.data.charge._id)
      handle3DSecure(req.data)
    } else {
      handleSuccessfulView(req.data)
    }

  }

  function handleSuccessfulView() {
    setCheckoutViewState(CheckoutViewStates.SUCCESSFUL)
  }


  function handle3DSecure(reqData) {
    setThreeDSecureUrl(reqData['3dSecureUrl'])
    setCheckoutViewState(CheckoutViewStates.THREE_DSECURE)
  }

  function resetCheckout() {
    setThreeDSecureUrl('')
  }

  const errorPayment = errorData => {
    setCheckoutViewState(CheckoutViewStates.FAILED)
    if (errorData &&
      errorData.response &&
      errorData.response.data &&
      errorData.response.data.errorMessage) {

      toast.error(errorData.response.data.errorMessage, {
        position: toast.POSITION.TOP_RIGHT
      })
    }
  }

  function on3DSCompleted() {
    let authToken = props.authData.token


    return axios.post('/payments/verifyCharge',
      {
        id: chargeId
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      .then((res) => {
        console.log(res)


        setCheckoutViewState(CheckoutViewStates.SUCCESSFUL)
      })
      .catch(errorPayment)


  }

  function onPaymentMethodCreated(paymentMethodResult) {

    let authToken = props.authData.token

    return axios.post('/payments/charge',
      {
        paymentMethod: paymentMethodResult,
        currency: CURRENCY,
        subscriptionType: props.selectedSubscription,
        workspaceId: props.selectedWorkspace._id,
        autoPay: props.autoPay,
        useSavedCard: false
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      .then(successPayment)
      .catch(errorPayment)

  }

  function onFreeActivate() {

    let authToken = props.authData.token

    return axios.post('/payments/freeActivate',
      {
        subscriptionType: props.selectedSubscription,
        workspaceId: props.selectedWorkspace._id,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      .then(successPayment)
      .catch(errorPayment)

  }

  function onUsedCardSelected(cardId) {
    setSelectedCardId(cardId)
  }

  function onPayWithUsedCard() {


    let authToken = props.authData.token

    return axios.post('/payments/charge',
      {
        cardId: selectedCardId,
        currency: CURRENCY,
        subscriptionType: props.selectedSubscription,
        workspaceId: props.selectedWorkspace._id,
        autoPay: props.autoPay,
        useSavedCard: true
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      .then(successPayment)
      .catch(errorPayment)

  }

  function renderCheckoutView(checkoutViewState) {
    switch (checkoutViewState) {
      case CheckoutViewStates.NOT_PAID:

        return <CheckoutView
          userTopWorkspaceMember={userData}
          state={checkoutViewState}
          onFreeActivate={onFreeActivate}
          onPaymentMethodCreated={onPaymentMethodCreated}
          userCardsData={userCardsData}
          onUsedCardSelected={onUsedCardSelected}
          onPayWithUsedCard={onPayWithUsedCard}
          selectedSubscription={props.selectedSubscription}
          setAutoPay={props.setAutoPay}
        />
      case CheckoutViewStates.SUCCESSFUL:

        return <CheckoutView state={checkoutViewState}
                             setShowTransition={props.setShowTransition}
        />

      case CheckoutViewStates.THREE_DSECURE:

        return <CheckoutView state={checkoutViewState} threeDSecureUrl={threeDSecureUrl}
                             on3DSCompleted={on3DSCompleted}
                             userTopWorkspaceMember={userData}
        />
      case CheckoutViewStates.FAILED:

        return <CheckoutView
          state={checkoutViewState}
          resetCheckout={resetCheckout}
          changeBackStep={props.changeBackStep}
          setShowTransition={props.setShowTransition}
          setSelectWorkspaceSelected={props.setSelectWorkspaceSelected}
          userTopWorkspaceMember={userData}

        />
      default:
        return <CheckoutView
          state={checkoutViewState}
          onPaymentMethodCreated={onPaymentMethodCreated}
          userTopWorkspaceMember={userData}

        />

    }
  }


  return (
    <ErrorBoundary>
      <Fragment>

        <S.PaymentGatewayWrapper style={{ height: '100%' }}>
          {renderCheckoutView(checkoutViewState)}
        </S.PaymentGatewayWrapper>

      </Fragment>
    </ErrorBoundary>
  )
}


const S = {
  PaymentGatewayWrapper: styled.div`
    
    &&::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 10px;
      background-color: #FFF;
    }

    &&::-webkit-scrollbar {
      width: 12px;
      background-color: #FFF;
    }

    &&::-webkit-scrollbar-thumb {
      border-radius: 10px;
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
      background-color: ${Colors.primaryColor};
    }
`,
  Col: styled(Col)`
    && {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
  `,

  ImageExample: styled.img`
    width: 60%;
    border-radius: 20px;
    box-shadow: 2px 2px 10px #aaaaaa;

`
}

function mapStateToProps(state) {
  return {
    authData: state.authReducer.authData
  }
}

function mapDispatchToProps(dispatch) {
  return {

    authActions: bindActionCreators(authActions, dispatch),

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentGateway)
