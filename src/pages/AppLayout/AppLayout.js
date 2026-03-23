import styled from 'styled-components'
import React, { Component, lazy } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as workspacesActions from '../../actions/workspacesActions.js'
import * as channelActions from '../../actions/channelsActions.js'
import * as walkthroughActions from '../../actions/walkthroughActions.js'
import './test.css'
import { Navigate, Route, Routes, useNavigate, useLocation, useParams } from 'react-router-dom'
import Colors from '../../constants/mainColors'
import { WithSuspense } from '../../components/utilComponents/HOCs/HOCs.js'
//import { Col, Layout } from 'antd'
import Spinner from '../../components/Spinner/Spinner.js'

import Col from 'antd/es/col'
import Layout from 'antd/es/layout'
import 'antd/es/col/style'
import 'antd/es/layout/style'
// import 'antd/dist/antd.css';

const Sidebar = WithSuspense(lazy(() => import('../../components/Sidebar/Sidebar.js')))
const ProfilePage = WithSuspense(lazy(() => import('../ProfilePage/ProfilePage.js')))
const SettingsPage = WithSuspense(lazy(() => import('../SettingsPage/SettingsPage.js')))
const LiveDemosPage = WithSuspense(lazy(() => import('../LiveDemosPage/LiveDemosPage.js')))
// const WorkspaceMemberPage = WithSuspense(lazy(() => import('../WorkspaceMemberPage/WorkspaceMemberPage.js')))
// const SlackAuthenticationFailed = WithSuspense(lazy(() => import('../SlackAuthenticationFailed/SlackAuthenticationFailed.js')))
const LogoutPage = WithSuspense(lazy(() => import('../LogoutPage/LogoutPage.js')))
const ExitDemoPage = WithSuspense(lazy(() => import('../ExitDemoPage/ExitDemoPage.js')))
const AddWorkspacePage = WithSuspense(lazy(() => import('../AddWorkspacePage/AddWorkspacePageResponsive.js')))
const Dashboard = WithSuspense(lazy(() => import('../DashboardPage/DashboardPage.js')))
const BillingPage = WithSuspense(lazy(() => import('../BillingPage/BillingPage.js')))
const PaymentPage = WithSuspense(lazy(() => import('../PaymentPage/PaymentPage.js')))
const WorkspacePage = WithSuspense(lazy(() => import('../WorkspacePage/WorkspacePage.js')))
const StoryDemoPage = WithSuspense(lazy(() => import('../StoryDemoPage/StoryDemoPage.js')))
const CreateWorkspace = WithSuspense(lazy(() => import('../CreateWorkspace/CreateWorkspace.js')))
const LeadsPage = WithSuspense(lazy(() => import('../LeadsPage/LeadsPage.js')))
const AnalyticsPage = WithSuspense(lazy(() => import('../AnalyticsPage/AnalyticsPage.js')))
const NotFoundPage = WithSuspense(lazy(() => import('../../components/NotFound/NotFoundPage.js')))
const Walkthrough = WithSuspense(lazy(() => import('../../components/Walkthrough/Walkthrough.js')))
const InstanceAuthPage = WithSuspense(lazy(() => import('../InstanceAuthPage/InstanceAuthPage.js')))
const HubspotIntegrationSuccessPage = WithSuspense(lazy(() => import('../HubspotIntegrationSuccessPage/HubspotIntegrationSuccessPage.js')))
// ErrorBoundary is imported statically in SuspenseWrapper, so we don't need to lazy load it here
// const ErrorBoundary = WithSuspense(lazy(() => import('../../components/utilComponents/HOCs/ErrorBoundary.js')))

const { Header, Content, Footer, Sider } = Layout


class AppLayout extends Component {
  constructor(props) {
    super(props)

    this.state = {
      collapsed: true,
      isMobile: false,
      hasSelectedDefaultWorkspace: !!props.currentSelectedWorkspace._id,
    }


    this.updateWorkspaces()
      .catch(err => {
        this.props.navigate('/', { replace: true })
      })
  }

  // Replaced componentWillUpdate (removed in React 18) with componentDidUpdate
  componentDidUpdate(prevProps, prevState) {
    // Check if we need to select a default workspace
    if (!this.state.hasSelectedDefaultWorkspace && !this.props.currentSelectedWorkspace._id) {
      if (this.props.workspaces && this.props.workspaces.length !== 0) {
        this.setState((prevState) => {
          return {
            ...prevState,
            hasSelectedDefaultWorkspace: true
          }
        })

        this.props.workspaceActions.updateCurrentSelectedWorkspace(
          this.props.authData.token,
          this.props.workspaces[0]._id
        )
      }
    }
  }

  updateWorkspaces = () => {

    let token = this.props.authData.token
    return this.props.workspaceActions.updateAllWorkspacesForUser(token)
  }

  onCollapse = collapsed => {
    this.setState({ collapsed: true })
  }

  setIsMobile = isMobile => {
    this.setState((oldState) => {
      return {
        ...oldState,
        isMobile
      }
    })
  }

  onSiderBreakpoint = isMobile => {
    this.setIsMobile(isMobile)
  }

