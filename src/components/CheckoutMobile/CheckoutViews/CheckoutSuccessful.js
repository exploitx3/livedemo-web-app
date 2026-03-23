import React, { Fragment, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import styled, { keyframes } from 'styled-components'
import { updateAllWorkspacesForUser } from '../../../actions/workspacesActions'
import { authWithToken } from '../../../actions/authActions'
import ErrorBoundary from '../../utilComponents/HOCs/ErrorBoundary'


const CheckoutSuccessful = ({ setShowTransition, authData, actions }) => {
  const navigate = useNavigate()

  useEffect(() => {

    setShowTransition(false)

    let token = authData.token
    actions.updateAllWorkspacesForUser(token)
    actions.authWithToken(token)
  }, [])


  return (
    <ErrorBoundary>

    <Fragment>
      <S.Wrapper>
        {/*<div className="wrapper green">*/}
        <S.HeaderWrapper className="header__wrapper">
          <S.Header className="header">
            <S.Sign className="sign"><span></span></S.Sign>
          </S.Header>
        </S.HeaderWrapper>
        <S.TopText>Payment Successful</S.TopText>
        <S.Button onClick={() => {


              navigate('/')
        }}>Now go on</S.Button>
        {/*</div>*/}
      </S.Wrapper>
    </Fragment>
    </ErrorBoundary>
  )
}

const CheckoutColors = {
  black: 'rgba(0,0,0,1)',
  white: 'rgba(255,255,255,1)',
  red_1: 'rgba(255,53,53,1)',
  red_2: 'rgba(255,130,130,1)',
  red_3: 'rgba(255,162,162,1)',
  red_4: 'rgba(255,179,179,1)',
  green_1: 'rgba(78,196,94,1)',
  green_2: 'rgba(78,196,94,0.6)',
  green_3: 'rgba(78,196,94,0.2)',
  green_4: 'rgba(0,203,43,0.29)'
}


/*
 * ANIMATIONS
*/

const A = {
  headerAni: keyframes`
  0% {
    border-radius: 0;
    opacity: 0;
    transform: translateY(-100px)
  }
  100% {
    border-radius: 50%;
    opacity: 1;
    transform: translateY(0);
  }`,
  wrapperAni: keyframes`
    0%{
      opacity: 0;
      transform: scale(.95) translateY(40px);
    }
    100%{
      opacity: 1;
      transform: scale(1) translateY(0);
    }`,
  signAni: keyframes`
   0% {
      opacity: 0;
      transform: scale(.3);
      rotate(180deg);
    }
    60% {
      transform: scale(1.3);
    }
    80% {
      transform: scale(.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
      rotate(0);
    }
`
}

const S = {
  Wrapper: styled.div`
    height: 100%;
    width: 100%;
    margin: 0 auto;
    display: block;
    animation: ${A.wrapperAni} 230ms ease-in 200ms forwards;
    background: ${CheckoutColors.white};
    border: 1px solid rgba(rgba(0,0,0,1), .15);
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(${CheckoutColors.black}, .1);
    opacity: 0;
    position: relative;
    vertical-align: top;
`,
  HeaderWrapper: styled.div`
    height: 200px;
    overflow: hidden;
    position: relative;
    width: 100%;
    border-radius: 4px;
`,
  Header: styled.div`
    background-color: ${CheckoutColors.green_4};


    animation: ${A.headerAni} 230ms ease-in 430ms forwards;
    border-radius: 0;
    height: 700px;
    left: -255px;
    opacity: 0;
    position: absolute;
    top: -500px;
    width: 700px;
`,
  Sign: styled.div`
    animation: ${A.signAni} 430ms ease-in 660ms forwards;
    border-radius: 50%;
    bottom: 50px;
    display: block;
    height: 100px;
    left: calc(50% - 50px);
    opacity: 0;
    position: absolute;
    width: 100px;
    
    background-color: ${CheckoutColors.green_1};
    box-shadow: 0 0 0 15px ${CheckoutColors.green_2}, 0 0 0 30px ${CheckoutColors.green_3};

    &:before,
    &:after{
      background: ${CheckoutColors.white};
      border-radius: 2px;
      content: "";
      display: block;
      height: 40px;
      left: calc(50% - 2px);
      position: absolute;
      top: calc(50% - 20px);
      width: 5px;
    }
    
    &:before{
      left: calc(50% + 5px);
      transform: rotate(45deg);
      top: calc(50% - 20px);
    }
    
    &:after{
      height: 20px;
      left: calc(50% - 15px);
      transform: rotate(-45deg);
      top: calc(50% - 5px);
    }
`,
  TopText: styled.div`
    color: rgba(${CheckoutColors.black}, 0.8);
    font-size: 28px;
    font-weight: 700;
    padding-top: 15px;
    margin: 0 auto 10px;
    text-align: center;
`,
  BottomText: styled.div`
    color: rgba(${CheckoutColors.black}, 0.7);
    padding: 0 40px;
    font-size: 18px;
    line-height: 1.4em;
    text-align: center;
`,
  Button: styled.button`
    background: ${CheckoutColors.white};
    border: 1px solid rgba(${CheckoutColors.black}, 0.15);
    border-radius: 20px;
    bottom: -20px;
    box-shadow: 0 2px 4px rgba(${CheckoutColors.black}, 0.1);
    color: rgba(${CheckoutColors.black}, 0.7);
    cursor: pointer;
    font-family: inherit;
    font-size: 16px;
    font-weight: 600;
    height: 40px;
    left: calc(50% - 85px);
    outline: none;
    position: absolute;
    transition: all 170ms ease-in;
    width: 170px;
    
    &:hover{
      border-color: ${CheckoutColors.green_1};
    }
    
    &:focus{
      background-color: ${CheckoutColors.green_4};
      border-color: ${CheckoutColors.green_1};
    }
    
`
}

function mapStateToProps(state) {

  return {
    authData: state.authReducer.authData
  }
}

function mapDispatchToProps(dispatch) {
  return {

    actions: bindActionCreators({
      updateAllWorkspacesForUser: updateAllWorkspacesForUser,
    authWithToken: authWithToken
      }
    , dispatch)

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutSuccessful)
