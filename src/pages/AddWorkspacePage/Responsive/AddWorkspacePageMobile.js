import React, { useState, useEffect, useRef } from 'react'
import {
  useNavigate,
  useLocation,
  useParams,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import {
  CSSTransition,
  TransitionGroup,
} from 'react-transition-group'

import Media from 'react-media'
import '../../../styles/removeSnapSVGbranding.css'

import Snap from 'snapsvg-cjs'
import Colors from '../../../constants/mainColors'

import Header from '../../../components/Header/Header'
import AuthWorkspace from './components/AuthWorkspace/AuthWorkspace'
import SelectWorkspace from './components/SelectWorkspace/SelectWorkspace'
import PaymentGateway from './components/PaymentGateway/PaymentGateway'
import ThreeDSRedirect from '../../../components/Checkout/ThreeDSecureRedirect'
import mainColors from '../../../constants/mainColors'

// Illustrations
//import { Steps, Layout, Button, Icon, Col } from 'antd'

import Steps from 'antd/es/steps'
import Layout from 'antd/es/layout'
import Button from 'antd/es/button'
import Icon from '../../../components/Icon/Icon'
import Col from 'antd/es/col'
import ErrorBoundary from '../../../components/utilComponents/HOCs/ErrorBoundary'
import { findTopWorkspaceMember } from '../../../utils/helperFunctions'
import { connect } from 'react-redux'
import axios from '../../../utils/axiosInstance'

const { Content } = Layout

const STEPS = {
  'auth': 'auth',
  'select': 'select',
  'finalize': 'finalize',
}

const AddWorkspacePageMobile = (props) => {
  const navigate = useNavigate()
  // const location = useLocation()
  const params = useParams()
  
  const { workspaces } = props

  const paramStepName = STEPS[params.stepName]
  const [currentStep, setCurrentStep] = useState(paramStepName || STEPS['auth'])
  const prevStep = usePrevious(currentStep)
  const [selectedWorkspace, setWorkspace] = useState(null)

  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [workspaceChannels, setWorkspaceChannels] = useState([])
  const [workspaceChannelsLoading, setWorkspaceChannelsLoading] = useState(false)
  const [selectedChannels, setSelectedChannels] = useState([])

  const [autoPay, setAutoPay] = useState(false)

  const [showTransition, setShowTransition] = useState(true)

  const svgCircleRef = React.createRef()
  const svgButtonRectRef = React.createRef()
  const svgButtonRectMaskRef = React.createRef()
  const svgBackgroundRef = React.createRef()
  const svgBackgroundMaskRef = React.createRef()

  const [selectWorkspaceSelected, setSelectWorkspaceSelected] = useState(false)


  useEffect(() => {


    let state = location.state
    let pathname = location.pathname
    if (state === undefined && (pathname === '/add-workspace' || pathname === '/add-workspace/auth')) {
      setShowTransition(true)
      setCurrentStep(STEPS.auth)
    } else if (state === undefined && pathname === '/add-workspace/select') {


      setCurrentStep(STEPS.select)
    } else {
      if(state !== undefined) {
        if(state.prevStep === STEPS.finalize && state.nextStep === STEPS.select) {
          setSelectWorkspaceSelected(true)
        }

        setCurrentStep(state.prevStep)
        setCurrentStep(state.nextStep)
      } else {

        setCurrentStep(STEPS.auth)
        setCurrentStep(STEPS.auth)
      }

    }
  }, [location.pathname])

  function changeBackStep() {
    let stepKeys = Object.keys(STEPS)
    let currentStepIndex = stepKeys.indexOf(currentStep)


    let nextStep = STEPS[stepKeys[currentStepIndex - 1]]

    navigate('/add-workspace/' + nextStep, { state: { prevStep: currentStep, nextStep: nextStep } })
  }

  function changeForwardStep() {

    let stepKeys = Object.keys(STEPS)
    let currentStepIndex = stepKeys.indexOf(currentStep)


    let nextStep = STEPS[stepKeys[currentStepIndex + 1]]

    navigate('/add-workspace/' + nextStep, { state: { prevStep: currentStep, nextStep: nextStep } })

  }

  function getStepNumber(stepWorkspaceName) {
    return Object.keys(STEPS).indexOf(stepWorkspaceName)
  }

  function applyChangeStepEffects(currentStep, nextStep) {


    if (currentStep === STEPS.auth && nextStep === STEPS.auth) {

      showAuthButtonSvg(svgButtonRectRef, Snap)
      authButtonMouseOut()
      setWorkspace(null)
      setSelectedSubscription(null)
      setSelectWorkspaceSelected(false)
    }

    if (currentStep === STEPS.select && currentStep === STEPS.select) {
      paymentGatewayBackgroundAnimation(true, svgBackgroundRef, svgBackgroundMaskRef, Snap)
      hideAuthButtonSvg(svgButtonRectRef, Snap)
      authButtonMouseIn(true)
    }

    if (currentStep === STEPS.auth && nextStep === STEPS.select) {
      hideAuthButtonSvg(svgButtonRectRef, Snap)
      authButtonMouseIn(true)
    }


    if (currentStep === STEPS.select && nextStep === STEPS.auth) {
      showAuthButtonSvg(svgButtonRectRef, Snap)
      authButtonMouseOut()

      setWorkspace(null)
      setSelectedSubscription(null)
      setSelectWorkspaceSelected(false)
    }

    if (currentStep === STEPS.select && nextStep === STEPS.finalize) {
      paymentGatewayBackgroundAnimation(false, svgBackgroundRef, svgBackgroundMaskRef, Snap)
      authButtonMouseIn(true)

    }

    if (currentStep === STEPS.finalize && nextStep === STEPS.select) {

      paymentGatewayBackgroundAnimation(true, svgBackgroundRef, svgBackgroundMaskRef, Snap)
      authButtonMouseIn(true)

    }

    if (currentStep === STEPS.finalize && nextStep === STEPS.auth) {

      paymentGatewayBackgroundAnimation(true, svgBackgroundRef, svgBackgroundMaskRef, Snap)

      let svgCircleRefCopy = {}
      svgCircleRefCopy.current = svgCircleRef.current
      let svgButtonRectRefCopy = {}
      svgButtonRectRefCopy.current = svgButtonRectRef.current
      let svgButtonRectMaskRefCopy = {}
      svgButtonRectMaskRefCopy.current = svgButtonRectMaskRef.current
      setTimeout(function () {

        Snap(svgButtonRectRefCopy.current).animate({
          width: '350',
          x: '15'
        }, 1500, mina.easeinout())

        Snap(svgButtonRectMaskRefCopy.current).animate({
          width: '350',
          x: '15'
        }, 1500, mina.easeinout())

        Snap(svgCircleRefCopy.current).animate({
          r: '1%'
        }, 2000, mina.easeout())
      }, 1500)
    }
  }

  function authButtonMouseOut() {
    Snap(svgButtonRectRef.current).animate({
      fill: Colors.primaryColor
    }, 200, mina.easein())

    Snap(svgCircleRef.current).animate({
      r: '1%'
    }, 1000, mina.easeout)
  }

  function authButtonMouseIn(notAnimateButton) {

    if (!notAnimateButton) {

      Snap(svgButtonRectRef.current).animate({
        fill: '#FFFFFF'
      }, 100, mina.easeout())

    }

    Snap(svgCircleRef.current).animate({
      r: '30%'
    }, 1000, mina.easein)

  }

  function hideAuthButtonSvg(svgButtonRect, Snap) {

    Snap(svgButtonRect.current).animate({
      width: '0',
      x: '0'
    }, 500, mina.easeinout())

    Snap(svgButtonRectMaskRef.current).animate({
      width: '0',
      x: '0'
    }, 500, mina.easeinout())
  }

  function showAuthButtonSvg(svgButtonRect, Snap) {

    Snap(svgButtonRect.current).animate({
      width: '350',
      x: '15'
    }, 1000, mina.easeinout())

    Snap(svgButtonRectMaskRef.current).animate({
      width: '350',
      x: '15'
    }, 1000, mina.easeinout())
  }

  function initSetupForPaymentGateway(svgBackground, svgBackgroundMask, svgButtonRectRef, svgButtonRectMaskRef, svgCircleRef, Snap) {

    Snap(svgBackground.current).attr({
      viewBox: '900 -575 4000 700'
    })

    Snap(svgBackgroundMaskRef.current).attr({
      viewBox: '900 -575 4000 700'
    })


    Snap(svgButtonRectRef.current).attr({
      width: '0',
      x: '0'
    })

    Snap(svgButtonRectMaskRef.current).attr({
      width: '0',
      x: '0'
    })

    Snap(svgCircleRef.current).animate({
      r: '30%'
    }, 2250, mina.easein)
  }

  function paymentGatewayBackgroundAnimation(reverse, svgBackground, svgBackgroundMask, Snap) {

    if (reverse) {

      Snap(svgBackground.current).animate({
        viewBox: '0 -68 1000 557'
      }, 2250, mina.easeinout())

      Snap(svgBackgroundMask.current).animate({
        viewBox: '0 -68 1000 557'
      }, 2250, mina.easeinout())

    } else {

      Snap(svgBackground.current).animate({
        viewBox: '900 -575 4000 700'
      }, 3250, mina.easeinout())

      Snap(svgBackgroundMask.current).animate({
        viewBox: '900 -575 4000 700'
      }, 3250, mina.easeinout())
    }


  }

  function getWorkspaceChannels(workspaceId, authData) {

    let token = authData.token
    setWorkspaceChannelsLoading(true)
    let maxRetry = 10
    let retryCounter = 0
    let interval = setInterval(() => {
      return axios.get(`/workspaces/${workspaceId}/channels`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then((channelsResponse) => {
          let channels = channelsResponse.data !== "" ? channelsResponse.data.channelsIn.concat(channelsResponse.data.IMChannelsIn) : []
          if(channels.length !== 0 || retryCounter > maxRetry) {

            clearInterval(interval)
            setWorkspaceChannels(channels)
          }

          retryCounter += 1
        })
    }, 4000)

  }

  const StepComponent = () => {
    const stepParams = useParams()
    const stepName = stepParams.stepName || STEPS.auth
    return getCurrentStepComponent(stepName)
  }

  function getCurrentStepComponent(stepName) {
    setCurrentStep(stepName)
    switch (stepName) {
      case STEPS['auth']:
        return <React.Fragment>
          <AuthWorkspace
            onMouseOut={authButtonMouseOut}
            onMouseIn={authButtonMouseIn}

          />


        </React.Fragment>
      case STEPS['select']:

        return <React.Fragment>
          <SelectWorkspace
            onInit={() => {


              // setTimeout(() => {
              //   hideAuthButtonSvg(svgButtonRectRef, Snap)
              //
              //   authButtonMouseIn(true)
              // }, 1000)

            }
            }
            selectedWorkspace={selectedWorkspace}
            selectedSubscription={selectedSubscription}
            workspaceChannels={workspaceChannels}
            selectedChannels={selectedChannels}
            onSelected={(workspaceSelected) => {


              setWorkspace(workspaceSelected)
              setSelectWorkspaceSelected(true)

              getWorkspaceChannels(workspaceSelected._id, props.authData)
              setSelectedChannels([])
            }
            }
            onSubscriptionSelected={(selectedSubscription) => {

              setSelectedSubscription(selectedSubscription)
            }
            }
          />

        </React.Fragment>

      case STEPS['finalize']:

        if (selectedWorkspace === null || selectedSubscription === null) {

          return <Redirect to={'/add-workspace/select'}/>
        }

        return <PaymentGateway  selectedWorkspace={selectedWorkspace} onInit={() => {

          // initSetupForPaymentGateway(svgBackgroundRef, svgBackgroundMaskRef, svgButtonRectRef, svgButtonRectMaskRef, svgCircleRef, Snap)

        }}
                               setShowTransition={setShowTransition}
                               changeBackStep={changeBackStep}
                               setSelectWorkspaceSelected={setSelectWorkspaceSelected}
                               selectedSubscription={selectedSubscription}
                               setAutoPay={setAutoPay}
                               autoPay={autoPay}
        />
      case 'finalize-3ds':
        return <ThreeDSRedirect/>
    }

  }

  function renderTransition() {
    if (showTransition) {

      return <S.StepTransition>
        <Button.Group size={'large'}>
          <S.NavButton onClick={changeBackStep} disabled={getStepNumber(currentStep) === 0} type="primary">
            <Icon type="left"/>
            Back
          </S.NavButton>
          <S.NavButton onClick={changeForwardStep}
                       disabled={getStepNumber(currentStep) === 2 || ((currentStep === STEPS.select && !selectWorkspaceSelected) || (currentStep === STEPS.select && !selectedSubscription))}
                       type="primary">
            Next
            <Icon type="right"/>
          </S.NavButton>
        </Button.Group>
      </S.StepTransition>
    } else {

      return null
    }
  }


  const { location } = props
  const { Step } = Steps
  return (
    <ErrorBoundary>
    <S.MainWrapper style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>

      <Header title={'Add Workspace'}/>


      <S.Content>
      <S.InnerContent>
        <S.Steps progressDot direction={'vertical'} onChange={changeForwardStep}
                 current={getStepNumber(currentStep)}>
          <Step icon={<Icon style={{ fontSize: '35px' }} type="api" theme="twoTone"/>} title="Authenticate"/>
          <Step icon={<Icon style={{ fontSize: '35px' }} type="idcard" theme="twoTone"/>} title="Select"/>
          <Step icon={<Icon style={{ fontSize: '35px' }} type="check-circle" theme="twoTone"/>} title="Finalize"/>
        </S.Steps>
        <S.Wrapper>
          <TransitionGroup style={{ height: '100%' }} className="transition-group">
            <CSSTransition
              style={{ width: '100%' }}
              key={location.key}
              timeout={{ enter: 300, exit: 300 }}
              classNames="fade"
            >
              <S.StepsContentWrapper>

                <Routes location={location}>
                  <Route path={`${location.pathname}/:stepName?`}
                         element={<StepComponent/>}/>
                </Routes>
              </S.StepsContentWrapper>

            </CSSTransition>
          </TransitionGroup>
        </S.Wrapper>
        {renderTransition()}
      </S.InnerContent>
      </S.Content>


    </S.MainWrapper>
    </ErrorBoundary>
  )
}


const S = {

  Content: styled(Content)`
    && {
      height: 90%;
      //padding: 10px 25px 10px 25px;
      position: relative;
      background: ${mainColors.App.sidebarColor};

    }
`,
  InnerContent: styled.div`
    background: white;
    padding: 25px 25px 10px 25px;

    border-top-right-radius: 4px;
    border-top-left-radius: 4px;
    width: 100%;
    height: 100%;
`,
  MainWrapper: styled.div`
    background: white;
  `,
  Wrapper: styled.span`
     & {
       z-index: 3;
       position: relative;
       width: 100%;
       height: 57%;
       display: block;
       
          .fade-enter {
              opacity: 0.01;
          }
          
          .fade-enter.fade-enter-active {
              opacity: 1;
              transition: opacity 300ms ease-in;
          }
          
          .fade-exit {
              opacity: 1;
          }
          
          .fade-exit.fade-exit-active {
              opacity: 0.01;
              transition: opacity 300ms ease-in;
          }
        }
        
`,
  NavButton: styled(Button)`
   && {
    background: none;
    border: none;
    box-shadow: none;
    color: #000000;
    font-weight: bold;
   }
   
   &&:hover {
    background: ${Colors.primaryColor}
   }

`,
  Steps: styled(Steps)`
    && {
      width: 120%;
      height: 27%;
      margin: 0 auto;
      z-index: 1;
      padding-left: 30%;
    }
    
    && .ant-steps-item-icon {
      width: 10px !important;
      height: 10px;
    }
`,
  StepsContentWrapper: styled.span`
    width: 80%;
    height: 88%;
    display: block;
    //margin: 0 auto;
    //padding-right: 25px;
    //padding-left: 25px;
    position: absolute;
    top: 0;
    
    
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
  StepTransition: styled.span`
    display: block;
    width: 100%;
    margin-top: 30px;
    text-align: center;
    z-index: 2;
    position: relative;
  `,
  SvgBackground: styled.svg`
  position: absolute;
  transform: translateX(-31%) translateY(calc(-39% - 5px));
  z-index: 2;
 
  
  `,
  AuthIllImage: styled.img`
        position: absolute;
        right: -112px;
        width: 400px;
        transform: scale(-1, 1);
        bottom: -45%;
        z-index: 1;
    `,
  ChooseIllImage: styled.img`
    position: absolute;
    right: 14%;
    width: 300px;
    top: 11%;
    filter: drop-shadow(2px -2px 5px #1890ff) drop-shadow(25px 14px 10px #aaa);
    transition: all 1s;
  `,
  SvgCircle: styled.circle`

  transform: translate(-27%,-25%) scale(4.0)
 
`


}

function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef()

  // Store current value in ref
  useEffect(() => {
    ref.current = value
  }, [value]) // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current
}


function mapStateToProps(state) {
  return {
    authData: state.authReducer.authData
  }
}

export default connect(mapStateToProps)(AddWorkspacePageMobile)
