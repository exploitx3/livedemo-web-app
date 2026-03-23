import React, { Component } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Logo from '../../static/images/logo-round.svg'
//import { Icon, Layout, Menu, Select } from 'antd'
import { FundOutlined, DeploymentUnitOutlined, SettingOutlined, CreditCardOutlined, LogoutOutlined, BarChartOutlined } from '@ant-design/icons'


import Icon from '../Icon/Icon'
import Layout from 'antd/es/layout'
import Menu from 'antd/es/menu'
import Select from 'antd/es/select'
import 'antd/es/layout/style'
import 'antd/es/menu/style'
import 'antd/es/select/style'


import {
  resetCurrentSelectedWorkspace,
  updateAllWorkspacesForUser,
  updateCurrentSelectedWorkspace
} from '../../actions/workspacesActions'
import { resetCurrentSelectedChannel, updateCurrentSelectedChannel } from '../../actions/channelsActions'
import styled from 'styled-components'
import Colors from '../../constants/mainColors'
import WorkspaceMemberRoles from '../../constants/WorkspaceMemberRoles'
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'

const { Header, Content, Footer, Sider } = Layout
const { SubMenu } = Menu
const { Option } = Select

const MENU_ITEMS = {
  Dashboard: '/',
  Billing: '/billing',
  // Conversations: '/conversations',
  // Analysis: '/analysis',
  Demos: '/demos',
  Leads: '/leads',
  Settings: '/settings',
  Analytics: '/analytics',
  // Activity: '/activity',
  Logout: '/logout',
  ExitDemo: '/exit-demo',
}

const MENU_ITEMS_PATHNAMES = {
  '/': 'Dashboard',
  '/billing': 'Billing',
  // '/conversations': 'Conversations',
  // '/analysis': 'Analysis',
  // '/activity': 'Activity',
  '/demos': 'Demos',
  '/leads': 'Leads',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/logout': 'Logout',
  '/exit-demo': 'ExitDemo'
}

