import React, { Component, memo } from 'react'
import WorkspacesView from './components/WorkspacesView/WorkspacesView'
import IframeView from './components/IframeView/IframeView'
import Header from '../../components/Header/Header'
// //import { Button, Col, Layout, Modal } from 'antd'

import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import Layout from 'antd/es/layout'
import Modal from 'antd/es/modal'

import 'antd/es/button/style'
import 'antd/es/col/style'
import 'antd/es/row/style'
import 'antd/es/layout/style'
import 'antd/es/modal/style'

import {MdWebAsset, MdCheckCircle} from 'react-icons/md'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import axios from '../../utils/axiosInstance'
import styled from 'styled-components'
import { chromeAppAuthenticate, showErrorsForResponse, checkIfIsAuthenticated } from '../../utils/helperFunctions'
import { authWithToken } from '../../actions/authActions'
import * as workspacesActions from '../../actions/workspacesActions'
import * as walkthroughActions from '../../actions/walkthroughActions'
import mainColors from '../../constants/mainColors'
import ENV from '../../config'
import { Toaster, toast } from 'react-hot-toast';
import {chromeAppAuthorize} from "../../actions/workspacesActions";

const { confirm } = Modal

const { Content, Footer, Sider } = Layout

const DEFAULT_REPORTS_LIMIT = 3

var chrome = chrome

var chromeRuntimeExists = false

if(chrome) {
  chromeRuntimeExists = true
}



class DashboardPage extends Component {
  constructor(props) {
    super(props)


    this.state = {
      collapsed: true,
      // isDemoAccount: false,
      isDemoAccount: (props.authData.email && props.authData.email === 'matt@telltrail.ai') || false,
      reports: [],
      reportsPage: 0,
      reportsPages: 0,
      reportsTotal: 0,

    }

    this.showConfirmDeleteWorkspace = this.showConfirmDeleteWorkspace.bind(this)
    this.triggerTutorialOnDemoUser = this.triggerTutorialOnDemoUser.bind(this)
    this.onReportsPageChange = this.onReportsPageChange.bind(this)
    this.getConversations = this.getConversations.bind(this)
    this.successEventHandler = this.successEventHandler.bind(this)

    window.addEventListener('message', this.successEventHandler)
  }



  componentDidMount() {


    checkIfIsAuthenticated()

    // this.getConversations()

    // if(this.props.workspaces && this.props.workspaces.length !== 0){
    //   setTimeout(() => {
    //     this.triggerTutorialOnDemoUser(this.props.authData)
    //
    //   }, 500)
    // }
  }

  componentDidUpdate(prevProps, prevState) {
    Object.entries(this.props).forEach(([key, val]) =>
      prevProps[key] !== val && console.log(`Prop '${key}' changed`)
    );
    if (this.state) {
      Object.entries(this.state).forEach(([key, val]) =>
        prevState[key] !== val && console.log(`State '${key}' changed`)
      );
    }
  }
  componentWillUnmount() {
    window.removeEventListener('message', this.successEventHandler)
  }

  successEventHandler(event) {

    if(event.data.type === 'shouldAuthenticate'){
      if (this.props.authData.email) {



        let additionalApps = []
        let searchParams = (this.props.location && this.props.location.search) ?
          new URLSearchParams(this.props.location.search) : null

        if(searchParams) {
          let appId = searchParams.get('appId')
          if(appId) {
            additionalApps.push(appId)
          }
        }

        console.log('additionalApps')
        console.log(additionalApps)

        chromeAppAuthenticate(this.props.authData, additionalApps)
      }
    }

    if(event.data.type === 'contentAppAuthenticated_successful'){
      toast(
        <S.CopiedWrapper>
          <S.CopiedImg/>
          <S.CopiedText>Authenticated</S.CopiedText>
        </S.CopiedWrapper>, {
          duration: 3500,
          position: 'top-center',
          // Styling
          style: {
            borderRadius: '25px',
            background: '#111',
          },
          className: '',

          ariaProps: {
            role: 'status',
            'aria-live': 'polite',
          },
        })
      this.props.actions.chromeAppAuthorize()
      console.log('contentAppAuthenticated_successful recieved')
    }

    if(event.data.type === 'contentAppAuthenticated_already'){

      this.props.actions.chromeAppAuthorize()
      console.log('contentAppAuthenticated_already recieved')
    }
  }

