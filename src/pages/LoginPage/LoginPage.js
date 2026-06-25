import React, { Fragment, useMemo, useState, useEffect } from 'react'
import Button from 'antd/es/button'
import Icon from '../../components/Icon/Icon'
import Layout from 'antd/es/layout'
import Tabs from 'antd/es/tabs'

import 'antd/es/tabs/style'
import 'antd/es/button/style'
import 'antd/es/layout/style'

import CONFIG from '../../config'
import ErrorBoundary from '../../components/utilComponents/HOCs/ErrorBoundary'
import styled, { keyframes } from 'styled-components'
import Colors from '../../constants/mainColors'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import IconTextButton from '../../components/IconTextButton/IconTextButton'
import StyledInput from '../../components/StyledInput/StyledInput'

import * as workspaceActions from '../../actions/workspacesActions'

import GoogleLogo from '../../static/images/google_logo.png'
import Logo from '../../static/images/logo-round.svg'
import { showErrorsForResponse } from '../../utils/helperFunctions'
import { authWithEmailAndPassword, googleAuthenticate, registerWithEmailAndPassword } from '../../actions/authActions'

import axios from '../../utils/axiosInstance'
import { getPostLoginPathFromLocation } from '../../utils/postLoginRedirect'

const { Content } = Layout
const { TabPane } = Tabs

const TAB_KEYS = {
  login: 'login',
  register: 'register'
}

