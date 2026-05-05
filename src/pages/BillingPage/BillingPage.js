import styled from 'styled-components'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { capitalize } from '../../utils/helperFunctions'
import moment from 'moment'
import uuid from 'uuid/v4'
import { mapCardToIcon } from '../../utils/CardToIconMap'
import Media from 'react-media'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import Header from '../../components/Header/Header'
//import { Avatar, Checkbox, Col, Icon, Layout, List, Modal, Table } from 'antd'

import Avatar from 'antd/es/avatar'
import 'antd/es/avatar/style'
import Checkbox from 'antd/es/checkbox'
import 'antd/es/checkbox/style'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import Icon from '../../components/Icon/Icon'
import Layout from 'antd/es/layout'
import List from 'antd/es/list'
import 'antd/es/list/style'
import 'antd/es/row/style'

import Modal from 'antd/es/modal'
import 'antd/es/modal/style'

import Table from 'antd/es/table'
import 'antd/es/table/style'

import axios from '../../utils/axiosInstance'
import config from '../../config.json'
import Spinner from '../../components/Spinner/Spinner'
import Colors from '../../constants/mainColors'

const { Content, Footer, Sider } = Layout
const { confirm } = Modal

const PLAN_LENGTHS = {
  Annually: 'Annually',
  Monthly: 'Monthly',
}

const IS_DEV = config.ENV === 'dev'

const PRODUCT_IDS = {
  Business: {
    [PLAN_LENGTHS.Monthly]: IS_DEV ? 'prod_USR38KOAAF6aFo' : 'prod_USQIjwxyXqkb4a',
    [PLAN_LENGTHS.Annually]: IS_DEV ? 'prod_USR3CHtcPZDvIx' : 'prod_USQKMjZ7qq5Zrq',
  },
}

const subscriptionTypes = [
  // {
  //   name: 'Startup',
  //   price: 'Free for 2 Creators'
  // },
  {
    name: 'Business',
    price: 'Up to 5 Creators'
  },

]

