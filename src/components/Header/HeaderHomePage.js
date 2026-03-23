import React, { Component } from 'react'
import styled from 'styled-components'
import './styles/Header.scss'
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'
import config from '../../config'

class Header extends Component {
  constructor(props) {
    super(props)


  }


  render() {


    return (
      <ErrorBoundary>
      <HeaderStyled id={'navbar'} className="navbar site-header is-revealing">
        <div style={{position: 'relative', height:'100%'}} className="container">
          <HeaderInner className="site-header-inner">

            <div  style={{position: 'relative', height:'100%'}}  className="brand header-brand">
              <h1  style={{margin: 0, position: 'relative', height:'100%'}}  className="m-0">
                <a style={{position: 'relative', height:'100%', display: 'flex', alignItems: 'center'}} href={config.LANDING_URL}>
                  {/*<Logo src={logo} alt="Blue logo"/>*/}
                  <LogoSvg width="127" height="140" viewBox="0 0 127 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path className={'leftStripes__right'} d="M20.9848 111.181C18.0578 110.396 16.3208 107.388 17.1051 104.461L29.2764 59.0368C30.0607 56.1098 33.0693 54.3727 35.9963 55.157C38.9233 55.9413 40.6604 58.9499 39.8761 61.877L27.7047 107.301C26.9204 110.228 23.9118 111.965 20.9848 111.181Z" fill="black"/>
                    <path className={'leftStripes__left'} d="M5.90436 111.676C2.97734 110.892 1.24031 107.883 2.02461 104.956L14.1959 59.5319C14.9802 56.6048 17.9888 54.8678 20.9159 55.6521C23.8429 56.4364 25.5799 59.445 24.7956 62.372L12.6243 107.796C11.84 110.723 8.83138 112.46 5.90436 111.676Z" fill="#0077E6"/>
                    <path className={'rightStripes__right'} d="M106.543 61.8061C103.616 61.0218 101.879 58.0132 102.663 55.0862L114.834 9.66217C115.619 6.73515 118.627 4.99813 121.554 5.78242C124.481 6.56671 126.218 9.57532 125.434 12.5023L113.263 57.9264C112.478 60.8534 109.47 62.5904 106.543 61.8061Z" fill="#0077E6"/>
                    <path className={'rightStripes__left'} d="M90.9608 62.3012C88.0337 61.5169 86.2967 58.5083 87.081 55.5813L99.2524 10.1572C100.037 7.23023 103.045 5.4932 105.972 6.27749C108.899 7.06179 110.636 10.0704 109.852 12.9974L97.6807 58.4215C96.8964 61.3485 93.8878 63.0855 90.9608 62.3012Z" fill="black"/>
                    <path className={'letterT'} d="M67.9122 63.6704L47.0781 138.139C46.5464 138.324 45.7267 138.509 44.619 138.694C43.5814 138.971 42.5346 139.11 41.4786 139.11C37.2546 139.11 35.6211 137.399 36.5781 133.979L56.2482 63.6704H29.3202C29.1615 63.2081 29.0416 62.6072 28.9605 61.8676C28.9053 61.0355 29.02 60.111 29.3045 59.0941C29.7442 57.5224 30.4644 56.3206 31.4652 55.4885C32.4918 54.564 33.7252 54.1018 35.1652 54.1018H97.5172C97.6758 54.564 97.7828 55.2112 97.838 56.0432C97.9191 56.7828 97.8303 57.6149 97.5717 58.5394C97.132 60.111 96.3988 61.3591 95.3721 62.2836C94.3455 63.2081 93.1122 63.6704 91.6722 63.6704H67.9122Z" fill="black"/>
                  </LogoSvg>
                </a>
              </h1>
            </div>
            <HeaderLinksContainer>
              <LinkStyled href={config.LANDING_URL}>Home</LinkStyled>

              {/*<LinkStyled href="/get-started">*/}
              {/*  <a>Get Started</a>*/}
              {/*</LinkStyled>*/}
              {/*<LinkStyled href="/login">*/}
              {/*  <a>Login</a>*/}
              {/*</LinkStyled>*/}
            </HeaderLinksContainer>

          </HeaderInner>
        </div>
      </HeaderStyled>
      </ErrorBoundary>
    )
  }
}

const Logo = styled.img`
    width: 50px;
    height: 50px;
    background: #f4ffee;
    border: 2px solid rgba(0,119,230,0.96);
    border-radius: 15px;
    margin-right: 15px;
    
 
`
const LogoSvg = styled.svg`
    width: 50px;
    height: 50px;
    background: #ffffff;
    border: 2px solid rgba(0,119,230,0.96);
    border-radius: 15px;
    margin-right: 15px;
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

const HeaderStyled = styled.header`

  visibility: visible;
  z-index: 1;
  position: relative;
  height: 100%;

  top: 0;
`

const LinkStyled = styled.a`
  cursor: pointer;
  position: relative;
  height: 100%;

  &&&&:hover {
    color: black;
  }
`

const HeaderInner = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  justify-content: space-between;
`

const HeaderLinksContainer = styled.nav`
  position: relative;
  height: 100%;

  font-size: 18px;
  margin-top: 10px;
  width: 95%;
`

// const LinkStyled = styled(Link)`
//   display: inline-block;
//   margin-left: 10px;
// `

export default Header
