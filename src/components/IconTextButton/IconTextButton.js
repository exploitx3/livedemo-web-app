import React from 'react'
import styled from 'styled-components'
import Colors from '../../constants/mainColors'
//import { Button } from 'antd'

import Button from 'antd/es/button'

const IconTextButton = ({ onClick, loading, img, text, buttonStyles, textStyles, disabled = false, isImgOnLeftSide = true }) => {
  let isImgComponent = typeof img !== 'string'
  let imgComp = isImgComponent ? img : <S.Image src={img} alt='button-image'/>

  let textStylesInternal = textStyles ? textStyles : {}

  return (
    <S.Button onClick={onClick} loading={loading} buttonStyles={buttonStyles} disabled={disabled} >
      {!loading && isImgOnLeftSide ? imgComp : ''}
      <S.Text textStyles={textStylesInternal}>{text}</S.Text>
      {!loading && !isImgOnLeftSide ? imgComp : ''}
    </S.Button>
  )
}

const S = {
  Button: styled(Button)(props => ({

    color: '#8d9599',
    textAlign: 'center',
    display: 'flex',
    border: 'solid 1px #dae3f2',
    height: '50px',
    width: '300px',
    borderRadius: '5px',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgb(0 0 0 / 5%)',
    '&:hover': {
      cursor: 'pointer',
      border: `solid 1px ${Colors.primaryColor}`,
    },

    '&& .anticon > svg': {
      width: '1.5em',
      height: '1.5em'
    },

    ...props.buttonStyles,
  })),
  Image: styled.img`
    width: 25px;
    height: 25px;
  `,
  Text: styled.p(props => ({
    'height': '50px',
    'textAlign': 'center',
    'lineHeight': '50px',
    'margin': '0px 15px',
    'fontSize': '1.4em',
      ...props.textStyles,
  })),
}

export default IconTextButton
