import React, { useState, useEffect, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import * as queryString from 'query-string/index'
import PropTypes from 'prop-types'
import { refreshToken } from '../../actions/authActions'

const ALLOWED_PAGES = {
  '/add-workspace/select': '/add-workspace/select'
}

const RefreshToken = (props) => {
  const location = useLocation()
  const navigate = useNavigate()

  let token = queryString.parse(location.search).token
  let page = queryString.parse(location.search).page
  if(!token || !ALLOWED_PAGES[page]) {

    navigate('/')
  } else {


    props.actions.refreshToken(token)
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

    actions: bindActionCreators({ refreshToken: refreshToken }, dispatch)

  }
}

export default connect(null, mapDispatchToProps)(RefreshToken)
