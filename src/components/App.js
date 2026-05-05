/* eslint-disable import/no-named-as-default */
import { Route, Routes } from 'react-router-dom'
import styled from 'styled-components'
import LoginPage from '../pages/LoginPage/LoginPage'
import ForgotPassword from '../pages/HomePage/ForgotPassword'
import AppLayout from '../pages/AppLayout/AppLayout'
import PropTypes from 'prop-types'
import React from 'react'
// import { hot } from 'react-hot-loader'
import HOC from './utilComponents/HOCs/HOCs'
import Auth from '../pages/Auth/Auth'
import RefreshToken from '../pages/RefreshToken/RefreshToken'
import ChangePassword from '../pages/ChangePassword/ChangePassword'
import { cssTransition, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { Toaster } from 'react-hot-toast'
import DemoLoginPage from '../pages/DemoLoginPage/DemoLoginPage'
import { isMobile } from 'react-device-detect'
import LiveDemoPreviewPage from '../pages/LiveDemoPreviewPage/LiveDemoPreviewPage'
import AutoRecordingPreviewPage from '../pages/AutoRecordingPreviewPage/AutoRecordingPreviewPage'
import DesktopAuthPage from '../pages/DesktopAuthPage/DesktopAuthPage'
import OnboardingPage from '../pages/OnboardingPage/OnboardingPage'
import DemoDashboardPage from '../pages/DemoDashboardPage/DemoDashboardPage'
import {enableMapSet} from "immer"
import TopLoadingBar from "./TopLoadingBar";
import 'antd/reset'

enableMapSet()


// This is a class-based component because the current
// version of hot reloading won't hot reload a stateless
// component at the top-level.

class App extends React.Component {
  constructor(props) {
    super(props)

    if(!isMobile) {
      // this.setupIntercom()
      // this.setupStonly()
      this.setupCrisp()
    }
  }

  setupIntercom() {

    window.intercomSettings = {
      api_base: "https://api-iam.intercom.io",
      app_id: "yme7c9oj"
    }


    const script = document.createElement('script');
    script.type = 'text/javascript'

    script.async = true;
    let code = "(function(){var w=window;var ic=w.Intercom;if(typeof ic===\"function\"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/yme7c9oj';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();\n"
    script.appendChild(document.createTextNode(code));

    const entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(script, entry);

  }

  setupStonly() {

    window.STONLY_WID = "52ad3cc4-bb71-11ec-9fb8-0ae9fa2a18a2"


    const script = document.createElement('script');
    script.type = 'text/javascript'

    script.async = true;
    let code = "!function(s,t,o,n,l,y,w,g){s.StonlyWidget||((w=s.StonlyWidget=function(){\n" +
      "  w._api?w._api.apply(w,arguments):w.queue.push(arguments)}).scriptPath=n,w.queue=[],(y=t.createElement(o)).async=!0,\n" +
      "  (g=new XMLHttpRequest).open(\"GET\",n+\"version?v=\"+Date.now(),!0),g.onreadystatechange=function(){\n" +
      "  4===g.readyState&&(y.src=n+\"stonly-widget.js?v=\"+(200===g.status?g.responseText:Date.now()),\n" +
      "  (l=t.getElementsByTagName(o)[0]).parentNode.insertBefore(y,l))},g.send())\n" +
      "  }(window,document,\"script\",\"https://stonly.com/js/widget/v2/\");"
    script.appendChild(document.createTextNode(code));

    const entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(script, entry);

  }

  setupCrisp() {
    /*
        <script type="text/javascript"></script>

    */

    const script = document.createElement('script')
    script.innerHTML = 'window.$crisp=[];window.CRISP_WEBSITE_ID="b1a68559-a717-494d-96f2-e47ea588617b";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();'

    const entry = document.getElementsByTagName('script')[0]
    entry.parentNode.insertBefore(script, entry)
  }

  setupErxes() {

    window.erxesSettings = {
      email: 'support@livedemo.ai',
      messenger: {
        brand_id: '9g2nqE',
        css: `

          .erxes-launcher {
              background-color: #F9F9F9!important;
              background-size: 30px!important;
              border: 2px solid #1890ff;
              box-shadow: 0 0 10px 0 rgb(24, 144, 255);
          }

           .erxes-messenger-hidden > iframe {
              width: 80px!important;
              height: 80px!important;
            }

           a.erxes-launcher.close, a.erxes-launcher.close-launcher {
              background-image: url('data:image/svg+xml;utf8,<svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 6.5L5.5 17.5" stroke="black" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 6.5L16.5 17.5" stroke="black" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/></svg>') !important;
           }
          `
      },
      phone: "",
      data: {
        domain: 'livedemo.ai',
      }
    }


    const script = document.createElement('script')
    script.src = 'https://livedemo.app.erxes.io/widgets/build/messengerWidget.bundle.js'
    script.async = true

    const entry = document.getElementsByTagName('script')[0]
    entry.parentNode.insertBefore(script, entry)

  }

  render() {
    const activeStyle = { color: 'blue' }
    return (
      <S.Main>
        <TopLoadingBar  />
        <S.Container>

          <Routes>
          <Route path="/auto-recordings/:autoRecordingId" element={<AutoRecordingPreviewPage/>}/>

            <Route path="/change-password" element={<ChangePassword/>}/>
            <Route path="/auth" element={<Auth/>}/>
            <Route path="/demo-login" element={<DemoLoginPage/>}/>
            <Route path="/desktop-auth" element={HOC.SwitchComponentIfAuth(<LoginPage/>, <DesktopAuthPage/>)}/>
            <Route path="/livedemos/:livedemoId" element={<LiveDemoPreviewPage/>}/>
            <Route path="/livedemos/:livedemoId/links/:linkId" element={<LiveDemoPreviewPage/>}/>

            <Route path="/refreshToken" element={<RefreshToken/>}/>
            <Route path="/onboarding" element={HOC.SwitchComponentIfAuth(<LoginPage/>, <OnboardingPage/>)}/>
            <Route path="/demo-dashboard" element={HOC.SwitchComponentIfAuth(<LoginPage/>, <DemoDashboardPage/>)}/>
            <Route path="/login" element={HOC.SwitchComponentIfAuth(<LoginPage/>, <AppLayout/>)}/>
            <Route path="/register" element={HOC.SwitchComponentIfAuth(<LoginPage/>, <AppLayout/>)}/>
            <Route path="/forgot-password" element={HOC.SwitchComponentIfAuth(<ForgotPassword/>, <AppLayout/>)}/>
            {/*<Route path="/register" element={HOC.SwitchComponentIfAuth(<RegisterPage/>, <AppLayout/>)}/>*/}

            <Route path="/" element={HOC.SwitchComponentIfAuth(<LoginPage/>, <AppLayout/>)}/>
            
            {/* Catch-all route for authenticated pages - must be last */}
            <Route path="/*" element={HOC.SwitchComponentIfAuth(<LoginPage/>, <AppLayout/>)}/>
          </Routes>
          {/*<Route path="/" element={() => <Navigate to={'/'} replace />} />*/}
          
          {/* react-toastify container with updated API */}
          <S.StyledToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable={false}
            pauseOnHover
            transition={cssTransition({
              enter: 'fadeIn',
              exit: 'fadeOut',
              duration: 400,
            })}
          />
          
          {/* react-hot-toast container */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              className: '',
              duration: 2000,
              style: {
                background: '#363636',
                color: '#fff',
              },

              // Default options for specific types
              success: {
                duration: 3000,
                theme: {
                  primary: 'green',
                  secondary: 'black',
                },
              },
            }}
          />
        </S.Container>
      </S.Main>
    )
  }
}

App.propTypes = {
  children: PropTypes.element
}


const S = {
  Main: styled.main`
    height: 100%;
    width: 100%
  `,
  Container: styled.section`
      width: 100%;
      height: 100%;
      display: block;
  `,
  StyledToastContainer: styled(ToastContainer)`
    .Toastify__toast {
      color: #000000;
    }

    .Toastify__toast-body {
      color: #000000;
    }
  `
}


export default App
