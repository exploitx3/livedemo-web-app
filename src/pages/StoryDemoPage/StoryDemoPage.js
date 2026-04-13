import React, {useEffect, useRef, useState} from 'react'
import Button from 'antd/es/button'
import 'antd/es/button/style'
import Col from 'antd/es/col'
import 'antd/es/col/style'
import 'antd/es/row/style'
import 'antd/es/form/style'
import Icon from '../../components/Icon/Icon'
import Input from 'antd/es/input'
import 'antd/es/input/style'
import Layout from 'antd/es/layout'
import 'antd/es/layout/style'
import Menu from 'antd/es/menu'
import 'antd/es/menu/style'
import Modal from 'antd/es/modal'
import 'antd/es/modal/style'
import 'antd/es/tabs/style'
import axios from '../../utils/axiosInstance'
import TabsView from './components/TabsView/TabsView'
import Header from '../../components/Header/Header'
import {Resizable} from 're-resizable'
import {Route, Routes, useLocation, useNavigate, useParams} from 'react-router-dom'
import {CSSTransition, TransitionGroup,} from 'react-transition-group'
import styled from 'styled-components'
import Colors from '../../constants/mainColors'
import ScreenTypes from '../../constants/ScreenTypes'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {updateCurrentSelectedWorkspace} from '../../actions/workspacesActions'
import {refreshToken} from '../../actions/authActions'
import {getWorkspaceEncryptionKey} from '../../actions/secureStorageActions'
import {getStoryDemo, updateStoryDemo} from '../../actions/storyDemoActions'
import * as ENV from '../../config'
import Toolbar from './components/Toolbar/Toolbar'
import Library from './components/Library/Library'
import AIEnhance from './components/AIEnhance/AIEnhance'
import IconTextButton from '../../components/IconTextButton/IconTextButton'
import 'tippy.js/dist/tippy.css' // optional
// import 'tippy.js/animations/shift-away.css'
import 'tippy.js/animations/scale.css'
import Confetti from 'react-confetti'
import Tippy from '@tippyjs/react'
import {deriveRenderSteps} from '../../utils/storyHelpers'
import {resolveStoryDemoOuterBackground} from '../../utils/storyDemoBackground'
// import {WalkthroughComponent} from '@georgi.apostolov/livedemo-components/dist/index'
// import {WalkthroughComponent} from '../../livedemo-components/dist/index'
// import WalkthroughComponent from '../../livedemo-components/components/WalkthroughComponent'
// import WalkthroughComponent from '../../livedemo-components/components/WalkthroughComponent'
import WalkthroughComponent from '../../injectScript/WalkthroughComponent'


import Spinner from '../../components/Spinner/Spinner'
import VideoEditor from '../../components/VideoEditor/VideoEditor'

import ShareDropdown from '../../components/ShareDropdown/ShareDropdown'
import {MdAddPhotoAlternate, MdOutlineVideoLibrary, MdZoomIn} from 'react-icons/md'

//import { Button, Col, Form, Icon, Input, Layout, Menu, Modal, Tabs } from 'antd'

const {Content, Footer, Sider} = Layout
const {confirm} = Modal
// const { getFieldDecorator } = Form // Removed - deprecated in Ant Design v6
// const { TabPane } = Tabs // Removed - deprecated in Ant Design v6, use items prop instead
// const { SubMenu } = Menu // Removed - deprecated in Ant Design v6, use items prop instead

function Tip({children, ...props}) {

  return <S.Tippy {...props}>{children}</S.Tippy>
}

