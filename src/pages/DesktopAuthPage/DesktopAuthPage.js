import React, { useEffect, useRef, useState } from 'react'
//import { Carousel, Form, Layout, Menu, Modal, Tabs } from 'antd'
import Carousel from 'antd/es/carousel'
import Form from 'antd/es/form'
import Layout from 'antd/es/layout'
import Menu from 'antd/es/menu'
import Modal from 'antd/es/modal'
import Tabs from 'antd/es/tabs'

import 'antd/es/carousel/style'
import 'antd/es/form/style'
import 'antd/es/layout/style'
import 'antd/es/menu/style'
import 'antd/es/modal/style'
import 'antd/es/tabs/style'


import Header from './components/Header/Header'
import Spinner from '../../components/Spinner/Spinner'
import IconTextButton from '../../components/IconTextButton/IconTextButton'
import Icon from '../../components/Icon/Icon'
import styled from 'styled-components'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { updateCurrentSelectedWorkspace } from '../../actions/workspacesActions'
import { refreshToken } from '../../actions/authActions'
import { getWorkspaceEncryptionKey } from '../../actions/secureStorageActions'
import mainColors from '../.././constants/mainColors'
import AutoRecordingStatuses from '../.././constants/AutoRecordingStatuses'
import ENV from '../../config'
import axios from '../../utils/axiosInstance'


const { Content, Footer, Sider } = Layout
const { confirm } = Modal
const { getFieldDecorator } = Form
const { TabPane } = Tabs
const { SubMenu } = Menu


const DesktopAuthPage = ({ collapsed, currentSelectedWorkspace, authData }) => {

  let innerHeight = window.innerHeight
  let innerWidth = window.innerWidth

  console.log('authData ')
  console.log(JSON.stringify(authData, null, 2))

  console.log('currentSelectedWorkspace')
  console.log(JSON.stringify(currentSelectedWorkspace, null, 2))


  function openDesktopApp(workspaceId, autoRecordingId, authToken) {
    const userName = authData && authData.name ? encodeURIComponent(authData.name) : '';
    const token = authToken || (authData && authData.token ? authData.token : '');
    let url = `livedemo://auth?authToken=${token}&userName=${userName}&workspaceId=${workspaceId}`;
    // url = "livedemo://auth?authToken=5a24c06752b4a5098d62de7d30f88429f8f4d207b1de060e9b8aca243dab1f81&userName=George%20Apostolov&workspaceId=694dcb7155ee437ee86b8bb5"
    console.log('opening desktop app with url', url)
    window.location.href = url;
  }



  // useEffect(() => {
    

  // }, [])


  return (
    <React.Fragment>
      <Header
        workspaceName={currentSelectedWorkspace && currentSelectedWorkspace.name}
        authData={authData}
        style={{ boxShadow: 'none' }}
      />
      <S.Content>
        <S.Wrapper>
          <S.AutoRecordingDescriptionWrapper>
            <S.AutoRecordingTitle>Open the Desktop App</S.AutoRecordingTitle>
            <S.GenerateLiveDemoButtonWrapper>
              <IconTextButton
                onClick={() => {
                  openDesktopApp(currentSelectedWorkspace._id, authData.token)
                  }}
                  img={
                    <S.LiveDemoIcon
                      width="24"
                      height="24"
                      viewBox="0 0 94 106"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        className="icon-inner-layer"
                        d="M0.5 6.85552C0.5 3.52841 3.43103 0.963143 6.72881 1.40402L76.0839 10.6761C85.7686 11.9708 93 20.2333 93 30.0041V82.0433C93 89.997 86.9798 96.6599 79.0668 97.4639L6.55596 104.831C3.31524 105.161 0.5 102.617 0.5 99.3595V6.85552Z"
                        fill={mainColors.primaryColor}
                        stroke="#999"
                      />
                      <path
                        className="icon-play"
                        d="M31 35.6795C31 31.0607 36 28.1739 40 30.4833L70 47.8039C74 50.1133 74 55.8868 70 58.1962L40 75.5167C36 77.8261 31 74.9393 31 70.3205L31 35.6795Z"
                        fill="white"
                      />
                      <path
                        className="icon-play"
                        d="M31 35.6795C31 31.0607 36 28.1739 40 30.4833L70 47.8039C74 50.1133 74 55.8868 70 58.1962L40 75.5167C36 77.8261 31 74.9393 31 70.3205L31 35.6795Z"
                        stroke={mainColors.primaryColor}
                        strokeWidth="3"
                      />
                      <path
                        className="icon-play-outline"
                        d="M31 35.6795C31 31.0607 36 28.1739 40 30.4833L70 47.8039C74 50.1133 74 55.8868 70 58.1962L40 75.5167C36 77.8261 31 74.9393 31 70.3205L31 35.6795Z"
                        stroke="white"
                        strokeOpacity="0.15"
                        strokeWidth="3"
                      />
                    </S.LiveDemoIcon>
                  }
                  text="Open Desktop App"
                  buttonStyles={{
                    backgroundColor: `white !important`,
                    color: '#111 !important',
                    border: `2px solid ${mainColors.primaryColor} !important`,
                    cursor: 'pointer',
                  }}
                  textStyles={{
                    color: '#111 !important',
                    fontSize: '1em',
                  }}
                  isImgOnLeftSide={false}
                />
              </S.GenerateLiveDemoButtonWrapper>
            </S.AutoRecordingDescriptionWrapper>
          </S.Wrapper>
        </S.Content>
    </React.Fragment>
  )
}

