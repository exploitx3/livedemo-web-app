import React from 'react'
//import { Button, Card, Col, Dropdown, Icon, Menu, Skeleton } from 'antd'

import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Col from 'antd/es/col'
import Dropdown from 'antd/es/dropdown'
import Icon from '../../../components/Icon/Icon'
import Menu from 'antd/es/menu'
import Skeleton from 'antd/es/skeleton'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { bindActionCreators } from 'redux'
import { updateCurrentSelectedWorkspace } from '../../../../actions/workspacesActions'
import { refreshToken } from '../../../../actions/authActions'
import { getWorkspaceEncryptionKey } from '../../../../actions/secureStorageActions'
import { connect } from 'react-redux'
import WorkspaceStatuses from '../../../../constants/WorkspaceStatuses'


const LiveDemosView = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  function onClickAddWorkspace() {
    navigate('/create-workspace')
  }

  return (
    <S.Workspaces>

      <S.WorkspacesTitleWrapper>

      </S.WorkspacesTitleWrapper>
      <S.WorkspacesContainer>
        {generateLiveDemoCards(props.livedemos, props)}

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

function generateLiveDemoCards(liveDemos, props) {


  let loading = liveDemos === null
  // loading = true
  if (loading) {


    return [...Array(3).keys()].map((key) => {

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
            <Card.Meta
              title="Card title"
            />
          </Card>


          {/*<S.Skeleton loading={loading} paragraph={{ rows: 2 }} active>*/}

          {/*</S.Skeleton>*/}
        </S.Col>
      )
    })
  } else {

    if (liveDemos.length === 0) {


      return [...Array(1).keys()].map((key) => {

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
              <Card.Meta
                title="Card title"
              />
            </Card>


            {/*<S.Skeleton loading={loading} paragraph={{ rows: 2 }} active>*/}

            {/*</S.Skeleton>*/}
          </S.ColEmpty>
        )
      })

    } else {

      return liveDemos.map(liveDemo => {
        const menu = (
          <Menu>
            <Menu.Item><span onClick={() => {


            }}>Open</span></Menu.Item>
            <Menu.Item onClick={() => {


              return props.onDeleteWorkspace(liveDemo)
            }}>Delete</Menu.Item>
          </Menu>

        )

        return (
          <S.Col key={liveDemo._id} xs={24} lg={8}>
            <Card
              style={{ width: 150, margin: '0 auto' }}
              cover={
                <S.ImageWrapper style={{ width: 150 }} onClick={() => {
                  navigate(`/workspace/${liveDemo.workspaceId}/livedemo/${liveDemo._id}`)


                }}>
                  <S.WorkspaceImage>{liveDemo.name[0]}</S.WorkspaceImage>


                </S.ImageWrapper>
              }
              actions={[
                (
                  <span style={{ width: '100%', display: 'flex' }}>
                  <span className={'card__left-action'}
                        style={{ width: '70%', display: 'flex', justifyContent: 'space-evenly' }}>
                    <Icon type="sync" style={{ lineHeight: '25px' }}/>
                    <span style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}></span>
                  </span>
                  <span className={'card__right-action'} style={{ width: '30%', borderLeft: '1px solid #e8e8e8' }}>
                      <Dropdown overlay={menu}>
                        <Icon type="ellipsis"/>
                      </Dropdown>
                  </span>
                </span>

                )]}
            >
              <Card.Meta
                style={{ textTransform: 'capitalize' }}
                title={liveDemo.name}
              />
            </Card>
          </S.Col>
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

export default connect(mapStateToProps, mapDispatchToProps)(LiveDemosView)

const S = {}

S.Col = styled(Col)`
  float: unset !important;
  display: inline-block !important;
  margin-top: 20px;
        
        
  @media only screen and (max-width: 992px) {
    display: block !important;
  }
      
  && .ant-card {
    width: 150px;
    margin: 0px auto;
    height: 225px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
      
  && .ant-card-cover {
    flex-grow: 1;
  }
      
  && .ant-card-body {
    padding: 12px;
  }
      
  && .ant-card-actions li>span {
    width: 100%;
    cursor: auto;
    
  }
  
  && .ant-card-actions li>span:hover{
    color: rgba(0, 0, 0, 0.45);
    
  }
  
  && .ant-card-actions li .card__left-action:hover {
    color: #1890ff;
    transition: color 0.3s;
    cursor: pointer;

  }
  
  && .ant-card-actions li .card__right-action:hover {
    color: #1890ff;
    transition: color 0.3s;
    cursor: pointer;

  }

`

S.ColEmpty = styled(Col)`

  float: unset !important;
  display: inline-block !important;
  margin-top: 20px;
  
  && .ant-card-actions li>span {
    width: 100%;
    cursor: auto;
    
  }
  
  && .ant-card-actions li>span:hover{
    color: rgba(0, 0, 0, 0.45);
    
  }
  
  && .ant-card-actions li .card__left-action:hover {
    color: #1890ff;
    transition: color 0.3s;
    cursor: pointer;

  }
  
  && .ant-card-actions li .card__right-action:hover {
    color: #1890ff;
    transition: color 0.3s;
    cursor: pointer;

  }

    &&& .ant-card-loading-block{
      animation: card-loading 1.4s ease;
    }
`

S.Workspaces = styled.div`
  
  `

S.WorkspacesTitleWrapper = styled.span`
  display: flex;
  justify-content: end;
`

S.WorkspacesTitle = styled.h2`
  font-size: 24px;
    @media (max-width:567px) {
      & {
        
        width: 100%;
        text-align: center;
      }
    }
`

S.AddWorkspaceButton = styled(Button)`
  margin-left: 45px;
  height: 35px;
  font-size: 1.1em;
  
  @media (max-width:567px) {
      & {
        
        display: none;
      }
    }
`

S.WorkspacesContainer = styled.div`
  text-align: left;
`


S.Skeleton = styled(Skeleton)`
   && {
    width: 90%;
    height: 265px;
  }
`

S.ImageWrapper = styled.span`
  
  height: 100%;
  
  &:hover {
    cursor: pointer;
  }    
`

S.WorkspaceImage = styled.span`
    width: 100%;
    height: 100%;
    background: #1070ff;
    color: white;
    font-size: 3em;
    position: relative;
    text-transform: uppercase;
    text-align: center;   
    
    justify-content: center;
    align-items: center;
    display: flex;
`
