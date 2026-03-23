import React, { Fragment, useEffect } from 'react'
import styled from 'styled-components'
import mainColors from '../../constants/mainColors'
import { PulseLoader } from 'react-spinners'
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'

const ThreeDSecureRedirect = ({ threeDSecureUrl }) => {


  useEffect(() => {

    console.log('postMessage 3ds')
    window.top.postMessage('3DS-authentication-complete')
  }, [])


  return (
    <ErrorBoundary>
      <Fragment>
        <S.Wrapper>
          <PulseLoader css={{ 'margin': '0 auto' }} color={mainColors.App.spinnerColor} size={15} speedMultiplier={0.5}/>
        </S.Wrapper>
      </Fragment>
    </ErrorBoundary>
  )
}

const S = {
  Wrapper: styled.div`
    width: 100%;
    height: 100%;
    background-color: ${mainColors.primaryColor};
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    
    display: flex;
    justify-content: center;
    align-items: center;
`
}


export default ThreeDSecureRedirect