const BillingPage = ({ authData, currentSelectedWorkspace, workspaces }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [changePasswordEmailSent, setChangePasswordEmailSent] = useState(false)

  // const [charges, setCharges] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [subLoading, setSubLoading] = useState(false)
  const [cards, setCards] = useState([])

  const [planLength, setPlanLength] = useState(PLAN_LENGTHS.Annually)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  async function handleCheckout(subName) {
    const productId = PRODUCT_IDS[subName]?.[planLength]
    if (!productId) return

    setCheckoutLoading(true)
    try {
      const response = await axios.post(
        '/payments/checkout-session',
        { productId, workspaceId: currentSelectedWorkspace._id },
        { headers: { Authorization: `Bearer ${authData.token}` } }
      )

      if (response.data.url) {
        window.location.href = response.data.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setCheckoutLoading(false)
    }
  }

  const [userDefaultCardId, setUserDefaultCardId] = useState('')
  const [user, setUser] = useState([])

  const [userLoading, setUserLoading] = useState(false)

  // const [exportsLoading, setExportsLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let authHeaders = {
      'Authorization': `Bearer ${authData.token}`
    }

    let getSubscriptionsPromise = axios.get('/subscriptions', { headers: authHeaders })
    let getCardsPromise = axios.get('/users/cards', { headers: authHeaders })
    let getUserPromise = axios.get('/users', { headers: authHeaders })

    Promise.all(
      [
        getCardsPromise,
        getSubscriptionsPromise,
        getUserPromise,
      ])
      .then(([cardsResp, subsResp, userResp]) => {
        setCards(cardsResp.data.cards)
        setUserDefaultCardId(cardsResp.data.defaultCardId)


        setSubscriptions(subsResp.data.subscriptions)

        setUser(userResp.data)

        setIsLoading(false)
      })
      .catch(err => {
        console.log(err)
        console.log(`Couldn't get subscriptions or cards data from API`)
      })

  }, [])

  function renderWorkspacesTable(workspaces, isMobile) {
    let columns = []
    if (isMobile) {
      columns = [
        {
          title: 'Picture',
          dataIndex: 'icon',
          key: 'icon',
          render: (iconObj) => {

            return <S.PictureWorkspace alt={'Workspace Picture'} src={''}/>
          }
        },
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
        },

      ]
    } else {
      columns = [
        {
          title: 'Picture',
          dataIndex: 'icon',
          key: 'icon',
          render: (iconObj) => {

            return <S.PictureWorkspace alt={'Workspace Picture'} src={''}/>
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
      ]
    }


    return <Table
      rowKey={(record, index) => record._id || `workspace-${index}`}
      onRow={(record, rowIndex) => {
        return {
          onClick: event => {

            navigate(`/workspaces/${record._id}`)
          }
        }
      }}
      columns={columns}
      dataSource={workspaces}
      size="small"
      pagination={false}
    />
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
      rowKey={(record, index) => record._id || `subscription-${index}`}
      loading={subLoading}
      columns={columns}
      dataSource={subscriptions}
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
      rowKey={(record, index) => record._id || `card-${index}`}
      columns={columns}
      dataSource={cards}
      size="small"
      pagination={false}
    />
  }

  function renderSub(sub, subIndex, subLength, authData) {

    return (
      <U.ListItem key={subIndex}>
        <U.Name>
          <U.NameText>{sub.name}</U.NameText>
        </U.Name>
        <U.Text>
          {sub.price}
        </U.Text>
        <U.Action>

          <U.ActionPurchase
            onClick={() => handleCheckout(sub.name)}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? 'Loading...' : 'Purchase'}
          </U.ActionPurchase>
        </U.Action>

      </U.ListItem>
    )
  }

  let currentWkspaceName = (currentSelectedWorkspace && currentSelectedWorkspace.name) || ''
  return (
    <React.Fragment>

      <Header title={'Billing'}/>
      <S.Content>
        {isLoading ? <Spinner/> : (
          <React.Fragment>

            <S.FirstLine>
              <S.DashboardRow gutter={[16, 16]}>
                <S.WorkspacesCol xs={24} lg={12}>
                <U.TitleText>Active Plans</U.TitleText>

                  {/* <h2 style={{ fontSize: '24px' }}>Active Plans</h2> */}

                  <React.Fragment>
                    <Media query="(max-width: 576px)" render={() => renderSubscriptionsTable(subscriptions, true)}/>
                    <Media query="(min-width: 577px)" render={() => renderSubscriptionsTable(subscriptions, false)}/>
                  </React.Fragment>
                </S.WorkspacesCol>
                <S.WorkspacesCol xs={24} lg={12}>
                  <U.TitleText>Plans</U.TitleText>

                  {/* <h2 style={{ fontSize: '24px' }}>Plans</h2> */}
                  <U.FormUsers>
                    <U.TitleSection>
                      <U.Title>
                        <U.TitleText>Plans</U.TitleText>
                      </U.Title>
                      <U.TitleDesc> Purchase a plan for <U.WkspName>{currentWkspaceName}</U.WkspName> workspace </U.TitleDesc>
                      <U.UsersListHeaders>
                        <U.HeaderName style={{ width: '23%' }}>Plan</U.HeaderName>
                        <U.HeaderName style={{ width: '48%' }}>Price</U.HeaderName>
                        <U.PlanSwitch style={{ width: '29%' }}>
                          <U.PlanLength isSelected={planLength === PLAN_LENGTHS.Annually}
                          onClick={() => {
                            if(planLength !== PLAN_LENGTHS.Annually) {

                              setPlanLength(PLAN_LENGTHS.Annually)
                            }
                          }}>Annually</U.PlanLength>
                          <U.PlanLength isSelected={planLength === PLAN_LENGTHS.Monthly}
                            onClick={() => {
                              if(planLength !== PLAN_LENGTHS.Monthly) {

                                setPlanLength(PLAN_LENGTHS.Monthly)
                              }
                            }}
                          >Monthly</U.PlanLength>
                        </U.PlanSwitch>
                      </U.UsersListHeaders>
                    </U.TitleSection>
                    <U.MainSection>
                      <List
                        itemLayout="horizontal"
                        dataSource={subscriptionTypes}
                        renderItem={(sub, subIndex) => renderSub(sub, subIndex, planLength, authData)}
                      />
                    </U.MainSection>
                  </U.FormUsers>
                </S.WorkspacesCol>
              </S.DashboardRow>
            </S.FirstLine>
            <S.SecondLine>
              <S.DashboardRow gutter={[16, 16]}>
                <S.WorkspacesCol xs={24} lg={12}>
                  <U.TitleText>Cards</U.TitleText>
                  {/* <h2 style={{ fontSize: '24px' }}>Cards</h2> */}
                  <React.Fragment>
                    <Media query="(max-width: 576px)" render={() => renderCardsTable(cards, true)}/>
                    <Media query="(min-width: 577px)" render={() => renderCardsTable(cards, false)}/>
                  </React.Fragment>
                </S.WorkspacesCol>
                <S.WorkspacesCol xs={24} lg={12}>

                </S.WorkspacesCol>
              </S.DashboardRow>
            </S.SecondLine>

            <S.ThirdLine>
              <S.DashboardRow gutter={[16, 16]}>

              </S.DashboardRow>
            </S.ThirdLine>
            <S.FourthLine>
              <S.DashboardRow gutter={[16, 16]}>
                <S.WorkspacesCol xs={24} lg={12}>

                </S.WorkspacesCol>
                <S.WorkspacesCol xs={24} lg={12}>
                </S.WorkspacesCol>
              </S.DashboardRow>
            </S.FourthLine>
          </React.Fragment>)
        }

      </S.Content>
    </React.Fragment>

  )
}


