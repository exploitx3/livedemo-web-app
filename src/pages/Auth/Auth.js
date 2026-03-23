import React, { Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import * as queryString from 'query-string/index'
import { authWithToken } from '../../actions/authActions'

const ALLOWED_PAGES = {
  '/add-workspace/select': '/add-workspace/select',
  '/': '/'
}

const Auth = (props) => {
  const location = useLocation()
  const navigate = useNavigate()

  let token = queryString.parse(location.search).token
  let page = queryString.parse(location.search).page
  if(!token) {

    navigate('/')
  } else if (token && !ALLOWED_PAGES[page]) {


    props.actions.authWithToken(token)
      .then(() => {
        navigate('/')
      })

  } else {


    props.actions.authWithToken(token)
      .then(() => {
        navigate(ALLOWED_PAGES[page])
      })

  }


  return (
    <Fragment>

    </Fragment>
  )
}

function mapDispatchToProps(dispatch) {
  return {

    actions: bindActionCreators({ authWithToken: authWithToken }, dispatch)

  }
}

export default connect(null, mapDispatchToProps)(Auth)
