import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { PulseLoader } from 'react-spinners'
import Header from '../../components/Header/Header'
import Colors from '../../constants/mainColors'
import SubscriptionTypes from '../../constants/SubscriptionTypes'
import WorkspaceMemberRoles from '../../constants/WorkspaceMemberRoles'
//import { Button, Col, Form, Icon, Layout, List, Menu, Modal, Tabs } from 'antd'

import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Icon from '../../components/Icon/Icon'
import Layout from 'antd/es/layout'
import List from 'antd/es/list'
import 'antd/es/list/style'

import Menu from 'antd/es/menu'
import Modal from 'antd/es/modal'
import Tabs from 'antd/es/tabs'
import styled from 'styled-components'
import { updateCurrentSelectedWorkspace } from '../../actions/workspacesActions'
import { refreshToken } from '../../actions/authActions'
import { getWorkspaceEncryptionKey } from '../../actions/secureStorageActions'
import ErrorBoundary from '../../components/utilComponents/HOCs/ErrorBoundary'

const { Content, Footer, Sider } = Layout
const { confirm } = Modal
const { getFieldDecorator } = Form
const { TabPane } = Tabs
const { SubMenu } = Menu

const WorkspacePage = (props) => {

  let [workspaceSyncing, setWorkspaceSyncing] = useState(false)
  let [workspaceMembers, setWorkspaceMembers] = useState(props.currentSelectedWorkspace ? props.currentSelectedWorkspace.members : [])
  let [userRole, setUserRole] = useState(WorkspaceMemberRoles.MEMBER)
  let [inviteSending, setInviteSending] = useState(false)

  let [weeklyReportsEnabled, setWeeklyReportsEnabled] = useState(false)


  let [keyData, setKeyData] = useState(null)
  let [keysGenerated, setKeysGenerated] = useState(false)

  const [activeTab, setActiveTab] = useState('1')

  useEffect(() => {

    if (props.currentSelectedWorkspace._id) {
      let token = props.authData.token


          if (props.authData.id) {
            setWeeklyReportsEnabled(props.currentSelectedWorkspace.reportsConfig.usersToSendTo.find(userId => userId === props.authData.id))
          }

          // Get encryption key if Workspace is encrypted


    }
  }, [props.currentSelectedWorkspace])

  useEffect(() => {
    if (!props.currentSelectedWorkspace.members) {
      return
    }

    if (props.authData.id) {
      setWeeklyReportsEnabled(props.currentSelectedWorkspace.reportsConfig.usersToSendTo.find(userId => userId === props.authData.id))
    }

    let filterWorkspaceMembers = JSON.parse(JSON.stringify(props.currentSelectedWorkspace.members))
    filterWorkspaceMembers = filterWorkspaceMembers.map(member => {
      member.isAdmin = member.role !== WorkspaceMemberRoles.MEMBER
      member.isOwner = member.role === WorkspaceMemberRoles.OWNER

      return member
    })

    setWorkspaceMembers(filterWorkspaceMembers)

    let ownerWorkspaceMembers = filterWorkspaceMembers.filter(member => member.userId === props.authData.id)
    if (ownerWorkspaceMembers.length !== 0) {
      ownerWorkspaceMembers = ownerWorkspaceMembers.sort(function(first, second) {
        if(first.isOwner){
          return -1
        } else if (second.isOwner) {
          return 1
        } else if (first.isAdmin) {
          return -1
        } else if(second.isAdmin) {
          return 1
        } else {
          return 0
        }
      })
      setUserRole(ownerWorkspaceMembers[0].role)
    }


  }, [props.currentSelectedWorkspace])



  return (
    <ErrorBoundary>
      <React.Fragment>
        <Header
          title={props.currentSelectedWorkspace.name || 'Workspace'}
          rightSideComponent={
            <React.Fragment>
              {props.currentSelectedWorkspace.type !== SubscriptionTypes.ENTERPRISE ?
                <Button onClick={() => {
                  props.navigate('/add-workspace/select')

                }} type={'primary'}>Upgrade</Button>
                : null}
            </React.Fragment>
          }
        />
        <S.Content>
          {!props.currentSelectedWorkspace._id ? (
              <PulseLoader css={{ 'margin': '0 auto', 'width': '100%', 'height': '100%' }} color={Colors.App.spinnerColor}
                          size={15} speedMultiplier={0.5}/>) : null}

        </S.Content>
      </React.Fragment>
    </ErrorBoundary>
  )
}


