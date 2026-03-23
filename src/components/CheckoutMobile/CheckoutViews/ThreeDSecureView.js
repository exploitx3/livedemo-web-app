import React, { useState, useEffect, Fragment } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors'
import ErrorBoundary from '../../utilComponents/HOCs/ErrorBoundary'

const ThreeDSecureView = ({threeDSecureUrl, on3DSCompleted}) => {

  function listen3DSCompleted(ev) {

    if (ev.data === '3DS-authentication-complete') {
      on3DSCompleted()
    }
  }

  useEffect(() => {

    window.addEventListener('message', listen3DSCompleted, false)

    return () => {
      window.removeEventListener('message', listen3DSCompleted)
    }
  }, [])


  return (
    <ErrorBoundary>

    <Fragment>
      <S.IFrame src={threeDSecureUrl} height="400" width="600" />
    </Fragment>
    </ErrorBoundary>
  )
}

const S = {
  IFrame: styled.iframe`
     margin: 0 auto;
     display: block;
    //Scroll Bar styles
    
    
`
}

export default ThreeDSecureView
