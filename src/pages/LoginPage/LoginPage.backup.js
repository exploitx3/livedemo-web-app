import React, { Fragment, useState } from 'react'
//import { Button, Icon, Layout, Tabs } from 'antd'

import Button from 'antd/es/button'
import Icon from '../../components/Icon/Icon'
import Layout from 'antd/es/layout'
import Tabs from 'antd/es/tabs'

import 'antd/es/tabs/style'
import 'antd/es/button/style'
import 'antd/es/layout/style'

import CONFIG from '../../config'
import ErrorBoundary from '../../components/utilComponents/HOCs/ErrorBoundary'
import styled from 'styled-components'
import Colors from '../../constants/mainColors'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import IconTextButton from '../../components/IconTextButton/IconTextButton'
import StyledInput from '../../components/StyledInput/StyledInput'

import * as workspaceActions from '../../actions/workspacesActions'

import GoogleLogo from '../../static/images/google_logo.png'
import Logo from '../../static/images/logo-round.svg'
import { showErrorsForResponse } from '../../utils/helperFunctions'
import { authWithEmailAndPassword, googleAuthenticate, registerWithEmailAndPassword } from '../../actions/authActions'

import axios from '../../utils/axiosInstance'

const { Content } = Layout

const { TabPane } = Tabs

const TAB_KEYS = {
  login: 'login',
  register: 'register'
}

