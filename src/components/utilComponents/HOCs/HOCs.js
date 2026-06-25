// in src/restricted.js
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import SuspenseWrapper from './SuspenseWrapper'

const EMAIL_VERIFY_PATH = '/email-verify'

function getAuthDataFromState(state) {
  const authData = state.authReducer.authData
  return (Object.entries(authData).length === 0 && authData.constructor === Object) ? null : authData
}

function isEmailVerified(authData) {
  if (authData?.isDemo) {
    return true
  }
  return authData?.emailVerified === true
}

function SwitchComponentIfAuth(NonAuthComponent, AuthComponent, options = {}) {
  const { bypassEmailVerify = false } = options

  const RedirectComponentWrapper = (props) => {
    const navigate = useNavigate()
    const location = useLocation()
    const hasAuth = !!props.authData
    const verified = isEmailVerified(props.authData)
    const onEmailVerifyPage = location.pathname === EMAIL_VERIFY_PATH

    useEffect(() => {
      if (hasAuth && !verified && !bypassEmailVerify && !onEmailVerifyPage) {
        navigate(EMAIL_VERIFY_PATH, { replace: true })
      } else if (hasAuth && verified && bypassEmailVerify && onEmailVerifyPage) {
        navigate('/', { replace: true })
      }
    }, [hasAuth, verified, bypassEmailVerify, onEmailVerifyPage, navigate])

    if (!hasAuth) {
      return NonAuthComponent
    }

    if (!verified && !bypassEmailVerify && !onEmailVerifyPage) {
      return <React.Fragment/>
    }

    if (verified && bypassEmailVerify && onEmailVerifyPage) {
      return <React.Fragment/>
    }

    return AuthComponent
  }

  function mapStateToProps(state) {
    return {
      authData: getAuthDataFromState(state)
    }
  }

  const ConnectedComponent = connect(mapStateToProps)(RedirectComponentWrapper)
  return <ConnectedComponent />
}

function RedirectComponentIfAuth(currentPath, redirectPath, NonAuthComponent, AuthComponent) {
  const RedirectComponentWrapper = (props) => {
    const navigate = useNavigate()
    const location = useLocation()
    const hasAuth = !!props.authData
    const verified = isEmailVerified(props.authData)

    useEffect(() => {
      if (hasAuth && !verified && location.pathname !== EMAIL_VERIFY_PATH) {
        navigate(EMAIL_VERIFY_PATH, { replace: true })
      } else if (!hasAuth && currentPath !== redirectPath) {
        navigate(redirectPath)
      }
    }, [hasAuth, verified, location.pathname, navigate])

    if (hasAuth && !verified && location.pathname !== EMAIL_VERIFY_PATH) {
      return <React.Fragment/>
    }

    if (hasAuth) {
      return <AuthComponent/>
    } else if (!hasAuth && currentPath !== redirectPath) {
      return <React.Fragment/>
    } else if (!hasAuth && currentPath === redirectPath) {
      return <NonAuthComponent/>
    }
    return null
  }

  function mapStateToProps(state) {
    return {
      authData: getAuthDataFromState(state)
    }
  }

  const ResultComp = connect(mapStateToProps)(RedirectComponentWrapper)

  return <ResultComp/>
}

export function WithSuspense(Component) {

  const WrappedComponent = (props) => {


    return (
      <SuspenseWrapper>
        <Component {...props}/>
      </SuspenseWrapper>
    )
  }

  return WrappedComponent
}

export default {
  RedirectComponentIfAuth: RedirectComponentIfAuth,
  SwitchComponentIfAuth: SwitchComponentIfAuth,
  WithSuspense: WithSuspense
}