const S = {
  Icon: styled(Icon)`
    width: 15px;
    height: 15px;

    && svg {
      width: 100% !important;
      height: 100% !important;
    }
  `,

  Content: styled(Content)`
    && {
      background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
      overflow: scroll;
      width: 100%;
      height: 100%;
      padding: 60px 80px;

      @media screen and (max-width: 700px) {
        padding: 30px 20px;
      }
    }
  `,
  Wrapper: styled.div`
    width: 100%;
    max-width: 1400px;
    height: ${({ wrapperHeight }) => (wrapperHeight ? wrapperHeight : '100%')};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    margin: 0 auto;

    @media screen and (max-width: 450px) {
      width: 100%;
    }

    //iphone 13
    @media only screen
    and (device-width: 390px)
    and (device-height: 844px)
    and (-webkit-device-pixel-ratio: 3) {
      height: 70%;
    }
  `,
  LoadingWrapper: styled.div`
    width: 100%;
    height: 100%;
    position: relative;

    //&& .spinner {
    //  width: 70px;
    //  height: 70px;
    //}
  `,
  LoadingCarousel: styled(Carousel)`
    && {
      z-index: 5;
    }

    && .slick-slide {
      text-align: center;
      height: 160px;
      line-height: 160px;
      overflow: hidden;
    }

    && .slick-slide h3 {
      color: #fff;
    }
  `,
  LoadingText: styled.h2`
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 100%;
    font-size: 1.7em;
    font-weight: 500;
    color: #111;
    font-family: ${mainColors.fontFamily};
    padding-bottom: 30px;
    text-align: center;

  `,
  Spinner: styled(Spinner)`
    &&.spinner {
      width: 100px;
      height: 100px;
    }
  `,
  AutoRecordingWrapper: styled.div`
    width: 100%;
    position: relative;
  `,
  DemoSuggestionsList: styled.div`
    display: flex;
    flex-direction: row;
    gap: 24px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 20px 10px 30px 10px;
    width: 100%;
    justify-content: center;

    &::-webkit-scrollbar {
      height: 10px;
    }

    &::-webkit-scrollbar-track {
      background: #f0f0f0;
      border-radius: 5px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 5px;

      &:hover {
        background: #a1a1a1;
      }
    }

    @media screen and (max-width: 700px) {
      gap: 16px;
      padding: 10px 5px 20px 5px;
    }
  `,
  DemoSuggestionItem: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 0 0 auto;
    min-width: 320px;
    max-width: 380px;
    width: 100%;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 20px;
    border-radius: 12px;
    background: ${props => props.isSelected ? mainColors.primaryColor : '#ffffff'};
    border: 2px solid ${props => props.isSelected ? mainColors.primaryColor : '#e8e8e8'};
    box-shadow: ${props => props.isSelected ? '0 8px 24px rgba(24, 144, 255, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.08)'};

    &:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 12px 32px rgba(24, 144, 255, 0.2);
      background: ${props => props.isSelected ? mainColors.primaryColor : '#ffffff'};
      border-color: #1890ff;
    }

    @media screen and (max-width: 700px) {
      min-width: 280px;
      max-width: 320px;
      padding: 16px;
    }
  `,
  DemoSuggestionThumbnailWrapper: styled.div`
    width: 100%;
    aspect-ratio: 16 / 9;
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
    transition: all 0.3s ease;
    background: #f5f5f5;

    &:hover {
      box-shadow: 0 6px 20px rgba(24, 144, 255, 0.25);
    }
  `,
  DemoSuggestionThumbnail: styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  `,
  DemoSuggestionName: styled.h3`
    font-size: 1.1em;
    font-weight: 600;
    color: ${props => props.isSelected ? '#ffffff' : '#1a1a1a'};
    font-family: ${mainColors.fontFamily};
    text-align: center;
    margin: 0 0 16px 0;
    padding: 0 4px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 4.5em;
    transition: color 0.3s ease;

    @media screen and (max-width: 700px) {
      font-size: 1em;
      min-height: 4em;
    }
  `,
  DemoSuggestionStepsList: styled.ol`
    list-style: none;
    counter-reset: step-counter;
    margin: 16px 0 0 0;
    padding: 16px;
    width: 100%;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e8e8e8;

    @media screen and (max-width: 700px) {
      margin: 12px 0 0 0;
      padding: 12px;
    }
  `,
  DemoSuggestionStepItem: styled.li`
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
    font-size: 0.9em;
    line-height: 1.6;
    color: #333;
    font-family: ${mainColors.fontFamily};

    &:last-child {
      margin-bottom: 0;
    }

    @media screen and (max-width: 700px) {
      font-size: 0.85em;
      margin-bottom: 10px;
    }
  `,
  DemoSuggestionStepNumber: styled.span`
    margin-right: 10px;
    font-weight: 700;
    flex-shrink: 0;
    font-size: 1.05em;
    line-height: 2em;
  `,
  DemoSuggestionStepExplanation: styled.span`
    font-family: Roboto;
    flex: 1;
    color: #1a1a1a;
    font-size: 1.3em;
  `,
  IFrameWrapper: styled.div`
    width: 100%;
    height: 100%;
    position: relative;

    //padding-bottom: 56.25%;
    padding-bottom: ${({ scalePercentage }) => scalePercentage}%;
    //max-width: 956px;
    border-radius: 6px;


  `,
  IFrame: styled.iframe`
    position: absolute;
    top: 0;
    left: 0;
    //transform: scale(0.6555) translateZ(0) perspective(1px);
    backface-visibility: hidden;
    -webkit-font-smoothing: subpixel-antialiased;


    //margin-top: 25px;

    //aspect-ratio: 16 / 9;
    height: 100%;
    width: 100%;
    outline: none;
    border: none;
    border-radius: 6px;
  `,
  AutoRecordingDescriptionWrapper: styled.div`
    width: 100%;
    margin-bottom: 40px;
    text-align: center;

    @media screen and (max-width: 700px) {
      margin-bottom: 30px;
    }
  `,
  AutoRecordingTitle: styled.h2`
    font-size: 1.6em;
    font-weight: 600;
    color: #1a1a1a;
    font-family: ${mainColors.fontFamily};
    text-align: center;
    margin: 0 0 24px 0;
    line-height: 1.3;
    letter-spacing: -0.02em;

    @media screen and (max-width: 700px) {
      font-size: 1.5em;
      margin-bottom: 20px;
    }
  `,
  GenerateLiveDemoButtonWrapper: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 8px;
  `,
  LiveDemoIcon: styled.svg`
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  `
}


function mapStateToProps(state) {
  return {
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace,
    authData: state.authReducer.authData,
    secureStorage: state.secureStorageReducer
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ updateCurrentSelectedWorkspace, getWorkspaceEncryptionKey, refreshToken }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DesktopAuthPage)
