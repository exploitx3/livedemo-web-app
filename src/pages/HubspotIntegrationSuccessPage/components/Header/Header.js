import React from 'react'
import PropTypes from 'prop-types'
import { NavLink, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Icon from '../../../../components/Icon/Icon'
import Layout from 'antd/es/layout'
import ErrorBoundary from '../../../../components/utilComponents/HOCs/ErrorBoundary'
import mainColors from '../../../../constants/mainColors'
import IconTextButton from '../../../../components/IconTextButton/IconTextButton'

const LayoutHeader = Layout.Header

const Header = (props) => {
  const navigate = useNavigate()
  let { authData } = props
  let workspaceName = props.workspaceName ? props.workspaceName : ''

  return (
    <ErrorBoundary>
      <S.Header style={props.style ? props.style : {}} title={props.title}>
        <S.LeftSide>
          <S.Breadcrumbs>
            <S.Breadcrumbs__Link className={'Breadcrumbs__WorkspaceName'} to={'/'}>
              <S.Breadcrumbs__Text>{workspaceName}</S.Breadcrumbs__Text>
            </S.Breadcrumbs__Link>
            <S.Seperator>/</S.Seperator>
            <S.Breadcrumbs__Text>HubSpot Integration</S.Breadcrumbs__Text>
          </S.Breadcrumbs>
        </S.LeftSide>
        <S.RightSide>
          {(!authData || !authData.token) ? (
            <IconTextButton
              loading={false}
              onClick={(e) => {
                navigate(`/login`)
              }}
              img={undefined}
              text={'Sign in'}

              textStyles={{
                fontSize: '1.1em',
                color: 'white'
              }}
              buttonStyles={{
                background: mainColors.primaryColor,
                marginLeft: '10px',
                boxShadow: 'none',
                justifyContent: 'center',
                width: '75px',
                height: '36px',
                borderRadius: '6px',
                '&:hover': {
                  background: mainColors.primaryColor
                },
                '&:active': {
                  background: mainColors.primaryColor
                },
                '&:focus': {
                  background: mainColors.primaryColor
                }
              }}

            />
          ) : (<React.Fragment></React.Fragment>)
          }

        </S.RightSide>
      </S.Header>
    </ErrorBoundary>
  )
}

const S = {
  LeftSide: styled.span`
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  `,
  RightSide: styled.span`
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-self: flex-end;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 400px) {
      display: none;
    }

  `,
  Breadcrumbs: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  `,
  Breadcrumbs__Link: styled(NavLink)`
    &&.Breadcrumbs__WorkspaceName {
      @media (max-width: 400px) {
        display: none;
      }
    }
  `,
  Breadcrumbs__Text: styled.p`
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 500px;
    font-size: 0.8em;
    color: #111;

    @media (max-width: 700px) {
      max-width: 350px;
      flex-grow: 1;
    }

    @media (max-width: 600px) {
      max-width: 250px;
    }

    @media (max-width: 500px) {
      max-width: 200px;
    }

    @media (max-width: 400px) {
      max-width: 75vw;
    }

  `,
  Seperator: styled.span`
    color: #e5e7eb;
    margin: 0px 10px;
  `,
  Header: styled(LayoutHeader)`
    && h1,
    && p {
      margin: 0;
      font-family: ${mainColors.fontFamily};

    }

    border-bottom: 1px solid #e5e7eb;

    font-size: 1.4em;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;

    &.ant-layout-header {
      text-transform: capitalize;
      z-index: 2;
      padding: 0px 25px;
      background: ${mainColors.App.sidebarColor};
      position: relative;
      width: 100%;
      @media (min-width: 567px) {

        //box-shadow: 0px 1px 10px #aaaaaa;
      }

    }

    && h1 {
      color: ${mainColors.primaryText};
      font-size: 1.2em;

    }

    @media (max-width: 567px) {
      //&& {
      //  width: 50%;
      //}
      && h1 {
        width: 90%;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

      }

      && p {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

    }

  `
}

Header.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
}

export default Header

