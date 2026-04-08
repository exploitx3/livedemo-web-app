import React, { Fragment, useEffect } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import * as queryString from 'query-string/index'
import { authWithToken } from '../../actions/authActions'
import { sanitizeReturnPath } from '../../utils/postLoginRedirect'

const Auth = (props) => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const { token, page } = queryString.parse(location.search)
    if (!token) {
      navigate('/')
      return
    }
    const safePage = sanitizeReturnPath(page != null && page !== '' ? page : '/')
    props.actions.authWithToken(token)
      .then(() => {
        navigate(safePage, { replace: true })
      })
  }, [location.search])

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