const StoryDemoPage = ({
                         collapsed,
                         currentSelectedWorkspace,
                         currentStoryDemo,
                         renderSteps,
                         authData,
                         actions,
                         navigate,
                         location,
                         params
                       }) => {
  const workspaceIdFromURL = params?.workspaceId
  const storyDemoIdFromUrl = params?.storyDemoId

  let [hasDemoLoaded, setHasDemoLoaded] = useState(false)

  // document.domain = URL_COMMON_DOMAIN

  let [storyWidth, setStoryWidth] = useState(0)
  let [storyHeight, setStoryHeight] = useState(0)

  if (!window.config) {
    window.config = {
      "SCREENS": [
        "656056d89956dbaff0967b17",
        "656056d89956dbaff0967b0e",
        "656056d89956dbaff0967b18",
        "656056d89956dbaff0967b10",
        "656056d89956dbaff0967b19",
        "656056d89956dbaff0967b12",
        "656056d89956dbaff0967b1a",
        "656056d89956dbaff0967b14",
        "656056d89956dbaff0967b1b",
        "656056d89956dbaff0967b16"
      ],
      "STEPS": [
        {
          "_id": 1,
          "screenId": "656056d89956dbaff0967b17",
          "screenType": "Screen_Video",
          "asset": {
            "tracks": [
              {
                "type": "video",
                "max_width": 1684,
                "max_height": 938,
                "max_frame_rate": 30,
                "id": "abzHl9MlJNMNMWUV56sbQ7xvCArgPUbPwxRuDMXdRz8",
                "duration": 0.909
              }
            ],
            "status": "ready",
            "static_renditions": {
              "status": "preparing"
            },
            "source_asset_id": "44r89947qEDqiHe021gzAsGzAVUQ6WWjrE00ilTTs8xQA",
            "resolution_tier": "1080p",
            "playback_ids": [
              {
                "policy": "public",
                "id": "FY8eyFL1CDAiTJdupqXDNuePlwgvmlleLoQfz8fXKBg"
              }
            ],
            "mp4_support": "standard",
            "max_stored_resolution": "HD",
            "max_stored_frame_rate": 30,
            "max_resolution_tier": "1080p",
            "master_access": "none",
            "id": "2ibM9axPyXjkYoAXPbxEeQrYLgLvekTee01gcJ00MXtwU",
            "encoding_tier": "smart",
            "duration": 0.909,
            "created_at": "1700812498",
            "aspect_ratio": "842:469",
            "videoId": "abb26453-e6d1-45ec-b4d1-de61e5ea3fb6"
          },
          "playbackRate": 1,
          "index": 0
        },
        {
          "view": {
            "pointer": {
              "selectorLocation": {
                "positionX": 200,
                "positionY": 200,
                "width": 150,
                "height": 50
              },
              "selector": "",
              "placement": "auto"
            },
            "hotspot": {
              "frameX": 1058,
              "frameY": 41,
              "placement": "auto"
            },
            "popup": {
              "type": "post",
              "formId": null,
              "showOverlay": false,
              "title": "",
              "description": "<p></p>",
              "buttons": []
            },
            "viewType": "hotspot",
            "content": "<p>Start by clicking on \"Plans\" to access the available options</p>",
            "nextButtonText": "Next",
            "showStepNumbers": true,
            "showHeader": false,
            "showFooter": false
          },
          "zoomSpan": {
            "delay": 0,
            "duration": 2.5,
            "width": 0,
            "height": 0,
            "editorWidth": 0,
            "offsetX": 0,
            "offsetY": 0,
            "enabled": false
          },
          "elementData": {
            "targetHTML": "<a class=\"Header__LinkStyled-sc-137q003-7 iLAhGm\">Plans</a>",
            "targetElementType": "Link",
            "targetText": "\"Plans\""
          },
          "action": {
            "actionType": "NextButton",
            "selector": ""
          },
          "_id": "656056d89956dbaff0967b0f",
          "index": 1,
          "stepAudioId": {
            "_id": "65650dae817e81da7a8f28e0",
            "audioUrl": "https://d1tmqwkaq9ygb3.cloudfront.net/step-audios/9a583626-6466-4d9a-b473-77dfb81a2f6c.mp3",
            "text": "Start by clicking on \"Plans\" to access the available options\n",
            "voiceType": "nova",
            "active": true,
            "stepId": "656056d89956dbaff0967b0f",
            "storyId": "6560562f32011296a542916b",
            "screenId": "656056d89956dbaff0967b0e",
            "__v": 0
          },
          "screenId": "656056d89956dbaff0967b0e",
          "screenType": "Screen_Screenshot",
          "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/79Gg5bBEsGC8bAgYQPuLd4.png"
        },
        {
          "view": {
            "pointer": {
              "selectorLocation": {
                "positionX": 114.51699345603272,
                "positionY": 151.88894541751526,
                "width": 469.2008819892119,
                "height": 216.8158321341769
              },
              "selector": "",
              "placement": "auto"
            },
            "hotspot": {
              "frameX": 200,
              "frameY": 200,
              "placement": "auto"
            },
            "popup": {
              "type": "post",
              "formId": null,
              "showOverlay": false,
              "title": "",
              "description": "<p></p>",
              "buttons": []
            },
            "viewType": "pointer",
            "content": "<p>New step</p>",
            "nextButtonText": "Next",
            "showStepNumbers": true,
            "showHeader": false,
            "showFooter": false
          },
          "zoomSpan": {
            "delay": 0,
            "duration": 2.5,
            "width": 0,
            "height": 0,
            "editorWidth": 0,
            "offsetX": 0,
            "offsetY": 0,
            "enabled": false
          },
          "elementData": {
            "targetHTML": "",
            "targetElementType": "element",
            "targetText": ""
          },
          "action": {
            "actionType": "NextButton",
            "selector": ""
          },
          "stepAudioId": null,
          "_id": "6566631157cf0468dcc966eb",
          "index": 2,
          "screenId": "656056d89956dbaff0967b0e",
          "screenType": "Screen_Screenshot",
          "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/79Gg5bBEsGC8bAgYQPuLd4.png"
        },
        {
          "_id": 1,
          "screenId": "656056d89956dbaff0967b18",
          "screenType": "Screen_Video",
          "asset": {
            "tracks": [
              {
                "type": "video",
                "max_width": 1684,
                "max_height": 938,
                "max_frame_rate": 30,
                "id": "bmETxkphXVx2Dfe00xqvbqiqbw4mcrdsJ4bPbQV301ink",
                "duration": 2.8449999999999998
              }
            ],
            "status": "ready",
            "static_renditions": {
              "status": "preparing"
            },
            "source_asset_id": "44r89947qEDqiHe021gzAsGzAVUQ6WWjrE00ilTTs8xQA",
            "resolution_tier": "1080p",
            "playback_ids": [
              {
                "policy": "public",
                "id": "zkBReW9QMmVuA7liZhEw00FpTegyOnfO9ajybPvWQP3o"
              }
            ],
            "mp4_support": "standard",
            "max_stored_resolution": "HD",
            "max_stored_frame_rate": 30,
            "max_resolution_tier": "1080p",
            "master_access": "none",
            "id": "F3xhzIkAfvfT8K9qAdQD00nr5ytlEZk02BSSgLy6701RAY",
            "encoding_tier": "smart",
            "duration": 2.8449999999999998,
            "created_at": "1700812498",
            "aspect_ratio": "842:469",
            "videoId": "fbfe6d3a-2bff-48ab-8b6b-5df1fd7af9b1"
          },
          "playbackRate": 1,
          "index": 3
        },
        {
          "view": {
            "pointer": {
              "selectorLocation": {
                "positionX": 200,
                "positionY": 200,
                "width": 150,
                "height": 50
              },
              "selector": "",
              "placement": "auto"
            },
            "hotspot": {
              "frameX": 961,
              "frameY": 38,
              "placement": "auto"
            },
            "popup": {
              "type": "post",
              "formId": null,
              "showOverlay": false,
              "title": "",
              "description": "<p></p>",
              "buttons": []
            },
            "viewType": "hotspot",
            "content": "<p>Once you are in the \"Plans\" section, navigate to the \"Blog\" section by clicking on it</p>",
            "nextButtonText": "Next",
            "showStepNumbers": true,
            "showHeader": false,
            "showFooter": false
          },
          "zoomSpan": {
            "delay": 0,
            "duration": 2.5,
            "width": 0,
            "height": 0,
            "editorWidth": 0,
            "offsetX": 0,
            "offsetY": 0,
            "enabled": false
          },
          "elementData": {
            "targetHTML": "<a class=\"Header__LinkStyled-sc-137q003-7 iLAhGm\">Blog</a>",
            "targetElementType": "Link",
            "targetText": "\"Blog\""
          },
          "action": {
            "actionType": "NextButton",
            "selector": ""
          },
          "_id": "656056d89956dbaff0967b11",
          "index": 4,
          "stepAudioId": {
            "_id": "65650dae817e81da7a8f28e1",
            "audioUrl": "https://d1tmqwkaq9ygb3.cloudfront.net/step-audios/d3b5dd63-9aee-4ed2-9987-6961296a5d2a.mp3",
            "text": "Once you are in the \"Plans\" section, navigate to the \"Blog\" section by clicking on it\n",
            "voiceType": "nova",
            "active": true,
            "stepId": "656056d89956dbaff0967b11",
            "storyId": "6560562f32011296a542916b",
            "screenId": "656056d89956dbaff0967b10",
            "__v": 0
          },
          "screenId": "656056d89956dbaff0967b10",
          "screenType": "Screen_Screenshot",
          "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/iwM2ERqYitPyd8ouYamFPQ.png"
        },
        {
          "_id": 1,
          "screenId": "656056d89956dbaff0967b19",
          "screenType": "Screen_Video",
          "asset": {
            "tracks": [
              {
                "type": "video",
                "max_width": 1684,
                "max_height": 938,
                "max_frame_rate": 30,
                "id": "1MHh00e9c8WWqHTqS2wtv02uTaJ3bHhLSn02GBJ71QHP8s",
                "duration": 2.065
              }
            ],
            "status": "ready",
            "static_renditions": {
              "status": "preparing"
            },
            "source_asset_id": "44r89947qEDqiHe021gzAsGzAVUQ6WWjrE00ilTTs8xQA",
            "resolution_tier": "1080p",
            "playback_ids": [
              {
                "policy": "public",
                "id": "n01L3i02FMN01q02hHOqsxyb8PoLaA01Ybp8QXWuIHaTffvw"
              }
            ],
            "mp4_support": "standard",
            "max_stored_resolution": "HD",
            "max_stored_frame_rate": 30,
            "max_resolution_tier": "1080p",
            "master_access": "none",
            "id": "CgNxp3ESkbAqHuqqkDAEwY26MXR3NwPiSj71TuBKqE4",
            "encoding_tier": "smart",
            "duration": 2.065,
            "created_at": "1700812498",
            "aspect_ratio": "842:469",
            "videoId": "6f2af478-b97c-45fd-b137-be00a26e1b2d"
          },
          "playbackRate": 1,
          "index": 5
        },
        {
          "view": {
            "pointer": {
              "selectorLocation": {
                "positionX": 200,
                "positionY": 200,
                "width": 150,
                "height": 50
              },
              "selector": "",
              "placement": "auto"
            },
            "hotspot": {
              "frameX": 919,
              "frameY": 268,
              "placement": "auto"
            },
            "popup": {
              "type": "post",
              "formId": null,
              "showOverlay": false,
              "title": "",
              "description": "<p></p>",
              "buttons": []
            },
            "viewType": "hotspot",
            "content": "<p>In the \"Blog\" section, find and click on the image titled \"Introducing LiveDemo\" to learn more about it</p>",
            "nextButtonText": "Next",
            "showStepNumbers": true,
            "showHeader": false,
            "showFooter": false
          },
          "zoomSpan": {
            "delay": 0,
            "duration": 2.5,
            "width": 0,
            "height": 0,
            "editorWidth": 0,
            "offsetX": 0,
            "offsetY": 0,
            "enabled": false
          },
          "elementData": {
            "targetHTML": "<img alt=\"Introducing LiveDemo\" src=\"/images/posts/introducing-livedemo.svg\" width=\"925\" height=\"475\" decoding=\"async\" data-nimg=\"1\" class=\"posts-image\" style=\"color: transparent; background: url(&quot;/images/posts/introducing-livedemo.svg&quot;) center center; max-width: 100%; max-height: 100%;\">",
            "targetElementType": "Image",
            "targetText": "\"Introducing LiveDemo\" image"
          },
          "action": {
            "actionType": "NextButton",
            "selector": ""
          },
          "_id": "656056d89956dbaff0967b13",
          "index": 6,
          "stepAudioId": {
            "_id": "65650dae817e81da7a8f28e2",
            "audioUrl": "https://d1tmqwkaq9ygb3.cloudfront.net/step-audios/e0e7f9d7-9a16-4495-9d73-47e12e57f17b.mp3",
            "text": "In the \"Blog\" section, find and click on the image titled \"Introducing LiveDemo\" to learn more about it\n",
            "voiceType": "nova",
            "active": true,
            "stepId": "656056d89956dbaff0967b13",
            "storyId": "6560562f32011296a542916b",
            "screenId": "656056d89956dbaff0967b12",
            "__v": 0
          },
          "screenId": "656056d89956dbaff0967b12",
          "screenType": "Screen_Screenshot",
          "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/opgy7GnzbjJ56FoJByEkok.png"
        },
        {
          "_id": 1,
          "screenId": "656056d89956dbaff0967b1a",
          "screenType": "Screen_Video",
          "asset": {
            "tracks": [
              {
                "type": "video",
                "max_width": 1684,
                "max_height": 938,
                "max_frame_rate": 30,
                "id": "oC87gGnUUf01RaRLEmpHkNCx5TiLNr2bCvfumWHdzfSE",
                "duration": 11.671
              }
            ],
            "status": "ready",
            "static_renditions": {
              "status": "preparing"
            },
            "source_asset_id": "44r89947qEDqiHe021gzAsGzAVUQ6WWjrE00ilTTs8xQA",
            "resolution_tier": "1080p",
            "playback_ids": [
              {
                "policy": "public",
                "id": "VIlrzN3W162qXAQAwaWJEub6bGDxiivjsh8iFU00KUVw"
              }
            ],
            "mp4_support": "standard",
            "max_stored_resolution": "HD",
            "max_stored_frame_rate": 30,
            "max_resolution_tier": "1080p",
            "master_access": "none",
            "id": "1tUKoSnu6U3s29V4qiU01uC3xPAvqs4yFcI02rRUiOXS4",
            "encoding_tier": "smart",
            "duration": 11.671,
            "created_at": "1700812498",
            "aspect_ratio": "842:469",
            "videoId": "81a9e7cd-d2ad-4047-b1c8-0c70d9a0a922"
          },
          "playbackRate": 1,
          "index": 7
        },
        {
          "view": {
            "pointer": {
              "selectorLocation": {
                "positionX": 200,
                "positionY": 200,
                "width": 150,
                "height": 50
              },
              "selector": "",
              "placement": "auto"
            },
            "hotspot": {
              "frameX": 1133,
              "frameY": 35,
              "placement": "auto"
            },
            "popup": {
              "type": "post",
              "formId": null,
              "showOverlay": false,
              "title": "",
              "description": "<p></p>",
              "buttons": []
            },
            "viewType": "hotspot",
            "content": "<p>After reading about LiveDemo, proceed to review the terms and conditions associated with the product or service by clicking on \"Terms\"</p>",
            "nextButtonText": "Next",
            "showStepNumbers": true,
            "showHeader": false,
            "showFooter": false
          },
          "zoomSpan": {
            "delay": 0,
            "duration": 2.5,
            "width": 0,
            "height": 0,
            "editorWidth": 0,
            "offsetX": 0,
            "offsetY": 0,
            "enabled": false
          },
          "elementData": {
            "targetHTML": "<a class=\"Header__LinkStyled-sc-137q003-7 iLAhGm\">Terms</a>",
            "targetElementType": "Link",
            "targetText": "\"Terms\""
          },
          "action": {
            "actionType": "NextButton",
            "selector": ""
          },
          "_id": "656056d89956dbaff0967b15",
          "index": 8,
          "stepAudioId": {
            "_id": "65650daf817e81da7a8f28e3",
            "audioUrl": "https://d1tmqwkaq9ygb3.cloudfront.net/step-audios/a57d3149-d0d6-451d-bf01-a2770ea2c672.mp3",
            "text": "After reading about LiveDemo, proceed to review the terms and conditions associated with the product or service by clicking on \"Terms\"\n",
            "voiceType": "nova",
            "active": true,
            "stepId": "656056d89956dbaff0967b15",
            "storyId": "6560562f32011296a542916b",
            "screenId": "656056d89956dbaff0967b14",
            "__v": 0
          },
          "screenId": "656056d89956dbaff0967b14",
          "screenType": "Screen_Screenshot",
          "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/r5khcDnebNRWyVQjTk1VnD.png"
        },
        {
          "_id": 1,
          "screenId": "656056d89956dbaff0967b1b",
          "screenType": "Screen_Video",
          "asset": {
            "tracks": [
              {
                "type": "video",
                "max_width": 1684,
                "max_height": 938,
                "max_frame_rate": 30,
                "id": "HsX9Oe00Ltn00mMtPtnKHagOUAVWPmay6SQC900KG9XyOM",
                "duration": 2.176667000000002
              }
            ],
            "status": "ready",
            "static_renditions": {
              "status": "preparing"
            },
            "source_asset_id": "44r89947qEDqiHe021gzAsGzAVUQ6WWjrE00ilTTs8xQA",
            "resolution_tier": "1080p",
            "playback_ids": [
              {
                "policy": "public",
                "id": "YJH1F02zqAf02b1nGZmL700kMzNPVbnvmQB102PAOgECyeA"
              }
            ],
            "mp4_support": "standard",
            "max_stored_resolution": "HD",
            "max_stored_frame_rate": 30,
            "max_resolution_tier": "1080p",
            "master_access": "none",
            "id": "V2YZmnX6B2r2M101o1tv01Fe0264GBA02SRu2VTovkeLfK8",
            "encoding_tier": "smart",
            "duration": 2.176667000000002,
            "created_at": "1700812498",
            "aspect_ratio": "842:469",
            "videoId": "58d6a3f1-b31c-49bf-a244-ee4b159e489c"
          },
          "playbackRate": 1,
          "index": 9
        },
        {
          "screenId": "656056d89956dbaff0967b16",
          "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/final.png",
          "screenType": "Screen_Screenshot",
          "index": 10
        }
      ],
      "TRANSITIONS": {
        "656056d89956dbaff0967b17": [],
        "656056d89956dbaff0967b0e": [],
        "656056d89956dbaff0967b18": [],
        "656056d89956dbaff0967b10": [],
        "656056d89956dbaff0967b19": [],
        "656056d89956dbaff0967b12": [],
        "656056d89956dbaff0967b1a": [],
        "656056d89956dbaff0967b14": [],
        "656056d89956dbaff0967b1b": [],
        "656056d89956dbaff0967b16": []
      },
      "workspaceId": "634ec9890af91d52423ff103",
      "storyId": "6560562f32011296a542916b",
      "isEmbed": true,
      "storyDemo": {
        "_id": "6560562f32011296a542916b",
        "custom": {
          "header": {
            "isActive": false,
            "imageUrl": "",
            "personName": "",
            "text": ""
          },
          "theme": {
            "isActive": false,
            "backgroundColor": "#1070ff",
            "textColor": "#FFFFFF",
            "buttonBackgroundColor": "#1070ff",
            "buttonTextColor": "#FFFFFF",
            "overlayBackgroundColor": "rgba(0,0,0,0)"
          },
          "misc": {
            "isActive": false,
            "confettiOnLastStep": true,
            "isOmniBarDisabled": false,
            "isLiveDemoWatermarkEnabled": true,
            "isTabsEnabled": true
          }
        },
        "screens": [
          {
            "_id": "656056d89956dbaff0967b17",
            "playbackRate": 1,
            "type": "Screen_Video",
            "asset": {
              "tracks": [
                {
                  "type": "video",
                  "max_width": 1684,
                  "max_height": 938,
                  "max_frame_rate": 30,
                  "id": "abzHl9MlJNMNMWUV56sbQ7xvCArgPUbPwxRuDMXdRz8",
                  "duration": 0.909
                }
              ],
              "status": "ready",
              "static_renditions": {
                "status": "preparing"
              },
              "source_asset_id": "44r89947qEDqiHe021gzAsGzAVUQ6WWjrE00ilTTs8xQA",
              "resolution_tier": "1080p",
              "playback_ids": [
                {
                  "policy": "public",
                  "id": "FY8eyFL1CDAiTJdupqXDNuePlwgvmlleLoQfz8fXKBg"
                }
              ],
              "mp4_support": "standard",
              "max_stored_resolution": "HD",
              "max_stored_frame_rate": 30,
              "max_resolution_tier": "1080p",
              "master_access": "none",
              "id": "2ibM9axPyXjkYoAXPbxEeQrYLgLvekTee01gcJ00MXtwU",
              "encoding_tier": "smart",
              "duration": 0.909,
              "created_at": "1700812498",
              "aspect_ratio": "842:469",
              "videoId": "abb26453-e6d1-45ec-b4d1-de61e5ea3fb6"
            },
            "index": 0,
            "steps": [],
            "customTransitions": []
          },
          {
            "_id": "656056d89956dbaff0967b0e",
            "type": "Screen_Screenshot",
            "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/79Gg5bBEsGC8bAgYQPuLd4.png",
            "steps": [
              {
                "view": {
                  "pointer": {
                    "selectorLocation": {
                      "positionX": 200,
                      "positionY": 200,
                      "width": 150,
                      "height": 50
                    },
                    "selector": "",
                    "placement": "auto"
                  },
                  "hotspot": {
                    "frameX": 1058,
                    "frameY": 41,
                    "placement": "auto"
                  },
                  "popup": {
                    "type": "post",
                    "formId": null,
                    "showOverlay": false,
                    "title": "",
                    "description": "<p></p>",
                    "buttons": []
                  },
                  "viewType": "hotspot",
                  "content": "<p>Start by clicking on \"Plans\" to access the available options</p>",
                  "nextButtonText": "Next",
                  "showStepNumbers": true,
                  "showHeader": false,
                  "showFooter": false
                },
                "zoomSpan": {
                  "delay": 0,
                  "duration": 2.5,
                  "width": 0,
                  "height": 0,
                  "editorWidth": 0,
                  "offsetX": 0,
                  "offsetY": 0,
                  "enabled": false
                },
                "elementData": {
                  "targetHTML": "<a class=\"Header__LinkStyled-sc-137q003-7 iLAhGm\">Plans</a>",
                  "targetElementType": "Link",
                  "targetText": "\"Plans\""
                },
                "action": {
                  "actionType": "NextButton",
                  "selector": ""
                },
                "_id": "656056d89956dbaff0967b0f",
                "index": 1,
                "stepAudioId": {
                  "_id": "65650dae817e81da7a8f28e0",
                  "audioUrl": "https://d1tmqwkaq9ygb3.cloudfront.net/step-audios/9a583626-6466-4d9a-b473-77dfb81a2f6c.mp3",
                  "text": "Start by clicking on \"Plans\" to access the available options\n",
                  "voiceType": "nova",
                  "active": true,
                  "stepId": "656056d89956dbaff0967b0f",
                  "storyId": "6560562f32011296a542916b",
                  "screenId": "656056d89956dbaff0967b0e",
                  "__v": 0
                },
                "screenId": "656056d89956dbaff0967b0e",
                "screenType": "Screen_Screenshot",
                "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/79Gg5bBEsGC8bAgYQPuLd4.png"
              },
              {
                "view": {
                  "pointer": {
                    "selectorLocation": {
                      "positionX": 114.51699345603272,
                      "positionY": 151.88894541751526,
                      "width": 469.2008819892119,
                      "height": 216.8158321341769
                    },
                    "selector": "",
                    "placement": "auto"
                  },
                  "hotspot": {
                    "frameX": 200,
                    "frameY": 200,
                    "placement": "auto"
                  },
                  "popup": {
                    "type": "post",
                    "formId": null,
                    "showOverlay": false,
                    "title": "",
                    "description": "<p></p>",
                    "buttons": []
                  },
                  "viewType": "pointer",
                  "content": "<p>New step</p>",
                  "nextButtonText": "Next",
                  "showStepNumbers": true,
                  "showHeader": false,
                  "showFooter": false
                },
                "zoomSpan": {
                  "delay": 0,
                  "duration": 2.5,
                  "width": 0,
                  "height": 0,
                  "editorWidth": 0,
                  "offsetX": 0,
                  "offsetY": 0,
                  "enabled": false
                },
                "elementData": {
                  "targetHTML": "",
                  "targetElementType": "element",
                  "targetText": ""
                },
                "action": {
                  "actionType": "NextButton",
                  "selector": ""
                },
                "stepAudioId": null,
                "_id": "6566631157cf0468dcc966eb",
                "index": 2,
                "screenId": "656056d89956dbaff0967b0e",
                "screenType": "Screen_Screenshot",
                "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/79Gg5bBEsGC8bAgYQPuLd4.png"
              }
            ],
            "index": 1,
            "customTransitions": []
          },
          {
            "_id": "656056d89956dbaff0967b18",
            "playbackRate": 1,
            "type": "Screen_Video",
            "asset": {
              "tracks": [
                {
                  "type": "video",
                  "max_width": 1684,
                  "max_height": 938,
                  "max_frame_rate": 30,
                  "id": "bmETxkphXVx2Dfe00xqvbqiqbw4mcrdsJ4bPbQV301ink",
                  "duration": 2.8449999999999998
                }
              ],
              "status": "ready",
              "static_renditions": {
                "status": "preparing"
              },
              "source_asset_id": "44r89947qEDqiHe021gzAsGzAVUQ6WWjrE00ilTTs8xQA",
              "resolution_tier": "1080p",
              "playback_ids": [
                {
                  "policy": "public",
                  "id": "zkBReW9QMmVuA7liZhEw00FpTegyOnfO9ajybPvWQP3o"
                }
              ],
              "mp4_support": "standard",
              "max_stored_resolution": "HD",
              "max_stored_frame_rate": 30,
              "max_resolution_tier": "1080p",
              "master_access": "none",
              "id": "F3xhzIkAfvfT8K9qAdQD00nr5ytlEZk02BSSgLy6701RAY",
              "encoding_tier": "smart",
              "duration": 2.8449999999999998,
              "created_at": "1700812498",
              "aspect_ratio": "842:469",
              "videoId": "fbfe6d3a-2bff-48ab-8b6b-5df1fd7af9b1"
            },
            "index": 2,
            "steps": [],
            "customTransitions": []
          },
          {
            "_id": "656056d89956dbaff0967b10",
            "type": "Screen_Screenshot",
            "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/iwM2ERqYitPyd8ouYamFPQ.png",
            "steps": [
              {
                "view": {
                  "pointer": {
                    "selectorLocation": {
                      "positionX": 200,
                      "positionY": 200,
                      "width": 150,
                      "height": 50
                    },
                    "selector": "",
                    "placement": "auto"
                  },
                  "hotspot": {
                    "frameX": 961,
                    "frameY": 38,
                    "placement": "auto"
                  },
                  "popup": {
                    "type": "post",
                    "formId": null,
                    "showOverlay": false,
                    "title": "",
                    "description": "<p></p>",
                    "buttons": []
                  },
                  "viewType": "hotspot",
                  "content": "<p>Once you are in the \"Plans\" section, navigate to the \"Blog\" section by clicking on it</p>",
                  "nextButtonText": "Next",
                  "showStepNumbers": true,
                  "showHeader": false,
                  "showFooter": false
                },
                "zoomSpan": {
                  "delay": 0,
                  "duration": 2.5,
                  "width": 0,
                  "height": 0,
                  "editorWidth": 0,
                  "offsetX": 0,
                  "offsetY": 0,
                  "enabled": false
                },
                "elementData": {
                  "targetHTML": "<a class=\"Header__LinkStyled-sc-137q003-7 iLAhGm\">Blog</a>",
                  "targetElementType": "Link",
                  "targetText": "\"Blog\""
                },
                "action": {
                  "actionType": "NextButton",
                  "selector": ""
                },
                "_id": "656056d89956dbaff0967b11",
                "index": 4,
                "stepAudioId": {
                  "_id": "65650dae817e81da7a8f28e1",
                  "audioUrl": "https://d1tmqwkaq9ygb3.cloudfront.net/step-audios/d3b5dd63-9aee-4ed2-9987-6961296a5d2a.mp3",
                  "text": "Once you are in the \"Plans\" section, navigate to the \"Blog\" section by clicking on it\n",
                  "voiceType": "nova",
                  "active": true,
                  "stepId": "656056d89956dbaff0967b11",
                  "storyId": "6560562f32011296a542916b",
                  "screenId": "656056d89956dbaff0967b10",
                  "__v": 0
                },
                "screenId": "656056d89956dbaff0967b10",
                "screenType": "Screen_Screenshot",
                "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/iwM2ERqYitPyd8ouYamFPQ.png"
              }
            ],
            "index": 3,
            "customTransitions": []
          },
          {
            "_id": "656056d89956dbaff0967b19",
            "playbackRate": 1,
            "type": "Screen_Video",
            "asset": {
              "tracks": [
                {
                  "type": "video",
                  "max_width": 1684,
                  "max_height": 938,
                  "max_frame_rate": 30,
                  "id": "1MHh00e9c8WWqHTqS2wtv02uTaJ3bHhLSn02GBJ71QHP8s",
                  "duration": 2.065
                }
              ],
              "status": "ready",
              "static_renditions": {
                "status": "preparing"
              },
              "source_asset_id": "44r89947qEDqiHe021gzAsGzAVUQ6WWjrE00ilTTs8xQA",
              "resolution_tier": "1080p",
              "playback_ids": [
                {
                  "policy": "public",
                  "id": "n01L3i02FMN01q02hHOqsxyb8PoLaA01Ybp8QXWuIHaTffvw"
                }
              ],
              "mp4_support": "standard",
              "max_stored_resolution": "HD",
              "max_stored_frame_rate": 30,
              "max_resolution_tier": "1080p",
              "master_access": "none",
              "id": "CgNxp3ESkbAqHuqqkDAEwY26MXR3NwPiSj71TuBKqE4",
              "encoding_tier": "smart",
              "duration": 2.065,
              "created_at": "1700812498",
              "aspect_ratio": "842:469",
              "videoId": "6f2af478-b97c-45fd-b137-be00a26e1b2d"
            },
            "index": 4,
            "steps": [],
            "customTransitions": []
          },
          {
            "_id": "656056d89956dbaff0967b12",
            "type": "Screen_Screenshot",
            "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/opgy7GnzbjJ56FoJByEkok.png",
            "steps": [
              {
                "view": {
                  "pointer": {
                    "selectorLocation": {
                      "positionX": 200,
                      "positionY": 200,
                      "width": 150,
                      "height": 50
                    },
                    "selector": "",
                    "placement": "auto"
                  },
                  "hotspot": {
                    "frameX": 919,
                    "frameY": 268,
                    "placement": "auto"
                  },
                  "popup": {
                    "type": "post",
                    "formId": null,
                    "showOverlay": false,
                    "title": "",
                    "description": "<p></p>",
                    "buttons": []
                  },
                  "viewType": "hotspot",
                  "content": "<p>In the \"Blog\" section, find and click on the image titled \"Introducing LiveDemo\" to learn more about it</p>",
                  "nextButtonText": "Next",
                  "showStepNumbers": true,
                  "showHeader": false,
                  "showFooter": false
                },
                "zoomSpan": {
                  "delay": 0,
                  "duration": 2.5,
                  "width": 0,
                  "height": 0,
                  "editorWidth": 0,
                  "offsetX": 0,
                  "offsetY": 0,
                  "enabled": false
                },
                "elementData": {
                  "targetHTML": "<img alt=\"Introducing LiveDemo\" src=\"/images/posts/introducing-livedemo.svg\" width=\"925\" height=\"475\" decoding=\"async\" data-nimg=\"1\" class=\"posts-image\" style=\"color: transparent; background: url(&quot;/images/posts/introducing-livedemo.svg&quot;) center center; max-width: 100%; max-height: 100%;\">",
                  "targetElementType": "Image",
                  "targetText": "\"Introducing LiveDemo\" image"
                },
                "action": {
                  "actionType": "NextButton",
                  "selector": ""
                },
                "_id": "656056d89956dbaff0967b13",
                "index": 6,
                "stepAudioId": {
                  "_id": "65650dae817e81da7a8f28e2",
                  "audioUrl": "https://d1tmqwkaq9ygb3.cloudfront.net/step-audios/e0e7f9d7-9a16-4495-9d73-47e12e57f17b.mp3",
                  "text": "In the \"Blog\" section, find and click on the image titled \"Introducing LiveDemo\" to learn more about it\n",
                  "voiceType": "nova",
                  "active": true,
                  "stepId": "656056d89956dbaff0967b13",
                  "storyId": "6560562f32011296a542916b",
                  "screenId": "656056d89956dbaff0967b12",
                  "__v": 0
                },
                "screenId": "656056d89956dbaff0967b12",
                "screenType": "Screen_Screenshot",
                "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/opgy7GnzbjJ56FoJByEkok.png"
              }
            ],
            "index": 5,
            "customTransitions": []
          },
          {
            "_id": "656056d89956dbaff0967b1a",
            "playbackRate": 1,
            "type": "Screen_Video",
            "asset": {
              "tracks": [
                {
                  "type": "video",
                  "max_width": 1684,
                  "max_height": 938,
                  "max_frame_rate": 30,
                  "id": "oC87gGnUUf01RaRLEmpHkNCx5TiLNr2bCvfumWHdzfSE",
                  "duration": 11.671
                }
              ],
              "status": "ready",
              "static_renditions": {
                "status": "preparing"
              },
              "source_asset_id": "44r89947qEDqiHe021gzAsGzAVUQ6WWjrE00ilTTs8xQA",
              "resolution_tier": "1080p",
              "playback_ids": [
                {
                  "policy": "public",
                  "id": "VIlrzN3W162qXAQAwaWJEub6bGDxiivjsh8iFU00KUVw"
                }
              ],
              "mp4_support": "standard",
              "max_stored_resolution": "HD",
              "max_stored_frame_rate": 30,
              "max_resolution_tier": "1080p",
              "master_access": "none",
              "id": "1tUKoSnu6U3s29V4qiU01uC3xPAvqs4yFcI02rRUiOXS4",
              "encoding_tier": "smart",
              "duration": 11.671,
              "created_at": "1700812498",
              "aspect_ratio": "842:469",
              "videoId": "81a9e7cd-d2ad-4047-b1c8-0c70d9a0a922"
            },
            "index": 6,
            "steps": [],
            "customTransitions": []
          },
          {
            "_id": "656056d89956dbaff0967b14",
            "type": "Screen_Screenshot",
            "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/r5khcDnebNRWyVQjTk1VnD.png",
            "steps": [
              {
                "view": {
                  "pointer": {
                    "selectorLocation": {
                      "positionX": 200,
                      "positionY": 200,
                      "width": 150,
                      "height": 50
                    },
                    "selector": "",
                    "placement": "auto"
                  },
                  "hotspot": {
                    "frameX": 1133,
                    "frameY": 35,
                    "placement": "auto"
                  },
                  "popup": {
                    "type": "post",
                    "formId": null,
                    "showOverlay": false,
                    "title": "",
                    "description": "<p></p>",
                    "buttons": []
                  },
                  "viewType": "hotspot",
                  "content": "<p>After reading about LiveDemo, proceed to review the terms and conditions associated with the product or service by clicking on \"Terms\"</p>",
                  "nextButtonText": "Next",
                  "showStepNumbers": true,
                  "showHeader": false,
                  "showFooter": false
                },
                "zoomSpan": {
                  "delay": 0,
                  "duration": 2.5,
                  "width": 0,
                  "height": 0,
                  "editorWidth": 0,
                  "offsetX": 0,
                  "offsetY": 0,
                  "enabled": false
                },
                "elementData": {
                  "targetHTML": "<a class=\"Header__LinkStyled-sc-137q003-7 iLAhGm\">Terms</a>",
                  "targetElementType": "Link",
                  "targetText": "\"Terms\""
                },
                "action": {
                  "actionType": "NextButton",
                  "selector": ""
                },
                "_id": "656056d89956dbaff0967b15",
                "index": 8,
                "stepAudioId": {
                  "_id": "65650daf817e81da7a8f28e3",
                  "audioUrl": "https://d1tmqwkaq9ygb3.cloudfront.net/step-audios/a57d3149-d0d6-451d-bf01-a2770ea2c672.mp3",
                  "text": "After reading about LiveDemo, proceed to review the terms and conditions associated with the product or service by clicking on \"Terms\"\n",
                  "voiceType": "nova",
                  "active": true,
                  "stepId": "656056d89956dbaff0967b15",
                  "storyId": "6560562f32011296a542916b",
                  "screenId": "656056d89956dbaff0967b14",
                  "__v": 0
                },
                "screenId": "656056d89956dbaff0967b14",
                "screenType": "Screen_Screenshot",
                "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/r5khcDnebNRWyVQjTk1VnD.png"
              }
            ],
            "index": 7,
            "customTransitions": []
          },
          {
            "_id": "656056d89956dbaff0967b1b",
            "playbackRate": 1,
            "type": "Screen_Video",
            "asset": {
              "tracks": [
                {
                  "type": "video",
                  "max_width": 1684,
                  "max_height": 938,
                  "max_frame_rate": 30,
                  "id": "HsX9Oe00Ltn00mMtPtnKHagOUAVWPmay6SQC900KG9XyOM",
                  "duration": 2.176667000000002
                }
              ],
              "status": "ready",
              "static_renditions": {
                "status": "preparing"
              },
              "source_asset_id": "44r89947qEDqiHe021gzAsGzAVUQ6WWjrE00ilTTs8xQA",
              "resolution_tier": "1080p",
              "playback_ids": [
                {
                  "policy": "public",
                  "id": "YJH1F02zqAf02b1nGZmL700kMzNPVbnvmQB102PAOgECyeA"
                }
              ],
              "mp4_support": "standard",
              "max_stored_resolution": "HD",
              "max_stored_frame_rate": 30,
              "max_resolution_tier": "1080p",
              "master_access": "none",
              "id": "V2YZmnX6B2r2M101o1tv01Fe0264GBA02SRu2VTovkeLfK8",
              "encoding_tier": "smart",
              "duration": 2.176667000000002,
              "created_at": "1700812498",
              "aspect_ratio": "842:469",
              "videoId": "58d6a3f1-b31c-49bf-a244-ee4b159e489c"
            },
            "index": 8,
            "steps": [],
            "customTransitions": []
          },
          {
            "_id": "656056d89956dbaff0967b16",
            "type": "Screen_Screenshot",
            "imageUrl": "https://livedemo-cdn.s3.amazonaws.com/flix-images/6560562f32011296a542916b/final.png",
            "steps": [],
            "index": 9,
            "customTransitions": []
          }
        ],
        "filePath": "/home/exploitx/WebstormProjects/livedemo/tmp/storyRequests/6560562f32011296a542916b.json",
        "status": "ready",
        "isPublished": false,
        "capturedEvents": [
          {
            "clickId": "79Gg5bBEsGC8bAgYQPuLd4",
            "frameId": 0,
            "frameX": 1058,
            "frameY": 41,
            "tabId": 987252275,
            "targetElementType": "Link",
            "targetHTML": "<a class=\"Header__LinkStyled-sc-137q003-7 iLAhGm\">Plans</a>",
            "targetText": "\"Plans\"",
            "timeMs": 1700812316064,
            "type": "click"
          },
          {
            "endTimeMs": 1700812316104,
            "frameId": 0,
            "startTimeMs": 1700812316104,
            "tabId": 987252275,
            "type": "scrolling"
          },
          {
            "endTimeMs": 1700812318403,
            "frameId": 0,
            "startTimeMs": 1700812316256,
            "tabId": 987252275,
            "type": "dragging"
          },
          {
            "clickId": "iwM2ERqYitPyd8ouYamFPQ",
            "frameId": 0,
            "frameX": 961,
            "frameY": 38,
            "tabId": 987252275,
            "targetElementType": "Link",
            "targetHTML": "<a class=\"Header__LinkStyled-sc-137q003-7 iLAhGm\">Blog</a>",
            "targetText": "\"Blog\"",
            "timeMs": 1700812318909,
            "type": "click"
          },
          {
            "endTimeMs": 1700812319250,
            "frameId": 0,
            "startTimeMs": 1700812319102,
            "tabId": 987252275,
            "type": "dragging"
          },
          {
            "endTimeMs": 1700812319251,
            "frameId": 0,
            "startTimeMs": 1700812319251,
            "tabId": 987252275,
            "type": "scrolling"
          },
          {
            "endTimeMs": 1700812320772,
            "frameId": 0,
            "startTimeMs": 1700812319259,
            "tabId": 987252275,
            "type": "dragging"
          },
          {
            "clickId": "opgy7GnzbjJ56FoJByEkok",
            "frameId": 0,
            "frameX": 919,
            "frameY": 268,
            "tabId": 987252275,
            "targetElementType": "Image",
            "targetHTML": "<img alt=\"Introducing LiveDemo\" src=\"/images/posts/introducing-livedemo.svg\" width=\"925\" height=\"475\" decoding=\"async\" data-nimg=\"1\" class=\"posts-image\" style=\"color: transparent; background: url(&quot;/images/posts/introducing-livedemo.svg&quot;) center center; max-width: 100%; max-height: 100%;\">",
            "targetText": "\"Introducing LiveDemo\" image",
            "timeMs": 1700812320974,
            "type": "click"
          },
          {
            "endTimeMs": 1700812321954,
            "frameId": 0,
            "startTimeMs": 1700812321304,
            "tabId": 987252275,
            "type": "dragging"
          },
          {
            "endTimeMs": 1700812326758,
            "frameId": 0,
            "startTimeMs": 1700812322106,
            "tabId": 987252275,
            "type": "scrolling"
          },
          {
            "endTimeMs": 1700812327776,
            "frameId": 0,
            "startTimeMs": 1700812326968,
            "tabId": 987252275,
            "type": "dragging"
          },
          {
            "endTimeMs": 1700812328042,
            "frameId": 0,
            "startTimeMs": 1700812327843,
            "tabId": 987252275,
            "type": "scrolling"
          },
          {
            "endTimeMs": 1700812332329,
            "frameId": 0,
            "startTimeMs": 1700812329177,
            "tabId": 987252275,
            "type": "dragging"
          },
          {
            "clickId": "r5khcDnebNRWyVQjTk1VnD",
            "frameId": 0,
            "frameX": 1133,
            "frameY": 35,
            "tabId": 987252275,
            "targetElementType": "Link",
            "targetHTML": "<a class=\"Header__LinkStyled-sc-137q003-7 iLAhGm\">Terms</a>",
            "targetText": "\"Terms\"",
            "timeMs": 1700812332645,
            "type": "click"
          },
          {
            "endTimeMs": 1700812332792,
            "frameId": 0,
            "startTimeMs": 1700812332792,
            "tabId": 987252275,
            "type": "scrolling"
          },
          {
            "endTimeMs": 1700812332880,
            "frameId": 0,
            "startTimeMs": 1700812332880,
            "tabId": 987252275,
            "type": "dragging"
          }
        ],
        "name": "LiveDemo | Demo the future",
        "workspaceId": "634ec9890af91d52423ff103",
        "userId": "627c3dc27fd6f2582a22b0ca",
        "aspectRatio": "1",
        "videoStartMs": 1700812315155,
        "videoEndMs": 1700812334846,
        "tabInfo": {
          "active": true,
          "audible": false,
          "autoDiscardable": true,
          "discarded": false,
          "favIconUrl": "https://livedemo.ai/images/favicon.ico",
          "groupId": -1,
          "height": 938,
          "highlighted": true,
          "id": 987252275,
          "incognito": false,
          "index": 65,
          "mutedInfo": {
            "muted": false
          },
          "pinned": false,
          "selected": true,
          "status": "complete",
          "title": "LiveDemo | Demo the future",
          "url": "https://livedemo.ai/",
          "width": 1684,
          "windowId": 987251287
        },
        "windowMeasures": {
          "innerHeight": 938,
          "innerWidth": 1684
        },
        "createdAt": "2023-11-24T07:52:15.736Z",
        "updatedAt": "2023-11-24T07:55:04.600Z",
        "__v": 0
      },
      "run": true,
      "stepBlobs": {},
      "sessionId": "6566c5fa57cf0468dcc96daa"
    }
  }
  window.config.currentStepIndex = 0


  const windowConfigRef = useRef(window.config)


  const walkthroughElementRef = useRef(null)
  // const iframeContainerWrapperRef = useRef(null)

  let iframeScaleX = useRef(1)
  let iframeScaleY = useRef(1)

  let sidebarLength = collapsed ? 80 : 200

  // let [storyDemo, _setStoryDemo] = useState(JSON.parse(JSON.stringify(currentStoryDemo)))
  let storyDemoRef = useRef(currentStoryDemo ? JSON.parse(JSON.stringify(currentStoryDemo)) : null)

  let [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false)

  function setStoryDemo(storyDemoValue) {

    let newStoryDemoValue = JSON.parse(JSON.stringify(storyDemoValue))

    storyDemoRef.current = storyDemoValue

    console.log('setStoryDemo')
    console.log(storyDemoRef.current)

    // _setStoryDemo(storyDemoValue)

    actions.updateStoryDemo(newStoryDemoValue)
      .then(() => {


      })


  }

  useEffect(() => {

    storyDemoRef.current = currentStoryDemo

  }, [currentStoryDemo])

  let [tabsWidth, setTabsWidth] = useState((window.innerWidth * 0.33) - (sidebarLength + 10))

  let stepsSize = currentStoryDemo?.screens?.reduce((accum, screen) => {
    accum += (screen.steps && screen.steps.length) || 1
    return accum
  }, 0) || 0

  let [steps, setSteps] = useState([])

  let [iframeWidth, setIframeWidth] = useState(window.innerWidth - (window.innerWidth * 0.33))
  let [iframeUrl, setIframeUrl] = useState('')

  let [currentStepIndex, setCurrentStepIndex] = useState(1)
  let [currentStep, setCurrentStep] = useState(null)
  let [previousStepIndex, setPreviousStepIndex] = useState(1)
  let [previousStep, setPreviousStep] = useState(null)

  let [isLoading, setIsLoading] = useState(false)

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [isAIEnhanceOpen, setIsAIEnhanceOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [isLibraryLoading, setIsLibraryLoading] = useState(false)

  let [isPublished, setIsPublished] = useState(currentStoryDemo?.isPublished || false)

  const isOmniBarDisabled = (storyDemoRef.current.custom && storyDemoRef.current.custom.misc && storyDemoRef.current.custom.misc.isOmniBarDisabled) || false

  let omniBarHeight = isOmniBarDisabled ? 0 : 40


  let [isZoomEnabled, setIsZoomEnabled] = useState(false)

  function getIframeUrl(storyDemo, authToken, stepNumber = 1) {

    // if(!storyDemo.url) {
    //   return ''
    // }

    let newUrl = `${ENV.STORIES_API}/workspaces/${storyDemo.workspaceId}/stories/${storyDemo._id}/preview?step=${stepNumber}`

    // let urlSplit = storyDemo.url.split('?')[1]
    // if (urlSplit && urlSplit.length !== 0) {
    //
    //   newUrl = urlSplit[0] + '?' + urlSplit[1] + '&resp_server_cookie=' + authToken
    // } else {
    //
    //   newUrl = storyDemo.url + '?resp_server_cookie=' + authToken
    // }

    return newUrl
  }

  useEffect(() => {

    setCurrentStep(steps[currentStepIndex - 1])

  }, [currentStepIndex, steps])

  useEffect(() => {

    if (walkthroughElementRef.current) {
      let rectWrapper = walkthroughElementRef.current.getBoundingClientRect()

      let tabWidth = currentStoryDemo.tabInfo && currentStoryDemo.tabInfo.width ? currentStoryDemo.tabInfo.width : 1366
      let tabHeight = currentStoryDemo.tabInfo && currentStoryDemo.tabInfo.height ? currentStoryDemo.tabInfo.height : 632

      setStoryWidth(rectWrapper.width)
      setStoryHeight(rectWrapper.height)

      iframeScaleX.current = (rectWrapper.width / tabWidth)
      iframeScaleY.current = (rectWrapper.height / tabHeight)
    }

  }, [walkthroughElementRef, walkthroughElementRef.current, currentStoryDemo])

  function changeIframeStep(storyDemo, authData, currentStepInternal = currentStepIndex) {

    // if (iframeRef.current) {
    console.log(steps)
    console.log(steps[currentStepInternal - 1])
    console.log('ChangeIframeStep - ' + currentStepInternal)
    setPreviousStep(currentStep)
    setPreviousStepIndex(currentStepIndex)
    setCurrentStep(steps[currentStepInternal - 1])


    // window.postMessage({
    window.postMessage({
      type: 'changeStep',
      stepNumber: currentStepInternal
    }, '*')
    // }
  }

  function patchStep(stepUpdateObj, workspaceId, storyDemoId, screenId, stepId, authToken) {

    return axios.patch(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${stepId}`, {
      ...stepUpdateObj
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((newStepRes) => {

      return newStepRes.data
    })
  }

  function patchTransition(transitionObj, workspaceId, storyDemoId, screenId, transitionId, authToken) {

    return axios.patch(
      `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/transitions/${transitionId}`,
      transitionObj,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      .then((res) => {
        return res.data
      })
  }

  // useEffect(() => {
  //   changeIframeStep(storyDemo, authData, iframeCurrentStep)
  // }, [iframeCurrentStep])

  useEffect(() => {

    if (currentStoryDemo && currentStoryDemo._id === storyDemoIdFromUrl) {
      setHasDemoLoaded(true)
    }

    let demo = JSON.parse(JSON.stringify(currentStoryDemo))

    let stepsInternal = demo.screens.reduce((accum, screen) => {
      if (screen.steps) {
        screen.steps = screen.steps.map(step => {

          if (!step._id) {
            step._id = 1
          }

          step.screenId = screen._id
          step.screenType = screen.type

          return step
        })

        accum = accum.concat(screen.steps.length !== 0 ? screen.steps : [{
          screenId: screen._id,
          screenType: screen.type,
          zoomSpans: screen.zoomSpans ? screen.zoomSpans : []
        }])
      }


      return accum
    }, [])

    console.log("set stepsInternal")
    console.log(stepsInternal)
    setSteps(stepsInternal)

    // setCurrentStep(stepsInternal[0])

  }, [currentStoryDemo])

  useEffect(() => {
    // document.domain = URL_COMMON_DOMAIN

    let internalStoryDemo = storyDemoRef.current

    function messageHandler(event) {
      if (event.data.type && event.data.type === 'hotspot_set') {

        // console.log('hotspot_set')
        // console.log('event.data')
        // console.log(event.data)

        let isPatchTransition = event.data.transitionId ? true : false

        if (isPatchTransition) {
          patchTransition({
              // frameX: event.data.frameX * ((iframeScaleX.current) + 1),
              // frameY: event.data.frameY * ((iframeScaleY.current) + 1),
              hotspot: {
                frameX: event.data.frameX,
                frameY: event.data.frameY
              }
            },
            workspaceIdFromURL,
            storyDemoIdFromUrl,
            event.data.screenId,
            event.data.transitionId,
            authData.token
          )
            .then((res) => {
              let newTransition = res.data
              // console.log('Transition Patched ')
              // console.log(event.data)

              // Update/set StoryDemo -> Screen -> Transition after patchTransition to be able to persist the change
              // in the React App as well so next time user clicks Save it will use the new data

              let newStoryDemo = JSON.parse(JSON.stringify(storyDemoRef.current))

              let foundTransition = newStoryDemo.screens.find(scr => scr._id === event.data.screenId).customTransitions.find(
                (transition) => transition._id === event.data.transitionId
              )

              if (foundTransition) {
                foundTransition = {...foundTransition, ...newTransition}
                foundTransition.hotspot.frameX = event.data.frameX
                foundTransition.hotspot.frameY = event.data.frameY

                setStoryDemo(newStoryDemo)
              }


            })
        } else {
          patchStep({
              view: {
                hotspot: {
                  frameX: event.data.frameX,
                  frameY: event.data.frameY
                }
              }

            },
            workspaceIdFromURL,
            storyDemoIdFromUrl,
            event.data.screenId,
            event.data.stepId,
            authData.token
          )
            .then((res) => {

              let newStep = res.data
              // console.log('Step Patched ')
              // console.log(event.data)

              // Update/set StoryDemo -> Screen -> Transition after patchTransition to be able to persist the change
              // in the React App as well so next time user clicks Save it will use the new data

              let newStoryDemo = JSON.parse(JSON.stringify(storyDemoRef.current))

              let foundStep = newStoryDemo.screens.find(scr => scr._id === event.data.screenId).steps.find(
                (step) => step._id === event.data.stepId
              )


              if (foundStep) {
                foundStep = {...foundStep, ...newStep}
                foundStep.view.hotspot.frameX = event.data.frameX
                foundStep.view.hotspot.frameY = event.data.frameY

                setStoryDemo(newStoryDemo)
              }


            })
        }


      }


      if (event.data.type && event.data.type === 'region_set') {

        console.log('region_set')
        console.log('event.data')
        console.log(event.data)


        let newSelectorLocation = {
          positionX: event.data.pixelData.x,
          positionY: event.data.pixelData.y,
          width: event.data.pixelData.width,
          height: event.data.pixelData.height
        }

        let stepUpdateObj = {
          view: {
            pointer: {
              selectorLocation: newSelectorLocation
            },
          }
        }

        let transitionUpdateObj = {
          pointer: {
            selectorLocation: newSelectorLocation
          }
        }

        if (event.data.regionType === 'step') {
          patchStep(
            stepUpdateObj,
            workspaceIdFromURL,
            storyDemoIdFromUrl,
            event.data.screenId,
            event.data.id,
            authData.token
          )
            .then((newStepData) => {
              // console.log('Step Patched ')
              // console.log(event.data)

              if (storyDemoRef.current.screens.length === 0) {
                return
              }


              // Update/set StoryDemo -> Screen -> Transition after patchTransition to be able to persist the change
              // in the React App as well so next time user clicks Save it will use the new data

              let newStoryDemo = JSON.parse(JSON.stringify(storyDemoRef.current))

              let newScreen = newStoryDemo.screens.find(scr => scr._id === event.data.screenId)

              if (newScreen && newScreen.steps.length && newStepData) {

                newScreen = {...newScreen}

                newScreen.steps = [...newScreen.steps].map(step => {
                  if (step._id === newStepData._id) {
                    return newStepData
                  }
                  return step
                })

                newStoryDemo.screens = newStoryDemo.screens.map(screen => {
                  if (screen._id === newScreen._id) {
                    return newScreen
                  }
                  return screen
                })


                setStoryDemo(newStoryDemo)
              }


            })
        } else {

          patchTransition(transitionUpdateObj, workspaceIdFromURL,
            storyDemoIdFromUrl,
            event.data.screenId,
            event.data.id,
            authData.token)
            .then((newTransition) => {
              // console.log('Transition Patched ')


              if (storyDemoRef.current.screens.length === 0) {
                return
              }

              let newStoryDemo = {...storyDemoRef.current}

              let newScreen = newStoryDemo.screens.find(scr => scr._id === event.data.screenId)

              if (newScreen && newScreen.customTransitions.length && newTransition) {

                newScreen = {...newScreen}

                newScreen.customTransitions = [...newScreen.customTransitions].map(transition => {
                  if (transition._id === newTransition._id) {
                    return newTransition
                  }
                  return transition
                })

                newStoryDemo.screens = newStoryDemo.screens.map(screen => {
                  if (screen._id === newScreen._id) {
                    return newScreen
                  }
                  return screen
                })


                setStoryDemo(newStoryDemo)
              }
            })
        }


      }


      if (event.data.type && event.data.type === 'step_index_changed') {

        // let newNumber = Math.max(1, Math.min(event.data.state.stepNumber, storyDemoRef.current.screens.length))
        let newNumber = event.data.state.stepNumber
        console.log('app received step_index_changed event')
        console.log(event.data)

        if (steps && steps.length !== 0) {
          setCurrentStep(steps[newNumber - 1])
          setPreviousStep(steps[newNumber - 1])
        }

        setCurrentStepIndex(newNumber)
        setPreviousStepIndex(newNumber)
      }

    }

    // Don't load if we don't have required params
    if (!workspaceIdFromURL || !storyDemoIdFromUrl || !authData?.token) {
      return
    }

    let isEventListenerSet = false

    console.log('getStoryDemo called from useEffect', {workspaceIdFromURL, storyDemoIdFromUrl})
    actions.getStoryDemo(workspaceIdFromURL, storyDemoIdFromUrl, authData.token)
      .then((storyDemoData) => {
        if (!storyDemoData || !storyDemoData._id) {
          console.error('Failed to load story demo')
          return
        }

        setStoryDemo(storyDemoData)

        // setIsPublished(storyDemoData.isPublished)

        let stepsInternal = storyDemoData.screens.reduce((accum, screen) => {
          if (screen.steps) {
            screen.steps = screen.steps.map(step => {
              step.screenId = screen._id
              step.screenType = screen.type

              return step
            })

            accum = accum.concat(screen.steps.length !== 0 ? screen.steps : [{
              screenId: screen._id,
              screenType: screen.type,
              zoomSpans: screen.zoomSpans ? screen.zoomSpans : []
            }])
          }

          return accum
        }, [])

        window.addEventListener('message', messageHandler)
        isEventListenerSet = true

        setSteps(stepsInternal)

        let newIframeUrl = getIframeUrl(storyDemoData, authData.token, currentStepIndex)
        setIframeUrl(newIframeUrl)

      })
      .catch((error) => {
        console.error('Error loading story demo:', error)
      })

    return () => {
      if (isEventListenerSet) {
        window.removeEventListener('message', messageHandler)
      }
    }

  }, [workspaceIdFromURL, storyDemoIdFromUrl, authData?.token])


  function reloadStoryDemo() {
    return getStoryDemo(workspaceIdFromURL, storyDemoIdFromUrl, authData.token)
      .then((storyDemoData) => {
        debugger
        setStoryDemo(storyDemoData)
      })
  }

  function scrollToLastScreen() {
    setTimeout(() => {

      //Scroll ScreensTab to bottom
      let screensTabBodyElem = document.getElementById('ScreensTab__Body')
      if (screensTabBodyElem) {
        screensTabBodyElem.scrollTop = screensTabBodyElem.scrollHeight
      }

    }, 1000)
  }

  function afterScreenUpload() {
    return actions.updateCurrentSelectedWorkspace(authData.token, workspaceIdFromURL)
      .then(() => {

        return reloadStoryDemo()
      })
      .then(() => {
        scrollToLastScreen()
      })
  }


  function addScreen(screenId, workspaceId, storyDemoId, authToken) {
    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/copy`, {}, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {
        return res.data
      })
      .then(() => {

        return reloadStoryDemo()
      })
      .then(() => {
        scrollToLastScreen()
      })
  }

  useEffect(() => {
    setTabsWidth((window.innerWidth - iframeWidth) - sidebarLength)
  }, [collapsed])

  // useEffect(() => {
  //
  //
  //
  //   }
  //
  // }, [iframeRef.current])


  function getStoryDemo(workspaceId, storyDemoId, authToken) {

    return axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {
        return res.data
      })
  }

  function onSetIsPublished(storyDemo, isPublished, authToken) {
    return axios.post(`${ENV.STORIES_API}/workspaces/${storyDemo.workspaceId}/stories/${storyDemo._id}/publish`, {
      isPublished: isPublished
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {
        return res.data
      })
      .then(() => {

        let newStoryDemo = {...storyDemo}
        newStoryDemo.isPublished = isPublished
        setStoryDemo(newStoryDemo)
      })
  }

  let currentScreen = currentStep && currentStep.screenId ?
    storyDemoRef.current.screens.find(screen => screen._id === currentStep.screenId)
    : {
      zoomSpans: []
    }
  console.log('currentScreen')
  console.log(currentScreen)


  let [videoPercentageTime, setVideoPercentageTime] = useState(0)

  // Show loading spinner if we don't have story demo data or if it doesn't match URL params
  // This check must be AFTER all hooks to follow Rules of Hooks
  if (!currentStoryDemo || !currentStoryDemo._id || currentStoryDemo._id !== storyDemoIdFromUrl) {
    return <Spinner/>
  }

  let noScreensForDemo = hasDemoLoaded && renderSteps && renderSteps.length === 0

  const outerBg = resolveStoryDemoOuterBackground(currentStoryDemo)

  return (
    <React.Fragment>
      <Header
        style={{boxShadow: 'none'}}
        title={currentStoryDemo.name || 'LiveDemo'}
        liveDemo={currentStoryDemo}
        rightSideComponent={
          <React.Fragment>


          </React.Fragment>
        }
      />
      <S.Content>
        {isMobile ? (
          <S.MobileNotice>
            <S.WorkspaceColTitle>This Editor is not optimized for mobile</S.WorkspaceColTitle>
          </S.MobileNotice>
        ) : <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          // padding: '0 24px 24px 24px',
          background: '#fff'
        }}>
          <Resizable
            enable={{
              top: false,
              right: false,
              bottom: false,
              left: false,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false
            }}
            size={{
              width: tabsWidth,
              height: '100%'
            }}
            minWidth={200}
            // maxWidth={window.innerWidth * 0.6}
            onResize={(event, direction, refToElement, delta) => {
              const newWidth = refToElement.clientWidth
              setTabsWidth(newWidth)
              setIframeWidth(window.innerWidth - newWidth - sidebarLength)
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                height: '100%',
                // padding: '0 24px 24px 24px',
                background: '#fff'
              }}
            >

              <S.WorkspacesCol style={{
                flexGrow: 1,
                minWidth: '100%',
              }} id={'info-column-left'} xs={6} lg={6}>
                <TransitionGroup style={{height: '100%'}} className="transition-group">
                  <CSSTransition
                    key={location.key || location.pathname}
                    timeout={{enter: 300, exit: 300}}
                    classNames="fade"
                  >
                    <div style={{width: '100%', height: '100%'}}>

                      <Routes location={location}>

                        <Route path="*"
                               element={
                                 <TabsView
                                   tabsWidth={tabsWidth}
                                   storyDemo={currentStoryDemo}
                                   storyDemoRef={storyDemoRef}
                                   setStoryDemo={setStoryDemo}
                                   authData={authData}
                                   currentStepIndex={currentStepIndex}
                                   previousStepIndex={previousStepIndex}
                                   previousStep={previousStep}
                                   changeStep={(newStepNumber) => {
                                     return changeIframeStep(currentStoryDemo, authData, newStepNumber)
                                   }}
                                   reloadStoryDemo={() => {
                                     return reloadStoryDemo()
                                     // .then(() => {
                                     //
                                     //   scrollToLastScreen()
                                     // })
                                   }}
                                   iframeRef={walkthroughElementRef}
                                 />
                               }
                        />


                      </Routes>
                      <Library libraryObj={currentSelectedWorkspace?.library || {
                        pages: [],
                        screenshots: [],
                        videos: []
                      }}
                               workspaceId={workspaceIdFromURL}
                               storyDemoId={storyDemoIdFromUrl}
                               authData={authData}
                               onCancel={() => setIsLibraryOpen(false)}
                               isOpen={isLibraryOpen}
                               isLoading={isLibraryLoading}
                               setIsLoading={setIsLibraryLoading}
                               addScreen={(screenId) => {
                                 setIsLibraryLoading(true)
                                 addScreen(screenId, workspaceIdFromURL, storyDemoIdFromUrl, authData.token)
                                   .then(() => {
                                     setIsLibraryLoading(false)
                                     setIsLibraryOpen(false)
                                   })
                               }}
                      />
                      <AIEnhance
                        workspaceId={workspaceIdFromURL}
                        storyDemoId={storyDemoIdFromUrl}
                        authData={authData}
                        onCancel={() => setIsAIEnhanceOpen(false)}
                        isOpen={isAIEnhanceOpen}
                        setShowConfetti={setShowConfetti}
                        reloadStoryDemo={reloadStoryDemo}
                      />
                      {showConfetti ? (<Confetti
                        recycle={false}
                        width={window.innerWidth}
                        height={window.innerHeight}
                        // confettiSource={{
                        //   w: 10,
                        //   h: 10,
                        //   x: window.innerWidth / 2,
                        //   y: window.innerHeight / 2,
                        // }}
                        tweenDuration={5000}
                        numberOfPieces={1000}
                        gravity={0.23}
                        run={true}
                      />) : ''}

                    </div>
                  </CSSTransition>
                </TransitionGroup>


              </S.WorkspacesCol>
            </div>
          </Resizable>
          <Resizable
            enable={{
              top: false,
              right: false,
              bottom: false,
              left: false,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false
            }}
            size={{
              width: iframeWidth,
              height: '100%'
            }}
            minWidth={300}
            onResize={(event, direction, elementRef, delta) => {
              const newWidth = elementRef.clientWidth
              setIframeWidth(newWidth)
              setTabsWidth(window.innerWidth - newWidth - sidebarLength)
            }}
          >
            <S.ChartWorkspacesCol style={{
              minWidth: '100%',
              position: 'relative',
              ...(outerBg.mode === 'wallpaper'
                ? { background: 'transparent' }
                : { background: outerBg.css })
            }} id={'info-column-right'} xs={18} lg={18}>
              {outerBg.mode === 'wallpaper' ? (() => {
                const blurPx = outerBg.blur > 0 ? outerBg.blur : 0
                // Expand the blurred layer so filter bleed sits outside the clip; parent keeps square edges.
                const blurBleed = blurPx > 0 ? Math.ceil(blurPx * 2.5) : 0
                return (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 0,
                      overflow: 'hidden',
                      pointerEvents: 'none'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: -blurBleed,
                        left: -blurBleed,
                        right: -blurBleed,
                        bottom: -blurBleed,
                        backgroundImage: `url(${outerBg.wallpaperUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined
                      }}
                    />
                  </div>
                )
              })() : null}
              <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
              {isLoading ? (
                <PulseLoader css={{'margin': '0 auto', 'width': '100%', 'height': '100%'}}
                             color={Colors.App.spinnerColor}
                             size={15} speedMultiplier={0.5}/>) : (
                <S.IFrameWrapper>
                  <S.Omnibox>
                    <S.OmniLeftSide>
                      <Toolbar
                        isPage={currentStep && (currentStep.screenType === ScreenTypes.SCREEN_PAGE)}
                        isVideoOrScreenshot={currentStep && (currentStep.screenType === ScreenTypes.SCREEN_VIDEO || currentStep.screenType === ScreenTypes.SCREEN_SCREENSHOT)}
                        onLibraryClick={() => {
                          setIsLibraryOpen(true)
                        }}
                        onAIEnhanceClick={() => {
                          setIsAIEnhanceOpen(true)
                        }}
                        innerWidth={storyWidth}
                        innerHeight={storyHeight}
                        currentStep={currentStep}
                        isZoomEnabled={isZoomEnabled}
                        setIsZoomEnabled={setIsZoomEnabled}
                        workspaceId={workspaceIdFromURL}
                        storyDemoId={storyDemoIdFromUrl}
                        authData={authData}
                        afterScreenUpload={afterScreenUpload}
                        iframeRef={walkthroughElementRef}
                        screenId={currentStep && currentStep.screenId}
                        onFrameToScreenSuccess={() => {
                          return reloadStoryDemo()
                        }}
                      />
                    </S.OmniLeftSide>

                    <S.OmniRightSide>
                      <Tip
                        zIndex={9999}
                        // disabled={!showTippy}
                        arrow={false}
                        trigger={'click'}
                        animation={'scale'}
                        offset={[0, 5]}
                        popperOptions={{
                          modifiers: [
                            {
                              name: 'flip',
                              options: {
                                fallbackPlacements: ['top', 'right', 'left', 'bottom'],
                              },
                            },
                          ],
                        }}
                        interactive={true}
                        placement={'bottom'}
                        onShow={() => {
                          setIsShareDropdownOpen(true)
                        }}
                        onHide={() => {
                          setIsShareDropdownOpen(false)
                        }}
                        content={
                          (currentStoryDemo && currentStoryDemo.content ? <ShareDropdown
                            storyId={storyDemoIdFromUrl}
                            workspaceId={workspaceIdFromURL}
                            isPublished={currentStoryDemo && currentStoryDemo.isPublished}
                            liveDemo={currentStoryDemo}
                            isOpen={isShareDropdownOpen}
                            onSetIsPublished={(isPublished) => {

                              return onSetIsPublished(currentStoryDemo, isPublished, authData.token)
                            }}

                          /> : '')
                        }
                      >
                        <span>
                          <IconTextButton
                            loading={false}
                            onClick={(e) => {
                            }}
                            img={<S.ShareIcon type={'share-alt'}/>}
                            text={'Share'}

                            textStyles={{
                              fontSize: '1.1em',
                              color: '#111',
                            }}
                            buttonStyles={{
                              boxShadow: 'none',
                              justifyContent: 'space-between',
                              width: '105px',
                              height: '30px',
                              borderRadius: '6px'
                            }}
                          />

                        </span>
                      </Tip>


                      <IconTextButton
                        loading={false}
                        onClick={() => {
                          let previewUrl = `${ENV.APP_URL}/livedemos/${storyDemoIdFromUrl}`

                          window.open(previewUrl, '_blank')
                        }}
                        img={undefined}
                        text={'Preview'}

                        textStyles={{
                          fontSize: '1.1em',
                          color: 'white'
                        }}
                        buttonStyles={{
                          background: Colors.primaryColor,
                          boxShadow: 'none',
                          justifyContent: 'center',
                          width: '115px',
                          height: '30px',
                          borderRadius: '6px',
                          '&:hover': {
                            background: `${Colors.primaryColor} !important`
                          },
                          '&:active': {
                            background: `${Colors.primaryColor} !important`
                          },
                          '&:focus': {
                            background: `${Colors.primaryColor} !important`
                          }
                        }}

                      />
                      {/*<S.PublishButton onClick={() => {*/}
                      {/*  let previewUrl = `${ENV.APP_URL}/livedemos/${storyDemoIdFromUrl}`*/}

                      {/*  window.open(previewUrl, '_blank');*/}
                      {/*}}>Preview</S.PublishButton>*/}
                    </S.OmniRightSide>
                  </S.Omnibox>
                  <S.IFrameContainerWrapperMain>
                    <S.IFrameContainerWrapper
                      style={{
                        width: `calc(75vw - ${(tabsWidth + 80) / 2}px)`,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center'
                      }}
                      id={'story_iframeContainerWrapper'}>
                      <S.IFrameContainer
                        onClick={() => {
                          if (noScreensForDemo) {
                            setIsLibraryOpen(true)
                          }
                        }}
                        noScreensForDemo={noScreensForDemo}
                        ref={walkthroughElementRef}
                        width={(currentStoryDemo.tabInfo && currentStoryDemo.tabInfo.width ? currentStoryDemo.tabInfo.width : '1366')}
                        height={(currentStoryDemo.tabInfo && currentStoryDemo.tabInfo.height ? currentStoryDemo.tabInfo.height : '768')}
                      >
                        {hasDemoLoaded && renderSteps && renderSteps.length !== 0 ? <WalkthroughComponent
                          storyId={currentStoryDemo._id}
                          steps={deriveRenderSteps(currentStoryDemo)}
                          storyDemo={currentStoryDemo}
                          workspaceId={currentStoryDemo && currentStoryDemo.workspaceId}
                          firstScreenId={currentStoryDemo && currentStoryDemo.screens && currentStoryDemo.screens[0] && currentStoryDemo.screens[0]._id}
                          isEmbed={true}
                          isEditor={true}
                          width={storyWidth}
                          height={storyHeight}
                          config={windowConfigRef.current}

                          authData={authData}
                          reloadStoryDemo={reloadStoryDemo}
                        /> : (noScreensForDemo ? <div>
                          <S.ToolbarText style={{fontSize: '1.5em'}}>Add Screen from Library or Upload screenshot or
                            video</S.ToolbarText>
                        </div> : <Spinner/>)
                        }
                      </S.IFrameContainer>
                    </S.IFrameContainerWrapper>
                  </S.IFrameContainerWrapperMain>
                </S.IFrameWrapper>
              )}

              {isZoomEnabled ? (
                <VideoEditor
                  currentScreen={currentScreen}
                  storyDemoId={storyDemoIdFromUrl}
                  workspaceId={workspaceIdFromURL}
                  setStoryDemo={setStoryDemo}
                  videoPercentageTime={videoPercentageTime}
                  setVideoPercentageTime={setVideoPercentageTime}
                  omniBarHeight={omniBarHeight}
                  innerHeight={storyHeight}
                  innerWidth={storyWidth}
                  updateZoomSpans={(newZoomSpans, screenId) => {

                    let newStoryDemo = JSON.parse(JSON.stringify(storyDemoRef.current))

                    // updates the screen
                    newStoryDemo.screens = newStoryDemo.screens.map(screen => {

                      if (screen._id === screenId) {
                        let newScreen = JSON.parse(JSON.stringify(screen))

                        newScreen.zoomSpans = newZoomSpans

                        return newScreen
                      } else {

                        return screen
                      }

                    })

                    setStoryDemo(newStoryDemo)
                  }}
                  updateScreen={(newScreen) => {

                    let newStoryDemo = JSON.parse(JSON.stringify(storyDemoRef.current))

                    // updates the screen
                    newStoryDemo.screens = newStoryDemo.screens.map(screen => {

                      if (screen._id === newScreen._id) {

                        return newScreen
                      } else {

                        return screen
                      }
                    })

                    setStoryDemo(newStoryDemo)
                  }}
                />
              ) : (<S.ZoomPlaceholder/>)}

              </div>
            </S.ChartWorkspacesCol>
          </Resizable>
        </div>}
      </S.Content>
    </React.Fragment>
  )
}

const S = {
  Content: styled(Content)`
    && {
      background: white;

      overflow: hidden;
      //overflow-x: hidden;
      border-top-left-radius: 18px;
      border-top-right-radius: 4px;
      width: 100%;
      height: 100%;

      border-top: 1.6px solid #1070ff;
      border-left: 1.6px solid #1070ff;
    }

  `,
  Menu: styled(Menu)`
    && {
      height: 400px;
      overflow-y: scroll;
      overflow-x: hidden;
      direction: rtl;

    }

    &&::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
      border-radius: 10px;
      background-color: #fff;
    }

    &&::-webkit-scrollbar {
      width: 2px;
      background-color: #fff;
    }

    &&::-webkit-scrollbar-thumb {
      border-radius: 10px;
      //-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
      background-color: ${Colors.primaryColor};
    }

  `,
  WorkspaceColTitle: styled.h2`
    width: 50%;
    margin: 0 auto;
    display: flex;
    justify-content: space-evenly;
    font-size: 24px;
  `,


  WorkspacesCol: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    @media only screen and (max-width: 577px) {
      margin-bottom: 45px;
    }
  `,

  ChartWorkspacesCol: styled(Col)`
    && {
      float: unset !important;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      //display: inline-block;
      vertical-align: top;
      //width: 100%;
      height: 100%;

      background: #f9fafb;
    }

    @media only screen and (max-width: 577px) {
      margin-bottom: 45px;
    }
  `,
  List: styled.ul`
    list-style-type: none;
    text-align: center;
    padding: 0px;
  `,
  ListText: styled.p`
    margin: 0;
    padding: 0;
    font-size: 1.25em;
  `,
  ListContainer: styled.div`
    text-align: center;
  `,
  ListTitle: styled.p`
    font-size: 1.4em;

  `,
  GraphWrapper: styled.div`
    && > div {
      width: 100%;
      height: 100%;
    }
  `,
  Wrapper: styled.div`
    margin: 10px 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
  `,
  Overview: styled.div`
    display: flex;
    justify-content: space-evenly;
  `,
  EmotionContainer: styled.div`
    display: flex;
  `,
  EmotionLabels: styled.div`
    display: flex;
    justify-content: space-evenly;

    flex-direction: column;
  `,
  EmotionLines: styled.div`
    display: flex;
    justify-content: space-evenly;

    flex-direction: column;

  `,
  EmotionText: styled.p`
    font-size: 1.2em;
    margin: 0 20px 5px;
  `,
  ChartWrapper: styled.div`
    height: 50%;

  `,
  MemberImage: styled.img`
    width: 25px;
    height: 25px;
    margin-left: 12px;
    border-radius: 4px;

  `,
  MemberLine: styled.li`
    display: flex;
    justify-content: space-between;
  `,

  IFrameWrapper: styled.div`

    width: 100%;
    height: calc(100% - 100px);
    flex-grow: 1;

    //aspect-ratio:
    //padding-bottom: 56.25%; /* 16:9, for an aspect ratio of 1:1 change to this value to 100% */
    //overflow: scroll;
  `,
  IFrameContainerWrapperMain: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    padding-top: 100px;
  `,
  IFrameContainerWrapper: styled.div`
    //width: 90%;
    //height: 70.5%;
    //width: 100%;
    //height: 100%;

    height: 85vh;
    //width: 60vw;

    //width: 820px;
    //height: 379px;
  `,
  IFrameContainer: styled.div`
    //height: 100%;
    //width: 100%;


    cursor: ${({noScreensForDemo}) => noScreensForDemo ? 'pointer' : 'auto'};
    height: ${({height}) => height}px; //calc(100% - 142px);
    width: ${({width}) => width}px;
    max-height: calc(100% - 142px);
    max-width: 100%;

    position: relative;
      // padding-bottom: ${(props) => `calc(${(props.height / props.width) * 100}%)`};
    //padding-bottom: 50%;
      // padding-bottom: ${() => (379 / 820) * 100}%;
      //padding-bottom: ${() => 6 / 13 * 100}%;
    overflow: hidden;

    transform-origin: top left;
      // transform: scale(${({iframeScaleX, iframeScaleY}) => `${iframeScaleX}, ${iframeScaleY}`});

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 2px solid ${Colors.primaryColor};
    border-radius: 6px;



  `,
  IFrame: styled.iframe`
    position: absolute;
    //transform: translate(-120px,-50px) scale(0.70);
    //transform: translate(-235px,-50px) scale(0.65);
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    //width: calc(130% + 200px);
    //transform: translate(-30px,-40px) scale(0.85);
    //left: 0;
    //top: 0;

      // width: ${({iframeScaleX}) => iframeScaleX * 100}vw;
      // height: ${({iframeScaleY}) => iframeScaleY * 100}vw;

    width: 100%;
    height: 100%;
    min-height: 100%;
    outline: none;
    overflow: scroll;
      //outline-color: ${Colors.primaryColor};
    transform-origin: top left;
      // transform: scale(${({iframeScaleX, iframeScaleY}) => `${iframeScaleX}, ${iframeScaleY}`});

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
    cursor: pointer;


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
  Omnibox: styled.div`
    background: white;
    width: 100%;
    height: 46px;
    justify-content: flex-start;
    display: flex;
    flex-direction: row;
    align-items: center;
    // border-radius: 6px;
  `,
  OmniIcon: styled(Icon)`
    height: 35px;
    width: 35px;
    margin-left: 10px;
    line-height: 35px;

    && svg {
      border-radius: 25px;
      padding: 5px;
      vertical-align: middle;
      height: 25px;
      width: 25px;
    }

    &&:hover svg {
      cursor: pointer;
      background: #e6e4e4;
    }

  `,
  OmniIconLock: styled(Icon)`
    height: 35px;
    width: 35px;
    margin-left: 10px;
    line-height: 35px;

    && svg {
      border-radius: 25px;
      padding: 5px;
      vertical-align: middle;
      height: 25px;
      width: 25px;
    }


  `,
  AdressBarWrapper: styled.div`
    flex-grow: 2;
    height: 30px;
    background: white;
    color: #111;
    border-radius: 25px;
    margin-left: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    border: 3px solid #f9f9f9;
    background: white;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    ser-select: none;

  `,
  AddressBarText: styled(Input)`
    && {
      flex-grow: 1;
      height: 25px;
      border-radius: 25px;
      margin-left: 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      padding: 0px 10px;
      line-height: 25px;
      font-size: 12px;

      background: white;
      color: #111;

      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;

      border-left: 3px solid #f9f9f9;
      border-top: none;
      border-bottom: none;
      border-right: none;
      background: white;
      border-bottom-left-radius: 0px;
      border-top-left-radius: 0px;

    }


    &&:hover {

      -webkit-box-shadow: none;
      box-shadow: none;
      border-top: none;
    }

    &&:focus-visible {

      -webkit-box-shadow: none;
      box-shadow: none;
      border-top: none;
    }

    &&:focus {

      -webkit-box-shadow: none;
      box-shadow: none;
      border-top: none;
    }

    &&:active {

      -webkit-box-shadow: none;
      box-shadow: none;
      border-top: none;
    }

  `,
  PublishButton: styled(Button)`
    margin: 0px 10px;
    width: 100px;

  `,
  OmniLeftSide: styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;

  `,
  ToolbarButtonWrapper: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 800px;
  `,
  OmniRightSide: styled.div`
    width: 250px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;

    && h1,
    && p {
      margin: 0;
      font-family: ${Colors.fontFamily};
    }

    //margin-right: 85px;
  `,
  ToolbarWrapper: styled.div`
    position: absolute;
    top: 96px;
    right: -21px;
    width: 20px;
    z-index: 5;
  `,
  ShareIcon: styled(Icon)`
    width: 18px;
    height: 18px;

    && svg {
      width: 100%;
      height: 100%;
      fill: ${Colors.primaryColor};
    }
  `,
  Tippy: styled(Tippy)`

    background: none !important;
    //color: #f9f9f9;
    //font-size: 1rem;
    //padding: 5px 10px;
    //max-width: 250px;
    //border-radius: 6px;

    //&& .tippy-arrow::before {
    //  color: #333 !important;
    //}
  `,
  ZoomPlaceholder: styled.div`
    height: 41px;
    margin-bottom: 50px;
  `,
  MobileNotice: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 200px;
    padding: 24px;
    text-align: center;

    span {
      font-size: 1.2em;
      color: #555;
      font-weight: 500;
    }
  `


}


function mapStateToProps(state) {

  return {
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace,
    authData: state.authReducer.authData,
    secureStorage: state.secureStorageReducer,
    currentStoryDemo: state.storyDemoReducer.currentStoryDemo,
    renderSteps: state.storyDemoReducer.renderSteps,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      updateCurrentSelectedWorkspace,
      getWorkspaceEncryptionKey,
      refreshToken,
      getStoryDemo,
      updateStoryDemo
    }, dispatch)
  }
}

// Wrapper component to provide router hooks to functional component
const StoryDemoPageWithRouter = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  return <StoryDemoPage {...props} navigate={navigate} location={location} params={params}/>
}

export default connect(mapStateToProps, mapDispatchToProps)(StoryDemoPageWithRouter)
