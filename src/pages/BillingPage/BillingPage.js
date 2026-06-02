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
import { toast } from 'react-toastify'

const { Content, Footer, Sider } = Layout
const { confirm } = Modal

const PLAN_LENGTHS = {
  Annually: 'Annually',
  Monthly: 'Monthly',
}

const IS_DEV = config.ENV === 'dev'

const PRODUCT_IDS = {
  Pro: {
    [PLAN_LENGTHS.Monthly]: IS_DEV ? 'prod_UXZkkwn0B77gSJ' : 'prod_UXbDm4HqbawhNo',
    [PLAN_LENGTHS.Annually]: IS_DEV ? 'prod_UXZmCUin8ZKi0o' : 'prod_UXbDRK1gGrfWEh',
  },
  Growth: {
    [PLAN_LENGTHS.Monthly]: IS_DEV ? 'prod_UXZluZhDivdyOl' : 'prod_UXbECZgFqrpCzI',
    [PLAN_LENGTHS.Annually]: IS_DEV ? 'prod_UXZnkXaY05BRmV' : 'prod_UXbEreuawwjJ1v',
  },
  'Trial - Pro': {
    [PLAN_LENGTHS.Monthly]: IS_DEV ? 'prod_UXZkkwn0B77gSJ' : 'prod_UXbDm4HqbawhNo',
    [PLAN_LENGTHS.Annually]: IS_DEV ? 'prod_UXZmCUin8ZKi0o' : 'prod_UXbDRK1gGrfWEh',
  },
}

const subscriptionTypes = [
  // {
  //   name: 'Startup',
  //   price: 'Free for 2 Creators'
  // },
  {
    name: 'Pro',
    price: `$34/month or $324/year`,
    priceMonthly: 34,
    priceAnnually: 324,
  },
  {
    name: 'Growth',
    price: `$49/month or $468/year`,
    priceMonthly: 49,
    priceAnnually: 468,
  },
  {
    name: 'Trial - Pro',
    price: `Free for 7 days, then $34/month`,
    priceMonthly: 34,
    priceAnnually: 324,
    freeTrial: true,
  },
]

function safeCapitalize(value) {
  if (!value || typeof value !== 'string') return ''
  return capitalize(value)
}

function getApiErrorMessage(errorData, fallback = 'Something went wrong') {
  const data = errorData?.response?.data
  if (!data) return fallback

  const payload = typeof data === 'string'
    ? (() => {
      try {
        return JSON.parse(data)
      } catch {
        return { message: data }
      }
    })()
    : data

  return payload.errorMessage || payload.message || fallback
}

function formatSubscriptionWorkspaceNames(workspaceIds, workspaces = []) {
  if (!Array.isArray(workspaceIds) || !workspaceIds.length) return ''

  return workspaceIds
    .map((entry) => {
      if (entry && typeof entry === 'object' && entry.name) {
        return safeCapitalize(entry.name)
      }

      const id = (entry?._id ?? entry)?.toString?.() ?? String(entry)
      const workspace = workspaces.find((w) => w._id?.toString() === id)
      return workspace?.name ? safeCapitalize(workspace.name) : null
    })
    .filter(Boolean)
    .join(', ')
}