class Sidebar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      channelsMenuOpen: false,
      openKeys: [],
      selectedKeys: [],
      openImChannels: [],
      openChannel: null,
      selectedMenu: null,
      isReset: true,
      isMobile: this.props.isMobile,
      hasLoaded: false, // used for consistent initial collapsed sidebar
      isDemo: !!props.authData.isDemo
    }

    // if (props.workspaces === null || !props.currentSelectedWorkspace._id) {
    //   let isCurrentSelectedWorkspaceEmpty = !props.currentSelectedWorkspace._id
    //   let token = this.props.authData.token
    //   this.props.actions.updateAllWorkspacesForUser(token)
    //     .then((workspaces) => {
    //
    //       if(isCurrentSelectedWorkspaceEmpty) {
    //         this.props.actions.updateCurrentSelectedWorkspace(token, workspaces[0]._id)
    //       }
    //     })
    // }

    this.onSelectItem = this.onSelectItem.bind(this)
    this.toggleChannelsMenuOpen = this.toggleChannelsMenuOpen.bind(this)
    this.getOpenAndSelectedKeys = this.getOpenAndSelectedKeys.bind(this)
    this.getSelectWorkspaceComp = this.getSelectWorkspaceComp.bind(this)
  }

  getOpenAndSelectedKeys = (newProps) => {



    // TO handle when somebody refreshesh on a channel page and the Sidebar menu must be populated correctly with the workspace
    // if (newProps.currentSelectedWorkspace._id !== newProps.currentSelectedChannel.workspaceId ||
    //   (!newProps.currentSelectedWorkspace && newProps.currentSelectedChannel.workspaceId)) {
    //   if (newProps.currentSelectedChannel && newProps.currentSelectedChannel.workspaceId) {
    //
    //     let token = newProps.authData.token
    //     newProps.actions.updateCurrentSelectedWorkspace(token, newProps.authData.workspaceMembers, newProps.currentSelectedChannel.workspaceId)
    //   }
    // }


    let newOpenKeys = [
      this.state.channelsMenuOpen ? 'channels' : '',
    ]

    if (
      newProps.currentSelectedWorkspace._id &&
      this.state.openImChannels.length !== 0) {
      this.state.openImChannels.forEach(imChannelOwnerName => {
        newOpenKeys.push(`${newProps.currentSelectedWorkspace._id}-${imChannelOwnerName}-imChannelsGroup`)
      })
    }


    let newSelectedKeys = []
    let locationSplit = newProps.location.pathname.split('\/').filter(path => path !== '')
    if (locationSplit[0] === 'workspaces') {
      newOpenKeys.push(locationSplit[1] + '-currentSelectedWorkspace')
      if (locationSplit[2]) {
        if (
          newProps.currentSelectedChannel &&
          newProps.currentSelectedWorkspace._id
        ) {

          if (newProps.currentSelectedChannel.isIm) {
            if (newProps.currentSelectedWorkspace.userTopWorkspaceMember &&
              newProps.currentSelectedWorkspace.userTopWorkspaceMember.role === WorkspaceMemberRoles.MEMBER) {

              newSelectedKeys.push(`${newProps.currentSelectedChannel.workspaceId}-${newProps.currentSelectedChannel._id}-channel`)
            } else {
              newSelectedKeys.push(`${newProps.currentSelectedChannel.workspaceId}-${newProps.currentSelectedChannel.ownerName}-${newProps.currentSelectedChannel.memberName}-${newProps.currentSelectedChannel._id}-imChannel`)
              newSelectedKeys.push(`${newProps.currentSelectedChannel.workspaceId}-${newProps.currentSelectedChannel.memberName}-${newProps.currentSelectedChannel.ownerName}-${newProps.currentSelectedChannel._id}-imChannel`)
            }
          } else {
            newSelectedKeys.push(`${newProps.currentSelectedChannel.workspaceId}-${newProps.currentSelectedChannel._id}-channel`)
          }
        }
      }
    }

    // if(this.state.openChannel) {
    //   newSelectedKeys.push(`${this.state.openChannel.workspaceId}-${this.state.openChannel._id}-channel`)
    // }

    let selectedKey = MENU_ITEMS_PATHNAMES[newProps.location.pathname]
    if (newSelectedKeys.length === 0 && selectedKey) {
      newSelectedKeys.push(selectedKey)
    }


    return {
      openKeys: newOpenKeys,
      selectedKeys: newSelectedKeys
    }

  }

  // Replaced componentWillUpdate (removed in React 18) with componentDidUpdate
  componentDidUpdate(prevProps, prevState) {
    let state = this.props.location?.state

    if (state && state.resetSidebar && this.state.selectedMenu !== null) {
      this.setState(() => {
        return {
          openImChannels: [],
          selectedMenu: null,
          isReset: true,
          isMobile: this.props.isMobile
        }
      })
    }

    // if (!this.state.workspacesSubmenuOpen && newProps.workspaces && newProps.workspaces.length !== 0) {
    //   this.setState(() => {
    //     return {
    //       ...nextState,
    //       isMobile: newProps.isMobile,
    //
    //       // workspacesSubmenuOpen: (newProps.workspaces !== null && newProps.workspaces.length !== 0)
    //     }
    //   })

    else if (prevProps.isMobile !== this.props.isMobile) {
      this.setState(() => {
        return {
          isMobile: this.props.isMobile
        }
      })
    }



  }

  toggleChannelsMenuOpen() {

    if (this.props.collapsed) {
      this.props.onCollapse(false)
    } else {

      this.setState((currentState) => {
        return {
          channelsMenuOpen: !currentState.channelsMenuOpen
        }
      })
    }


  }



  renderConversationsMenuItems = (fromKey, workspaces, conversationsSubmenuOpen, currentSelectedWorkspace) => {

    if (workspaces === null) {

      return
    } else {

      return workspaces.map(workspace => {
        let result


        if (workspace.name === currentSelectedWorkspace.name) {


          result = (
            <Menu.Item
              key={`${workspace._id}-conversationWorkspace`}>
              <span>
                <S.Icon type="slack" />
                <span>{workspace.name}</span>
              </span>
            </Menu.Item>
          )

        } else {
          result = (
            <Menu.Item
              key={`${workspace._id}-conversationWorkspace`}>
              <span>
                <S.Icon type="slack" />
                <span>{workspace.name}</span>
              </span>
            </Menu.Item>
          )

        }

        fromKey += 1

        return result
      })
    }
  }

  renderWorkspaceMenuItems = (workspacesSubmenuOpen, currentSelectedWorkspace) => {

    if (!workspacesSubmenuOpen || !currentSelectedWorkspace._id) {

      return
    } else {


      return this.renderChannelsMenues(currentSelectedWorkspace)
    }
  }

  renderChannelsMenues = (currentSelectedWorkspace) => {

    if (currentSelectedWorkspace.channels.length === 0) {
      return (
        <p style={{
          marginTop: '25px',
          marginBottom: '25px',
          paddingLeft: '74px', fontSize: '0.9em', fontWeight: 'bold', 'color': 'white'
        }}>Not Updated</p>)
    }

    let normalChannels = currentSelectedWorkspace.channels.filter(channel => !channel.isIm && channel.statusPopulateMessages === 'populated')


    // let renderIM = null



    // If user has more than one member does not render all channels
    // if(currentSelectedWorkspace.userTopWorkspaceMember &&
    //   currentSelectedWorkspace.userTopWorkspaceMember.role === WorkspaceMemberRoles.MEMBER){
    //
    //   renderIM = currentSelectedWorkspace.channels.filter(c => {
    //     return c.isIm && (currentSelectedWorkspace.userTopWorkspaceMember.name === c.ownerName || currentSelectedWorkspace.userTopWorkspaceMember.name === c.memberName)
    //   })
    //     .map((channel) => {
    //
    //       let name = channel.ownerName === currentSelectedWorkspace.userTopWorkspaceMember.name ? channel.memberName : channel.ownerName
    //
    //       return (<Menu.Item key={`${currentSelectedWorkspace._id}-${channel._id}-channel`}>{name}</Menu.Item>)
    //     })
    // } else if(currentSelectedWorkspace.userTopWorkspaceMember &&
    //   currentSelectedWorkspace.userTopWorkspaceMember.role !== WorkspaceMemberRoles.MEMBER) {
    //   let ownerNames = currentSelectedWorkspace.channels.filter(channel => channel.isIm).map(channel => channel.ownerName)
    //   let imChannelsSameOwner = {}
    //
    //   currentSelectedWorkspace.channels.forEach(channel => {
    //     if (channel.isIm) {
    //       if (imChannelsSameOwner[channel.ownerName]) {
    //         imChannelsSameOwner[channel.ownerName].push(channel)
    //       } else {
    //         imChannelsSameOwner[channel.ownerName] = [channel]
    //       }
    //
    //       if (ownerNames.indexOf(channel.memberName) !== -1 && channel.memberName !== channel.ownerName) {
    //
    //         let newChannel = JSON.parse(JSON.stringify(channel))
    //         newChannel.ownerName = channel.memberName
    //         newChannel.memberName = channel.ownerName
    //         newChannel.name = channel.ownerName
    //
    //         if (imChannelsSameOwner[newChannel.ownerName]) {
    //
    //           imChannelsSameOwner[newChannel.ownerName].push(newChannel)
    //         } else {
    //           imChannelsSameOwner[newChannel.ownerName] = [newChannel]
    //         }
    //       }
    //     }
    //   })
    //
    //
    //   renderIM = Object.entries(imChannelsSameOwner).map(([ownerName, imChannelsByOwner]) => {
    //
    //     if (currentSelectedWorkspace.userTopWorkspaceMember &&
    //       currentSelectedWorkspace.userTopWorkspaceMember.role === WorkspaceMemberRoles.MEMBER) {
    //
    //       return <Menu.Item key={`${imChannelsByOwner[0].workspaceId}-${imChannelsByOwner[0]._id}-channel`}>{ownerName}</Menu.Item>
    //
    //     } else {
    //
    //
    //       return (<SubMenu
    //         theme="dark"
    //         onTitleClick={this.onSelectItem}
    //         mode="inline"
    //         className={'imChannelsGroup'}
    //         key={`${currentSelectedWorkspace._id}-${ownerName}-imChannelsGroup`}
    //         title={
    //           <span>
    //               <Icon type="team"/>
    //               <span>{ownerName}</span>
    //           </span>
    //         }
    //       >
    //         {imChannelsByOwner.map(imChannel => {
    //           //Handle private channels
    //
    //
    //           return (
    //             <Menu.Item
    //               key={`${currentSelectedWorkspace._id}-${ownerName}-${imChannel.memberName}-${imChannel._id}-imChannel`}>{imChannel.memberName}</Menu.Item>
    //           )
    //         })}
    //       </SubMenu>)
    //     }
    //   })
    // }


    return ([
      normalChannels.map(channel => {
        //Handle private channels
        return (
          <Menu.Item key={`${currentSelectedWorkspace._id}-${channel._id}-channel`}>{channel.name}</Menu.Item>
        )
      }),
      // ...renderIM

    ])


  }

  getSelectWorkspaceComp(workspaces, currentSelectedWorkspace, collapsed) {
    let loading = false


    if (!workspaces) {

      return null
    } else if (workspaces && workspaces.length === 0) {

      return <p style={{ color: 'white' }}>No workspaces</p>
    } else {

      return (
        <S.Select
          loading={loading}
          dropdownStyle={{
            background: Colors.App.sidebarColor,
            border: `1px solid ${Colors.primaryColor}`
            // boxShadow: `0 0 0 2px ${Colors.primaryColor}`
          }}
          defaultValue={
            currentSelectedWorkspace._id ? currentSelectedWorkspace._id : ''
          }
          value={
            currentSelectedWorkspace._id ? currentSelectedWorkspace._id : ''
          }
          style={{
            display: (collapsed ? 'none' : 'block'),
            width: 120
          }} onChange={(selectedWorkspaceId) => {

            this.props.actions.updateCurrentSelectedWorkspace(
              this.props.authData.token,
              selectedWorkspaceId
            )

          }}>
          {workspaces.map((workspace, index, array) => {
            let isLast = index === array.length - 1
            return <Option style={{
              background: 'none',
              color: Colors.primaryColor,
              borderBottom: isLast ? 'none' : '1px solid #d9d9d9',
              textTransform: 'capitalize'
            }} key={workspace._id} value={workspace._id}>{workspace.name}</Option>
          })
          }
        </S.Select>
      )
    }
  }

  onSelectItem(eventData) {
    const startTime = performance.now()
    // Handle both onSelect (old) and onClick (v6) event signatures
    // In v6, onClick provides: { key, keyPath, domEvent, item }
    const actualKey = eventData.key || (eventData.domEvent?.currentTarget?.dataset?.menuId)
    const keyPath = eventData.keyPath || []

    console.log('[Sidebar] onSelectItem STARTED', {
      timestamp: new Date().toISOString(),
      key: actualKey,
      keyPath: keyPath
    })

    const { item, selectedKeys, domEvent } = eventData

    const timeAfterEventData = performance.now()
    console.log('[Sidebar] Event data extracted', {
      timeFromStart: `${(timeAfterEventData - startTime).toFixed(2)}ms`
    })

    // Batch state updates to avoid multiple re-renders
    const selectedMenu = MENU_ITEMS[actualKey] ? actualKey : null
    const setStateStart = performance.now()

    this.setState({ selectedMenu })

    const timeAfterSetState = performance.now()
    console.log('[Sidebar] After initial setState', {
      timeFromStart: `${(timeAfterSetState - startTime).toFixed(2)}ms`
    })

    let splitKey = actualKey.split('-')
    if (splitKey.length !== 0 && splitKey[1] === 'workspace') {
      console.log('[Sidebar] Handling workspace selection')
      let token = this.props.authData.token
      let workspaceId = splitKey[0]

      const resetStart = performance.now()
      // this.props.actions.resetCurrentSelectedChannel()
      const resetEnd = performance.now()
      console.log('[Sidebar] resetCurrentSelectedChannel completed', {
        timeFromStart: `${(resetEnd - startTime).toFixed(2)}ms`,
        duration: `${(resetEnd - resetStart).toFixed(2)}ms`
      })

      const updateWorkspaceStart = performance.now()
      this.props.actions.updateCurrentSelectedWorkspace(token, this.props.authData.workspaceMembers, workspaceId)
        .then(() => {
          const updateWorkspaceEnd = performance.now()
          console.log('[Sidebar] updateCurrentSelectedWorkspace completed', {
            timeFromStart: `${(updateWorkspaceEnd - startTime).toFixed(2)}ms`,
            duration: `${(updateWorkspaceEnd - updateWorkspaceStart).toFixed(2)}ms`
          })
        })
        .catch(err => {
          console.error('[Sidebar] updateCurrentSelectedWorkspace error', err)
        })

      // Defer navigation to next event loop to allow current render cycle to complete
      // This prevents blocking the UI and makes navigation feel more responsive
      const pushStart = performance.now()
      const self = this
      setTimeout(() => {
        self.props.navigate(`/workspaces/${splitKey[0]}`)
        const pushEnd = performance.now()
        console.log('[Sidebar] navigate completed', {
          timeFromStart: `${(pushEnd - startTime).toFixed(2)}ms`,
          duration: `${(pushEnd - pushStart).toFixed(2)}ms`,
          path: `/workspaces/${splitKey[0]}`
        })
      }, 0)

    } else {
      console.log('[Sidebar] Handling menu item (Dashboard, Demos, Analytics, etc.)', {
        key: actualKey,
        path: MENU_ITEMS[actualKey]
      })

      const menuResetStart = performance.now()
      // this.props.actions.resetCurrentSelectedChannel()
      const menuResetEnd = performance.now()
      console.log('[Sidebar] resetCurrentSelectedChannel (menu item) completed', {
        timeFromStart: `${(menuResetEnd - startTime).toFixed(2)}ms`,
        duration: `${(menuResetEnd - menuResetStart).toFixed(2)}ms`
      })

      // Defer navigation to next event loop to allow current render cycle to complete
      // This prevents blocking the UI and makes navigation feel more responsive
      const menuPushStart = performance.now()
      const self = this
      setTimeout(() => {
        self.props.navigate(MENU_ITEMS[actualKey])
        const menuPushEnd = performance.now()
        console.log('[Sidebar] navigate (menu item) completed', {
          timeFromStart: `${(menuPushEnd - startTime).toFixed(2)}ms`,
          duration: `${(menuPushEnd - menuPushStart).toFixed(2)}ms`,
          path: MENU_ITEMS[actualKey]
        })
      }, 0)
    }

    const timeBeforeMobileCheck = performance.now()
    if (this.state.isMobile && !this.props.collapsed) {
      const collapseStart = performance.now()
      this.props.onCollapse(true)
      const collapseEnd = performance.now()
      console.log('[Sidebar] onCollapse completed', {
        timeFromStart: `${(collapseEnd - startTime).toFixed(2)}ms`,
        duration: `${(collapseEnd - collapseStart).toFixed(2)}ms`
      })
    }

    const endTime = performance.now()
    const totalDuration = endTime - startTime
    console.log('[Sidebar] onSelectItem COMPLETED', {
      timeFromStart: `${totalDuration.toFixed(2)}ms`,
      totalDuration: `${totalDuration.toFixed(2)}ms`,
      key: actualKey,
      timestamp: new Date().toISOString()
    })

    if (totalDuration > 100) {
      console.warn('[Sidebar] ⚠️ WARNING: onSelectItem took longer than 100ms!', {
        duration: `${totalDuration.toFixed(2)}ms`,
        key: actualKey
      })
    }
  }

  getMenuItems = () => {
    return [
      {
        key: 'Dashboard',
        icon: <S.MenuIcon><FundOutlined /></S.MenuIcon>,
        label: 'Dashboard'
      },
      {
        key: 'Demos',
        icon: <S.MenuIcon><DeploymentUnitOutlined /></S.MenuIcon>,
        label: 'Demos'
      },
      {
        key: 'Analytics',
        icon: <S.MenuIcon><BarChartOutlined /></S.MenuIcon>,
        label: 'Analytics'
      },
      {
        key: 'Settings',
        icon: <S.MenuIcon><SettingOutlined /></S.MenuIcon>,
        label: 'Settings'
      },
      {
        key: 'Billing',
        icon: <S.MenuIcon><CreditCardOutlined /></S.MenuIcon>,
        label: 'Billing'
      },
      {
        key: this.state.isDemo ? 'ExitDemo' : 'Logout',
        icon: <S.MenuIcon><LogoutOutlined /></S.MenuIcon>,
        label: this.state.isDemo ? "Exit Demo" : 'Logout'
      }
    ]
  }

  onOpenChange = (openKeys) => {
    // Update state with new openKeys for controlled mode in v6
    // This allows Menu to properly track which submenus are open
    this.setState({ openKeys })
  }

  render() {

    let { openKeys, selectedKeys } = this.getOpenAndSelectedKeys(this.props)


    let sidebarSide = this.state.isMobile ? 'right' : 'left'

    return (
      <ErrorBoundary>
        <span
        // onMouseEnter={() => {
        //   this.props.onCollapse(false)
        // }}
        // onMouseLeave={() => {
        //   this.props.onCollapse(true)
        // }}
        >
          <S.Sider
            breakpoint="xs"
            onBreakpoint={this.props.onSiderBreakpoint}
            style={{ [sidebarSide]: '0px', position: 'fixed', height: '100vh' }}
            collapsible={false}
            trigger={null}
            collapsed={this.props.collapsed !== undefined ? this.props.collapsed : true}
            onCollapse={(collapsedValue) => {
              if (!this.state.hasLoaded) {
                this.setState({ hasLoaded: true })
                return
              }
              this.props.onCollapse(collapsedValue)
            }}>
            <span style={{ width: '100%', height: '60px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }} className="logo">
                <span style={{
                  height: '50px',
                  width: '55px',
                  margin: '16px',
                  cursor: 'pointer'
                }}
                  onClick={() => {
                    this.onSelectItem({ key: 'Dashboard' })
                  }}>
                  <img style={{ width: '55px', height: '50px' }} src={Logo} alt="" />
                </span>
                {this.getSelectWorkspaceComp(this.props.workspaces, this.props.currentSelectedWorkspace, this.props.collapsed)}


              </div>
            </span>

            <S.Menu
              onClick={this.onSelectItem}
              selectedKeys={selectedKeys}
              openKeys={openKeys}
              onOpenChange={this.onOpenChange}
              mode="inline"
              items={this.getMenuItems()}
              theme="dark"
            />
          </S.Sider>
        </span>
      </ErrorBoundary>

    )
  }
}


function mapStateToProps(state) {

  return {
    workspaces: state.workspacesReducer.workspaces,
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace,
    currentSelectedChannel: state.channelsReducer.currentSelectedChannel,
    authData: state.authReducer.authData
  }
}

function mapDispatchToProps(dispatch) {
  return {

    actions: bindActionCreators({
      updateAllWorkspacesForUser,
      updateCurrentSelectedWorkspace,
      resetCurrentSelectedWorkspace,
    }, dispatch)

  }
}

const S = {
  MenuIcon: styled.span`
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 40px !important;
    height: 40px !important;
    margin: 0;
    font-size: 40px;
    line-height: 1;

    

    && svg {
      width: 20px !important;
      height: 20px !important;
      fill: ${Colors.primaryColor} !important;
    }
  `,
  MdIcon: styled.i`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    font-size: 20px;
    height: 20px;
    line-height: 20px;

    && svg {
      width: 20px;
      height: 20px;
      fill: #1070ff;
    }

  `,
  Sider: styled(Sider)`
      && {
        background-color: ${Colors.App.sidebarColor};
      }

      && div.ant-layout-sider-trigger {
        background-color: ${Colors.App.sidebarColor};
      }
  `,
  Menu: styled(Menu)`
      && {
        background-color: ${Colors.App.sidebarColor};
        width: 100%;
        border: none;
      }

      && li > span {
        font-size: 1.35em;
        color: ${Colors.primaryText};

      }

      && li.ant-menu-item{
        //transition: 0.1s all;
        margin:0px;
        border-radius: 0px;
        width: 101% !important;
        display: flex !important;
        align-items: center !important;
      }

      && li.ant-menu-item .ant-menu-item-icon {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        // margin-right: 8px;
        line-height: 1;
      }

      && li.ant-menu-item .ant-menu-item-icon {
        width: 30px !important;
        height: 30px !important;
      }

      && li.ant-menu-item .ant-menu-item-icon svg {
        width: 30px !important;
        height: 30px !important;
        fill: ${Colors.primaryColor} !important;
      }

      && li.ant-menu-item .anticon {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        vertical-align: middle;
        width: 15px !important;
        height: 15px !important;
        line-height: 15px !important;
      }

      && li.ant-menu-item .ant-menu-title-content {
        display: none !important;
      }

      && li.ant-menu-item .anticon svg {
        width: 30px !important;
        height: 30px !important;
        fill: ${Colors.primaryColor} !important;
      }

      && li.ant-menu-item > span {
        display: flex;
        align-items: center;
      }

      && li.ant-menu-item-selected {
        background-color: ${Colors.primaryColor};
        //border-top-left-radius: 18px;
        //border-bottom-left-radius: 18px;
      }

      && li.ant-menu-item-selected > span{
        color: white;
      }


      && li.ant-menu-item-selected > span > svg{
        fill: white !important;
      }

      && li.ant-menu-item-selected .ant-menu-item-icon svg {
        fill: white !important;
      }

      && li.ant-menu-item-selected .anticon svg {
        fill: white !important;
      }

      && li.ant-menu-item-selected span svg {
        fill: white !important;
      }

      && li.ant-menu-item-selected > i > svg {
        fill: white !important;
      }

      && li.ant-menu-item-active {
        background-color: ${Colors.primaryColor} !important;
        //border-top-left-radius: 18px;
        //border-bottom-left-radius: 18px;
        color: white;
      }

      && li.ant-menu-item-active > span {
        color: white;
      }

      && li.ant-menu-item-active .ant-menu-item-icon svg {
        fill: white !important;
      }

      && li.ant-menu-item-active .anticon svg {
        fill: white !important;
      }

      && li.ant-menu-item-active span svg {
        fill: white !important;
      }

      && li.ant-menu-item-selected > i > svg {
        fill: white !important;
      }

  `,
  SubMenu: styled(SubMenu)`

    && .imChannelsGroup .ant-menu-submenu-title {
        padding-left: 44px !important;

    }

    && li.ant-menu-item {
        padding-left: 68px !important;
    }

    &&.channelsMenu > ul {
        overflow-y: scroll;
        //overflow-y: scroll !important;
        max-height: 165px;
    }

    && .workspace-submenu  .ant-menu-submenu-title {
        padding-left: 44px !important;
    }

    && .workspace-submenu > .ant-menu-submenu-title > i.ant-menu-submenu-arrow {
      display: none;
    }

    &&.channelsMenu > ul::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 10px;
      background-color: #000c17;
    }

    &&.channelsMenu > ul::-webkit-scrollbar {
      width: 12px;
      background-color: #000c17;
    }

    &&.channelsMenu > ul::-webkit-scrollbar-thumb {
      border-radius: 10px;
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
      background-color: ${Colors.primaryColor};
    }

`,

  ConvSubMenu: styled(SubMenu)`

    && .imChannelsGroup .ant-menu-submenu-title {
        padding-left: 44px !important;

    }

    //&& li.ant-menu-item {
    //    padding-left: 68px !important;
    //}

    &&.workspaceSubMenu > ul {
        overflow-y: scroll;
        //overflow-y: scroll !important;
        height: 200px;
    }

    && .workspace-submenu  .ant-menu-submenu-title {
        padding-left: 44px !important;
    }

    && .workspace-submenu > .ant-menu-submenu-title > i.ant-menu-submenu-arrow {
      display: none;
    }

    &&.workspaceSubMenu > ul::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 10px;
      background-color: #000c17;
    }

    &&.workspaceSubMenu > ul::-webkit-scrollbar {
      width: 12px;
      background-color: #000c17;
    }

    &&.workspaceSubMenu > ul::-webkit-scrollbar-thumb {
      border-radius: 10px;
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
      background-color: ${Colors.primaryColor};
    }

`,
  Select: styled(Select)`
    text-transform: capitalize;

    && .ant-select-content-value {
      background: none;
      color: ${Colors.primaryColor};
      border: none !important;
      box-shadow: none;
    }


    && .ant-select-selection {
      background: none;
      color: ${Colors.primaryColor};
      border: 1px solid #d9d9d9;
      box-shadow: none;
    }

    && .ant-select-selection:hover {
      border: 1px solid ${Colors.primaryColor};
    }

    && .ant-select-arrow {
      color: ${Colors.primaryColor};
    }

    && .ant-select-selection-selected-value {
      width: 90%;
    }
`,
  Icon: styled(Icon)`
    //&& {
    //  display: block;
    //  position: absolute;
    //  width: 3%;
    //  z-index: 2;
    //  left: 0;
    //  line-height: 50px;
    //
    //}

    width: 30px !important;
    height: 30px !important;

    & svg {

      fill: ${Colors.primaryColor};
    }
`,
}

Sidebar.propTypes = {
  onCollapse: PropTypes.func,
  collapsed: PropTypes.bool
}

// Wrapper component to provide router hooks to class component
const SidebarWithRouter = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  return <Sidebar {...props} navigate={navigate} location={location} params={params} />
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SidebarWithRouter)
