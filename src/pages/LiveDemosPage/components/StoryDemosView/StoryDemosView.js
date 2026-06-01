import React, { memo, useMemo } from 'react'

import Card from 'antd/es/card'
import Col from 'antd/es/col'
import Button from 'antd/es/button'
import Skeleton from 'antd/es/skeleton'

import Icon from '../../../../components/Icon/Icon'

import 'antd/es/card/style'
import 'antd/es/dropdown/style'
import 'antd/es/col/style'
import 'antd/es/button/style' 
import 'antd/es/skeleton/style' 

import styled from 'styled-components'
import WorkspaceStatuses from '../../../../constants/WorkspaceStatuses'
import InstallAppButton from '../../../../components/InstallAppButton/InstallAppButton'
import StoryDemoCardSwitch from '../StoryDemoCard/StoryDemoCardSwitch'
import ENV from '../../../../config'
import mainColors from '../../../../constants/mainColors'

const FREE_DEMO_LIMIT = 3

const StoryDemosView = memo((props) => {
  
  const cards = useMemo(
    () => generateStoryDemoCards(props.storydemos, props),
    [props.storydemos, props.onDeleteLiveDemo, props.isChromeAppAuthorized, props.noDemoLimit]
  )

  return (
    <S.Workspaces>
      <S.WorkspacesTitleWrapper />
      <React.Fragment>
        {cards}
      </React.Fragment>
    </S.Workspaces>
  )
})

function renderWorkspaceStatus(status) {
  if (status === WorkspaceStatuses.CHANNELS_POPULATED) {
    status = WorkspaceStatuses.EMPTY
  }

  return status === 'populated' ? 'updated' : <b>{status}</b>
}

function generateStoryDemoCards(storyDemos, props) {


  let loading = storyDemos === null
  // loading = true
  if (loading) {


    return [...Array(6).keys()].map((key) => {

      return (

        <S.Col key={key} span={4}>

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
                    className={'ant-skeleton-avatar ant-skeleton-avatar-lg ant-skeleton-avatar-square'} />
                </span>


              </div>
            }
            actions={[
              (
                <span style={{ width: '100%', display: 'flex' }}>
                  <span className={'card__left-action'}
                    style={{ width: '70%', display: 'flex', justifyContent: 'space-evenly' }}>
                    <Icon type="sync" style={{ lineHeight: '25px' }} />
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

    if (storyDemos.length === 0 && !props.isChromeAppAuthorized) {


      return (<S.InstallAppRow>
        <S.InstallAppText>To create LiveDemos - install the chrome app</S.InstallAppText>
        <InstallAppButton onClick={() => {
          window.open(`https://chrome.google.com/webstore/detail/livedemo-app/${ENV.CHROME_APP_ID}`, '_blank')
        }} />
      </S.InstallAppRow>
      )
      // return [...Array(1).keys()].map((key) => {
      //
      //   return (
      //
      //     <S.ColEmpty span={8}>
      //
      //       <Card
      //         key={key}
      //         loading={true}
      //         style={{ width: 150 }}
      //         cover={
      //           <div className={'ant-skeleton'}>
      //       <span style={{
      //         width: '100%',
      //         display: 'block',
      //         paddingTop: '20px'
      //       }}
      //             className={'ant-skeleton-header'}>
      //         <span style={{
      //           display: 'block', margin: '0 auto', width: '55px', height: '35px'
      //         }}
      //               className={'ant-skeleton-avatar ant-skeleton-avatar-lg ant-skeleton-avatar-square'}/>
      //       </span>
      //
      //
      //           </div>
      //         }
      //         actions={[
      //           (
      //             <span style={{ width: '100%', display: 'flex' }}>
      //             <span className={'card__left-action'}
      //                   style={{ width: '70%', display: 'flex', justifyContent: 'space-evenly' }}>
      //               <Icon type="sync" style={{ lineHeight: '25px' }}/>
      //               <span>Status</span>
      //             </span>
      //             <span className={'card__right-action'} style={{ width: '30%', borderLeft: '1px solid #e8e8e8' }}>
      //             </span>
      //           </span>
      //
      //           )]}
      //       >
      //         <Card.Meta
      //           title="Card title"
      //         />
      //       </Card>
      //
      //
      //       {/*<S.Skeleton loading={loading} paragraph={{ rows: 2 }} active>*/}
      //
      //       {/*</S.Skeleton>*/}
      //     </S.ColEmpty>
      //   )
      // })

    } else if (storyDemos.length === 0 && props.isChromeAppAuthorized) {

      return (<S.InstallAppRow>
        <S.InstallAppText>Open the LiveDemo App from the toolbar and record your first demo!</S.InstallAppText>
      </S.InstallAppRow>
      )
    }
    else {

        const noDemoLimit = props.noDemoLimit === true

      return <S.WorkspacesContainer>
        {storyDemos.map((storyDemo, index) => {
          const isHidden = !noDemoLimit && index < storyDemos.length - FREE_DEMO_LIMIT 
          return (
            <StoryDemoCardSwitch
              key={storyDemo._id}
              storyDemo={storyDemo}
              onDeleteLiveDemo={props.onDeleteLiveDemo}
              hidden={isHidden}
            />
          )
        })}
      </S.WorkspacesContainer>

    }


  }
}


export default StoryDemosView

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

S.CardText = styled.span`
  font-family: ${mainColors.fontFamily};
  color: #111;
  font-size: 1.2em;
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  display: block;
  text-overflow: ellipsis;
`

S.InstallAppRow = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    margin-top: 20px;
  `
S.InstallAppText = styled.p`
    margin: 0px 0px 10px 0px;
    font-family: ${mainColors.fontFamily};
    color: #111;
    display: flex;
    justify-content: flex-start;
    align-items: center;
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  align-items: start;
  text-align: left;
  margin-top: 20px;
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