  triggerTutorialOnDemoUser(authData) {

    let shouldTriggerDemo = authData.email && authData.email === 'mike@getnada.com'
    if(shouldTriggerDemo) {

      this.props.actions.runWalkthrough('/')
    }
  }

  showConfirmDeleteWorkspace(workspace) {

    let thiz = this
    let authToken = this.props.authData.token

    return confirm({
      title: `Are you sure you want to delete ${workspace.name} workspace?`,
      content: '',
      okText: 'Confirm',
      okButtonProps: { type: 'danger' },
      cancelText: 'Cancel',
      onOk() {
        return axios.delete(`/workspaces/${workspace._id.toString()}`, { headers: { 'Authorization': `Bearer ${authToken}` } })
          .then(req => {

            return thiz.props.actions.authWithToken(authToken)
              .then(() => {
                thiz.props.actions.updateAllWorkspacesForUser(authToken)
              })
          })
          .catch(err => {

            return showErrorsForResponse(err)
          })
      },
      onCancel() {
      },
    })

  }


  getConversations(filterData = {}) {
    let authToken = this.props.authData.token

    let params = {

      ...filterData
    }

    if (!filterData.page) {
      params.page = 1
    }


    return axios.get(`/reports`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` },
        params: params
      })
      .then(req => {

        this.setState((currentState) => {

          return {
            ...currentState,
            reports: req.data.reports,
            reportsPage: req.data.page,
            reportsPages: req.data.pages,
            reportsTotal: req.data.total
          }
        })

      })
  }

  onReportsPageChange(page) {
    return this.getConversations({ page: page })
  }

  render() {


    return (
      <React.Fragment>

        <Header title={'Dashboard'} rightSideComponent={
          this.state.isDemoAccount ? (
            <span style={{display: 'flex', justifyContent: 'space-between'}}>
              {/*<S.TutorialButton shape={'circle'} title={'Tutorial'} onClick={() => {*/}
              {/*  this.props.actions.runWalkthrough('/')*/}

              {/*}} type={'primary'}>?*/}
              {/*</S.TutorialButton>*/}
              <S.ExitDemoButton onClick={() => {
                this.props.navigate(`/exit-demo`)

              }} type={'primary'}>Exit Demo</S.ExitDemoButton>
            </span>) : null}/>

        <S.Content>

          <S.DashboardContainer id={'dashboard-container'}>
            <S.DashboardRow gutter={[16, 16]}>
              <S.WorkspacesCol xs={24} lg={12}>
                <WorkspacesView onDeleteWorkspace={this.showConfirmDeleteWorkspace} workspaces={this.props.workspaces}/>
              </S.WorkspacesCol>
              <S.WorkspacesColRight xs={24} lg={12}>
                <S.GroupWrapper>

                <S.GroupTitle style={{ fontSize: '24px' }}>1. Get started</S.GroupTitle>
                <S.InstallAppRow>
                  <S.AppButtonsContainer>
                    <S.AppButton
                      href={`https://chromewebstore.google.com/detail/livedemo-app/${ENV.CHROME_APP_ID}`}
                      target="_blank"
                      rel="noopener noreferrer">
                      <S.AppButtonIconContainer>
                        <S.AppButtonIcon
                          src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlechrome.svg"
                          loading="lazy"
                          width="18"
                          height="18"
                          alt="Chrome icon" />
                      </S.AppButtonIconContainer>
                      <S.AppButtonText>Chrome</S.AppButtonText>
                    </S.AppButton>

                    <S.AppButton
                      href="https://livedemo-cdn.s3.us-east-1.amazonaws.com/releases/LiveDemo.dmg"
                      target="_blank"
                      rel="noopener noreferrer">
                      <S.AppButtonIconContainer>
                        <S.AppButtonIcon
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1200px-Apple_logo_black.svg.png"
                          loading="lazy"
                          width="18"
                          height="18"
                          alt="MacOS icon" />
                      </S.AppButtonIconContainer>
                      <S.AppButtonText>Mac</S.AppButtonText>
                    </S.AppButton>
                    <S.AppButton
                      href="https://apps.microsoft.com/detail/9mvvcb7t7sll"
                      target="_blank"
                      rel="noopener noreferrer">
                      <S.AppButtonIconContainer>
                        <S.AppButtonIcon
                          src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoft.svg"
                          loading="lazy"
                          width="18"
                          height="18"
                          alt="Windows icon" />
                      </S.AppButtonIconContainer>
                      <S.AppButtonText>Windows</S.AppButtonText>
                    </S.AppButton>
                    <S.AppButton
                      href="https://www.figma.com/community/plugin/1592001133823412557/livedemo-app"
                      target="_blank"
                      rel="noopener noreferrer">
                      <S.AppButtonIconContainer>
                        <S.AppButtonIcon
                          src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/figma.svg"
                          loading="lazy"
                          width="18"
                          height="18"
                          alt="Figma icon" />
                      </S.AppButtonIconContainer>
                      <S.AppButtonText>Figma</S.AppButtonText>
                    </S.AppButton>
                  </S.AppButtonsContainer>
                </S.InstallAppRow>
                </S.GroupWrapper>
                <S.GroupWrapper>
                <S.GroupTitle style={{ fontSize: '24px' }}>2. Let's see how</S.GroupTitle>
                  <S.LiveDemoWrapper>

                      <IframeView />
                  </S.LiveDemoWrapper>
                </S.GroupWrapper>
                {/*<ReportsView*/}
                {/*  reports={this.state.reports}*/}
                {/*  page={this.state.reportsPage}*/}
                {/*  pages={this.state.reportsPages}*/}
                {/*  total={this.state.reportsTotal}*/}
                {/*  limit={DEFAULT_REPORTS_LIMIT}*/}
                {/*  onPageChange={this.onReportsPageChange}*/}

                {/*/>*/}
              </S.WorkspacesColRight>
            </S.DashboardRow>
          </S.DashboardContainer>

        </S.Content>

      </React.Fragment>
    )
  }
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
  GroupWrapper: styled.div`
    padding-bottom: 25px;
  `,
  GroupTitle: styled.h2`
    padding-bottom: 10px;
  `,
  LiveDemoWrapper: styled.div`
    border-radius: 6px;
    border: 1px solid #1070ff;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
  `,
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
  DashboardContainer: styled.div`
    background: white;
    width: 100%;
  `,
  DashboardRow: styled(Row)`
    && {
      width: 100%;
    }
  `,
  WorkspacesCol: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
    }
  `,
  WorkspacesColRight: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
      text-align: center;
    }

    @media (max-width: 992px) {
      & {
        margin-top: 30px;
      }
    }
  `,
  ExitDemoButton: styled(Button)`
   margin-left: 25px;
  `,
  InstallAppRow: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  AppButtonsContainer: styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  `,
  AppButton: styled.a`
    text-decoration: none !important;
    background: white;
    border: 2px solid #111;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 14px;
    height: 40px;
    font-weight: 600;
    transition: all .15s cubic-bezier(.25, .46, .45, .94);
    box-shadow: 0 2px 4px rgba(17, 24, 39, 0.08);
    user-select: none;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(17, 24, 39, 0.12);
      border-color: ${mainColors.primaryColor};
    }
  `,
  AppButtonIconContainer: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  AppButtonIcon: styled.img`
    width: 18px;
    height: 18px;
    filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(212deg) brightness(104%) contrast(97%);
  `,
  AppButtonText: styled.div`
    color: #111;
    font-size: 14px;
    font-weight: 600;
  `,
  CopiedWrapper: styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    border-radius: 25px;
  `,
  CopiedText: styled.p`
    margin: 0px;
    color: #f9f9f9;
  `,
  CopiedImg: styled(MdCheckCircle)`
    width: 25px;
    height: 25px;
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
      chromeAppAuthorize: workspacesActions.chromeAppAuthorize,
      runWalkthrough: walkthroughActions.runWalkthrough
    }, dispatch)

  }
}

// Wrapper component to provide router hooks to class component
const DashboardPageWithRouter = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  
  return <DashboardPage {...props} navigate={navigate} location={location} params={params} />
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(DashboardPageWithRouter))
