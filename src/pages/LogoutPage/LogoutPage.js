import React, { useState, useEffect, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { logout } from '../../actions/authActions'

const LogoutPage = (props) => {
  const navigate = useNavigate()

  useEffect(() => {
    let token = props.authData.token
    if(!token) {

      navigate('/')
    } else {

      props.actions.logout(token)
        .then(() => {
          navigate('/')
        })

    }

  })

  return (
    <Fragment>

    </Fragment>
  )
}

function mapStateToProps(state) {
  return {
    authData: state.authReducer.authData
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ logout: logout }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogoutPage)