  render() {


    return (
      <React.Fragment>
        {this.props.workspaces === null || (this.props.workspaces  && this.props.workspaces.length !== 0 && !this.props.currentSelectedWorkspace._id) ? (
        <S.SpinnerWrapper>
          <Spinner/>
        </S.SpinnerWrapper>
        ) :
        <Routes>

          <Route path="/create-workspace" element={<CreateWorkspace/>}/>

          <Route path="/*" element={
            <S.Layout>
              {/* <Walkthrough menuCollapsed={this.state.collapsed} collapseMenu={this.onCollapse} */}
              {/*             isMobile={this.state.isMobile}/>*/}
              <Sidebar
                onSiderBreakpoint={this.onSiderBreakpoint}
                isMobile={this.state.isMobile}
                collapsed={true}
                // collapsed={this.state.collapsed || true}
                onCollapse={this.onCollapse}
              />
              <S.LayoutInner onClick={() => {
                if (this.state.isMobile && !this.state.collapsed) {
                  this.onCollapse(true)
                }

              }} ismobile={this.state.isMobile} sidebarcollapsed={this.state.collapsed || true ? 'true' : 'false'}>

                <Routes>
                  <Route index element={<Dashboard isMobile={this.state.isMobile}
                                                     workspaces={this.props.workspaces}/>}/>
                  <Route path="/login" element={<Navigate to={'/'} replace/>}/>
                  <Route path="/register" element={<Navigate to={'/'} replace/>}/>
                  <Route path="/demos" element={<LiveDemosPage/>}/>
                  <Route path="/instance-auth" element={<InstanceAuthPage/>}/>
                  <Route path="/integrations/hubspot/success" element={<HubspotIntegrationSuccessPage/>}/>
                  <Route path="/settings" element={<SettingsPage/>}/>
                  <Route path="/billing" element={<BillingPage/>}/>
                  <Route path="/billing/payment/:subName/*" element={<PaymentPage/>}/>
                  <Route path="/logout" element={<LogoutPage/>}/>
                  <Route path="/exit-demo" element={<ExitDemoPage/>}/>
                  {/*<Route path="/failed-authentication" element={<SlackAuthenticationFailed/>}/>*/}
                  <Route path="/add-workspace" element={<AddWorkspacePage workspaces={this.props.workspaces}/>}/>
                  <Route path="/analysis" element={<WorkspacePage/>}/>
                  <Route path="/leads" element={<LeadsPage/>}/>
                  <Route path="/analytics" element={<AnalyticsPage/>}/>
                  {/*<Route path="/workspace/:workspaceId/livedemo/:liveDemoId" element={<LiveDemoPage collapsed={this.state.collapsed}/>}/>*/}
                  <Route path="/workspace/:workspaceId/storydemo/:storyDemoId" element={<StoryDemoPage collapsed={this.state.collapsed}/>}/>
                  {/*<Route path="/members/:workspaceMemberId" element={<WorkspaceMemberPage/>}/>*/}

                  <Route path="*" element={<NotFoundPage/>}/>
                </Routes>

                {/*<Footer style={{ textAlign: 'center' }}></Footer>*/}
              </S.LayoutInner>
            </S.Layout>
          }/>

        </Routes>
        }


      </React.Fragment>)
  }
}

const S = {
  Layout: styled(Layout)`
    && {
      background: ${Colors.App.sidebarColor};
      height: 100%;
    }
`,
  LayoutInner: styled(Layout)`

    margin: ${props => {

    if (props.ismobile) {
      if (props.sidebarcollapsed === 'true' || true) {
        return '0 80px 0 0'
      } else {
        return '0 200px 0 0'
      }
    } else {
      if (props.sidebarcollapsed === 'true' || true) {
        return '0 0 0 80px'
      } else {
        return '0 0 0 200px'
      }
    }

  }};

    && {

      height: 100%;
      background: ${Colors.App.sidebarColor};
      // this important below fixes a layout bug in step 7 on mobile tutorial
      overflow-x: hidden !important;
      // transition: all 0.5s ease-in-out 0s;

    }


  `,
  Header: styled(Header)`
    &.ant-layout-header {
      z-index: 1;
      padding: 0px 25px;
      background: #fff;
      position: fixed;
      width: 100%;
    }

  `,
  WorkspacesCol: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
    }
  `,
  SpinnerWrapper: styled(Spinner)`

  `
}

function mapStateToProps(state) {

  return {
    workspaces: state.workspacesReducer.workspaces,
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace,
    authData: state.authReducer.authData
  }
}


function mapDispatchToProps(dispatch) {
  return {

    workspaceActions: bindActionCreators(workspacesActions, dispatch),
    channelActions: bindActionCreators(channelActions, dispatch),
    walkthroughActions: bindActionCreators(walkthroughActions, dispatch)

  }
}


// Wrapper component to provide router hooks to class component
const AppLayoutWithRouter = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  return <AppLayout {...props} navigate={navigate} location={location} params={params} />
}

export default connect(mapStateToProps, mapDispatchToProps)(AppLayoutWithRouter)
