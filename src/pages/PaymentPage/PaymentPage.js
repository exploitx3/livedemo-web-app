import styled from 'styled-components'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import Header from '../../components/Header/Header'
// import { Avatar, Checkbox, Col, Icon, Layout, Modal, Table } from 'antd'

// import Avatar from 'antd/es/avatar'
import Col from 'antd/es/col'
import 'antd/es/col/style'
import Layout from 'antd/es/layout'
import 'antd/es/layout/style'

import axios from '../../utils/axiosInstance'
import Spinner from '../../components/Spinner/Spinner'
import {Navigate} from 'react-router-dom'
import PaymentGateway from '../../components/PaymentGateway/PaymentGateway'
import ThreeDSRedirect from '../../components/Checkout/ThreeDSecureRedirect'
import SubscriptionTypes from '../../constants/SubscriptionTypes'

const { Content, Footer, Sider } = Layout

const STEPS = {
  'finalize': 'finalize',
}

const PaymentPage = ({ authData, workspaces, currentSelectedWorkspace}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const [changePasswordEmailSent, setChangePasswordEmailSent] = useState(false)

  const [currentStep, setCurrentStep] = useState(STEPS.finalize)
  const [autoPay, setAutoPay] = useState(false)

  const [selectedWorkspace, setWorkspace] = useState(null)

  // Extract subName from params (it's the subscription type like "business_monthly")
  const subName = params.subName || ''
  let defaultSelectedSubscription = SubscriptionTypes[subName && subName.toUpperCase()] || SubscriptionTypes.STARTUP_MONTHLY
  const [selectedSubscription, setSelectedSubscription] = useState(defaultSelectedSubscription)

  // const [charges, setCharges] = useState([])
  // const [exports, setExports] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [subLoading, setSubLoading] = useState(false)

  const [cards, setCards] = useState([])
  const [userDefaultCardId, setUserDefaultCardId] = useState('')
  const [user, setUser] = useState([])

  const [userLoading, setUserLoading] = useState(false)

  // const [exportsLoading, setExportsLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let authHeaders = {
      'Authorization': `Bearer ${authData.token}`
    }

    let getSubscriptionsPromise = axios.get('/subscriptions', { headers: authHeaders })
    let getCardsPromise = axios.get('/users/cards', { headers: authHeaders })
    let getUserPromise = axios.get('/users', { headers: authHeaders })

    Promise.all(
      [
        getCardsPromise,
        getSubscriptionsPromise,
        getUserPromise,
      ])
      .then(([cardsResp, subsResp, userResp]) => {
        setCards(cardsResp.data.cards)
        setUserDefaultCardId(cardsResp.data.defaultCardId)


        setSubscriptions(subsResp.data.subscriptions)

        setUser(userResp.data)

        setIsLoading(false)
      })
      .catch(err => {
        console.log(err)
        console.log(`Couldn't get subscriptions or cards data from API`)
      })

  }, [])

  useEffect(() => {
    if(currentSelectedWorkspace._id){

      setWorkspace(currentSelectedWorkspace)
    }

  }, [currentSelectedWorkspace])

  function getCurrentStepComponent(stepName) {
    switch (stepName) {

      case STEPS['finalize']:

        if (selectedWorkspace === null || selectedSubscription === null) {

          return <Spinner/>
        }

        return <PaymentGateway selectedWorkspace={selectedWorkspace} onInit={() => {

          // initSetupForPaymentGateway(svgBackgroundRef, svgBackgroundMaskRef, svgButtonRectRef, svgButtonRectMaskRef, svgCircleRef, Snap)

        }}
                               setShowTransition={()=> {}}
                               changeBackStep={() => {}}
                               setSelectWorkspaceSelected={() => {}}
                               selectedSubscription={selectedSubscription}
                               setAutoPay={setAutoPay}
                               autoPay={autoPay}
        />
      case 'finalize-3ds':
        return <ThreeDSRedirect/>
      default:
        return null
    }

  }

  // Extract stepName from URL if it exists (after /billing/payment/:subName/:stepName)
  useEffect(() => {
    const urlParts = location.pathname.split('/').filter(Boolean)
    const paymentIndex = urlParts.indexOf('payment')
    let newStep = STEPS.finalize
    
    if (paymentIndex >= 0 && urlParts[paymentIndex + 2]) {
      const stepNameFromUrl = urlParts[paymentIndex + 2]
      if (STEPS[stepNameFromUrl] || stepNameFromUrl === 'finalize-3ds') {
        newStep = stepNameFromUrl
      }
    }
    
    // Only update if the step actually changed
    if (currentStep !== newStep) {
      setCurrentStep(newStep)
    }
  }, [location.pathname]) // Only depend on location.pathname, not currentStep

  return (
    <React.Fragment>

      <Header title={'Billing'}/>
      <S.Content>
        {isLoading ? <Spinner/> : (
          <React.Fragment>

            <S.FirstLine>
              {getCurrentStepComponent(currentStep)}
            </S.FirstLine>
          </React.Fragment>)
        }

      </S.Content>
    </React.Fragment>

  )
}


