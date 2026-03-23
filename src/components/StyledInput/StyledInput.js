import React from 'react'
//import { Input } from 'antd'

import Input from 'antd/es/input'
import 'antd/es/input/style'

import styled from 'styled-components'
import Colors from '../../constants/mainColors'

const StyledInput = (props) => {
  let {
    size,
    placeholder,
    value,
    onChange,
    onPressEnger,
    inputStyles
  } = props

  return (
    <S.Input inputStyles={props.inputStyles} {...props} >

    </S.Input>
  )
}

const S = {
  Input: styled(Input)(props => ({
    height: "50px",
    fontSize: "1.5em",
    border: "1px solid black",
    '&&:hover': {
      border: `1px solid ${Colors.primaryColor} !important`
    },
    '&&:focus': {
      border: `1px solid ${Colors.primaryColor} !important`
    },

    ...props.inputStyles
  }))
  ,
  Button: styled.div(props => ({

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

    ...props.buttonStyles,
  })),
  Image: styled.img`
    width: 25px;
    height: 25px;  
  `,
  Text: styled.p`
    height: 50px;
    text-align: center;
    line-height: 50px;
    margin: 0px 15px;
    font-size: 1.3em;

`
}

export default StyledInput