const LoginPage = (props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnPath = useMemo(
    () => getPostLoginPathFromLocation(location),
    [location.pathname, location.search]
  )

  const browserSessionId = useMemo(() => {
    const fromParams = searchParams.get('browserSessionId')
    if (fromParams) {
      sessionStorage.setItem('browserSessionId', fromParams)
      return fromParams
    }
    return sessionStorage.getItem('browserSessionId') || null
  }, [searchParams])

  let [emailAddress, setEmailAddress] = useState('')
  let [password, setPassword] = useState('')

  let [fullNameReg, setFullNameReg] = useState('')
  let [passwordReg, setPasswordReg] = useState('')

  let [isLoading, setIsLoading] = useState(false)
  let [isGoogleLoading, setIsGoogleLoading] = useState(false)
  let [activeTab, setActiveTab] = useState(location.pathname === '/login' ? TAB_KEYS.login : TAB_KEYS.register)

  function postWarm(authToken) {
    return axios.post(`/login/warm`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'ClientId': 'landingPageClient',
      }
    })
      .then(req => {
        console.log('warm endpoint called')
      })
      .catch(err => {
        return showErrorsForResponse(err)
      })
  }

  function onSignWithGoogle(e) {
    let googleUrl = `${CONFIG.API_URL}/users/auth/google-link?returnTo=${encodeURIComponent(returnPath)}`
    if (browserSessionId) {
      googleUrl += `&browserSessionId=${encodeURIComponent(browserSessionId)}`
    }
    window.location.assign(googleUrl)
  }

  function onLogin(e) {
    setIsLoading(true)
    // postWarm(CONFIG.LANDING_PAGE_CLIENT_TOKEN)

    let postLoginRedirectPath = returnPath

    return props.authActions.authWithEmailAndPassword(emailAddress, password, browserSessionId)
      .then((responseData) => {
        if (responseData && typeof responseData.redirectPath === 'string' && responseData.redirectPath.trim() !== '') {
          postLoginRedirectPath = responseData.redirectPath
        }
        setIsLoading(false)
        navigate(postLoginRedirectPath, { replace: true })
      })
      .catch(error => {
        showErrorsForResponse(error)
        setIsLoading(false)
      })
  }

  function onRegister(e) {
    setIsLoading(true)
    // postWarm(CONFIG.LANDING_PAGE_CLIENT_TOKEN)

    let postRegisterRedirectPath = returnPath

    return props.authActions.registerWithEmailAndPassword(emailAddress, passwordReg, fullNameReg, browserSessionId)
      .then((responseData) => {
        if (responseData && typeof responseData.redirectPath === 'string' && responseData.redirectPath.trim() !== '') {
          postRegisterRedirectPath = responseData.redirectPath
        }
        setIsLoading(false)
        return responseData
      })
      .then(() => {
        navigate(postRegisterRedirectPath, { replace: true })
      })
      .catch(error => {
        showErrorsForResponse(error)
        setIsLoading(false)
      })
  }

  return (
    <ErrorBoundary>
      <S.MainWrapper>

        <S.LeftSide>
          <S.MessageContainer>
            <S.LogoContainer onClick={() => window.open(CONFIG.LANDING_URL, '_self')}>
              <S.Logo src={Logo}/>
              <S.LogoText>LiveDemo</S.LogoText>
            </S.LogoContainer>

            <S.Title>
              <span>{activeTab === 'login' ? 'Welcome back' : 'Get started free'}</span>
            </S.Title>

            <S.BenefitsList>
              <S.BenefitItem>
                <S.CheckIcon>✓</S.CheckIcon>
                <S.BenefitText>Create stunning product demos in minutes</S.BenefitText>
              </S.BenefitItem>
              <S.BenefitItem>
                <S.CheckIcon>✓</S.CheckIcon>
                <S.BenefitText>Embed anywhere - websites, blogs & social media</S.BenefitText>
              </S.BenefitItem>
              <S.BenefitItem>
                <S.CheckIcon>✓</S.CheckIcon>
                <S.BenefitText>No credit card required to start</S.BenefitText>
              </S.BenefitItem>
            </S.BenefitsList>

            <S.Splitter />

            <S.Subtitle>
              Capture screens, videos and webpages from your product to create interactive guided demos
            </S.Subtitle>

            <S.SocialProof>
              <S.ProofItem>
                <S.ProofNumber>5x+</S.ProofNumber>
                <S.ProofLabel>Return on Investment</S.ProofLabel>
              </S.ProofItem>
              <S.ProofItem>
                <S.ProofNumber>50K+</S.ProofNumber>
                <S.ProofLabel>Demos Created</S.ProofLabel>
              </S.ProofItem>
              <S.ProofItem>
                <S.ProofNumber>95%</S.ProofNumber>
                <S.ProofLabel>Customer Satisfaction</S.ProofLabel>
              </S.ProofItem>
            </S.SocialProof>

          </S.MessageContainer>
        </S.LeftSide>

        <S.RightSide>
          <S.Modal__Container>
            <S.Modal>
              <Fragment>
                <S.Tabs
                  defaultActiveKey={activeTab}
                  activeKey={activeTab}
                  onChange={(newActiveTab) => setActiveTab(newActiveTab)}
                  animated={false}
                  tabPosition={'top'}
                >
                  <S.TabPaneLogin tab={'Log in'} key={TAB_KEYS.login}>
                    <S.Content>
                      <S.FormHeader>
                        <S.FormTitle>Log in to your account</S.FormTitle>
                        <S.FormSubtitle>Continue where you left off</S.FormSubtitle>
                      </S.FormHeader>

                      <S.GoogleButton
                        loading={isGoogleLoading}
                        onClick={onSignWithGoogle}
                        img={GoogleLogo}
                        text={'Continue with Google'}
                        buttonStyles={{
                          maxWidth: '100%',
                          width: '100%'
                        }}
                      />

                      <S.TextSplitter>
                        <S.SplitterLine />
                        <S.SplitterText>or</S.SplitterText>
                        <S.SplitterLine />
                      </S.TextSplitter>

                      <S.InputGroup>
                        <S.Label>Email address</S.Label>
                        <S.StyledInput
                          size="large"
                          placeholder="name@company.com"
                          type={'email'}
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          onPressEnter={onLogin}
                        />
                      </S.InputGroup>

                      <S.InputGroup>
                        <S.LabelRow>
                          <S.Label>Password</S.Label>
                          {/*<S.ForgotPassword>Forgot password?</S.ForgotPassword>*/}
                        </S.LabelRow>
                        <S.StyledInput
                          size="large"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onPressEnter={onLogin}
                        />
                      </S.InputGroup>

                      <S.LoginButton
                        type={'Primary'}
                        loading={isLoading}
                        onClick={onLogin}
                      >
                        Log In
                        <S.LoginButtonIcon type={'arrow-right'}/>
                      </S.LoginButton>

                      <S.BottomText>
                        Don't have an account? <S.Link onClick={() => setActiveTab(TAB_KEYS.register)}>Sign up free</S.Link>
                      </S.BottomText>
                    </S.Content>
                  </S.TabPaneLogin>

                  <S.TabPaneRegister tab={'Sign Up'} key={TAB_KEYS.register}>
                    <S.Content>
                      <S.FormHeader>
                        <S.FormTitle>Create your account</S.FormTitle>
                        <S.FormSubtitle>Start creating demos in 60 seconds</S.FormSubtitle>
                      </S.FormHeader>

                      <S.GoogleButton
                        loading={isGoogleLoading}
                        onClick={onSignWithGoogle}
                        img={GoogleLogo}
                        text={'Continue with Google'}
                        buttonStyles={{
                          maxWidth: '100%',
                          width: '100%'
                        }}
                      />

                      <S.TextSplitter>
                        <S.SplitterLine />
                        <S.SplitterText>or</S.SplitterText>
                        <S.SplitterLine />
                      </S.TextSplitter>

                      <S.InputGroup>
                        <S.Label>Full name</S.Label>
                        <S.StyledInput
                          size="large"
                          placeholder="John Smith"
                          value={fullNameReg}
                          onChange={(e) => setFullNameReg(e.target.value)}
                          onPressEnter={onRegister}
                        />
                      </S.InputGroup>

                      <S.InputGroup>
                        <S.Label>Email</S.Label>
                        <S.StyledInput
                          size="large"
                          placeholder="name@company.com"
                          type={'email'}
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          onPressEnter={onRegister}
                        />
                      </S.InputGroup>

                      <S.InputGroup>
                        <S.Label>Password</S.Label>
                        <S.StyledInput
                          size="large"
                          type="password"
                          placeholder="Create a strong password"
                          value={passwordReg}
                          onChange={(e) => setPasswordReg(e.target.value)}
                          onPressEnter={onRegister}
                        />
                        <S.PasswordHint>Must be at least 8 characters</S.PasswordHint>
                      </S.InputGroup>

                      <S.LoginButton
                        loading={isLoading}
                        type={'Primary'}
                        onClick={onRegister}
                      >
                        Create Account
                        <S.LoginButtonIcon type={'arrow-right'}/>
                      </S.LoginButton>

                      <S.SmallText>
                        By signing up, you agree to our <S.Link href={CONFIG.LANDING_URL + '/terms'}>Terms of Service</S.Link> and <S.Link href={CONFIG.LANDING_URL + '/terms'}>Privacy Policy</S.Link>
                      </S.SmallText>

                      <S.BottomText>
                        Already have an account? <S.Link onClick={() => setActiveTab(TAB_KEYS.login)}>Log in</S.Link>
                      </S.BottomText>
                    </S.Content>
                  </S.TabPaneRegister>
                </S.Tabs>
              </Fragment>
            </S.Modal>
          </S.Modal__Container>
        </S.RightSide>

      </S.MainWrapper>
    </ErrorBoundary>
  )
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