const S = {
  Content: styled(Content)`
    && {
      background: white;
      padding: 16px;
      overflow: scroll;
      overflow-x: hidden;
      border-top-left-radius: 18px;
      border-top-right-radius: 4px;
      width: 100%;
      height: 100%;

      border-top: 1.6px solid #1070ff;
      border-left: 1.6px solid #1070ff;
    }
    
`,
  WorkspaceColTitle: styled.h2`
    width: 50%; 
    margin: 0 auto;
    display: flex;
    justify-content: space-evenly;
    font-size: 24px;
`,
  FirstLine: styled.div`
    width: 100%;
    margin-top: 0;

    @media only screen and (max-width: 577px) {
      flex-direction: column;
      table {
        font-size: 0.9em;
      } 
      
      & table td {
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
      }
    }
  `,
  SecondLine: styled.div`
    width: 100%;

    @media only screen and (max-width: 577px) {
      flex-direction: column;
      table {
        font-size: 0.9em;
      }
      
      & table td {
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
      }
    }
  `,
  ThirdLine: styled.div`
    width: 100%;

    @media only screen and (max-width: 577px) {
      flex-direction: column;
      table {
        font-size: 0.9em;
      }
      
      & table td {
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
      }
    }
  `,
  FourthLine: styled.div`
    width: 100%;

    @media only screen and (max-width: 577px) {
      flex-direction: column;
      table {
        font-size: 0.9em;
      }
      
      & table td {
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
      }
    }
  `,

  CardImg: styled.img`
          width: 50px;
          display: inline-block;
          `,
  CardText: styled.p`
          display: inline;
          margin: 0;
          `,
  // Avatar: styled(Avatar)`
  //         display: inline-block;
  //
  //         @media only screen and (max-width: 577px) {
  //           && {
  //             margin-left: 15px;
  //           }
  //
  //         }
  //         `,
  UserProfile: styled.div`

          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          //width: 50%;
          text-align: left;
          //padding-left: 5%;
          //padding-top: 2.5%;
          min-height: 130px;
          
          @media only screen and (max-width: 577px) {
            flex-direction: column;
          
          }
          `,
  ProfileText: styled.p`
          margin: 2px;

          `,
  UserProfileInfo: styled.div`
          justify-content: space-between;
          display: flex;
          flex-direction: column;
          margin-left: 15px;
          height: 100%;
          `,
  CardInfoWrapper: styled.span`
          && {
          display: flex;
          margin-left: 10px;
          justify-content: space-between;
          align-items: center;

          }
          `,
  ColTopLeft: styled.span`
   @media only screen and (max-width: 577px) {
          width: 100%;
    }

          width: 35%;
          padding-left: 1.25%;
          margin-top: 35px;
          `,
  ColTopRight: styled.span`
   @media only screen and (max-width: 577px) {
          width: 100%;

    }
          width: 55%;
          padding-left: 1.25%;
          margin-top: 35px;
          `,
  WorkspacesCol: styled.span`
   @media only screen and (max-width: 577px) {
          width: 100%;

    }
          width: 45%;
          padding-left: 1.25%;
          margin-top: 30px;
          `,
  WorkspacesColCards: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
    }

    @media only screen and (max-width: 577px) {
      width: 100%;
    }
  `,
  WorkspacesColSubs: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
    }

    @media only screen and (max-width: 577px) {
      width: 100%;
    }
  `,
  PictureWorkspace: styled.img`
          width: 25px;
          `,
  BelowButtons: styled.span`
    display: flex;
    margin: 15px 0;
    width: 100%;
    `
}

function mapStateToProps(state) {

  return {
    authData: state.authReducer.authData,
    workspaces: state.workspacesReducer.workspaces,
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace
  }
}


export default connect(mapStateToProps)(PaymentPage)
