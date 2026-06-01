import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import Layout from 'antd/es/layout'
import 'antd/es/layout/style'
import Header from '../../components/Header/Header'
import CheckoutSuccessful from '../../components/Checkout/CheckoutViews/CheckoutSuccessful'
import Spinner from '../../components/Spinner/Spinner'
import axios from '../../utils/axiosInstance'

const { Content } = Layout

const BillingSuccessfulPage = ({ authData }) => {
  const location = useLocation()
  const sessionId = new URLSearchParams(location.search).get('session_id')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(true)
      return
    }

    axios.post(
      '/payments/verify-checkout-session',
      { sessionId },
      { headers: { Authorization: `Bearer ${authData.token}` } }
    )
    .then(() => {
      setIsLoading(false)
    })
    .catch(err => {
      setIsLoading(false)
      console.error('Failed to verify checkout session:', err)
    }).finally(() => {
      setIsLoading(false)
    })
  }, [sessionId, authData?.token])

  return (
    <React.Fragment>
      <Header title={'Billing'}/>
      <S.Content>
        {isLoading ? (
          <S.SpinnerWrapper>
            <Spinner />
          </S.SpinnerWrapper>
        ) : (
          <CheckoutSuccessful setShowTransition={() => {}}/>
        )}
      </S.Content>
    </React.Fragment>
  )
}

const S = {
  Content: styled(Content)`
    && {
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      border-top-left-radius: 18px;
      border-top-right-radius: 4px;
      border-top: 1.6px solid #1070ff;
      border-left: 1.6px solid #1070ff;
    }
  `,
  SpinnerWrapper: styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 200px;
  `
}

function mapStateToProps(state) {
  return {
    authData: state.authReducer.authData
  }
}

export default connect(mapStateToProps)(BillingSuccessfulPage)
