import React, {useEffect, useState} from 'react'
import {bindActionCreators} from "redux";
import {connect} from 'react-redux'
import styled from 'styled-components'
import {MdAddPhotoAlternate, MdOutlineVideoLibrary, MdZoomIn} from 'react-icons/md'
import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'
import Tippy from '@tippyjs/react'
//import { Icon, Upload } from 'antd'
import * as storyDemoActionsImport from '../../../../actions/storyDemoActions'
import Icon from '../../../../components/Icon/Icon'
import Upload from 'antd/es/upload'
import ENV from '../../../../config'
import axios from '../../../../utils/axiosInstance'

import ScreenTypes from '../../../../constants/ScreenTypes'
import Colors from "../../../../constants/mainColors";
import FrameToScreenToolbarButton from './FrameToScreenToolbarButton'

function Tip({children, ...props}) {

  return <TB.Tippy {...props}>{children}</TB.Tippy>
}

const IconWrapper = React.forwardRef(function (props, ref) {

  return <TB.LibraryIcon/>

})

const Toolbar = ({
                   workspaceId,
                   storyDemoId,
                   screenId,
                   authData,
                   isPage,
                   isVideoOrScreenshot,
                   innerWidth,
                   innerHeight,
                   onLibraryClick,
                   onAIEnhanceClick,
                   afterScreenUpload,
                   isZoomEnabled,
                   setIsZoomEnabled,
                   iframeRef,
                   currentStep,
                   storyDemoActions,
                   onFrameToScreenSuccess,
                 }) => {
  const [isTextEditing, setIsTextEditing] = useState(false)

  // Currently if there are no Steps I cannot add a ZoomSpan,
  // For example if there are only transitions I cannot add a ZoomSpan
  const addZoomVisible = isVideoOrScreenshot && !currentStep.zoomSpans

  const stepZoomSpanExists = !!currentStep?.zoomSpan

  useEffect(() => {

    if ((currentStep && currentStep.screenType === ScreenTypes.SCREEN_VIDEO) || (currentStep && currentStep.zoomSpans && currentStep.zoomSpans.length !== 0)) {

      setIsZoomEnabled(true)
    } else {

      setIsZoomEnabled(false)
    }

  }, [currentStep])

  function onEditText(workspaceId, storyDemoId, screenId, authToken) {

    // EditText only for DOM/rrweb screens. Legacy static PageScreens are retired.
    if (!(currentStep && currentStep.recordingRole)) {
      return
    }

    if (isTextEditing) {
      setIsTextEditing(false)
      iframeRef.current.contentWindow.resetEditText()

      return
    }

    return new Promise((resolve, reject) => {
      setIsTextEditing(true)

      function onFinishEditting(result) {
        resolve(result)
      }

      setTimeout(() => {
        reject()
      }, 300 * 1000)

      iframeRef.current.contentWindow.editText(onFinishEditting)

    })
      .then((result) => {
        if (result.action === 'save' && result.text !== result.oldText) {
          let screenId = result.screenId
          let newText = result.text
          let nodeId = result.rrwebNodeId

          if (nodeId == null) {
            console.error('EditText: missing rrweb node id')
            return Promise.resolve({})
          }

          return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/editText`,
            {
              'selector': String(nodeId),
              'text': newText
            },
            {
              headers: {
                Authorization: `Bearer ${authToken}`
              }
            })
            .then((res) => {
              if (iframeRef.current && iframeRef.current.contentWindow && iframeRef.current.contentWindow.reloadRrwebAfterTextEdit) {
                return iframeRef.current.contentWindow.reloadRrwebAfterTextEdit().then(() => res.data)
              }
              return res.data
            })
        } else {
          return Promise.resolve({})
        }

      })
      .then((result) => {
        setIsTextEditing(false)
        // console.log(result)
      })
      .catch((err) => {
        console.error('EditText failed', err)
        setIsTextEditing(false)
        if (iframeRef.current && iframeRef.current.contentWindow && iframeRef.current.contentWindow.resetEditText) {
          iframeRef.current.contentWindow.resetEditText()
        }
      })
  }

  const canEditDomText = !!(currentStep && currentStep.recordingRole)

  function removeZoomSpan() {
    // if(currentStep.screenType === ScreenTypes.SCREEN_VIDEO) {
      // storyDemoActions.deleteZoomSpan(
      //   workspaceId,
      //   storyDemoId,
      //   screenId,
      //   authData.token
      // )
    // } else {
      storyDemoActions.deleteStepZoomSpan(
        workspaceId,
        storyDemoId,
        screenId,
        currentStep._id,
        currentStep?.zoomSpan?._id,
        authData.token
      )
    // }
  }
  function addZoomSpan() {
    if(currentStep.screenType === ScreenTypes.SCREEN_VIDEO) {
      storyDemoActions.addZoomSpan(
        workspaceId,
        storyDemoId,
        screenId,
        0,
        1,
        100,
        100,
        innerWidth,
        innerHeight,
        0,
        0,
        authData.token
      )
    } else {
      storyDemoActions.addStepZoomSpan(
        workspaceId,
        storyDemoId,
        screenId,
        currentStep._id,
        0.5,
        1.5,
        100,
        100,
        innerWidth,
        innerHeight,
        0,
        0,
        authData.token
      )
    }
  }

  const uploadProps = {
    name: 'screenUpload',
    action: `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screenUpload`,
    headers: {
      authorization: `Bearer ${authData.token}`,
    },
    showUploadList: false,
    onChange(info) {
      if (info.file.status !== 'uploading') {
        // console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        console.log(`${info.file.name} file uploaded successfully`)

        afterScreenUpload()
        // actions.updateCurrentSelectedWorkspace(authData.token, workspaceId)
        // setImageUrl(info.file.response.imageUrl)
      } else if (info.file.status === 'error') {
        console.log(`${info.file.name} file upload failed`)
      }
    },
  }


  return (
    <div>
      <TB.ToolbarButtonWrapper>

        <TB.ToolbarButton
          onClick={() => {
            if (!canEditDomText) {
              return
            }
            onEditText(workspaceId, storyDemoId, screenId, authData.token)
          }}
          isDisabled={!canEditDomText}>
          <TB.ToolbarIcon>
            <TB.Toolbar__EditIcon
              type={isTextEditing ? 'close-circle' : 'edit'}
            />
          </TB.ToolbarIcon>
          <TB.ToolbarText>Edit</TB.ToolbarText>
        </TB.ToolbarButton>
        {currentStep && currentStep.screenType === ScreenTypes.SCREEN_VIDEO ? (
          <FrameToScreenToolbarButton
            workspaceId={workspaceId}
            storyId={storyDemoId}
            screenId={screenId}
            authToken={authData.token}
            iframeRef={iframeRef}
            onSuccess={onFrameToScreenSuccess}
            isDisabled={!screenId}
          />
        ) : (
          <TB.ToolbarButton
            isDisabled={!addZoomVisible}
          >
            <TB.ToolbarIcon>
              <TB.Toolbar__ZoomIcon/>
            </TB.ToolbarIcon>
            <TB.ToolbarText onClick={() => {
              if(stepZoomSpanExists) {
                removeZoomSpan()
              } else {
                addZoomSpan()
              }
            }}>{stepZoomSpanExists ? 'Remove' : 'Add'} Zoom/Span</TB.ToolbarText>
          </TB.ToolbarButton>
        )}
        <TB.ToolbarButton
          onClick={() => {
            onLibraryClick()
          }}
        >
          <TB.ToolbarIcon>
            <TB.Toolbar__LibraryIcon/>
          </TB.ToolbarIcon>
          <TB.ToolbarText>Show Library</TB.ToolbarText>
        </TB.ToolbarButton>
        <Upload {...uploadProps}>
          <TB.ToolbarButton>
            <TB.ToolbarIcon>
              <TB.Toolbar__UploadIcon/>
            </TB.ToolbarIcon>
            <TB.ToolbarText>Upload</TB.ToolbarText>
          </TB.ToolbarButton>
        </Upload>
        <TB.ToolbarButton
          onClick={() => {
            onAIEnhanceClick()
          }}
        >
          <TB.ToolbarIcon>
            <TB.Toolbar__AIIcon
              type={'thunderbolt'}
            />
          </TB.ToolbarIcon>
          <TB.ToolbarText>Enhance with AI</TB.ToolbarText>
        </TB.ToolbarButton>


      </TB.ToolbarButtonWrapper>
      {/*<Tip*/}
      {/*  zIndex={5}*/}
      {/*  // disabled={!showTippy}*/}
      {/*  arrow={true}*/}
      {/*  animation={'shift-away'}*/}
      {/*  offset={[0, 10]}*/}
      {/*  popperOptions={{*/}
      {/*    modifiers: [*/}
      {/*      {*/}
      {/*        name: 'flip',*/}
      {/*        options: {*/}
      {/*          fallbackPlacements: ['top', 'right', 'left', 'bottom'],*/}
      {/*        },*/}
      {/*      },*/}
      {/*    ],*/}
      {/*  }}*/}
      {/*  interactive={true}*/}
      {/*  placement={'right'}*/}
      {/*  content={*/}
      {/*    <TB.IconTooltipText>*/}
      {/*      {isPage ? 'Edit Page' : 'Only Pages can be edited'}*/}
      {/*    </TB.IconTooltipText>*/}
      {/*  }*/}
      {/*>*/}
      {/*  <span>*/}
      {/*      <TB.EditIcon*/}
      {/*        onClick={() => {*/}
      {/*          onEditText(workspaceId, storyDemoId, screenId, authData.token)*/}
      {/*        }}*/}
      {/*        isDisabled={!isPage}*/}
      {/*        type={isTextEditing ? 'close-circle' : 'edit'}*/}
      {/*      />*/}

      {/*  </span>*/}
      {/*</Tip>*/}
      {/*<Tip*/}
      {/*  zIndex={5}*/}
      {/*  arrow={true}*/}
      {/*  animation={'shift-away'}*/}
      {/*  offset={[0, 10]}*/}
      {/*  popperOptions={{*/}
      {/*    modifiers: [*/}
      {/*      {*/}
      {/*        name: 'flip',*/}
      {/*        options: {*/}
      {/*          fallbackPlacements: ['top', 'right', 'left', 'bottom'],*/}
      {/*        },*/}
      {/*      },*/}
      {/*    ],*/}
      {/*  }}*/}
      {/*  interactive={true}*/}
      {/*  placement={'right'}*/}
      {/*  content={*/}
      {/*    <TB.IconTooltipText>*/}
      {/*      {isVideo ? 'Add Zoom Spans' : 'Only Videos can use Zoom Spans'}*/}
      {/*    </TB.IconTooltipText>*/}
      {/*  }*/}
      {/*>*/}
      {/*  <span>*/}
      {/*      <TB.ZoomIcon*/}
      {/*        onClick={() => {*/}
      {/*          setIsZoomEnabled(true)*/}
      {/*        }}*/}
      {/*        isDisabled={!isVideo || isZoomEnabled}*/}
      {/*      />*/}

      {/*  </span>*/}
      {/*</Tip>*/}
      {/*<Tip*/}
      {/*  zIndex={5}*/}
      {/*  disabled={false}*/}
      {/*  // disabled={!showTippy}*/}
      {/*  arrow={true}*/}
      {/*  animation={'shift-away'}*/}
      {/*  offset={[0, 10]}*/}
      {/*  popperOptions={{*/}
      {/*    modifiers: [*/}
      {/*      {*/}
      {/*        name: 'flip',*/}
      {/*        options: {*/}
      {/*          fallbackPlacements: ['top', 'right', 'left', 'bottom'],*/}
      {/*        },*/}
      {/*      },*/}
      {/*    ],*/}
      {/*  }}*/}
      {/*  interactive={true}*/}
      {/*  placement={'right'}*/}
      {/*  content={*/}
      {/*    <TB.IconTooltipText>*/}
      {/*      Upload images and videos*/}
      {/*    </TB.IconTooltipText>*/}
      {/*  }*/}
      {/*>*/}
      {/*  <span>*/}
      {/*    <Upload {...uploadProps}>*/}
      {/*      <TB.UploadIcon/>*/}
      {/*    </Upload>*/}
      {/*  </span>*/}
      {/*</Tip>*/}
      {/*<Tip*/}
      {/*  zIndex={5}*/}
      {/*  disabled={false}*/}
      {/*  // disabled={!showTippy}*/}
      {/*  arrow={true}*/}
      {/*  animation={'shift-away'}*/}
      {/*  offset={[0, 10]}*/}
      {/*  popperOptions={{*/}
      {/*    modifiers: [*/}
      {/*      {*/}
      {/*        name: 'flip',*/}
      {/*        options: {*/}
      {/*          fallbackPlacements: ['top', 'right', 'left', 'bottom'],*/}
      {/*        },*/}
      {/*      },*/}
      {/*    ],*/}
      {/*  }}*/}
      {/*  interactive={true}*/}
      {/*  placement={'right'}*/}
      {/*  appendTo={'parent'}*/}
      {/*  content={*/}
      {/*    <TB.IconTooltipText>*/}
      {/*      Show Library*/}
      {/*    </TB.IconTooltipText>*/}
      {/*  }*/}
      {/*>*/}
      {/*  <span onClick={() => {*/}
      {/*    onLibraryClick()*/}
      {/*  }}>*/}
      {/*    <IconWrapper/>*/}
      {/*  </span>*/}
      {/*</Tip>*/}
    </div>
  )
}


const TB = {

  ToolbarButtonWrapper: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 800px;
  `,
  ToolbarButton: styled.div`
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

    cursor: ${({isDisabled}) => isDisabled ? 'not-allowed' : 'pointer'};

    svg, span > i > svg {
      fill: ${({isDisabled}) => isDisabled ? '#ccc' : '#111'} !important;
    }

    color: ${({isDisabled}) => isDisabled ? '#ccc' : '#111'};

    &:hover {
      background: #F3F4F6;
    }
  `,
  ToolbarIcon: styled.span`
    height: 19px;
    width: 19px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 4px;
  `,
  Toolbar__LibraryIcon: styled(MdOutlineVideoLibrary)`
    height: 15px;
    width: 15px;

    fill: ${Colors.primaryColor};
  `,
  Toolbar__EditIcon: styled(Icon)`
    height: 100%;
    width: 100%;

    && svg {
      width: 100%;
      height: 100%;
      fill: ${Colors.primaryColor};
        //fill: ${({isDisabled}) => isDisabled ? '#000' : '#111'};
    }

      //cursor: ${({isDisabled}) => isDisabled ? 'not-allowed' : 'pointer'};

  `,
  Toolbar__ZoomIcon: styled(MdZoomIn)`
    height: 15px;
    width: 15px;

      // fill: ${({isDisabled}) => isDisabled ? '#ccc' : '#fff'};
    fill: ${Colors.primaryColor}

      // cursor: ${({isDisabled}) => isDisabled ? 'not-allowed' : 'pointer'};

  `,
  Toolbar__StopEditIcon: styled(Icon)`
    height: 15px;
    width: 15px;

    && svg {
      width: 100%;
      height: 100%;
      fill: ${({isDisabled}) => isDisabled ? '#ccc' : '#fff'};
    }

  `,
  Toolbar__UploadIcon: styled(MdAddPhotoAlternate)`
    height: 100%;
    width: 100%;

    fill: ${Colors.primaryColor};
  `,
  Toolbar__IconTooltipText: styled.p`
    margin: 0px;
    color: #f9f9f9;
    width: 100%;
    height: 100%;
    white-space: nowrap;

  `,
  ToolbarText: styled.div`
    font-family: ${Colors.fontFamily};
  `,
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #1070ff;
    justify-content: flex-start;
    align-items: center;
    padding: 10px 0px;
    border-radius: 6px;
    border: 2px solid #03245a;

  `,
  Tippy: styled(Tippy)`

    background: #333 !important;
    color: #f9f9f9;
    //font-size: 1rem;
    //padding: 5px 10px;
    max-width: 250px;
    border-radius: 6px;

    && .tippy-arrow::before {
      color: #333 !important;
    }
  `,
  LibraryIcon: styled(MdOutlineVideoLibrary)`
    height: 15px;
    width: 15px;

    fill: #fff;

    &:hover {
      cursor: pointer;
      transform: scale(1.1);
    }
  `,
  EditIcon: styled(Icon)`
    height: 15px;
    width: 15px;

    && svg {
      width: 100%;
      height: 100%;
      fill: ${({isDisabled}) => isDisabled ? '#ccc' : '#fff'};
    }

    cursor: ${({isDisabled}) => isDisabled ? 'not-allowed' : 'pointer'};

    &:hover {
      transform: scale(1.1);
    }
  `,
  Toolbar__AIIcon: styled(Icon)`
    height: 15px;
    width: 15px;

    && svg {
      width: 100%;
      height: 100%;
      fill: ${({isDisabled}) => isDisabled ? '#ccc' : '#fff'};
    }

    cursor: ${({isDisabled}) => isDisabled ? 'not-allowed' : 'pointer'};

    &:hover {
      transform: scale(1.1);
    }
  `,
  ZoomIcon: styled(MdZoomIn)`
    fill: ${({isDisabled}) => isDisabled ? '#ccc' : '#fff'};

    cursor: ${({isDisabled}) => isDisabled ? 'not-allowed' : 'pointer'};

  `,
  StopEditIcon: styled(Icon)`
    height: 15px;
    width: 15px;

    && svg {
      width: 100%;
      height: 100%;
      fill: ${({isDisabled}) => isDisabled ? '#ccc' : '#fff'};
    }

    &:hover {
      cursor: pointer;
      transform: scale(1.1);
    }
  `,
  UploadIcon: styled(MdAddPhotoAlternate)`
    height: 15px;
    width: 15px;

    fill: #fff;

    &:hover {
      cursor: pointer;
      transform: scale(1.1);
    }
  `,
  IconTooltipText: styled.p`
    margin: 0px;
    color: #f9f9f9;
    width: 100%;
    height: 100%;
    white-space: nowrap;

  `
}

function mapDispatchToProps(dispatch) {
  return {
    storyDemoActions: bindActionCreators(storyDemoActionsImport, dispatch),
  }
}

export default connect(null,mapDispatchToProps)(Toolbar)
