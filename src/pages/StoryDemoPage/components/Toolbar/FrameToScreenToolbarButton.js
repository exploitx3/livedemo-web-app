import React, {useState} from 'react'
import styled from 'styled-components'
import {MdFilterFrames} from 'react-icons/md'
import axios from '../../../../utils/axiosInstance'
import ENV from '../../../../config'
import Colors from '../../../../constants/mainColors'

function getWalkthroughVideoCurrentTime(iframeRef) {
  try {
    const iframe = iframeRef && iframeRef.current
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow && iframe.contentWindow.document
      const video = doc && doc.querySelector('video')
      if (video && typeof video.currentTime === 'number' && Number.isFinite(video.currentTime)) {
        return Math.max(0, video.currentTime)
      }
    }
  } catch (e) {
    // iframe may be cross-origin or not ready
  }
  try {
    const video = document.querySelector('video')
    if (video && typeof video.currentTime === 'number' && Number.isFinite(video.currentTime)) {
      return Math.max(0, video.currentTime)
    }
  } catch (e) {
    //
  }
  return 0
}

export default function FrameToScreenToolbarButton({
  workspaceId,
  storyId,
  screenId,
  authToken,
  iframeRef,
  onSuccess,
  isDisabled,
}) {
  const [loading, setLoading] = useState(false)

  function handleClick() {
    if (loading || isDisabled || !screenId) {
      return
    }
    const time = getWalkthroughVideoCurrentTime(iframeRef)

    setLoading(true)
    axios
      .post(
        `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyId}/screens/${screenId}/createScreenFromFrame`,
        {time},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      )
      .then(() => {
        if (onSuccess) {
          return onSuccess()
        }
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const disabled = isDisabled || loading || !screenId

  return (
    <ToolbarButton isDisabled={disabled} onClick={handleClick}>
      <ToolbarIcon>
        {loading ? <InlineSpinner aria-hidden /> : <ToolbarFrameIcon />}
      </ToolbarIcon>
      <ToolbarText>Frame to Screen</ToolbarText>
    </ToolbarButton>
  )
}

const ToolbarButton = styled.div`
  height: 32px;
  text-align: center;
  line-height: 50px;
  margin: 0px 15px;
  font-size: 1.1em;
  color: #111;
  padding: 0px 5px;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 4px;

  cursor: ${({isDisabled}) => (isDisabled ? 'not-allowed' : 'pointer')};

  svg, span > i > svg {
    fill: ${({isDisabled}) => (isDisabled ? '#ccc' : '#111')} !important;
  }

  color: ${({isDisabled}) => (isDisabled ? '#ccc' : '#111')};

  &:hover {
    background: ${({isDisabled}) => (isDisabled ? 'transparent' : '#F3F4F6')};
  }
`

const ToolbarIcon = styled.span`
  height: 19px;
  width: 19px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 4px;
`

const ToolbarFrameIcon = styled(MdFilterFrames)`
  height: 15px;
  width: 15px;
  fill: ${Colors.primaryColor};
`

const ToolbarText = styled.div`
  font-family: ${Colors.fontFamily};
`

const InlineSpinner = styled.span`
  width: 14px;
  height: 14px;
  border: 2px solid #ccc;
  border-top-color: ${Colors.primaryColor};
  border-radius: 50%;
  animation: frame-to-screen-spin 0.7s linear infinite;

  @keyframes frame-to-screen-spin {
    to {
      transform: rotate(360deg);
    }
  }
`
