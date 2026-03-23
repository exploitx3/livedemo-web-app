import React, { useState, useEffect, Fragment } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import WorkspacesView from '../../../../DashboardPage/components/WorkspacesView/WorkspacesView'
//import { Button, Steps } from 'antd'

import Button from 'antd/es/button'
import Steps from 'antd/es/steps'

import Col from 'antd/es/col'
import 'antd/es/col/style'

import styled from 'styled-components'
import authExampleImg from '../../../../../static/images/authExample.png'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { debounce } from 'lodash'
import mainColors from '../../../../../constants/mainColors'
import AuthImage from '../../../../../static/images/auth-image.svg'
import Config from '../../../../../config'
import { updateCurrentSelectedChannel } from '../../../../../actions/channelsActions'
import ErrorBoundary from '../../../../../components/utilComponents/HOCs/ErrorBoundary'

const AuthWorkspace = (props) => {
  const [btnHovered, setBtnHovered] = useState(props.backgroundFilled || false)
  const [btnHoveredLock, setBtnHoveredLock] = useState(false)

  function onAuthenticateWorkspace() {
    setBtnHovered(true)

    let token = props.authData.token

    window.location = `${Config.API_URL}/slack/direct_install?authToken=${token}`
  }

  function animateOnHover(mouseIn) {


    let newBtnHovered = mouseIn

    if (!btnHoveredLock) {
      if (newBtnHovered) {
        props.onMouseIn()


      } else {

        props.onMouseOut()
      }

      setBtnHovered(newBtnHovered)
    } else {
      if (!newBtnHovered) {
        props.onMouseOut()
        setBtnHovered(newBtnHovered)

      }
    }


  }

  return (
    <ErrorBoundary>
    <Fragment>

      <div style={{ height: '100%', zIndex: '2', position: 'relative' }}>
        <S.Col span={24}
               style={{ display: 'inline-flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <h2 style={{ fontSize: '24px' }}>Authenticate Workspace</h2>
          <p>Give TellTrail access to back-up your Workspace</p>
          <S.ButtonWrapper>

            <S.Button className={'auth-button ' + (btnHovered ? 'btn-hovered' : '')}
                      onMouseEnter={() => animateOnHover(true)}
                      onMouseOut={() => animateOnHover(false)} onClick={onAuthenticateWorkspace} type="primary"
                      icon="deployment-unit" size={'large'}>
              Authenticate Workspace
            </S.Button>
          </S.ButtonWrapper>
        </S.Col>


      </div>

    </Fragment>
    </ErrorBoundary>
  )
}


const S = {
  Col: styled(Col)` 
    && {  
      height: 100%;
      display: inline-block;
      text-align: center;
    }
  `,
  ButtonWrapper: styled.span`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
`,
  Button: styled.button`
    && {
    
      font-size: 1.4em;
      font-weight: bold;
      height: 50px;
      box-shadow: unset;
      border: unset;
      line-height: 50px;
      background: ${mainColors.primaryColor};
      border-radius: 14px;
      color: white;
      transition: all .5s;
      cursor: pointer;
      display: block;
      //border: 2px solid white;
    }
    
    &&:hover {
      cursor: pointer;
    }
    
    &&.btn-hovered, &&.btn-hovered, &&.btn-hovered {
      color: black;
      font-weight: normal;

      font-size: 1.45em;
      cursor: pointer;
    }
    
    
    //&&::before {
    //content: "";
    //width: 125px;
    //height: 163px;
    //display: block;
    //background: white;
    //opacity: 1;
    //-webkit-transform: translate(-8px,-15px) rotate(-3deg) skewX(45deg);
    //-ms-transform: translate(-8px,-15px) rotate(-3deg) skewX(45deg);
    //transform: translate(-8px,-15px) rotate(-3deg) skewX(45deg);
    //border-top: 4px solid #1890ff;
    //border-top-right-radius: 85px;
    //border-bottom-right-radius: 0;
    //}
    //
    //&&.after-hidden::before {
    //  display: none;
    //
    //
    //}
`,

  ImageExample: styled.span`
    width: 50%;
    height: 110%;
    background:${AuthImage};
    border-radius: 20px;
    box-shadow: 0px 2px 10px #aaaaaa;
`
}

function mapStateToProps(state) {
  return {
    authData: state.authReducer.authData
  }
}

export default connect(mapStateToProps)(
AuthWorkspace
)
