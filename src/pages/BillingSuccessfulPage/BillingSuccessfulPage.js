import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import Layout from 'antd/es/layout'
import 'antd/es/layout/style'
import Header from '../../components/Header/Header'
import CheckoutSuccessful from '../../components/Checkout/CheckoutViews/CheckoutSuccessful'
import axios from '../../utils/axiosInstance'

const { Content } = Layout

const BillingSuccessfulPage = ({ authData }) => {
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const sessionId = params.get('session_id')

    if (!sessionId) return

    axios.post(
      '/payments/verify-checkout-session',
      { sessionId },
      { headers: { Authorization: `Bearer ${authData.token}` } }
    ).catch(err => {
      console.error('Failed to verify checkout session:', err)
    })
  }, [])

  return (
    <React.Fragment>
      <Header title={'Billing'}/>
      <S.Content>
        <CheckoutSuccessful setShowTransition={() => {}}/>
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
  `
}

function mapStateToProps(state) {
  return {
    authData: state.authReducer.authData
  }
}

export default connect(mapStateToProps)(BillingSuccessfulPage)
