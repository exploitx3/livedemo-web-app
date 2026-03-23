import styled, { keyframes } from 'styled-components'
import React from 'react'
import Login from '../../components/Login/Login'
import Header from './components/Header/Header'
//import { Col, Row } from 'antd'

import Col from 'antd/es/col'
import Row from 'antd/es/row'
import {useHistory} from 'react-router-dom'


import MainColors from '../../constants/mainColors'

function LoginPage() {
  const history = useHistory()

  return (
    <S.HomePage>
      <Header/>

      <S.Title>
        <S.Login className={'login'}>Login</S.Login>
        <S.Splitter className={'splitter'}></S.Splitter>
        <S.Register onClick={() => {
          history.push('/register')
        }} className={'register'}>Register</S.Register>
      </S.Title>
      <S.Main>
        <S.Row type={'flex'} justify={'center'}>
          <S.ColLogin xs={24} sm={9} lg={9}>
            <Login/>
          </S.ColLogin>
        </S.Row>
      </S.Main>

    </S.HomePage>
  )
}

export default LoginPage

const A = {
  blueGreenGradient: keyframes`
      0%{background-position:57% 0%}
      50%{background-position:44% 100%}
      100%{background-position:57% 0%}
  `
}

const S = {
  Title: styled.h1`
    //background: ${MainColors.primaryColor};
    //border: 2px solid white;
    //border-radius: 14px;
    display: flex;
    justify-content: space-evenly;
    transition: all 0.4s ease-in-out;
    
    &:hover {
      .splitter {
        visibility: visible;    
        margin-left: 0px; 
        margin-right: 0; 
        //width: 5px;
        height: 0;
        background: white;
        width: 1px;
            transition: all 0.4s ease-in-out;

      }
    }
    align-items: center;
    width: 200px;
    height: 48px;
    position: relative;
    margin: 0 auto;
    font-family: "Oxygen-Bold", sans-serif;
    text-align: center;
    color: white;
    font-size: 1.4rem;
  `,
  Login: styled.span`
      border-top-left-radius: 14px;
      border-bottom-left-radius: 14px;
      border: 2px solid ${MainColors.primaryColor};
      border-right-width: 0px;
      padding: 5px;
      flex-grow: 1;
      color: ${MainColors.primaryColor};
      &:hover {
        background: ${MainColors.primaryColor};
        color: white;
        cursor: pointer;
        transition: all 0.4s ease-in-out;
      
      }
      transition: all 0.4s ease-in-out;
  `,
  Splitter: styled.span`
    
    padding: 0px; 
    transition: all 1s ease-in-out;
    //margin: 5px;
    margin-left: 13px;
    margin-right: 13px; 
    width: 1px;
    height: 140%;
    background: ${MainColors.primaryColor};
    visibility: visible;


`,
  Register: styled.span`
          border-top-right-radius: 14px;
      border-bottom-right-radius: 14px;
      border: 2px solid ${MainColors.primaryColor};
      border-left-width: 0px;
      padding: 5px;
      flex-grow: 1;
      color: ${MainColors.primaryColor};
      &:hover {
        background: ${MainColors.primaryColor};
        color: white;
        cursor: pointer;

      }
          transition: all 1s ease-in-out;


`,
  Main: styled.main`
    color: ${MainColors.App.HomePage.inputText};
    display: flex;
    //align-items: space-between;
    
    width: 100%;
    padding: 0;
    height: 80%;  
    margin-top: 25px;
`,

  HomePage: styled.div`
    padding-top: 80px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    //background: linear-gradient(180deg, ${MainColors.primaryColor}, ${MainColors.secondaryColor});
    background: linear-gradient(90deg, #f9f9f9 21px, transparent 1%) center, linear-gradient(#f9f9f9 21px, transparent 1%) center, #1890ff;
    background-size: 22px 22px;
    // animation: ${A.blueGreenGradient} 17s ease infinite;
  `,
  Row: styled(Row)`
    margin: 0 auto;
    width: 80%;
    //background: rgba(57,191,233,0.8);
    border-top-left-radius: 350px;
    border-top-right-radius: 75px;
    height: 80%;
  `,
  Col: styled(Col)`
    &.ant-col-9 {
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
    &.ant-col-9 {
      color: ${MainColors.App.HomePage.inputText};
      display: flex;
      justify-content: center;
      //padding: 10px 0px 10px 50px;
      background: linear-gradient(180deg,#ffffff,#daedff);
      border-radius: 4px;
      box-shadow: 0 10px 20px -12px rgba(0,0,0,.42), 0 3px 20px 0 rgba(0,0,0,.12), 0 8px 10px -5px rgba(0,0,0,.2), 0 -12px 63px -10px rgba(255, 255, 255, 0.72);
      height: 100%;
      //border-bottom-right-radius: 2000px;
      //border-bottom-left-radius: 0px;
      //border-top-left-radius: 6000px;

   }
   &.ant-col-xs-24 {
      color: ${MainColors.App.HomePage.inputText};
      display: flex;
      justify-content: center;
      
      //padding: 10px 0px 10px 50px;
      background: linear-gradient(180deg,#ffffff,#daedff);
      border-radius: 4px;
      box-shadow: 0 10px 20px -12px rgba(0,0,0,.42), 0 3px 20px 0 rgba(0,0,0,.12), 0 8px 10px -5px rgba(0,0,0,.2), 0 -12px 63px -10px rgba(255, 255, 255, 0.72);
      height: 100%;
      //border-bottom-right-radius: 2000px;
      //border-bottom-left-radius: 0px;
      //border-top-left-radius: 6000px;

   }
  `
}
