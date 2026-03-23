import React from 'react'
import styled from 'styled-components'

const LineBar = ({ wrapperStyles, barStyles }) => {


  return (
    <S.WrapperBar wrapperStyles={wrapperStyles}>
      <S.BarLine barStyles={barStyles }/>
    </S.WrapperBar>
  )
}

const S = {
  WrapperBar: styled.div(props => ({

    height: '5px',
    width: '150px',
    borderRadius: '18px',
    background: '#f1f1f1',
    ...props.wrapperStyles,
  })),

  BarLine: styled.div(props => ({
      height: '5px',
      background: '#57d82d',
      width: '70%',
      borderRadius: '18px',
      ...props.barStyles
    }
  ))

}

export default LineBar
