import React, {useState, useEffect} from 'react'

import Card from 'antd/es/card'
import 'antd/es/card/style'

import Dropdown from 'antd/es/dropdown'
import 'antd/es/dropdown/style'

import Icon from '../../../../components/Icon/Icon'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { bindActionCreators } from 'redux'
import { updateCurrentSelectedWorkspace } from '../../../../actions/workspacesActions'
import { refreshToken } from '../../../../actions/authActions'
import { connect } from 'react-redux'
import ENV from '../../../../config'
import mainColors from '../../../../constants/mainColors'
import axios from '../../../../utils/axiosInstance'


const StoryDemoCard = ({ storyDemo, onDeleteLiveDemo, authData}) => {
  // let [storyDemoInternal, setStoryDemoInternal] = useState(storyDemo)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isImageError, setIsImageError] = useState(false)

  // Get image URL if available (you may need to adjust this property name based on your data structure)
  let imageUrl = ''
  for(let screen of storyDemo.screens) {
    if(screen.imageUrl) {
      imageUrl = screen.imageUrl
      break
    }
  }

  // Reset loading state when imageUrl changes
  useEffect(() => {
    setIsImageLoaded(false)
    setIsImageError(false)
  }, [imageUrl])

  let navigate = useNavigate()

  // Helper to find the card container for dropdown positioning
  const getPopupContainer = (triggerNode) => {
    // Find the closest card element or fallback to body
    let node = triggerNode
    while (node && node !== document.body) {
      if (node.classList && node.classList.contains('ant-card')) {
        return node
      }
      node = node.parentElement
    }
    return document.body
  }

  const menuItems = [
    {
      key: 'open',
      label: 'Open',
      onClick: () => {
        navigate(`/workspace/${storyDemo.workspaceId}/storydemo/${storyDemo._id}`)
      }
    },
    {
      key: 'delete',
      label: 'Delete',
      onClick: () => {
        return onDeleteLiveDemo(storyDemo)
      }
    }
  ]

  function updateStoryName(storyDemo, name, authToken) {
    return axios.patch(`${ENV.STORIES_API}/workspaces/${storyDemo.workspaceId}/stories/${storyDemo._id}`,
      {
        name: name
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      .then((res) => {


        return res.data
      })
  }

  return (
    <S.CardWrapper key={storyDemo._id} hasImage={!!imageUrl}>
      <Card
        style={{ width: 150, margin: '0 auto' }}
        loading={imageUrl && !isImageLoaded && !isImageError}
        cover={
          <S.ImageWrapper style={{ width: 150 }} onClick={() => {
            navigate(`/workspace/${storyDemo.workspaceId}/storydemo/${storyDemo._id}`)


          }}>
            {imageUrl && (
              <S.WorkspaceImage
                key={imageUrl}
                src={imageUrl}
                alt={storyDemo.name}
                onLoad={() => setIsImageLoaded(true)}
                onError={() => setIsImageError(true)}
                style={{
                  display: isImageLoaded && !isImageError ? 'block' : 'none',
                }}
              />
            )}
            {(!imageUrl || isImageError) && (
              <S.WorkspaceImageSpan>{storyDemo.name[0]}</S.WorkspaceImageSpan >
            )}
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
                  <span className={'card__right-action'} style={{ width: '30%', borderLeft: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Dropdown 
                        menu={{ items: menuItems }}
                        placement="bottomRight"
                        trigger={['click', 'hover']}
                        getPopupContainer={getPopupContainer}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', width: '100%', height: '100%' }}>
                          <Icon type="ellipsis"/>
                        </span>
                      </Dropdown>
                  </span>
                </span>

          )]}
      >
        <S.CardText
          contentEditable={true}
          suppressContentEditableWarning={true}
          onKeyPress={function (event) {
            console.log(event)
            if (event.key === "Enter") {
              event.preventDefault();

              event.target.blur()
            }

          }}
          onBlur={function (e) {

            let newStoryName = e.target.innerText



            if(newStoryName !== storyDemo.name) {

              updateStoryName(storyDemo, newStoryName, authData.token)
            }
          }}
        >
          {storyDemo.name}
        </S.CardText>
        {/*<Card.Meta*/}
        {/*  style={{ textTransform: 'capitalize' }}*/}
        {/*  title={storyDemo.name}*/}
        {/*/>*/}
      </Card>
    </S.CardWrapper>
  )
}



function mapStateToProps(state) {

  return {
    authData: state.authReducer.authData,
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace,
  }
}

function mapDispatchToProps(dispatch) {
  return {

    actions: bindActionCreators({ updateCurrentSelectedWorkspace, refreshToken }, dispatch)


  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StoryDemoCard)

const S = {}

S.CardWrapper = styled.div`
  height: 100%;
  
  .ant-card {
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

S.ImageWrapper = styled.span`
  height: 100%;
  width: 100%;
  display: block;
  position: relative;

  &:hover {
    cursor: pointer;
  }
`

S.WorkspaceImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    position: relative;
    // position: absolute;
    // top: 0;
    // left: 0;
`

S.WorkspaceImageSpan = styled.span`
    width: 100%;
    height: 100%;
    background: #1070ff;
    color: white;
    font-size: 3em;
    text-transform: uppercase;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    // position: absolute;
    // top: 0;
    // left: 0;
`