const S = {
  Content: styled(Content)`
    && {
      background: white;
      padding: 16px 0px 16px 16px;
      overflow: auto;
      //overflow-x: hidden;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      width: 100%;
      height: 100%;

    }
    

    
`,
  Tabs: styled(Tabs)`
    && {
      width: 100%;
      height: 100%;
      overflow: auto;
      overflow-x: hidden;

    }
    
    && .ant-tabs-content {
      width: 100%;
      height: 100%;
    }
    
    &&::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 10px;
      background-color: #fff;
    }

    &&::-webkit-scrollbar {
      width: 6px;
      background-color: #fff;
    }

    &&::-webkit-scrollbar-thumb {
      border-radius: 10px;
      //-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
      background-color: ${Colors.primaryColor};
    }
    
    && .ant-tabs-tab{
     font-family: ${Colors.fontFamily};
    }

    && .ant-tabs-nav-list {
        width: 100%;
    }

    && .ant-tabs-tab {
        justify-content: center;
    }

   && .ant-tabs-bar {
      margin: 0 0px 0 0;
   }
    && .ant-tabs {
        overflow: initial;
    }
   @media (min-width:900px) {
    && .ant-tabs-nav {
        width: 100%;
    }


    && .ant-tabs-nav > div {
        width: 100%;
        display: flex;
        justify-content: space-evenly;
    }

    && .ant-tabs-nav > div .ant-tabs-tab {
        font-size: 1.1em;

        padding: 12px 0;
        text-align: center;
        width: 50%;
        margin: 0;

    }

   }
    
`,
  TabPane: styled(TabPane)`
    && {
      width: 100%;
      height: 100%;

    }
    
`,
  WorkspaceColTitle: styled.h2`
    width: 50%; 
    margin: 0 auto;
    display: flex;
    justify-content: space-evenly;
    font-size: 24px;
`,
  SendInviteButton: styled(Button)`
     @media only screen and (max-width: 577px) {
        width: 100%;
    }
    
`,

  WorkspacesCol: styled(Col)` 
    && {
      float: unset !important;
      display: inline-block;
      vertical-align: top;
    }
    
    @media only screen and (max-width: 577px) {
      margin-bottom: 45px;
    }
`,
  ChannelIcon: styled(Icon)`
    && {
      width: 30px;
      height: 30px;
      vertical-align: middle;
      
    }
    
    && svg {
      fill: ${Colors.primaryColor}
      width: 100%;
      height: 100%;
    }
`, ChannelIconBot: styled(Icon)`
   && {
        width: 30px;
        height: 30px;
        vertical-align: middle;
        
      }
      
      && svg {
        fill: #AAAAAA;
        width: 100%;
        height: 100%;
      }
`,
  ListItem: styled(List.Item)`
    
    display: flex;
    justify-content: space-between;
    align-items: center;
    
   @media only screen and (max-width: 577px) {
      flex-direction: column;
    }
`,
  ListItemMeta: styled(List.Item.Meta)`
    && {
      flex-grow: 0
    }
`,
  DescItem: styled.div`
    
    display: flex;
    justify-content: space-between;
    margin: 0 10%;
    width: 90%;
    padding: 2px 10px;
    position: relative;
    height: 50px;
    font-size: 1.1em;
    justify-items: center;
    align-items: flex-end;
    border-bottom: 2px solid #1890ff;
    
    @media only screen and (max-width: 991px) {
        padding: 0;
    }
`,
  DescItemTitle: styled.span`
`,
  Plan: styled.span`
   
    text-transform: capitalize;
`,
  GenEncKeysModal: styled(Modal)`
    && .ant-modal-content {
      border: 1px solid white;
    }
    
    && .ant-modal-header {
      background: ${Colors.primaryColor};
    }
    
    && .ant-modal-header .ant-modal-title{
      font-family: Montserrat, sans-serif;
      color: white;
      //font-weight: 700;
      font-size:1.75em;
    }
    
    && .ant-modal-close svg {
      fill: white;
    }
    
    && .ant-modal-close {
      transition: all 0.3s ease-in-out;
    }
    
    && .ant-modal-close:focus, .ant-modal-close:hover {
      transform: scale(1.3);
    }
    
  `

}


function mapStateToProps(state) {
  return {
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace,
    authData: state.authReducer.authData,
    secureStorage: state.secureStorageReducer
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ updateCurrentSelectedWorkspace, getWorkspaceEncryptionKey, refreshToken }, dispatch)
  }
}


// Wrapper component to provide router hooks to functional component
const WorkspacePageWithRouter = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  
  return <WorkspacePage {...props} navigate={navigate} location={location} params={params} />
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkspacePageWithRouter)
