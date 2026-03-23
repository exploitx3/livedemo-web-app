import styled, { keyframes } from 'styled-components'
import React, { Component, useState } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Login from '../../components/Login/Login'
import Registration from '../../components/Registration/Registration'
import Header from './components/Header/Header'
//import { Row, Col } from 'antd'

import Row from 'antd/es/row'
import Col from 'antd/es/col'

import MainColors from '../../constants/mainColors'

function HomePage() {

  return (
    <S.HomePage>
      <Header/>

      <S.Title>Login | Register</S.Title>
      <S.Main>
        <S.Row type={'flex'} justify={'center'}>
          <S.ColLogin span={10}>
            <Login/>
          </S.ColLogin>
          <Col span={4}/>
          <S.ColRegistration span={10}>
            <Registration/>
          </S.ColRegistration>
        </S.Row>
      </S.Main>

    </S.HomePage>
  )
}

export default HomePage

const A = {
  blueGreenGradient: keyframes`
      0%{background-position:57% 0%}
      50%{background-position:44% 100%}
      100%{background-position:57% 0%}
  `
}

const S = {
  Title: styled.h1`
    font-family: "Oxygen-Bold", sans-serif;
    text-align: center;
    color: white;
    font-size: 1.4rem;
    padding-top: 60px;
  `,
  Main: styled.main`
    color: ${MainColors.App.HomePage.inputText};
    display: flex;
    //align-items: space-between;
    margin-top: 25px;
  `,
  HomePage: styled.div`
    width: 100%;
    height: 100%;
    display: block;
    background: linear-gradient(90deg, white 21px, transparent 1%) center, linear-gradient(white 21px, transparent 1%) center, #1890ff;
    background-size: 22px 22px;    // animation: ${A.blueGreenGradient} 17s ease infinite;
  `,
  Row: styled(Row)`
    margin: 0 auto;
    width: 100%;
    background: rgba(57,191,233,0.8);
    border-top-left-radius: 350px;
    border-top-right-radius: 75px;
    padding-top: 10px;
    margin-top: 45px;
    margin-bottom: 45px;
  `,
  Col: styled(Col)`
    &.ant-col-10 {
      font-size: 20px;
      display: flex;
      justify-content: center;
      padding: 10px 20px;
      background:  ${MainColors.App.HomePage.formBackground}; 
      border-radius: 4px;
      box-shadow: 0 10px 20px -12px rgba(0,0,0,.42), 0 3px 20px 0 rgba(0,0,0,.12), 0 8px 10px -5px rgba(0,0,0,.2), 0 -12px 63px -10px rgba(255, 255, 255, 0.72);
      height: 450px;
   }
  `,
  ColLogin: styled(Col)`
    &.ant-col-10 {
      color: ${MainColors.App.HomePage.inputText};
      display: flex;
      justify-content: center;
      //padding: 10px 0px 10px 50px;
      background: linear-gradient(180deg, #ffffff, ${MainColors.fourthColor});
      border-radius: 4px;
      box-shadow: 0 10px 20px -12px rgba(0,0,0,.42), 0 3px 20px 0 rgba(0,0,0,.12), 0 8px 10px -5px rgba(0,0,0,.2), 0 -12px 63px -10px rgba(255, 255, 255, 0.72);
      height: 450px;
      //border-bottom-right-radius: 2000px;
      //border-bottom-left-radius: 0px;
      //border-top-left-radius: 6000px;
      padding-top: 55px;
      //border-top-right-radius: 75px;
      margin-top: -45px;
   }
  `,
  ColRegistration: styled(Col)`
    &.ant-col-10 {
    text-align: center:
      display: flex;
    justify-content: center;
    padding: 10px 40px;
    background: linear-gradient(180deg, #ffffff, ${MainColors.fourthColor});
    border-radius: 4px;
    box-shadow: 0 10px 20px -12px rgba(0,0,0,.42), 0 3px 20px 0 rgba(0,0,0,.12), 0 8px 10px -5px rgba(0,0,0,.2), 0 -12px 63px -10px rgba(255, 255, 255, 0.72);
    height: 450px;
    //border-bottom-left-radius: 150px;
    //border-bottom-right-radius: 0px;
    //border-top-right-radius: 100px;
    padding-top: 55px;
    margin-top: -45px;
   }
  `
}
