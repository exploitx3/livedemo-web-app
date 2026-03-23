import React, { Component } from 'react'
import logo from '../../../../static/images/logo-round.svg'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import config from '../../../../config'
import mainColors from '../../../../constants/mainColors'
import {demoAuthenticate} from '../../../../actions/authActions'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

class Header extends Component {
  constructor(props) {
    super(props)

    this.authenticateDemo = this.authenticateDemo.bind(this)
  }

  authenticateDemo() {

    return this.props.actions.demoAuthenticate()
  }


  render() {


    return (
      <HeaderStyled>
        <HeaderInner>
          <a href={config.LANDING_URL}>
            <LogoSvg width="127" height="140" viewBox="0 0 127 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path className={'leftStripes__right'}
                    d="M20.9848 111.181C18.0578 110.396 16.3208 107.388 17.1051 104.461L29.2764 59.0368C30.0607 56.1098 33.0693 54.3727 35.9963 55.157C38.9233 55.9413 40.6604 58.9499 39.8761 61.877L27.7047 107.301C26.9204 110.228 23.9118 111.965 20.9848 111.181Z"
                    fill="black"/>
              <path className={'leftStripes__left'}
                    d="M5.90436 111.676C2.97734 110.892 1.24031 107.883 2.02461 104.956L14.1959 59.5319C14.9802 56.6048 17.9888 54.8678 20.9159 55.6521C23.8429 56.4364 25.5799 59.445 24.7956 62.372L12.6243 107.796C11.84 110.723 8.83138 112.46 5.90436 111.676Z"
                    fill="#0077E6"/>
              <path className={'rightStripes__right'}
                    d="M106.543 61.8061C103.616 61.0218 101.879 58.0132 102.663 55.0862L114.834 9.66217C115.619 6.73515 118.627 4.99813 121.554 5.78242C124.481 6.56671 126.218 9.57532 125.434 12.5023L113.263 57.9264C112.478 60.8534 109.47 62.5904 106.543 61.8061Z"
                    fill="#0077E6"/>
              <path className={'rightStripes__left'}
                    d="M90.9608 62.3012C88.0337 61.5169 86.2967 58.5083 87.081 55.5813L99.2524 10.1572C100.037 7.23023 103.045 5.4932 105.972 6.27749C108.899 7.06179 110.636 10.0704 109.852 12.9974L97.6807 58.4215C96.8964 61.3485 93.8878 63.0855 90.9608 62.3012Z"
                    fill="black"/>
              <path className={'letterT'}
                    d="M67.9122 63.6704L47.0781 138.139C46.5464 138.324 45.7267 138.509 44.619 138.694C43.5814 138.971 42.5346 139.11 41.4786 139.11C37.2546 139.11 35.6211 137.399 36.5781 133.979L56.2482 63.6704H29.3202C29.1615 63.2081 29.0416 62.6072 28.9605 61.8676C28.9053 61.0355 29.02 60.111 29.3045 59.0941C29.7442 57.5224 30.4644 56.3206 31.4652 55.4885C32.4918 54.564 33.7252 54.1018 35.1652 54.1018H97.5172C97.6758 54.564 97.7828 55.2112 97.838 56.0432C97.9191 56.7828 97.8303 57.6149 97.5717 58.5394C97.132 60.111 96.3988 61.3591 95.3721 62.2836C94.3455 63.2081 93.1122 63.6704 91.6722 63.6704H67.9122Z"
                    fill="black"/>
            </LogoSvg>
          </a>
          <HeaderLinksContainer>
            <LinkStyled  href={config.LANDING_URL}>
              Home
            </LinkStyled>
            <DemoButton onClick={this.authenticateDemo}>
              Live Demo
            </DemoButton>
          </HeaderLinksContainer>

        </HeaderInner>
      </HeaderStyled>
    )
  }
}

const HeaderStyled = styled.header`
  //// visibility: hidden;
  //z-index: 1;
  //padding-top: 15px;
  //width: 100%;
  //position: absolute;
  //top: 0;
  height: 65px;
  max-height: 65px;
  font-size: 18px;
  padding-top: 1px;
  visibility: visible;
  z-index: 1;
  top: 0;
  
  //background: ${mainColors.primaryColor};
  //background: white;
  transition: 0.4s all ease-in-out;
  position: absolute;

  top: 0;
  left: 0;
  right: 0;
  border: 0;
  border-radius: 3px;
  //box-shadow: 0 10px 20px -12px rgba(0,0,0,.42), 0 3px 20px 0 rgba(0,0,0,.12), 0 8px 10px -5px rgba(0,0,0,.2);

  
 

`

const DemoButton = styled.span`
   && {
      min-width: 155px;
      text-align: center;
      //margin: 20px auto;
      // background: ${mainColors.thirdColor};
      color: ${mainColors.thirdColor};
      display: inline-block;
      //padding: 1.375rem 2.625rem 1.375rem 2.625rem;
      padding: 15px 25px;
      //border: 2px solid white;
      border-radius: 2rem;
      font: 700 1.1em/0 'Baloo Chettan 2', cursive;
      text-decoration: none;
      transition: all 0.2s; 
      cursor: pointer;

    }
    
    &&:hover {
      background: white;
      color: ${mainColors.primaryColor};
      border: 2px solid ${mainColors.primaryColor};
      cursor: pointer;
    }

`
const LinkStyled = styled.a`
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1em;
  margin-right: 40px;
  color: ${mainColors.thirdColor};
  
  &:hover {
    text-decoration: underline;
    color: black;  
  }
`

const HeaderInner = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin: 0 auto;
    width: 70%;
`

const HeaderLinksContainer = styled.nav`
  width: 90%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: 15px;
`
const LogoSvg = styled.svg`
    width: 50px;
    height: 50px;
    background: #ffffff;
    border: 2px solid rgba(0,119,230,0.96);
    border-radius: 15px;
    margin-right: 5px;
    transition: all 1s;
    
    &:hover { 
        background: #000000;
        border-color: #0077E6;
        cursor: pointer;
    }
    
    &:hover .leftStripes__right,
    &:hover .rightStripes__left {
            fill: #ffffff;
    }
    
    &:hover .leftStripes__left,
    &:hover .rightStripes__right {
      fill: #0077E6;
    }
    
    &:hover .letterT {
            fill: #ffffff;

    }
`

function mapDispatchToProps(dispatch) {
  return {

    actions: bindActionCreators({ demoAuthenticate: demoAuthenticate }, dispatch)

  }
}

export default connect(null, mapDispatchToProps)(Header)