const BillingPage = ({ authData, currentSelectedWorkspace, workspaces }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [changePasswordEmailSent, setChangePasswordEmailSent] = useState(false)

  const featureFlags = authData.featureFlags || {}

  // const [charges, setCharges] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [subLoading, setSubLoading] = useState(false)
  const [cards, setCards] = useState([])

  const [planLength, setPlanLength] = useState(PLAN_LENGTHS.Monthly)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [planQuantities, setPlanQuantities] = useState(() =>
    Object.fromEntries(subscriptionTypes.map((sub) => [sub.name, 1]))
  )

  const MAX_PLAN_QUANTITY = 99

  function setPlanQuantity(planName, nextQuantity) {
    setPlanQuantities((prev) => ({
      ...prev,
      [planName]: Math.min(MAX_PLAN_QUANTITY, Math.max(1, nextQuantity)),
    }))
  }

  async function handleCheckout(subName, quantity = 1) {
    const productId = PRODUCT_IDS[subName]?.[planLength]
    if (!productId) return

    const sub = subscriptionTypes.find((s) => s.name === subName)
    const freeTrial = sub?.freeTrial === true

    setCheckoutLoading(true)
    try {
      const response = await axios.post(
        '/payments/checkout-session',
        {
          productId,
          workspaceId: currentSelectedWorkspace._id,
          quantity,
          ...(freeTrial && { freeTrial: true }),
        },
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


        setSubscriptions(subsResp.data.subscriptions || [])

        setUser(userResp.data)

        setIsLoading(false)
      })
      .catch(err => {
        console.log(err)
        console.log(`Couldn't get subscriptions or cards data from API`)
        setSubscriptions([])
        setIsLoading(false)
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

            return <S.PictureWorkspace alt={'Workspace Picture'} src={''} />
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

            return <S.PictureWorkspace alt={'Workspace Picture'} src={''} />
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


            return safeCapitalize(subType)
          }
        },
        {
          title: 'Workspace',
          dataIndex: 'workspaceIds',
          key: 'workspaceIds',
          render: (workspaceIds) => formatSubscriptionWorkspaceNames(workspaceIds, workspaces),
        },
        {
          title: 'Active',
          dataIndex: 'active',
          key: 'active',
          render: (active, record) => {
            if (!active) return <U.StatusText $enabled={false}>Disabled</U.StatusText>
            return <U.StatusText $enabled={record.autoPay}>
              {record.autoPay ? 'Enabled' : 'Disabled'}
            </U.StatusText>
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


            return safeCapitalize(subType)
          }
        },
        {
          title: 'Workspace',
          dataIndex: 'workspaceIds',
          key: 'workspaceIds',
          render: (workspaceIds) => formatSubscriptionWorkspaceNames(workspaceIds, workspaces),
        },
        {
          title: 'Active',
          dataIndex: 'active',
          key: 'active',
          render: (active, record) => {
            if (!active) return <U.StatusText $enabled={false}>Disabled</U.StatusText>
            return <U.StatusText $enabled={record.autoPay}>
              {record.autoPay ? 'Enabled' : 'Disabled'}
            </U.StatusText>
          }
        },
        // {
        //   title: 'Expired',
        //   dataIndex: 'expired',
        //   key: 'expired',
        //   render: (expired) => {
        //     return <Checkbox defaultChecked={expired} disabled={true} />
        //   }
        // },
        {
          title: 'Next Renewal Date',
          dataIndex: 'expireDate',
          key: 'expireDate',
          render: (expireDate) => {
            return expireDate ? moment(expireDate).format('L') : ''
          }
        },
        {
          title: 'Enable/Disable',
          dataIndex: 'autoPay',
          key: 'autoPay',
          render: (autoPay, record) => {


            if (!record.active) return null

            const toggleAutoPay = (newValue) => {
              setSubLoading(true)
              axios.patch(`/subscriptions/${record._id}`, { autoPay: newValue }, {
                headers: { Authorization: `Bearer ${authData.token}` }
              })
                .then(() => {
                  setSubscriptions(prev =>
                    prev.map(s => s._id === record._id ? { ...s, autoPay: newValue } : s)
                  )
                  setSubLoading(false)
                })
                .catch(err => { console.log(err); setSubLoading(false) })
            }

            if (autoPay) {
              return (
                <U.AutoPayCancelBtn disabled={subLoading} onClick={() => toggleAutoPay(false)}>
                  Cancel
                </U.AutoPayCancelBtn>
              )
            }

            return (
              <U.AutoPayActivateBtn disabled={subLoading} onClick={() => toggleAutoPay(true)}>
                Activate
              </U.AutoPayActivateBtn>
            )
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

            return isDefault ? <Icon type={'check'} /> : null
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
              <S.CardImg src={icon} alt="Card Brand Image" />
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

            return isDefault ? <Icon type={'check'} /> : null
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
                    .catch((err) => {
                      toast.error(getApiErrorMessage(err, 'Failed to delete card'), {
                        position: 'top-right',
                      })
                      return Promise.reject(err)
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

  function renderSub(sub, subIndex, subLength, featureFlags) {

    if (sub.freeTrial && featureFlags.freeActivate) {

      const quantity = 1
      const annualSavings =
        (sub.priceMonthly * 12 - sub.priceAnnually) * quantity

      return (
        <U.ListItem key={subIndex}>
          <U.Name>
            <U.NameText>{sub.name}</U.NameText>
          </U.Name>
          <U.Text>
            <U.PriceLine>
              <s>{`$${sub.priceMonthly * quantity}`}</s>
              <span>{`  - free for 7 days`}</span>
            </U.PriceLine>
            {subLength === PLAN_LENGTHS.Annually && annualSavings > 0 && (
              <React.Fragment>
                <span style={{ marginRight: '5px' }}>-</span>
                <U.PriceLine style={{ marginRight: '5px' }}>Save ${annualSavings}/year</U.PriceLine>
              </React.Fragment>
            )}
          </U.Text>
          <U.Action>
            <U.ActionPurchase
              onClick={() => handleCheckout(sub.name, 1)}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Loading...' : 'Start Free Trial'}
            </U.ActionPurchase>
          </U.Action>
        </U.ListItem>
      )
    } else if (sub.freeTrial && !featureFlags.freeActivate) {
      return null
    }

    const quantity = planQuantities[sub.name] ?? 1
    const annualSavings =
      (sub.priceMonthly * 12 - sub.priceAnnually) * quantity

    return (
      <U.ListItem key={subIndex}>
        <U.Name>
          <U.NameText>{sub.name}</U.NameText>
        </U.Name>
        <U.Text>
          <U.PriceLine>
            {subLength === PLAN_LENGTHS.Annually
              ? `$${sub.priceAnnually * quantity}`
              : `$${sub.priceMonthly * quantity}`}
            {subLength === PLAN_LENGTHS.Annually ? `/year` : `/month`}
          </U.PriceLine>
          {subLength === PLAN_LENGTHS.Annually && annualSavings > 0 && (
            <React.Fragment>
              <span style={{ marginRight: '5px' }}>-</span>
              <U.PriceLine style={{ marginRight: '5px' }}>Save ${annualSavings}/year</U.PriceLine>
            </React.Fragment>
          )}
        </U.Text>
        <U.Action>
          <U.QuantityControl
            onClick={(e) => e.stopPropagation()}
            role="group"
            aria-label={`Quantity for ${sub.name}`}
          >
            <U.QuantityButton
              type="button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1 || checkoutLoading}
              onClick={() => setPlanQuantity(sub.name, quantity - 1)}
            >
              −
            </U.QuantityButton>
            <U.QuantityValue aria-live="polite">{quantity}</U.QuantityValue>
            <U.QuantityButton
              type="button"
              aria-label="Increase quantity"
              disabled={quantity >= MAX_PLAN_QUANTITY || checkoutLoading}
              onClick={() => setPlanQuantity(sub.name, quantity + 1)}
            >
              +
            </U.QuantityButton>
          </U.QuantityControl>
          <U.ActionPurchase
            onClick={() => handleCheckout(sub.name, quantity)}
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

      <Header title={'Billing'} />
      <S.Content>
        {isLoading ? <Spinner /> : (
          <React.Fragment>

            <S.FirstLine>
              <S.DashboardRow gutter={[16, 16]}>
                <S.WorkspacesCol xs={24} lg={12}>
                  <U.TitleText>Active Plans</U.TitleText>


                  {/* <h2 style={{ fontSize: '24px' }}>Active Plans</h2> */}

                  <React.Fragment>
                    <Media query="(max-width: 576px)" render={() => renderSubscriptionsTable(subscriptions, true)} />
                    <Media query="(min-width: 577px)" render={() => renderSubscriptionsTable(subscriptions, false)} />
                  </React.Fragment>
                  <U.InfoText style={{ marginBottom: 62, display: 'block' }}>
                    - If your plan is cancelled before the next renewal date, you will not be charged.
                  </U.InfoText>
                </S.WorkspacesCol>
                <S.WorkspacesCol xs={24} lg={12}>
                  <U.TitleText>Plans</U.TitleText>

                  {/* <h2 style={{ fontSize: '24px' }}>Plans</h2> */}
                  <U.FormUsers>
                    <U.TitleSection>
                      <U.TitleRow>
                        <U.Title>
                          <U.TitleText>Plans</U.TitleText>
                        </U.Title>
                        <U.BillingToggleDiv>

                          <U.BillingToggleRow>

                            <U.BillingSavePill className={planLength === PLAN_LENGTHS.Annually ? 'active' : ''}>Save 20%</U.BillingSavePill>

                          </U.BillingToggleRow>
                          <U.BillingToggleRow style={{}}>

                            <U.BillingToggleLabel active={planLength === PLAN_LENGTHS.Monthly}>
                              Monthly
                            </U.BillingToggleLabel>
                            <U.BillingToggleTrack
                              type="button"
                              on={planLength === PLAN_LENGTHS.Annually}
                              onClick={() =>
                                setPlanLength((prev) =>
                                  prev === PLAN_LENGTHS.Annually
                                    ? PLAN_LENGTHS.Monthly
                                    : PLAN_LENGTHS.Annually
                                )
                              }
                              aria-label="Toggle billing period"
                            >

                              <U.BillingToggleThumb on={planLength === PLAN_LENGTHS.Annually} />
                            </U.BillingToggleTrack>
                            <U.BillingToggleLabel active={planLength === PLAN_LENGTHS.Annually}>
                              Annual
                            </U.BillingToggleLabel>

                          </U.BillingToggleRow>
                        </U.BillingToggleDiv>
                      </U.TitleRow>

                      <U.TitleDesc> Purchase a plan for <U.WkspName>{authData?.name}</U.WkspName> account </U.TitleDesc>
                      <U.UsersListHeaders>
                        <U.HeaderName style={{ width: '23%' }}>Plan</U.HeaderName>
                        <U.HeaderName style={{ width: '48%' }}>Price</U.HeaderName>


                      </U.UsersListHeaders>
                    </U.TitleSection>
                    <U.MainSection>
                      <List
                        itemLayout="horizontal"
                        dataSource={subscriptionTypes}
                        renderItem={(sub, subIndex) => renderSub(sub, subIndex, planLength, featureFlags)}
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
                    <Media query="(max-width: 576px)" render={() => renderCardsTable(cards, true)} />
                    <Media query="(min-width: 577px)" render={() => renderCardsTable(cards, false)} />
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
  StatusText: styled.span`
    font-size: 0.8125rem;
    font-weight: 600;
    color: ${p => p.$enabled ? '#16a34a' : '#6b7280'};
  `,
  AutoPayCancelBtn: styled.button`
    background: #dc2626;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 4px 12px;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s ease;

    &:hover { opacity: 0.85; }
    &:active { opacity: 0.7; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  `,
  AutoPayActivateBtn: styled.button`
    background: #16a34a;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 4px 12px;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s ease;

    &:hover { opacity: 0.85; }
    &:active { opacity: 0.7; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  `,
  TitleRow: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  `,
  ListItem: styled.li`
    display: flex;
    // cursor: pointer;
    flex-direction: row;
    justify-content: space-between;
    padding: 15px;
    &:hover {
      p {
        text-decoration: underline;
      }
    }
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
  Text: styled.div`
    width: 60%;
    margin: 0px;
    min-height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
    line-height: 50px;
  `,
  PriceLine: styled.span`
    font-size: 16px;
    line-height: 50px;
    color: #111111;
  `,
  Action: styled.span`
    width: 17%;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    line-height: 50px;
  `,
  QuantityControl: styled.div`
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  `,
  QuantityButton: styled.button`
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid #dae3f2;
    border-radius: 6px;
    background: #fff;
    color: #111111;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:disabled {
      color: #c4cacd;
      cursor: not-allowed;
      background: #f5f7fa;
    }

    &:not(:disabled):hover {
      border-color: ${Colors.primaryColor};
      color: ${Colors.primaryColor};
    }
  `,
  QuantityValue: styled.span`
    min-width: 24px;
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    color: #111111;
    line-height: 1;
  `,
  ActionPurchase: styled.button`
    color: #111111;
    margin: 0px;
    line-height: 50px;
    white-space: nowrap;
    border: none;
    background: none;
    padding: 0;
    font-size: inherit;
    font-family: inherit;
    cursor: pointer;
    
    &&:hover:not(:disabled) {
      text-decoration: underline;
      text-underline: #13c38a;
      cursor: pointer;
    }

    &:disabled {
      color: #c4cacd;
      cursor: not-allowed;
      text-decoration: none;
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
  InfoText: styled.p`
    margin: 20px 0px;
    font-size: 14px;
    // color: #6b7280;
    line-height: 2.4;
  `,
  TitleDesc: styled.p`
    font-size: 14px;
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
  BillingToggleDiv: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  `,
  BillingToggleRow: styled.div`
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
    font-size: 14px;
    line-height: 1;
  `,
  BillingToggleLabel: styled.span`
    color: ${({ active }) => (active ? '#111111' : '#c4cacd')};
    font-weight: ${({ active }) => (active ? 600 : 400)};
    transition: color 0.2s, font-weight 0.2s;
    user-select: none;
  `,
  BillingToggleTrack: styled.button`
    width: 44px;
    height: 24px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    background: ${({ on }) => (on ? Colors.primaryColor : '#d1d5db')};
    position: relative;
    transition: background 0.25s;
    flex-shrink: 0;
    padding: 0;
    line-height: 1;
  `,
  BillingToggleThumb: styled.span`
    position: absolute;
    top: 3px;
    left: ${({ on }) => (on ? '23px' : '3px')};
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.22s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  `,
  BillingSavePill: styled.span`
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${Colors.primaryColor};
    background:rgba(16, 112, 255, 0.07);
    border: 1px solid #1070ff;
    border-radius: 20px;
    padding: 2px 8px;
    &.active {
      visibility: visible;
    }
    visibility: hidden;
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
