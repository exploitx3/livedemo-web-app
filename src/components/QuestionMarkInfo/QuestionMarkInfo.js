import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
//import { Icon, Tooltip } from 'antd'

import Icon from '../Icon/Icon'
import Tooltip from 'antd/es/tooltip'

const QuestionMarkInfo = ({className, tooltipText, tooltipPlacement = 'top' }) => {


  return (
    <S.Tooltip className={className} title={tooltipText} placement={tooltipPlacement}>
      <Icon type="question-circle"/>
    </S.Tooltip>
  )
}

QuestionMarkInfo.propTypes = {
  tooltipText: PropTypes.string,
  tooltipPlacement: PropTypes.string
}

const S = {
  Tooltip: styled(Tooltip)`
        display: flex;
    align-items: center;
`
}

export default QuestionMarkInfo
