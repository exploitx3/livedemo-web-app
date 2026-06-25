import React from 'react'
import styled from 'styled-components'
import Layout from 'antd/es/layout'
import 'antd/es/layout/style'
import mainColors from '../../../constants/mainColors'
import Logo from '../../../static/images/logo-round.svg'

const LayoutHeader = Layout.Header

export default function UrlPreviewTopBar({ title, rightSideComponent }) {
  return (
    <S.Header>
      <S.Left>
        <S.LogoLink href="https://app.livedemo.ai">
          <img src={Logo} alt="LiveDemo" style={{ height: 28, width: 28, borderRadius: 6 }} />
        </S.LogoLink>
        <S.Divider />
        <S.Title>{title}</S.Title>
      </S.Left>
      {rightSideComponent && (
        <S.Right>{rightSideComponent}</S.Right>
      )}
    </S.Header>
  )
}

const S = {
  Header: styled(LayoutHeader)`
    &.ant-layout-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 25px;
      background: ${mainColors.App.sidebarColor};
      z-index: 300;
      position: sticky;
      top: 0;
      width: 100%;
      height: 64px;
      flex-shrink: 0;
      box-sizing: border-box;
    }
  `,
  Left: styled.div`
    display: flex;
    align-items: center;
    gap: 0;
    flex: 1;
  `,
  LogoLink: styled.a`
    display: flex;
    align-items: center;
    text-decoration: none;
    flex-shrink: 0;
  `,
  Divider: styled.div`
    width: 1px;
    height: 20px;
    background: #e5e7eb;
    flex-shrink: 0;
    margin: 0 12px;
  `,
  Title: styled.span`
    font-family: ${mainColors.fontFamily};
    font-size: 14px;
    color: ${mainColors.primaryText};
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  Right: styled.div`
    display: flex;
    align-items: center;
    flex-shrink: 0;
  `,
}