const U = {
  ListItem: styled.li`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 15px;
`,
  ChannelIcon: styled(Icon)`
    width: 25px;
    height: 25px;
    border-radius: 9px;
    
    && svg {
      border-radius: 9px;
      width: 25px;
      height: 25px;
      fill: ${Colors.primaryColor};
    }
  `,
  InnerMemberText: styled.p`

  `,
  ListItemMeta: styled.span`
  
`,
  Checkbox: styled(Checkbox)`

 `,
  WkspName: styled.p`
    margin: 0px;
    padding: 0px;
    text-transform: capitalize;
    display: inline-block;
    text-decoration: underline;
  `,

  Name: styled.span`
    margin-left: 5px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 23%;
    height: 50px;
    line-height: 50px;
    white-space: none;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  NameText: styled.p`
    color: #111111;
    font-size: 16px;
    margin: 0px;
    
  `,
  Text: styled.p`
    width: 60%;
    text-align: left;
    margin: 0px;
    line-height: 50px;
  `,
  Action: styled.span`
    width: 17%;
    text-align: left;
    line-height: 50px;

    
  `,
  ActionPurchase: styled.p`
    color: #111111;
    margin: 0px;
    line-height: 50px;
    
    &&:hover {
      text-decoration: underline;
      text-underline: #13c38a;
      cursor: pointer;
    }
  `,
  FormUsers: styled.div`
    height: 350px;
    border: solid 1px #dae3f2;
    -webkit-box-shadow: 0 1px 5px rgb(0 0 0 / 5%);
    -moz-box-shadown: 0 1px 5px rgba(0,0,0,.05);
    box-shadow: 0 1px 5px rgb(0 0 0 / 5%);
    border-radius: 6px;
    
    display: flex;
    flex-direction: column;
  `,
  TitleSection: styled.section`
    padding: 15px 20px;
    border-bottom: 1px solid #dae3f2;
    text-align: left;
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
  Title: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 5px;
  `,
  TitleText: styled.h2`
    font-weight: 500;
    font-size: 18px;
    margin: 0px 15px 0px 0px;
    text-align: center;
    margin-bottom: 20px;
  `,
  TitleDesc: styled.p`
    font-size: 12px;
    margin: 0px;
  `,
  AddUserIcon: styled(Icon)`
    width: 30px;
    height: 30px;
    border-radius: 9px;
    
    &&:hover svg {
      cursor: pointer;
      fill: #0554c8;
    }    
    
    &&:hover {
      cursor: pointer;
    }
    
    && svg {
      border-radius: 9px;
      width: 30px;
      height: 30px;
      fill: ${Colors.primaryColor};

      
    }
  `,

  UsersListHeaders: styled.div`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    line-height: 50px;
    align-items: flex-end;
    
  `,
  HeaderName: styled.p`
    font-size: 16px;
    font-weight: 550;
    color: #c4cacd;
    display: inline-block;
    margin: 0px;
    
  `,
  PlanSwitch: styled.span`
    display: inline-flex;
    flex-direction: row;
    height: 50px;
    line-height: 50px;
    justify-content: space-between;
    font-size: 14px;

  `,
  PlanLength: styled.p`
    
    color: ${(props) => {
      return props.isSelected ? '#111111' : '#c4cacd'
    }};
    
    text-decoration: ${(props) => {
      return props.isSelected ? 'underline' : 'none'
    }};
    
    &&:hover{
      text-decoration: underline;
      cursor: pointer;
    }
  `,
  MainSection: styled.section`
    background: #fafbfe;
    flex-grow: 1;
    overflow-y: scroll;
    
     //Scroll Bar styles
    
     &&::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 10px;
      background-color: #FFF;
    }

    &&::-webkit-scrollbar {
      width: 1px;
      background-color: #FFF;
    }

    &&::-webkit-scrollbar-thumb {
      border-radius: 10px;
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
      background-color: ${Colors.primaryColor};
    }
    
  `

}

const S = {
  Content: styled(Content)`
    && {
      background: white;
      padding: 36px;
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
    width: 100%;
    margin-top: 0;

    @media only screen and (max-width: 577px) {
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
    width: 100%;
    margin-top: 20px;

    @media only screen and (max-width: 577px) {
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
    width: 100%;

    @media only screen and (max-width: 577px) {
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
    width: 100%;

    @media only screen and (max-width: 577px) {
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

    @media only screen and (max-width: 577px) {
      width: 100%;
      margin-top: 30px;
    }
  `,
  WorkspacesColCards: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
    }

    @media only screen and (max-width: 577px) {
      width: 100%;
    }
  `,
  WorkspacesColSubs: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
    }

    @media only screen and (max-width: 577px) {
      width: 100%;
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
    workspaces: state.workspacesReducer.workspaces,
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace
  }
}


export default connect(mapStateToProps)(BillingPage)
