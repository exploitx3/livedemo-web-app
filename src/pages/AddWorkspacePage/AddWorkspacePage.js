import React, { useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useLocation, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import styled from 'styled-components'
import { CSSTransition, TransitionGroup, } from 'react-transition-group'
import '../../styles/removeSnapSVGbranding.css'

import Snap from 'snapsvg-cjs'
import Colors from '../../constants/mainColors'

import Header from '../../components/Header/Header'
import AuthWorkspace from './components/AuthWorkspace/AuthWorkspace'
import SelectWorkspace from './components/SelectWorkspace/SelectWorkspace'
import PaymentGateway from './components/PaymentGateway/PaymentGateway'
import ThreeDSRedirect from '../../components/Checkout/ThreeDSecureRedirect'
//import { Button, Icon, Layout, Steps } from 'antd'

import Button from 'antd/es/button'
import Icon from '../../components/Icon/Icon'
import Layout from 'antd/es/layout'
import Steps from 'antd/es/steps'
// Illustrations
import AuthImage from '../../static/images/auth-image.svg'
import ChooseImage from '../../static/images/choose-image.svg'
import ChooseImageSelected from '../../static/images/choose-image-selected.svg'
import ErrorBoundary from '../../components/utilComponents/HOCs/ErrorBoundary'
import axios from '../../utils/axiosInstance'
import SubscriptionTypes from '../../constants/SubscriptionTypes'
import { showErrorsForResponse } from '../../utils/helperFunctions'
import * as workspacesActions from '../../actions/workspacesActions'
import * as channelActions from '../../actions/channelsActions'
import * as walkthroughActions from '../../actions/walkthroughActions'

const { Content } = Layout

const STEPS = {
  'auth': 'auth',
  'select': 'select',
  'finalize': 'finalize',
}

const AddWorkspacePage = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const { workspaces } = props

  const paramStepName = STEPS[params.stepName]
  const [currentStep, setCurrentStep] = useState(paramStepName || STEPS['auth'])
  const prevStep = usePrevious(currentStep)
  const [selectedWorkspace, setWorkspace] = useState(null)

  let defaultSelectedSubscription = SubscriptionTypes.STANDARD

  const [selectedSubscription, setSelectedSubscription] = useState(defaultSelectedSubscription)
  const [workspaceChannels, setWorkspaceChannels] = useState([])
  const [workspaceChannelsLoading, setWorkspaceChannelsLoading] = useState(false)
  const [selectedChannels, setSelectedChannels] = useState(selectedWorkspace ? selectedWorkspace.populationConfig.selectedChannels : [])
  const [privateChannelsCheck, setPrivateChannelsCheck] = useState(selectedWorkspace ? selectedWorkspace.populationConfig.populatePrivateChannels : false)

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
      applyChangeStepEffects(currentStep || STEPS.select, STEPS.auth)
      setCurrentStep(STEPS.auth)
    } else if (state === undefined && pathname === '/add-workspace/select') {


      applyChangeStepEffects(currentStep || STEPS.select, STEPS.select)
      setCurrentStep(STEPS.select)
    } else {
      if(state !== undefined) {
        if(state.prevStep === STEPS.finalize && state.nextStep === STEPS.select) {
          setSelectWorkspaceSelected(true)
        }

        setCurrentStep(state.prevStep)
        applyChangeStepEffects(state.prevStep, state.nextStep)
        setCurrentStep(state.nextStep)
      } else {

        setCurrentStep(STEPS.auth)
        applyChangeStepEffects(STEPS.auth, STEPS.auth)
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
      setSelectedSubscription(SubscriptionTypes.STANDARD)
      setSelectedChannels([])
      setWorkspaceChannels([])
      // setPrivateChannelsCheck(false)
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

      props.workspaceActions.updateAllWorkspacesForUser(props.authData.token)

    }



    if (currentStep === STEPS.select && nextStep === STEPS.auth) {
      showAuthButtonSvg(svgButtonRectRef, Snap)
      authButtonMouseOut()

      setWorkspace(null)
      setSelectedSubscription(SubscriptionTypes.STANDARD)
      setSelectedChannels([])
      setWorkspaceChannels([])
      // setPrivateChannelsCheck(false)
      setSelectWorkspaceSelected(false)
    }

    if (currentStep === STEPS.select && nextStep === STEPS.finalize) {
      paymentGatewayBackgroundAnimation(false, svgBackgroundRef, svgBackgroundMaskRef, Snap)
      authButtonMouseIn(true)

      updateWorkspacePopulationConfig(selectedWorkspace, selectedChannels, privateChannelsCheck, props.authData)
    }

    if (currentStep === STEPS.finalize && nextStep === STEPS.select) {

      paymentGatewayBackgroundAnimation(true, svgBackgroundRef, svgBackgroundMaskRef, Snap)
      authButtonMouseIn(true)
      props.workspaceActions.updateAllWorkspacesForUser(props.authData.token)

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

  function updateWorkspacePopulationConfig(selectedWorkspace, selectedChannels, populatePrivateChannels, authData) {

    return axios.post(`workspaces/${selectedWorkspace._id}/updatePopulationConfig`, {
        selectedChannels,
        populatePrivateChannels
      }, {
        headers: {
          Authorization: `Bearer ${authData.token}`
        }

      })
      .then((response) => {
        console.log('workspace updatePopulationConfig successfull')
      })
      .catch(err => {
        console.log(err)
        // showErrorsForResponse(err)
      })
  }

  function getWorkspaceChannels(workspaceId, authData) {

    let token = authData.token

    setWorkspaceChannelsLoading(true)

    let maxRetry = 10
    let retryCounter = 0

    function getChannels() {
      return axios.get(`/workspaces/${workspaceId}/channels`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then((channelsResponse) => {
          // let channels = channelsResponse.data !== "" ? channelsResponse.data.channelsIn.concat(channelsResponse.data.IMChannelsIn) : []
          let channels = channelsResponse.data !== '' ? channelsResponse.data.channelsIn : []
          if (channels.length === 0 && retryCounter < maxRetry) {

            retryCounter += 1

            setTimeout(getChannels, 3000)
          } else {

            setWorkspaceChannels(channels)

            setWorkspaceChannelsLoading(false)
          }

        })
    }

    getChannels()


  }

  const StepComponentWrapper = ({ getCurrentStepComponent, defaultStep }) => {
    const params = useParams()
    const stepName = params.stepName || defaultStep
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

          <S.AuthIllImage src={AuthImage} alt="auth-image"/>

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
            workspaceChannelsLoading={workspaceChannelsLoading}
            selectedChannels={selectedChannels}
            privateChannelsCheck={privateChannelsCheck}
            onChannelsSelected={(newSelectedChannels) => {

              setSelectedChannels(newSelectedChannels)
            }
            }
            onPrivateChannelsCheck={(value) => {

              setPrivateChannelsCheck(value)
            }
            }
            onSelected={(workspaceSelected) => {


              setWorkspace(workspaceSelected)
              setSelectWorkspaceSelected(true)

              getWorkspaceChannels(workspaceSelected._id, props.authData)
              setSelectedChannels(workspaceSelected.populationConfig.selectedChannels)
              setPrivateChannelsCheck(workspaceSelected.populationConfig.populatePrivateChannels)
            }
            }
            onSubscriptionSelected={(selectedSubscription) => {

              setSelectedSubscription(selectedSubscription)
            }
            }
          />
          <S.ChooseIllImage
            src={(((currentStep === STEPS.select && !selectWorkspaceSelected) || (currentStep === STEPS.select && !selectedSubscription) || (currentStep === STEPS.select && selectedChannels.length === 0)) ? ChooseImage : ChooseImageSelected)}
            alt=""/>
        </React.Fragment>

      case STEPS['finalize']:

        if (selectedWorkspace === null || selectedSubscription === null) {

          return <Redirect to={'/add-workspace/select'}/>
        }

        return <PaymentGateway selectedWorkspace={selectedWorkspace} onInit={() => {}}
                               selectedSubscription={selectedSubscription}
                               setShowTransition={setShowTransition}
                               changeBackStep={()=>{}}
                               setSelectWorkspaceSelected={setSelectWorkspaceSelected}
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
                       disabled={getStepNumber(currentStep) === 2 || ((currentStep === STEPS.select && !selectWorkspaceSelected) || (currentStep === STEPS.select && !selectedSubscription) || (currentStep === STEPS.select && selectedChannels.length === 0))}
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

  // const { location } = props
  const { Step } = Steps
  return (
    <ErrorBoundary>
    <S.MainWrapper style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>

      <Header title={'Add Workspace'}/>


      <S.Content>
        <S.InnerContent>
        <S.SvgBackground width="365%" height="230%" viewBox="0 -68 1000 557" fill="none"
                         ref={svgBackgroundRef}
                         xmlns="http://www.w3.org/2000/svg">
          <rect ref={svgButtonRectRef} rx="10" id="svg_1" height="32" width="350" y="357" x="15" strokeWidth="1.1"
                stroke="#1890FF" fill="#1890FF"/>

          <path className={'background-path'}
                d="M103.182 399.879C237.682 507.879 497.182 478.879 614.682 399.879C732.182 320.879 696.388 149.394 810.682 34.8787C856.631 -11.1605 1214.89 -368.408 1590.68 -305.621C1590.68 -305.621 1819.31 -236.298 1969.18 -206.621C2479.29 -105.615 3300.68 -278.621 3300.68 -221.621C3300.68 -164.621 3422.5 617.5 3401.5 665.5L1969.18 917C1969.18 917 -83.1026 983.745 -107.818 486.245C-109.046 461.529 -114.318 466.879 -107.818 422.879C-101.318 378.879 -31.3184 291.879 103.182 399.879Z"
                fill="#FFFFFF" stroke="#1890FF"/>

        </S.SvgBackground>


        <S.SvgBackground
          width="365%"
          height="230%" viewBox="0 -68 1000 557" fill="none"
          ref={svgBackgroundMaskRef}
          xmlns="http://www.w3.org/2000/svg">


          <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="-112" y="-314" width="350%" height="230%">
            <S.SvgCircle ref={svgCircleRef} className={'animated-circle'} cx="10%" cy="10%" r="1%" fill="#C4C4C4"/>
          </mask>
          <g mask="url(#mask0)">
            <rect stroke="#000" rx="10" id="svg_1" height="32" width="350" y="357" x="15"
                  strokeWidth="1.5"
                  stroke="#1890FF"
                  ref={svgButtonRectMaskRef}
            />


            <path className={'mask-path'}
                  d="M103.182 399.879C237.682 507.879 497.182 478.879 614.682 399.879C732.182 320.879 696.388 149.394 810.682 34.8787C856.631 -11.1605 1214.89 -368.408 1590.68 -305.621C1590.68 -305.621 1819.31 -236.298 1969.18 -206.621C2479.29 -105.615 3300.68 -278.621 3300.68 -221.621C3300.68 -164.621 3422.5 617.5 3401.5 665.5L1969.18 917C1969.18 917 -83.1026 983.745 -107.818 486.245C-109.046 461.529 -114.318 466.879 -107.818 422.879C-101.318 378.879 -31.3184 291.879 103.182 399.879Z"
                  fill="#1890FF" stroke="#1890FF"/>
          </g>


        </S.SvgBackground>
        <S.Steps progressDot direction={'horizontal'} onChange={changeForwardStep}
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
                  <Route path={`${location.pathname.replace(/\/$/, '') || ''}/:stepName?`}
                         element={<StepComponentWrapper getCurrentStepComponent={getCurrentStepComponent} defaultStep={STEPS.auth}/>}/>
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
      height: 65%;
      position: relative;

    }
    background: ${Colors.App.sidebarColor};
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
       height: 100%;
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
      width: 90%;
      height: 70px;
      margin: 0 auto;
      z-index: 1;
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
    padding-right: 25px;
    padding-left: 25px;
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

function mapDispatchToProps(dispatch) {
  return {

    workspaceActions: bindActionCreators(workspacesActions, dispatch)

  }
}


export default connect(mapStateToProps, mapDispatchToProps)(AddWorkspacePage)
