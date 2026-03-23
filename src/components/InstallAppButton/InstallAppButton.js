import React from 'react'
import styled from 'styled-components'

import mainColors from '../../constants/mainColors'
import chromeIconImg from '../../static/images/chrome_icon_128.png'
// //import { Button, Col, Layout, Modal } from 'antd'

import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Layout from 'antd/es/layout'
import Modal from 'antd/es/modal'

const InstallAppButton = ({ onClick }) => {


  return (
    <IAB.InstallAppWrapper onClick={onClick}>
      <IAB.ChromeIconWrapper>
        <IAB.ChromeIcon src={chromeIconImg}/>
      </IAB.ChromeIconWrapper>
      <IAB.InstallAppText>
        Install chrome app
      </IAB.InstallAppText>
    </IAB.InstallAppWrapper>
  )
}


const IAB = {

  InstallAppWrapper: styled.div`
    display: flex;
    background: #f9f9f9;
    border-radius: 6px;
    width: 200px;
    transition: 0.3s ease-in-out;
    border: 1px solid transparent;
    cursor: pointer;
    
    &:hover {
      background: #f1f1f1;
      border: 1px solid ${mainColors.primaryColor};
      
    }
  `,
  InstallAppText: styled.p`
    margin: 0px;
    font-family: ${mainColors.fontFamily};
    color: #111;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  `,
  ChromeIconWrapper: styled.span`
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    
    
  `,
  ChromeIcon: styled.img`
    width: 40px;
    height: 40px;
    box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
    border-radius: 50%;
    
  `
}

export default InstallAppButton
