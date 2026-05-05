import React from 'react'
import styled from 'styled-components'
import Layout from 'antd/es/layout'
import 'antd/es/layout/style'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import CheckoutFailed from '../../components/Checkout/CheckoutViews/CheckoutFailed'

const { Content } = Layout

const BillingFailedPage = () => {
  const navigate = useNavigate()

  return (
    <React.Fragment>
      <Header title={'Billing'}/>
      <S.Content>
        <CheckoutFailed
          setShowTransition={() => {}}
          setSelectWorkspaceSelected={() => {}}
          changeBackStep={() => navigate('/billing')}
        />
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

export default BillingFailedPage
