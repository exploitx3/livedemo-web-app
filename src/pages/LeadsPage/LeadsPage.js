import React, { Component } from 'react'
import Header from '../../components/Header/Header'
// //import { Button, Col, Layout, Modal } from 'antd'

import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Layout from 'antd/es/layout'

import 'antd/es/button/style'
import 'antd/es/col/style'
import 'antd/es/layout/style'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import axios from '../../utils/axiosInstance'
import styled from 'styled-components'
import { showErrorsForResponse } from '../../utils/helperFunctions'
import { authWithToken } from '../../actions/authActions'
import * as workspacesActions from '../../actions/workspacesActions'
import * as walkthroughActions from '../../actions/walkthroughActions'
import mainColors from '../../constants/mainColors'


const { Content, Footer, Sider } = Layout

const DEFAULT_REPORTS_LIMIT = 3


const LeadsPage = function({}) {

    return (
      <React.Fragment>

        <Header title={'Leads'}/>

        <S.Content>

          <div id={'dashboard-container'} style={{background: 'white'}}>
            <S.WorkspacesCol xs={24} lg={12}>
              <h2 style={{ fontSize: '24px' }}>Work in progress</h2>
            </S.WorkspacesCol>
            <S.WorkspacesColRight xs={24} lg={12}>
            </S.WorkspacesColRight>


          </div>

        </S.Content>

      </React.Fragment>
    )
}

const S = {
//   DashboardContainer: styled.div`
//     border-top-left-radius: 4px;
//     padding: 24px;
//     background: white;
//     height: 100%;
//     width: 100%;
//
//
// `,
  Content: styled(Content)`
    && {
      background: white;
      padding: 16px;
      overflow: scroll;
      overflow-x: hidden;
      border-top-left-radius: 18px;
      border-top-right-radius: 4px;
      width: 100%;
      height: 100%;
      
      border-top: 1.6px solid #1070ff;
      border-left: 1.6px solid #1070ff;
    }
    
`,
  Wrapper: styled.div`
    display: block;
    height: 100%;
    width: 100%;
    background: white;
`,
  TutorialButton: styled(Button)`
      && {
      
        background: ${mainColors.primaryColor};
        color: white;
        display: inline-block;
        //margin: 0 20px;
        //padding: 5px 15px;
        border: 0.125rem solid ${mainColors.primaryColor};
        border-radius: 2rem;
        font-family: 'Baloo Chettan 2', cursive;
        font-size: 1.0em;
        text-decoration: none;
        transition: all 0.2s;
        cursor: pointer;
      }
      &&:hover {
        background: white;
        color: ${mainColors.primaryColor};
      }
          
`,
  WorkspacesCol: styled(Col)` 
    && {
      float: unset !important;
      display: inline-block;
      vertical-align: top;
    }
`,
  WorkspacesColRight: styled(Col)` 
    && {
      float: unset !important;
      display: inline-block;
      vertical-align: top;
      text-align: center;
      
    }
    
    @media (max-width:567px) {
      
      & {
        margin-top: 30px;
      
      }
    }
   
`,
  ExitDemoButton: styled(Button)`
   margin-left: 25px;
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
      authWithToken: authWithToken,
      updateAllWorkspacesForUser: workspacesActions.updateAllWorkspacesForUser,
      runWalkthrough: walkthroughActions.runWalkthrough
    }, dispatch)

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LeadsPage)