const S = {
  LogoContainer: styled.div`
    display: flex;
    align-items: center;
    height: 60px;
    width: fit-content;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  `,
  Logo: styled.img`
    width: 40px;
    height: 40px;
    vertical-align: middle;
  `,
  LogoText: styled.p`
    margin: 0 0 0 12px;
    padding: 0;
    font-size: 1.8em;
    font-weight: bold;
    display: block;
    line-height: 1;
    text-transform: uppercase;
    color: #111;
    letter-spacing: 1.5px;
  `,
  FormHeader: styled.div`
    text-align: center;
    margin-bottom: 24px;
  `,
  FormTitle: styled.p`
    font-size: 1.6em;
    font-weight: 700;
    color: #111;
    margin: 0 0 6px 0;
  `,
  FormSubtitle: styled.p`
    font-size: 0.95em;
    color: #6b7280;
    margin: 0;
  `,
  GoogleButton: styled(IconTextButton)`
    && {
      height: 48px !important;
      border: 1.5px solid #e5e7eb !important;
      border-radius: 8px !important;
      font-weight: 500 !important;
      font-size: 1em !important;
      transition: all 0.2s !important;

      &:hover {
        border-color: #d1d5db !important;
        background: #f9fafb !important;
      }
    }
  `,
  InputGroup: styled.div`
    margin-bottom: 16px;
    width: 100%;
  `,
  Label: styled.p`
    display: block;
    font-size: 0.9em;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
  `,
  LabelRow: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  `,
  ForgotPassword: styled.a`
    font-size: 0.85em;
    color: ${Colors.primaryColor};
    cursor: pointer;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  `,
  PasswordHint: styled.span`
    display: block;
    font-size: 0.8em;
    color: #6b7280;
    margin-top: 4px;
  `,
  StyledInput: styled(StyledInput)`
    &&& {
      font-size: 1em;
      width: 100%;
      height: 48px;
      border-radius: 8px;
      border: 1.5px solid #e5e7eb;
      transition: all 0.2s;

      &:hover {
        border-color: #d1d5db;
      }

      &:focus {
        border-color: ${Colors.primaryColor};
        box-shadow: 0 0 0 3px rgba(81, 111, 247, 0.1);
      }
    }
  `,
  TextSplitter: styled.div`
    display: flex;
    align-items: center;
    margin: 20px 0;
    width: 100%;
  `,
  SplitterLine: styled.div`
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  `,
  SplitterText: styled.span`
    color: #6b7280;
    font-size: 0.85em;
    padding: 0 12px;
    font-weight: 500;
  `,
  SmallText: styled.p`
    text-align: center;
    margin: 12px 0 0 0;
    font-size: 0.8em;
    color: #6b7280;
    line-height: 1.5;
  `,
  BottomText: styled.p`
    text-align: center;
    margin: 16px 0 0 0;
    font-size: 0.9em;
    color: #6b7280;
  `,
  Link: styled.a`
    color: ${Colors.primaryColor};
    cursor: pointer;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  `,
  LoginButton: styled(Button)`
    && {
      height: 48px;
      width: 100%;
      margin-top: 8px;
      background-color: ${Colors.primaryColor};
      color: #FFF !important;
      font-size: 1.05em;
      font-weight: 600;
      border-radius: 8px;
      border: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
    }

    && .anticon > svg {
      width: 1.2em;
      height: 1.2em;
    }

    && .anticon {
      margin-left: 8px;
    }

    &&:hover {
      background-color: ${Colors.primaryColorDarker} !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(81, 111, 247, 0.3);
    }

    &&:active {
      transform: translateY(0);
    }
  `,
  LoginButtonIcon: styled(Icon)`
    && {
      width: 20px;
      height: 20px;
      vertical-align: middle;
    }

    && svg {
      fill: #ffffff;
      width: 100%;
      height: 100%;
    }
  `,
  Content: styled.div`
    width: 100%;
    height: 100%;
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  MainWrapper: styled.div`
    background: white;
    height: 100%;
    position: relative;
    overflow: hidden;
    width: 100%;
    //min-height: 100vh;
    max-width: 1800px;
    margin: 0 auto;

    @media (max-width: 1024px) {
      padding: 0;
    }
  `,
  LeftSide: styled.div`
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 58%;
    background: #fff;
    z-index: 1;

    @media (max-width: 1024px) {
      display: none;
    }
  `,
  MessageContainer: styled.div`
    position: relative;
    padding: 60px 80px;
    max-width: 900px;
    margin: 0 auto;
    animation: ${fadeIn} 0.6s ease-out;

    @media (max-width: 1200px) {
      padding: 40px 50px;
    }
  `,
  Title: styled.div`
    font-size: 52px;
    line-height: 1.2;
    color: #111;
    font-weight: 700;
    margin-top: 60px;

    && span {
      color: ${Colors.primaryColor};
    }

    @media (max-width: 1200px) {
      font-size: 42px;
      margin-top: 40px;
    }
  `,
  BenefitsList: styled.div`
    margin-top: 40px;
  `,
  BenefitItem: styled.div`
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
    animation: ${fadeIn} 0.6s ease-out;
    animation-fill-mode: both;

    &:nth-child(1) { animation-delay: 0.1s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.3s; }
    &:nth-child(4) { animation-delay: 0.4s; }
  `,
  CheckIcon: styled.div`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${Colors.primaryColor} 0%, #409ff8 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    flex-shrink: 0;
    margin-right: 12px;
  `,
  BenefitText: styled.div`
    font-size: 18px;
    line-height: 1.5;
    color: #374151;
    font-weight: 500;
  `,
  Splitter: styled.div`
    position: relative;
    margin: 50px 0 30px;
    background: linear-gradient(90deg, ${Colors.primaryColor}, #409ff8);
    width: 80px;
    height: 4px;
    border-radius: 10px;
  `,
  Subtitle: styled.div`
    font-size: 20px;
    line-height: 1.6;
    font-weight: 400;
    color: #6b7280;
    margin-bottom: 40px;
  `,
  SocialProof: styled.div`
    display: flex;
    gap: 40px;
    margin-top: 40px;

    @media (max-width: 1200px) {
      gap: 30px;
    }
  `,
  ProofItem: styled.div`
    text-align: center;
  `,
  ProofNumber: styled.div`
    font-size: 32px;
    font-weight: 700;
    color: ${Colors.primaryColor};
    margin-bottom: 4px;
  `,
  ProofLabel: styled.div`
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
  `,
  RightSide: styled.div`
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: 42%;
    background: linear-gradient(174.38deg, rgba(81,111,247,0.95) 0%, ${Colors.primaryColor} 100%);
    background-repeat: no-repeat;
    background-attachment: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;

    @media (max-width: 1024px) {
      width: 100%;
      position: relative;
    }
  `,
  Modal__Container: styled.div`
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
  `,
  Modal: styled.div`
    width: 90vw;
    max-width: 440px;
    max-height: 100%;
    overflow-y: auto;
    vertical-align: middle;
    display: flex;
    flex-direction: column;
    background: #fff;
    text-align: left;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
    border-radius: 16px;
    animation: ${fadeIn} 0.4s ease-out;
  `,
  TabPaneLogin: styled(TabPane)`
    //min-height: 480px;
    position: relative;
  `,
  TabPaneRegister: styled(TabPane)`
    //min-height: 580px;
    position: relative;
  `,
  Tabs: styled(Tabs)`
    && .ant-tabs-tab {
      font-family: ${Colors.fontFamily};
    }

    && .ant-tabs-nav {
      width: 100%;
      margin: 0;
    }

    && .ant-tabs-nav-list {
      width: 100%;
      display: flex;
    }

    && .ant-tabs-tab {
      flex: 1;
      margin: 0 !important;
      justify-content: center;
      display: flex;
      align-items: center;
      text-align: center;
      font-size: 1.05em;
      padding: 14px 8px;
      font-weight: 600;
      color: #6b7280;
      transition: all 0.2s;
    }

    && .ant-tabs-tab-active {
      color: ${Colors.primaryColor};
    }

    && .ant-tabs-tab-btn {
      text-align: center;
    }

    && .ant-tabs-bar {
      margin: 0 0px 0 0;
      border-bottom: 1px solid #e5e7eb;
    }
    && .ant-tabs {
      overflow: initial;
    }

    && .ant-tabs-ink-bar {
      height: 3px;
      background: ${Colors.primaryColor};
    }

    @media (min-width: 900px) {
      && .ant-tabs-tab {
        font-size: 1.1em;
        padding: 16px 0;
      }
    }
  `
}

function mapStateToProps(state) {
  return {
    authData: state.authReducer.authData
  }
}

function mapDispatchToProps(dispatch) {
  return {
    workspaceActions: bindActionCreators(workspaceActions, dispatch),
    authActions: bindActionCreators({
      authWithEmailAndPassword,
      registerWithEmailAndPassword,
      googleAuthenticate
    }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage)