const LoginPage = (props) => {
  console.log(props)
  const location = useLocation()

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
    setIsGoogleLoading(true)

    postWarm(CONFIG.LANDING_PAGE_CLIENT_TOKEN)
    window.open(CONFIG.API_URL + '/users/auth/google-link', '_self')
  }

  function onLogin(e) {
    setIsLoading(true)

    postWarm(CONFIG.LANDING_PAGE_CLIENT_TOKEN)

    return props.authActions.authWithEmailAndPassword(emailAddress, password)

      .then(userData => {

        console.log(userData)
        setIsLoading(false)

      })
      .catch(error => {

        showErrorsForResponse(error)
        setIsLoading(false)
      })

  }


  function onRegister(e) {

    setIsLoading(true)

    postWarm(CONFIG.LANDING_PAGE_CLIENT_TOKEN)

    return props.authActions.registerWithEmailAndPassword(emailAddress, passwordReg, fullNameReg)

      .then(userData => {

        console.log(userData)
        setIsLoading(false)


        return postWarm(CONFIG.LANDING_PAGE_CLIENT_TOKEN)
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
            <S.LogoContainer>
              <S.Logo src={Logo}/>
              <S.LogoText onClick={() => {
                window.open(CONFIG.LANDING_URL, '_self')
              }}>
                LiveDemo</S.LogoText>
            </S.LogoContainer>

            <S.Title>
              <span>{activeTab == 'login' ? 'Login' : 'Get started free'} </span><br/>
            </S.Title>
            <S.SmallTitle>
              Do you know you can embed LiveDemos into websites, blogs and social media<span role="img" aria-label="sparkles">✨</span>?
            </S.SmallTitle>

            <S.Splitter>

            </S.Splitter>

            <S.Subtitle>
              Live Demo is a guided product demo with screens, videos and webpages captured from your product<br/>
            </S.Subtitle>

          </S.MessageContainer>
        </S.LeftSide>


        <S.RightSide>
          <S.Modal__Container>
            <S.Modal>

              <Fragment>

                <S.Tabs defaultActiveKey={activeTab} activeKey={activeTab} onChange={(newActiveTab) => {
                  setActiveTab(newActiveTab)
                }
                }
                        animated={false}
                        tabPosition={'top'}
                >
                  <S.TabPaneLogin tab={'Log in'} key={TAB_KEYS.login}>
                    <S.Content>
                      <IconTextButton
                        loading={isGoogleLoading}
                        onClick={(e) => {
                          onSignWithGoogle(e)
                        }} img={GoogleLogo} text={'Google'}
                        buttonStyles={{
                        maxWidth: '335px',
                        width: '100%'
                      }}/>
                      <S.TextSplitter>or
                      </S.TextSplitter>
                      <S.StyledInput
                        size="large"
                        placeholder="Email Address"
                        type={'email'}
                        value={emailAddress}
                        onChange={(event) => {

                          setEmailAddress(event.target.value)
                        }}
                        onPressEnter={(e) => {
                          onLogin(e)
                        }}
                      />
                      <S.StyledInput
                        size="large"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(event) => {

                          setPassword(event.target.value)
                        }}
                        onPressEnter={(e) => {
                          onLogin(e)
                        }}
                      />
                      <S.SmallText>I may need to reset my password.</S.SmallText>
                      <S.LoginButton type={'Primary'}
                                     loading={isLoading}
                                     onClick={(e) => {
                                       onLogin(e)
                                     }}>
                        Log In
                        <S.LoginButtonIcon size={'small'} type={'arrow-right'}/>
                      </S.LoginButton>
                    </S.Content>
                  </S.TabPaneLogin>
                  <S.TabPaneRegister tab={'Sign Up'} key={TAB_KEYS.register}>
                    <S.Content>
                      <S.FormHeader>
                        <S.FormTitle>Create your account</S.FormTitle>
                        <S.FormSubtitle>Start creating demos in 60 seconds</S.FormSubtitle>
                      </S.FormHeader>
                      <IconTextButton
                        loading={isGoogleLoading}
                        onClick={(e) => {
                          onSignWithGoogle(e)
                        }}
                        img={GoogleLogo} text={'Google'} buttonStyles={{
                        maxWidth: '335px',
                        width: '100%'
                      }}/>
                      <S.TextSplitter>or
                      </S.TextSplitter>
                      <S.StyledInput
                        size="large"
                        placeholder="Full Name"
                        value={fullNameReg}
                        onChange={(event) => {

                          setFullNameReg(event.target.value)
                        }}
                        onPressEnter={(e) => {
                          onRegister(e)
                        }}
                      />
                      <S.StyledInput
                        size="large"
                        placeholder="Work Email"
                        value={emailAddress}
                        onChange={(event) => {

                          setEmailAddress(event.target.value)
                        }}
                        onPressEnter={(e) => {
                          onRegister(e)
                        }}
                      />
                      <S.StyledInput
                        size="large"
                        type="password"
                        placeholder="Password"
                        value={passwordReg}
                        onChange={(event) => {

                          setPasswordReg(event.target.value)
                        }}
                        onPressEnter={(e) => {
                          onRegister(e)
                        }}
                      />
                      <S.SmallText>
                        By proceeding, you agree to the Terms of Service and acknowledge you have read the Privacy
                        Policy.
                      </S.SmallText>
                      <S.LoginButton
                        loading={isLoading}
                        type={'Primary'}
                        onClick={(e) => {
                          onRegister(e)
                        }}>
                        Sign Up
                        <S.LoginButtonIcon size={'small'} type={'arrow-right'}/>
                      </S.LoginButton>
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
const S = {
  LogoContainer: styled.div`
    display: flex;
    align-items: center;
    height: 80px;
    width: fit-content;

    &&:hover {
      cursor: pointer;
    }
  `,
  Logo: styled.img`
      && {
        width: 37px;
        height: 37px;
        vertical-align: middle;

      }

      && svg {
        fill: ${Colors.primaryColor};
        width: 100%;
        height: 100%;
      }
  `,
  LogoText: styled.p`
    margin: 0 0 0 8px;
    padding: 0;
    font-size: 2em;
    font-weight: bold;
    width: 70px;
    height: 40px;
    display: block;
    line-height: 40px;
    vertical-align: middle;
    text-transform: uppercase;
    color: black;
    letter-spacing: 2.2px;
  `,
  StyledInput: styled(StyledInput)`

    &&& {
      font-size: 1.4em;
      max-width: 335px;
      width: 100%;
      height: 50px;
      margin: 0px auto 5px auto;
    }

  `,
  TextSplitter: styled.p`
    color: #8d9599;
    font-size: 1.3em;
    text-align: center;
    margin: 20px auto;
  `,
  SmallText: styled.p`
    text-align: center;
    margin: 10px auto;
    font-size: 0.95em;
  `,
  LoginButton: styled(Button)`
    && {
      height: 50px;
      width: 100%;
      //margin-top: 10px;
      background-color: ${Colors.primaryColor};
      color: #FFF;
      font-size: 1.3em;
    }

    && .anticon > svg {
      width: 1.4em;
      height: 1.4em;
    }

    && .anticon {
     margin-right: 10px;
    }

    &&:hover {
      background-color: ${Colors.primaryColorDarker};
    }
  `,
  LoginButtonIcon: styled(Icon)`
    && {
      width: 30px;
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
    padding: 30px 28px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

  `,
  MainWrapper: styled.div`
    background: white;
    height: 100%;
    position: relative;
    overflow: hidden;

    width: 100%;
    padding: 30px 36px;
    min-height: calc(100vh - 170px);
    max-width: 1800px;
    margin: 0 auto;

  `,
  LeftSide: styled.div`
    position: absolute;
    top: 0;
    left: 0;
    min-height: 100%;
    width: calc(62% - 1px);
    background: #fff;
  `,
  MessageContainer: styled.div`
    position: relative;
    padding: 20px 35px;
    max-width: 900px;
    margin: 0 auto;

  `,
  GoBack: styled.div`
    display: flex;
    align-items: center;
    height: 60px;

    &&:hover {
      cursor: pointer;
    }
  `,
  GoBack__Icon: styled(Icon)`

    && {
      width: 30px;
      height: 20px;
      vertical-align: middle;

    }

    && svg {
      fill: ${Colors.primaryColor};
      width: 100%;
      height: 100%;
    }
  `,
  GoBack__Text: styled.span`
    margin: 0 0 0 5px;
    padding: 0;
    font-size: 1.7em;
    width: 70px;
    height: 40px;
    display: block;
    line-height: 40px;
    vertical-align: middle;


  `,
  Title: styled.div`
    font-size: 65px;
    line-height: 80px;
    color: #000;
    font-weight: 700;
    margin-top: 45px;
    font-family: 'Montserrat', sans-serif;

    && span {
      color: #516ff7;
    }
  `,
  SmallTitle: styled.div`
    font-family: 'Montserrat', sans-serif;

    font-size: 30px;
    color: #111;
    line-height: 60px;
    font-weight: 700;
    margin-top: 15px;

  `,
  Splitter: styled.div`
    position: relative;
    margin: 40px 0 15px;
    background: #8d9599;
    opacity: .15;
    width: 70px;
    height: 6px;
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
  `,
  Subtitle: styled.div`
    font-family: 'Montserrat', sans-serif;
    font-size: 25px;
    line-height: 45px;
    font-weight: lighter;
    color: #8d9599;
    width: 100%;
  `,
  RightSide: styled.div`
    position: fixed;
    top: 0;
    right: 0;
    min-height: 100%;
    height: 100%;
    width: calc(38% + 1px);
    background-image: linear-gradient(174.38deg, rgba(64,159,248,.9) 4%, ${Colors.primaryColor} 52.8%);
    background-repeat: no-repeat;
    background-attachment: fixed;
    border-left: solid 1px rgba(0,0,0,.5);

    display: flex;
    justify-content: center;
    align-items: center;

    @media (max-width:767px) {
      width: 100%;
    }


  `,

  FormHeader: styled.div`
    text-align: center;
    margin-bottom: 24px;
  `,
  FormTitle: styled.h2`
    font-size: 1.6em;
    font-weight: 700;
    color: #111;
    margin: 0 0 6px 0;
    font-family: 'Montserrat', sans-serif;
  `,
  FormSubtitle: styled.p`
    font-size: 0.95em;
    color: #6b7280;
    margin: 0;
  `,
  Modal__Container: styled.div`
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;


  `,
  Modal: styled.div`

    width: 90vw;
    max-width: 380px;
    vertical-align: middle;

    justify-content: space-between;
    display: flex;
    flex-direction: column;
    background: #fff;
    overflow: hidden;
    text-align: left;
    -webkit-box-shadow: 0 10px 25px rgb(0 0 0 / 15%);
    -moz-box-shadown: 0 10px 25px rgba(0,0,0,.15);
    box-shadow: 0 10px 25px rgb(0 0 0 / 15%);
    -webkit-border-radius: 12px;
    -moz-border-radius: 12px;
    border-radius: 12px;
  `,
  TabPaneLogin: styled(TabPane)`
    height: 375px;
    position: relative;
`,
  TabPaneRegister: styled(TabPane)`
    height: 475px;
    position: relative;
`,
  Tabs: styled(Tabs)`

   && .ant-tabs-bar {

      margin: 0 6px 0 0;
   }

   //@media (min-width:900px) {
    && .ant-tabs-nav {
        width: 100%;
    }

    && .ant-tabs-nav > div {
        width: 100%;
        display: flex;
        justify-content: space-evenly;
    }

    && .ant-tabs-nav > div .ant-tabs-tab {
        font-size: 1.4em;

        padding: 12px 0;
        text-align: center;
        width: 50%;
        margin: 0;

    }

   //}

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

    workspaceActions: bindActionCreators(workspaceActions, dispatch),
    authActions: bindActionCreators({
      authWithEmailAndPassword,
      registerWithEmailAndPassword,
      googleAuthenticate
    }, dispatch)

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage)
