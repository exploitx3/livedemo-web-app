import styled from 'styled-components'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { capitalize, showErrorsForResponse } from '../../utils/helperFunctions'
import uuid from 'uuid/v4'
import { PulseLoader } from 'react-spinners'
import Colors from '../../constants/mainColors'
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'
import Header from '../../components/Header/Header'
//import { Avatar, Button, Col, Icon, Layout, List, Modal, Table } from 'antd'

import Avatar from 'antd/es/avatar'
import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Icon from '../../components/Icon/Icon'
import Layout from 'antd/es/layout'
import List from 'antd/es/list'
import Modal from 'antd/es/modal'
import Table from 'antd/es/table'
import axios from '../../utils/axiosInstance'
import { toast } from 'react-toastify'

const { Content, Footer, Sider } = Layout
const { confirm } = Modal


const WorkspaceMemberPage = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const { authData, workspaces } = props
  const workspaceMemberId = params.workspaceMemberId

  const [workspaceMember, setWorkspaceMember] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let authHeaders = {
      'Authorization': `Bearer ${authData.token}`
    }

    axios.get(`/members/${workspaceMemberId}`, { headers: authHeaders })
      .then((resp) => {


      setWorkspaceMember(resp.data)
      setIsLoading(false)
    })
      .catch(err => {
        showErrorsForResponse(err)
        console.log(err)
      })

  }, [])

  return (
    <React.Fragment>
      {isLoading ? <PulseLoader
        css={{ 'margin': '0 auto', 'width': '100%', 'height': '100%' }}
        color={Colors.App.spinnerColor}
        size={15} speedMultiplier={0.5}/> : (
        <React.Fragment>

          <Header title={workspaceMember.name ? (workspaceMember.profile.displayName || workspaceMember.profile.realName || workspaceMember.name) : 'Workspace Member'}/>
          <S.Content>
            <div style={{

              // display: 'inline-flex',
              // marginTop: 0,
              // justifyContent: 'space-evenly',
              // textAlign: 'center',
              // width: '100%'
            }}>
              <S.WorkspacesCol xs={22} lg={8} offset={1}>
                <S.UserProfile style={{}}>
                  <S.Avatar src={workspaceMember.profile.image192} shape={'square'} size={128} icon="user"/>
                  <S.UserProfileInfo>
                    <S.ProfileText>Email: {workspaceMember.email}</S.ProfileText>
                    <S.ProfileText>Name: {(workspaceMember.profile.displayName || workspaceMember.profile.realName || workspaceMember.name)}</S.ProfileText>
                  </S.UserProfileInfo>
                </S.UserProfile>
              </S.WorkspacesCol>
              <S.WorkspacesCol xs={22} lg={6} offset={1}>
                <h2 style={{ fontSize: '24px' }}>Channels</h2>
                <S.ChannelsList
                  loading={!workspaceMember.channelsIn}
                  itemLayout="horizontal"
                  dataSource={workspaceMember.channelsIn}
                  renderItem={item => (
                    <List.Item>
                      <S.ChannelIcon type={'slack'}/>
                      <List.Item.Meta

                        title={<Link style={{ 'textTransform': 'capitalize' }}
                                     to={`/workspaces/${item.workspaceId}/channels/${item._id}`}>{item.name}</Link>}
                        description={`Status: ${item.status}`}
                      />



                    </List.Item>
                  )}
                />
              </S.WorkspacesCol>
              <S.WorkspacesCol xs={22} lg={6} offset={1}>
                <h2 style={{ fontSize: '24px' }}>Private Channels</h2>
                <S.ChannelsList
                  loading={!workspaceMember.IMChannelsIn}
                  itemLayout="horizontal"
                  dataSource={workspaceMember.IMChannelsIn}
                  renderItem={item => (
                    <List.Item>
                      <S.ChannelIcon type={'slack'}/>
                      <List.Item.Meta

                        title={<Link style={{ 'textTransform': 'capitalize' }}
                                     to={`/workspaces/${item.workspaceId}/channels/${item._id}`}>
                          {item.memberName === workspaceMember.name ? item.ownerName : item.memberName}
                        </Link>}
                        description={`Status: ${item.status}`}
                      />



                    </List.Item>
                  )}
                />
              </S.WorkspacesCol>
            </div>

          </S.Content>
        </React.Fragment>)
      }
    </React.Fragment>

  )
}


const S = {
  Content: styled(Content)`
      background: white;
      padding: 16px;
      overflow: scroll;
      overflow-x: hidden;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      width: 100%;
      height: 100%;
`,
  CardImg: styled.img`
          width: 50px;
          display: inline-block;
          `,
  CardText: styled.p`
          display: inline;
          margin: 0;
          `,
  Avatar: styled(Avatar)`
          @media only screen and (max-width: 577px) {
            && {
              margin-left: 15px;
            }
          }
          
          display: inline-block
          `,
  UserProfile: styled.div`
          @media (max-width:567px) {
            height: 100%;
            flex-direction: column;
          }
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          //width: 50%;
          text-align: left;
          //padding-left: 5%;
          //padding-top: 2.5%;
          height: 150px;
          `,
  ProfileText: styled.p`
          margin: 2px;

          `,
  UserProfileInfo: styled.div`
          display: inline-block;
          margin-left: 15px;
          height: 100%;
          `,
  CardInfoWrapper: styled.span`
          && {
          display: flex;
          margin-left: 10px;
          justify-content: space-between;
          align-items: center;

          }
          `,
  ColTopLeft: styled.span`
          width: 35%;
          padding-left: 1.25%;
          margin-top: 35px;
          `,
  ColTopRight: styled.span`
          width: 55%;
          padding-left: 1.25%;
          margin-top: 35px;
          `,
  WorkspacesCol: styled(Col)`
          display: flex;
          flex-direction: column;
          justify-content: center;
          //padding-left: 1.25%;
          margin-top: 50px;
          `,
  ChannelsList: styled(List)`
          text-align: center;
        
          `,
  WorkspacesColCards: styled(Col)`
          && {
          float: unset !important;
          display: inline-block;
          vertical-align: top;

          }
          `,
  WorkspacesColSubs: styled(Col)`
          && {
          float: unset !important;
          display: inline-block;
          vertical-align: top;

          }
          `,
  PictureWorkspace: styled.img`
          width: 25px;
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
`,
}

function mapStateToProps(state) {

  return {
    authData: state.authReducer.authData,
    workspaces: state.workspacesReducer.workspaces
  }
}


export default connect(mapStateToProps)(WorkspaceMemberPage)
