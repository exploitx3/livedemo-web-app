import styled from 'styled-components'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { capitalize, showErrorsForResponse } from '../../utils/helperFunctions'
import moment from 'moment'
import uuid from 'uuid/v4'
import { mapCardToIcon } from '../../utils/CardToIconMap'
import ErrorBoundary from '../../components/utilComponents/HOCs/ErrorBoundary'
import { PulseLoader } from 'react-spinners'
import Colors from '../../constants/mainColors'
import Media from 'react-media'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import Header from '../../components/Header/Header'
//import { Avatar, Button, Checkbox, Col, Icon, Layout, Modal, Table } from 'antd'

import Avatar from 'antd/es/avatar'
import Button from 'antd/es/button'
import Checkbox from 'antd/es/checkbox'
import Col from 'antd/es/col'
import Icon from '../../components/Icon/Icon'
import Layout from 'antd/es/layout'
import Modal from 'antd/es/modal'
import Table from 'antd/es/table'
import axios from '../../utils/axiosInstance'

const { Content, Footer, Sider } = Layout
const { confirm } = Modal


const ProfilePage = ({ authData, workspaces }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [changePasswordEmailSent, setChangePasswordEmailSent] = useState(false)

  const [charges, setCharges] = useState([])
  const [exports, setExports] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [subLoading, setSubLoading] = useState(false)

  const [cards, setCards] = useState([])
  const [userDefaultCardId, setUserDefaultCardId] = useState('')
  const [user, setUser] = useState([])

  const [userLoading, setUserLoading] = useState(false)

  const [exportsLoading, setExportsLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let authHeaders = {
      'Authorization': `Bearer ${authData.token}`
    }

    let getChargesPromise = axios.get('/charges', { headers: authHeaders })
    let getSubscriptionsPromise = axios.get('/subscriptions', { headers: authHeaders })
    let getCardsPromise = axios.get('/users/cards', { headers: authHeaders })
    let getExportsPromise = axios.get('/users/exports', { headers: authHeaders })
    let getUserPromise = axios.get('/users', { headers: authHeaders })

    Promise.all(
      [
        getCardsPromise,
        getChargesPromise,
        getSubscriptionsPromise,
        getUserPromise,
        getExportsPromise
      ])
      .then(([cardsResp, chargesResp, subsResp, userResp, exportsResp]) => {
        setCards(cardsResp.data.cards)
        setUserDefaultCardId(cardsResp.data.defaultCardId)

        setCharges(chargesResp.data.charges)

        setSubscriptions(subsResp.data.subscriptions)

        setUser(userResp.data)

        setExports(exportsResp.data.exports)

        setIsLoading(false)
        setExportsLoading(false)
      })
      .catch(err => {
        console.log(err)
        console.log(`Couldn't get charges, subscriptions or cards data from API`)
      })

  }, [])

  function syncExports(authData) {
    let authHeaders = {
      'Authorization': `Bearer ${authData.token}`
    }
    setExportsLoading(true)

    return axios.get('/users/exports', { headers: authHeaders }).then((resp) => {

      setExports(resp.data.exports)
      setExportsLoading(false)
    })
  }

  function showConfirmChangePassword(authToken) {


    return confirm({
      title: `An Email with change-password link will be sent to your email.`,
      content: '',
      okText: 'Send',
      okButtonProps: { type: 'danger' },
      cancelText: 'Cancel',
      onOk() {
        return axios.post(`/users/sendChangePasswordEmail`, {
          }, { headers: { 'Authorization': `Bearer ${authToken}` } })
          .then(req => {


            return setChangePasswordEmailSent(true)
          })
          .catch(err => {

            return showErrorsForResponse(err)
          })
      },
      onCancel() {
      },
    })

  }

  function showConfirmCloseAccount(authToken) {


    return confirm({
      title: `Are you sure you want to close your account`,
      content: '',
      okText: 'Confirm',
      okButtonProps: { type: 'danger' },
      cancelText: 'Cancel',
      onOk() {
        return axios.post(`/users/closeAccount`, {}, { headers: { 'Authorization': `Bearer ${authToken}` } })
          .then(req => {

            setUserLoading(true)
            return axios.get('/users', { headers: { 'Authorization': `Bearer ${authToken}` } }).then((resp) => {

              setUser(resp.data)
              setUserLoading(false)
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

  function renderWorkspacesTable(workspaces, isMobile) {
    let columns = []
    if (isMobile) {
      columns = [
        {
          title: 'Picture',
          dataIndex: 'icon',
          key: 'icon',
          render: (iconObj) => {

            return <S.PictureWorkspace alt={'Workspace Picture'} src={iconObj.image230}/>
          }
        },
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: 'Members',
          dataIndex: 'members',
          key: 'members',
          render: (members) => {

            return members.length
          }
        },
      ]
    } else {
      columns = [
        {
          title: 'Picture',
          dataIndex: 'icon',
          key: 'icon',
          render: (iconObj) => {

            return <S.PictureWorkspace alt={'Workspace Picture'} src={iconObj.image230}/>
          }
        },
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
        },
        {
          title: 'Members',
          dataIndex: 'members',
          key: 'members',
          render: (members) => {

            return members.length
          }
        },
      ]
    }


    return <Table
      rowKey={() => uuid().toString()}
      onRow={(record, rowIndex) => {
        return {
          onClick: event => {

            history.push(`/workspaces/${record._id}`)
          }
        }
      }}
      columns={columns}
      dataSource={workspaces}
      size="small"
      pagination={false}
    />
  }

  function renderExportsTable(exports, isMobile) {

    let columns = []
    if (isMobile) {
      columns = [
        {
          title: 'Name',
          dataIndex: 'channelId.name',
          key: 'channelId.name',
          render: (channelName, item) => {

            let name
            if (item.channelId && item.channelId.name) {
              name = item.channelId.name
            } else {
              name = item.workspaceId.name
            }

            return capitalize(name)
          }
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          render: (status) => {
            return capitalize(status)
          }

        },
        {
          title: 'Download',
          dataIndex: '_id',
          key: '_id',
          render: (_id, item) => {

            let authHeaders = {
              'Authorization': `Bearer ${authData.token}`
            }

            return (
              <Button disabled={item.status !== 'populated'} type={'primary'} size={'small'} onClick={() => {
                return axios.post('/exports/getExport', { exportId: item._id }, { headers: authHeaders }).then((resp) => {

                  window.open(resp.data.downloadUrl, '_blank')
                })

              }
              }>Download</Button>)

          }
        },
      ]
    } else {
      columns = [
        {
          title: 'Type',
          dataIndex: 'type',
          key: 'type',
          render: (type) => {


            return capitalize(type)
          }
        },
        {
          title: 'Name',
          dataIndex: 'channelId.name',
          key: 'channelId.name',
          render: (channelName, item) => {

            let name
            if (item.channelId && item.channelId.name) {
              name = item.channelId.name
            } else {
              name = item.workspaceId.name
            }

            return capitalize(name)
          }
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          render: (status) => {
            return capitalize(status)
          }

        },
        {
          title: 'Expires',
          dataIndex: 'expiresAt',
          key: 'expiresAt',
          render: (expiresAt) => {
            return moment(expiresAt).format('LL')
          }
        },
        {
          title: 'Download',
          dataIndex: '_id',
          key: '_id',
          render: (_id, item) => {

            let authHeaders = {
              'Authorization': `Bearer ${authData.token}`
            }

            return (
              <Button disabled={item.status !== 'populated'} type={'primary'} size={'small'} onClick={() => {
                return axios.post('/exports/getExport', { exportId: item._id }, { headers: authHeaders }).then((resp) => {

                  window.open(resp.data.downloadUrl, '_blank')
                })

              }
              }>Download</Button>)

          }
        },
      ]
    }

    return <ErrorBoundary><Table
      rowKey={() => uuid().toString()}

      loading={exportsLoading}
      columns={columns}
      dataSource={exports}
      size="small"
      pagination={false}
    /></ErrorBoundary>
  }

  function renderSubscriptionsTable(subscriptions, isMobile) {

    let columns = []
    if (isMobile) {
      columns = [
        {
          title: 'Type',
          dataIndex: 'type',
          key: 'type',
          render: (subType) => {


            return capitalize(subType)
          }
        },
        {
          title: 'Workspace',
          dataIndex: 'workspaceId',
          key: 'workspaceId',
          render: (workspaceObj) => {


            return capitalize(workspaceObj.name)
          }
        },
        {
          title: 'Active',
          dataIndex: 'active',
          key: 'active',
          render: (active) => {
            return active ? <Icon type={'check'}/> : null
          }

        }
      ]
    } else {
      columns = [
        {
          title: 'Type',
          dataIndex: 'type',
          key: 'type',
          render: (subType) => {


            return capitalize(subType)
          }
        },
        {
          title: 'Workspace',
          dataIndex: 'workspaceId',
          key: 'workspaceId',
          render: (workspaceObj) => {


            return capitalize(workspaceObj.name)
          }
        },
        {
          title: 'Active',
          dataIndex: 'active',
          key: 'active',
          render: (active) => {
            return active ? <Icon type={'check'}/> : null
          }

        },
        {
          title: 'Expired',
          dataIndex: 'expired',
          key: 'expired',
          render: (expired) => {
            return <Checkbox defaultChecked={expired} disabled={true}/>
          }
        },
        {
          title: 'Expire Date',
          dataIndex: 'expireDate',
          key: 'expireDate',
          render: (expireDate) => {

            return moment(expireDate).format('L')
          }
        },
        {
          title: 'AutoPay',
          dataIndex: 'autoPay',
          key: 'autoPay',
          render: (autoPay, record) => {


            return <Checkbox onChange={(event) => {
              let newAutoPayValue = event.target.checked
              setSubLoading(true)

              return axios.patch(`/subscriptions/${record._id}`, {
                  autoPay: newAutoPayValue
                },
                {
                  headers: { 'Authorization': `Bearer ${authData.token}` }
                })
                .then(() => {
                  setSubLoading(false)
                })
                .catch(err => {
                  console.log(err)
                  setSubLoading(false)
                })

            }} defaultChecked={autoPay && record.active} disabled={!record.active}/>
          }
        },
      ]
    }


    return <Table
      rowKey={() => uuid().toString()}

      loading={subLoading}
      columns={columns}
      dataSource={subscriptions}
      size="small"
      pagination={false}
    />
  }

  function renderChargesTable(charges, isMobile) {

    let columns = []
    if (isMobile) {
      columns = [
        {
          title: 'Type',
          dataIndex: 'subscriptionType',
          key: 'subscriptionType',
          render: (subType) => {


            return capitalize(subType)
          }
        },
        {
          title: 'Workspace',
          dataIndex: 'workspaceId',
          key: 'workspaceId',
          render: (workObj) => {

            return capitalize(workObj.name)
          }
        },
      ]
    } else {
      columns = [
        {
          title: 'Amount',
          dataIndex: 'amount',
          key: 'amount',
          render: (amount, record) => {
            let currencySymbol = '$'
            if (record.current === 'USD') {
              currencySymbol = '$'
            }

            return `${amount}${currencySymbol}`
          }
        },
        {
          title: 'Type',
          dataIndex: 'subscriptionType',
          key: 'subscriptionType',
          render: (subType) => {


            return capitalize(subType)
          }
        },
        {
          title: 'Workspace',
          dataIndex: 'workspaceId',
          key: 'workspaceId',
          render: (workObj) => {

            return capitalize(workObj.name)
          }
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          render: (status) => {

            return capitalize(status)
          }
        },
        {
          title: 'Purchase Date',
          dataIndex: 'createdAt',
          key: 'createdAt',
          render: (createdAt) => {

            return moment(createdAt).format('L')
          }
        }
      ]
    }

    return <Table
      rowKey={() => uuid().toString()}
      columns={columns}
      dataSource={charges}
      size="small"
      pagination={false}
    />
  }

  function renderCardsTable(cards, isMobile) {


    let columns = []
    if (isMobile) {
      columns = [
        {
          title: 'Last Digits',
          dataIndex: 'last4',
          key: 'last4',
          render: (last4) => {


            return `**** - ${last4}`
          }
        },
        {
          title: 'Exp.Date',
          dataIndex: 'expMonth',
          key: 'expMonth',
          render: (expMonth, record) => {

            return moment(parseInt(expMonth), 'M').format('MM') + '/' + record.expYear
          }
        },
        {
          title: 'Default Card',
          dataIndex: '_id',
          width: 45,
          key: 'default-card',
          render: (cardId) => {
            let isDefault = cardId === userDefaultCardId

            return isDefault ? <Icon type={'check'}/> : null
          }
        }
      ]
    } else {
      columns = [

        {
          title: 'Card',
          dataIndex: 'brand',
          key: 'brand',
          render: (brand, record) => {

            let icon = mapCardToIcon(brand)

            return <S.CardInfoWrapper>
              <S.CardImg src={icon} alt="Card Brand Image"/>
              <S.CardText>{capitalize(brand)}</S.CardText>
            </S.CardInfoWrapper>
          }
        },
        {
          title: 'Last Digits',
          dataIndex: 'last4',
          key: 'last4',
          render: (last4) => {


            return `**** - ${last4}`
          }
        },
        {
          title: 'Exp.Date',
          dataIndex: 'expMonth',
          key: 'expMonth',
          render: (expMonth, record) => {

            return moment(parseInt(expMonth), 'M').format('MM') + '/' + record.expYear
          }
        },
        {
          title: 'Default Card',
          dataIndex: '_id',
          width: 45,
          key: 'default-card',
          render: (cardId) => {
            let isDefault = cardId === userDefaultCardId

            return isDefault ? <Icon type={'check'}/> : null
          }
        },
        {
          title: 'Delete',
          dataIndex: '_id',
          key: 'delete',
          render: (cardId, record) => {

            function showConfirm() {
              return confirm({
                title: 'Do you want to delete this card?',
                content: 'Are you sure you want to remove your saved card',
                okText: 'Confirm',
                okButtonProps: { type: 'danger' },
                cancelText: 'Cancel',
                onOk() {
                  return axios.delete(`/cards/${cardId}`, { headers: { 'Authorization': `Bearer ${authData.token}` } })
                    .then(req => {

                      setCards(req.data.cards)
                    })
                    .catch(err => {

                      console.log(err)
                    })
                },
                onCancel() {
                },
              })
            }

            return <span>
        <a onClick={showConfirm}>Delete</a>
          </span>
          }
        },
      ]
    }
    return <Table
      rowKey={() => uuid().toString()}
      columns={columns}
      dataSource={cards}
      size="small"
      pagination={false}
    />
  }

  function renderWorkspaceMembersTable(workspaceMembers, isMobile) {

    workspaceMembers = workspaceMembers.filter(member => member.slackAccessTokens !== 0)

    let columns = []
    if (isMobile) {
      columns = [

        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (name) => {
            return capitalize(name)
          }
        },
        {
          title: 'Workspace',
          dataIndex: 'workspaceId',
          key: 'workspaceId',
          render: (workspaceObj) => {


            return capitalize(workspaceObj.name)
          }
        },
      ]
    } else {
      columns = [


        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (name) => {
            return capitalize(name)
          }
        },
        {
          title: 'Email',
          dataIndex: 'email',
          key: 'email'
        },
        {
          title: 'Workspace',
          dataIndex: 'workspaceId',
          key: 'workspaceId',
          render: (workspaceObj) => {


            return capitalize(workspaceObj.name)
          }
        },
        {
          title: 'Slack Primary Owner',
          dataIndex: 'slackIsPrimaryOwner',
          width: 50,
          key: 'slackIsPrimaryOwner',
          render: (slackIsPrimaryOwner) => {

            return slackIsPrimaryOwner ? <Icon type={'check'}/> : null
          }
        },
        {
          title: 'Text',
          dataIndex: 'role',
          key: 'role',
          render: (role) => {

            return capitalize(role)
          }
        }
      ]
    }

    return <Table
      rowKey={() => uuid().toString()}
      columns={columns}
      dataSource={workspaceMembers}
      size="small"
      pagination={false}
    />
  }

  return (
    <React.Fragment>

      <Header title={'Settings'}/>
      <S.Content >
          {isLoading ? <PulseLoader
            css={{ 'margin': '0 auto', 'width': '100%', 'height': '100%' }}
            color={Colors.App.spinnerColor}
            size={50}/> : (
            <React.Fragment>

              <S.FirstLine style={{
                display: 'inline-flex',
                marginTop: 0,
                justifyContent: 'space-evenly',
                textAlign: 'center',
                width: '100%'
              }}>
                <S.ColTopLeft>
                  <S.UserProfile style={{}}>
                    <S.Avatar style={{ backgroundColor: Colors.primaryColor }} shape="square" size={130} icon="user"/>
                    <S.UserProfileInfo>
                    <span>
                      <S.ProfileText>Email: {user.email}</S.ProfileText>
                      <S.ProfileText>Name: {(user.profile ? (user.profile.displayName || user.profile.realName || user.name) : user.name)}</S.ProfileText>
                    </span>
                      <span>
                      {changePasswordEmailSent ? <S.ProfileText style={{fontWeight: 'bold'}}>Email sent</S.ProfileText> :
                        <Button onClick={() => {
                          showConfirmChangePassword(authData.token)

                        }} type="primary">Change Password</Button>}

                    </span>

                    </S.UserProfileInfo>
                  </S.UserProfile>
                </S.ColTopLeft>
                <S.ColTopRight>
                  <h2 style={{ fontSize: '24px' }}>Authorized Slack Accounts</h2>
                  {(user && user.workspaceMembers) ?
                    <React.Fragment>
                      <Media query="(max-width: 576px)"
                             render={() => renderWorkspaceMembersTable(user.workspaceMembers, true)}/>
                      <Media query="(min-width: 577px)"
                             render={() => renderWorkspaceMembersTable(user.workspaceMembers, false)}/>
                    </React.Fragment>
                    : null}
                </S.ColTopRight>

              </S.FirstLine>
              <S.SecondLine style={{
                display: 'inline-flex',
                justifyContent: 'space-evenly',
                textAlign: 'center',
                width: '100%'
              }}>

                <S.WorkspacesCol>
                  <h2 style={{ fontSize: '24px' }}>Workspaces</h2>
                  <React.Fragment>
                    <Media query="(max-width: 576px)" render={() => renderWorkspacesTable(workspaces, true)}/>
                    <Media query="(min-width: 577px)" render={() => renderWorkspacesTable(workspaces, false)}/>
                  </React.Fragment>
                </S.WorkspacesCol>
                <S.WorkspacesCol>
                  <h2 style={{ fontSize: '24px' }}>Charges</h2>
                  <React.Fragment>
                    <Media query="(max-width: 576px)" render={() => renderChargesTable(charges, true)}/>
                    <Media query="(min-width: 577px)" render={() => renderChargesTable(charges, false)}/>
                  </React.Fragment>

                </S.WorkspacesCol>
              </S.SecondLine>
              <S.ThirdLine style={{
                display: 'inline-flex',
                justifyContent: 'space-evenly',
                textAlign: 'center',
                width: '100%',

              }}>
                <S.WorkspacesCol>
                  <h2 style={{ fontSize: '24px' }}>Subscriptions</h2>

                  <React.Fragment>
                    <Media query="(max-width: 576px)" render={() => renderSubscriptionsTable(subscriptions, true)}/>
                    <Media query="(min-width: 577px)" render={() => renderSubscriptionsTable(subscriptions, false)}/>
                  </React.Fragment>
                </S.WorkspacesCol>
                <S.WorkspacesCol>
                  <h2 style={{ fontSize: '24px' }}>Cards</h2>
                  <React.Fragment>
                    <Media query="(max-width: 576px)" render={() => renderCardsTable(cards, true)}/>
                    <Media query="(min-width: 577px)" render={() => renderCardsTable(cards, false)}/>
                  </React.Fragment>
                </S.WorkspacesCol>

              </S.ThirdLine>
              <S.FourthLine style={{
                display: 'inline-flex',
                justifyContent: 'space-evenly',
                textAlign: 'center',
                width: '100%',

              }}>
                <S.WorkspacesCol>

                  <S.BelowButtons>
                    {user.deleted ? <S.ProfileText style={{ fontWeight: 'bold' }}>Your Account will be deleted in 24
                        hours.</S.ProfileText> :
                      <Button onClick={() => {
                        showConfirmCloseAccount(authData.token)

                      }} type="primary">Close Account</Button>}
                  </S.BelowButtons>
                </S.WorkspacesCol>
                <S.WorkspacesCol>
                </S.WorkspacesCol>

              </S.FourthLine>
            </React.Fragment>)
          }

      </S.Content>
    </React.Fragment>

  )
}


const S = {
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
  WorkspaceColTitle: styled.h2`
    width: 50%; 
    margin: 0 auto;
    display: flex;
    justify-content: space-evenly;
    font-size: 24px;
`,
  FirstLine: styled.div`
   @media only screen and (max-width: 577px) {
   
      flex-direction: column;
      table {
        font-size: 0.9em;
      } 
      
      & table td {
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
      }
    }
`,
  SecondLine: styled.div`
   @media only screen and (max-width: 577px) {
      flex-direction: column;
      table {
        font-size: 0.9em;
      }
      
      & table td {
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
      }
    }
`,
  ThirdLine: styled.div`
   @media only screen and (max-width: 577px) {
      flex-direction: column;
      table {
        font-size: 0.9em;
      }
      
            
      & table td {
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
      }
    }
`,
  FourthLine: styled.div`
   @media only screen and (max-width: 577px) {
      flex-direction: column;
      table {
        font-size: 0.9em;
      }
      
            
      & table td {
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
      }
    }
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
          display: inline-block;
          
          @media only screen and (max-width: 577px) {
            && {
              margin-left: 15px; 
            }
          
          }
          `,
  UserProfile: styled.div`

          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          //width: 50%;
          text-align: left;
          //padding-left: 5%;
          //padding-top: 2.5%;
          min-height: 130px;
          
          @media only screen and (max-width: 577px) {
            flex-direction: column;
          
          }
          `,
  ProfileText: styled.p`
          margin: 2px;

          `,
  UserProfileInfo: styled.div`
          justify-content: space-between;
          display: flex;
          flex-direction: column;
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
   @media only screen and (max-width: 577px) {
          width: 100%;
    }

          width: 35%;
          padding-left: 1.25%;
          margin-top: 35px;
          `,
  ColTopRight: styled.span`
   @media only screen and (max-width: 577px) {
          width: 100%;

    }
          width: 55%;
          padding-left: 1.25%;
          margin-top: 35px;
          `,
  WorkspacesCol: styled.span`
   @media only screen and (max-width: 577px) {
          width: 100%;

    }
          width: 45%;
          padding-left: 1.25%;
          margin-top: 50px;
          `,
  WorkspacesColCards: styled(Col)`
         @media only screen and (max-width: 577px) {
          width: 100%;

    }
          && {
          float: unset !important;
          display: inline-block;
          vertical-align: top;

          }
          `,
  WorkspacesColSubs: styled(Col)`
   @media only screen and (max-width: 577px) {
          width: 100%;

    }
          && {
          float: unset !important;
          display: inline-block;
          vertical-align: top;

          }
          `,
  PictureWorkspace: styled.img`
          width: 25px;
          `,
  BelowButtons: styled.span`
    display: flex;
    margin: 15px 0;
    width: 100%;
    `
}

function mapStateToProps(state) {

  return {
    authData: state.authReducer.authData,
    workspaces: state.workspacesReducer.workspaces
  }
}


export default connect(mapStateToProps)(ProfilePage)
