// in src/restricted.js
import React from 'react'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import SuspenseWrapper from './SuspenseWrapper'

function SwitchComponentIfAuth(NonAuthComponent, AuthComponent) {


  class RedirectComponent extends React.Component {
    constructor(props, context) {
      super(props, context)
    }

    getComponentToRender() {

      if (this.props.authData) {
        return AuthComponent
      } else {
        return NonAuthComponent
      }
    }

    render() {

      let ComponentToRender = this.getComponentToRender()

      return ComponentToRender
    }
  }


  function mapStateToProps(state) {

    return {
      authData: (Object.entries(state.authReducer.authData).length === 0 && state.authReducer.authData.constructor === Object) ? null : state.authReducer.authData
    }
  }

  const ConnectedComponent = connect(mapStateToProps)(RedirectComponent)
  return <ConnectedComponent />
}

function RedirectComponentIfAuth(currentPath, redirectPath, NonAuthComponent, AuthComponent) {
  const RedirectComponentWrapper = (props) => {
    const navigate = useNavigate()

    if (props.authData) {
      return <AuthComponent/>
    } else if (props.authData && currentPath !== redirectPath) {
      return <AuthComponent/>
    } else if (!props.authData && currentPath !== redirectPath) {
      navigate(redirectPath)
      return <React.Fragment/>
    } else if (!props.authData && currentPath === redirectPath) {
      return <NonAuthComponent/>
    }
    return null
  }

  function mapStateToProps(state) {
    return {
      authData: (Object.entries(state.authReducer.authData).length === 0 && state.authReducer.authData.constructor === Object) ? null : state.authReducer.authData
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

//
// //TODO: implement a saving of accessed url and redirect on successful login
// function RedirectToLoginIfNotAuth(WrappedComponent) {
//   return class extends React.Component {
//     constructor(props, context) {
//       super(props, context)
//
//       this.checkAuthentication = this.checkAuthentication.bind(this)
//     }
//
//     componentWillMount() {
//       this.checkAuthentication(this.props);
//     }
//
//     componentWillReceiveProps(nextProps) {
//       if (nextProps.location !== this.props.location) {
//         this.checkAuthentication(nextProps);
//       }
//     }
//
//     checkAuthentication(params) {
//       const { history } = params;
//       if(!Auth.isUserAuthenticated()){
//         history.replace({ pathname: '/login' })
//       }
//     }
//     render() {
//       return <WrappedComponent {...this.props} />;
//     }
//   }
// }

export default {
  RedirectComponentIfAuth: RedirectComponentIfAuth,
  SwitchComponentIfAuth: SwitchComponentIfAuth,
  WithSuspense: WithSuspense
}
