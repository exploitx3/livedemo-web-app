import React from 'react'

import Button from 'antd/es/button'
import { DeploymentUnitOutlined, FolderOpenOutlined, SettingOutlined } from '@ant-design/icons'

import 'antd/es/button/style'

import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Colors from '../../../../constants/mainColors'
import { bindActionCreators } from 'redux'
import { updateCurrentSelectedWorkspace } from '../../../../actions/workspacesActions'
import { refreshToken } from '../../../../actions/authActions'
import { getWorkspaceEncryptionKey } from '../../../../actions/secureStorageActions'
import { connect } from 'react-redux'
import WorkspaceStatuses from '../../../../constants/WorkspaceStatuses'

const CARD_GRADIENTS = [
  ['#3a7bd5', '#2a63a3', '#4a8fe0'],
  ['#2eaa8f', '#1f9070', '#40bfa4'],
  ['#7a5fd0', '#5e3fa8', '#9a7fe0'],
  ['#d4861a', '#c07015', '#e0a040'],
  ['#c93050', '#a82040', '#d85870'],
]

function adjustBrightness(hex, factor) {
  const num = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.max(0, Math.round(((num >> 16) & 0xff) * factor)))
  const g = Math.min(255, Math.max(0, Math.round(((num >> 8) & 0xff) * factor)))
  const b = Math.min(255, Math.max(0, Math.round((num & 0xff) * factor)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function getGradient(name, darkness = 1) {
  const idx = !name ? 0 : name.charCodeAt(0) % CARD_GRADIENTS.length
  const [c1, c2, c3] = CARD_GRADIENTS[idx].map(c => adjustBrightness(c, darkness))
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`
}

function formatRelativeTime(dateString) {
  if (!dateString) return ''
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Updated ${mins || 1} minute${mins !== 1 ? 's' : ''} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Updated ${hours} hour${hours !== 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `Updated ${days} day${days !== 1 ? 's' : ''} ago`
}


const WorkspacesView = (props) => {
  const navigate = useNavigate()
  const hasWorskpaces = props.workspaces && props.workspaces.length > 0

  function onClickAddWorkspace() {
    navigate('/create-workspace')
  }

  return (
    <S.Workspaces>

      <S.WorkspacesTitleWrapper>
        <S.WorkspacesTitle>Workspaces</S.WorkspacesTitle>
        {hasWorskpaces ? '' : <S.AddWorkspaceButton onClick={onClickAddWorkspace} type="primary" icon={<DeploymentUnitOutlined />} size={'large'}>Add Workspace</S.AddWorkspaceButton>}
      </S.WorkspacesTitleWrapper>
      <S.WorkspacesContainer>
        {generateWorkspaceCards(props.workspaces, props, navigate)}

      </S.WorkspacesContainer>
    </S.Workspaces>
  )
}

function renderWorkspaceStatus(status) {
  if (status === WorkspaceStatuses.CHANNELS_POPULATED) {
    status = WorkspaceStatuses.EMPTY
  }

  return status === 'populated' ? 'updated' : <b>{status}</b>
}

function generateWorkspaceCards(workspaces, props, navigate) {
  let loading = workspaces === null
  // loading = true
  if (loading) {


    return [...Array(0).keys()].map((key) => {

      return (

        <S.Col key={key} span={8}>

          <Card
            loading={loading}
            style={{ width: 150 }}
            cover={
              <div className={'ant-skeleton ant-skeleton-active'}>
            <span style={{
              width: '100%',
              display: 'block',
              paddingTop: '20px'
            }}
                  className={'ant-skeleton-header'}>
              <span style={{
                display: 'block', margin: '0 auto', width: '55px', height: '35px'
              }}
                    className={'ant-skeleton-avatar ant-skeleton-avatar-lg ant-skeleton-avatar-square'}/>
            </span>


              </div>
            }
            actions={[
              (
                <span style={{ width: '100%', display: 'flex' }}>
                  <span className={'card__left-action'}
                        style={{ width: '70%', display: 'flex', justifyContent: 'space-evenly' }}>
                    <Icon type="sync" style={{ lineHeight: '25px' }}/>
                    <span>Status</span>
                  </span>
                  <span className={'card__right-action'} style={{ width: '30%', borderLeft: '1px solid #e8e8e8' }}>
                  </span>
                </span>

              )]}
          >
            <S.CardMeta
              title="Card title"
            />
          </Card>


          {/*<S.Skeleton loading={loading} paragraph={{ rows: 2 }} active>*/}

          {/*</S.Skeleton>*/}
        </S.Col>
      )
    })
  } else {

    if (workspaces.length === 0) {


      return [...Array(0).keys()].map((key) => {

        return (

          <S.ColEmpty span={8}>

            <Card
              key={key}
              loading={true}
              style={{ width: 150 }}
              cover={
                <div className={'ant-skeleton'}>
            <span style={{
              width: '100%',
              display: 'block',
              paddingTop: '20px'
            }}
                  className={'ant-skeleton-header'}>
              <span style={{
                display: 'block', margin: '0 auto', width: '55px', height: '35px'
              }}
                    className={'ant-skeleton-avatar ant-skeleton-avatar-lg ant-skeleton-avatar-square'}/>
            </span>


                </div>
              }
              actions={[
                (
                  <span style={{ width: '100%', display: 'flex' }}>
                  <span className={'card__left-action'}
                        style={{ width: '70%', display: 'flex', justifyContent: 'space-evenly' }}>
                    <Icon type="sync" style={{ lineHeight: '25px' }}/>
                    <span>Status</span>
                  </span>
                  <span className={'card__right-action'} style={{ width: '30%', borderLeft: '1px solid #e8e8e8' }}>
                  </span>
                </span>

                )]}
            >
              <S.CardMeta
                title="Card title"
              />
            </Card>


            {/*<S.Skeleton loading={loading} paragraph={{ rows: 2 }} active>*/}

            {/*</S.Skeleton>*/}
          </S.ColEmpty>
        )
      })

    } else {

      return workspaces.map(workspace => {
        const menuItems = [
          {
            key: 'open',
            label: 'Open',
            onClick: () => {
              props.actions.updateCurrentSelectedWorkspace(props.authData.token, workspace._id)
                .then(() => {
                  navigate('/demos')
                })
            }
          },
          {
            key: 'delete',
            label: 'Delete',
            onClick: () => {
              return props.onDeleteWorkspace(workspace)
            }
          }
        ]

        return (
          <S.WorkspaceCard key={workspace._id}>
            <S.CardCover
              gradient={getGradient(workspace.name, 1.3)}
              onClick={() => {
                props.actions.updateCurrentSelectedWorkspace(props.authData.token, workspace._id)
                  .then(() => navigate('/demos'))
              }}
            >
              <S.LetterAvatar>{workspace.name[0].toUpperCase()}</S.LetterAvatar>
            </S.CardCover>
            <S.CardBody>
              <S.CardName>{workspace.name}</S.CardName>
              <S.CardUpdated>{formatRelativeTime(workspace.updatedAt)}</S.CardUpdated>
              <S.CardActions>
                <S.ActionBtn
                  onClick={() => {
                    props.actions.updateCurrentSelectedWorkspace(props.authData.token, workspace._id)
                      .then(() => navigate('/demos'))
                  }}
                >
                  <FolderOpenOutlined />
                  <S.ActionLabel>Open</S.ActionLabel>
                </S.ActionBtn>
                <S.ActionDivider />
                <S.ActionBtn
                  onClick={() => {
                    props.actions.updateCurrentSelectedWorkspace(props.authData.token, workspace._id)
                    .then(() => {
                      navigate(`/settings?workspaceId=${workspace._id}`)
                    })
                  }}
                >
                  <SettingOutlined />
                  <S.ActionLabel>Settings</S.ActionLabel>
                </S.ActionBtn>
              </S.CardActions>
            </S.CardBody>
          </S.WorkspaceCard>
        )
      })

    }


  }
}


function mapStateToProps(state) {

  return {
    authData: state.authReducer.authData,
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace,
  }
}

function mapDispatchToProps(dispatch) {
  return {

    actions: bindActionCreators({ updateCurrentSelectedWorkspace, getWorkspaceEncryptionKey, refreshToken }, dispatch)


  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkspacesView)

const S = {}

S.Workspaces = styled.div``

S.WorkspacesTitleWrapper = styled.span`
  display: flex;
  justify-content: center;
`

S.WorkspacesTitle = styled.h2`
  font-size: 24px;
  @media (max-width: 567px) {
    width: 100%;
    text-align: center;
  }
`

S.AddWorkspaceButton = styled(Button)`
  margin-left: 45px;
  height: 35px;
  font-size: 1.1em;
  @media (max-width: 567px) {
    display: none;
  }
`

S.WorkspacesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 16px;
`

S.WorkspaceCard = styled.div`
  width: 220px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
  flex-shrink: 0;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.13);
    transform: translateY(-2px);
  }
`

S.CardCover = styled.div`
  width: 100%;
  height: 130px;
  background: ${({ gradient }) => gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: rgba(255,255,255,0.07);
    top: -40px;
    right: -40px;
  }

  &::after {
    content: '';
    position: absolute;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    bottom: -30px;
    left: -20px;
  }
`

S.LetterAvatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.6em;
  font-weight: 700;
  font-family: ${Colors.fontFamilyLexend};
  text-transform: uppercase;
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
`

S.CardBody = styled.div`
  padding: 14px 16px 12px;
`

S.CardName = styled.p`
  margin: 0 0 4px;
  font-size: 1.1em;
  font-weight: 700;
  color: ${Colors.primaryText};
  font-family: ${Colors.fontFamilyLexend};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
`

S.CardUpdated = styled.p`
  margin: 0 0 12px;
  font-size: 0.78em;
  color: #888;
  font-family: ${Colors.fontFamily};
  display: flex;
  align-items: center;
  gap: 4px;
`

S.CardActions = styled.div`
  display: flex;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
  gap: 0;
`

S.ActionBtn = styled.button`
  flex: 1;
  background: none;
  border: none;
  padding: 6px 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  color: ${Colors.primaryColor};
  font-size: 1.1em;
  border-radius: 8px;
  transition: background 0.15s, color 0.15s;
  outline: none;

  &:hover {
    background: #f0f5ff;
  }
`

S.ActionLabel = styled.span`
  font-size: 0.72em;
  font-family: ${Colors.fontFamily};
  color: ${Colors.primaryColor};
  font-weight: 500;
`

S.ActionDivider = styled.div`
  width: 1px;
  height: 32px;
  background: #f0f0f0;
  flex-shrink: 0;
`
