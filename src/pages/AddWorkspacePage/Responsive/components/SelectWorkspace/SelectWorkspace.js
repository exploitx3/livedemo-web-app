import React, { Fragment } from 'react'

//import { Col, Select } from 'antd'

import Col from 'antd/es/col'
import Select from 'antd/es/select'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { capitalize } from '../../../../../utils/helperFunctions'
import Colors from '../../../../../constants/mainColors'

import SubscriptionTypes from '../../../../../constants/SubscriptionTypes'
import SubscriptionPrices from '../../../../../constants/SubscriptionPrices'
import ErrorBoundary from '../../../../../components/utilComponents/HOCs/ErrorBoundary'
import SubscriptionTypesRank from '../../../../../constants/SubscriptionTypesRank'

const { Option } = Select


const SelectWorkspace = (props) => {
  let workspaces = props.workspaces === null ? [] : props.workspaces
  props.onInit()


  function handleChange(workSpaceName, onSelected, onSubscriptionSelected) {

    onSubscriptionSelected(null)
    onSelected(props.workspaces.find(workspace => workspace.name === workSpaceName))
    console.log(`selected ${workSpaceName}`)
  }

  function renderWorkspaceSelectElement(workspaces, handleChange, onSelected, onSubscriptionSelected) {

    return (
      <S.Select

        defaultValue={props.selectedWorkspace !== null ? props.selectedWorkspace.name : 'Select Workspace'}
        size="large"
        onChange={(value) => handleChange(value, onSelected, onSubscriptionSelected)}>
        {workspaces.map(workspace => {
          return (<S.Option key={workspace.name} value={workspace.name}>{workspace.name}</S.Option>)
        })}
      </S.Select>
    )
  }

  function renderSubscriptionSelectElement(onSubscriptionSelected) {

    let subTypesArr = Object.entries(SubscriptionTypes).reduce((accum, cur) => {
      accum.push(cur[1])

      return accum
    }, [])

    return (
      <S.Select
        value={props.selectedSubscription !== null ? props.selectedSubscription : 'Select Subscription'}
        defaultValue={props.selectedSubscription !== null ? props.selectedSubscription : 'Select Subscription'}
        size="large"
        onChange={(value) => onSubscriptionSelected(value)}>
        {subTypesArr.map(subscriptionType => {
          return (<S.Option
            disabled={
              props.selectedWorkspace ?
                (SubscriptionTypesRank[props.selectedWorkspace.type] >= SubscriptionTypesRank[subscriptionType]) :
                false
            }
            key={subscriptionType}
            value={subscriptionType}>{capitalize(subscriptionType)} - {SubscriptionPrices[subscriptionType.toUpperCase()]}$</S.Option>)
        })}
      </S.Select>
    )
  }

  return (
    <ErrorBoundary>
      <Fragment>


        <div style={{ height: '100%' }}>
          <S.Col span={24}
                 style={{ display: 'inline-flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <h2 style={{ fontSize: '24px', margin: 0 }}>Select Workspace</h2>
            <S.Text>Select Workspace:</S.Text>
            {renderWorkspaceSelectElement(workspaces, handleChange, props.onSelected, props.onSubscriptionSelected)}
            <S.Text>Select Plan:</S.Text>
            {renderSubscriptionSelectElement(props.onSubscriptionSelected)}


          </S.Col>
        </div>

      </Fragment>
    </ErrorBoundary>
  )
}

const S = {
  Col: styled(Col)` 
    && {  
      height: 100%;
      display: inline-block;
      text-align: center;
    }
    
    
    && .ant-card-loading-block{
      animation: card-loading 1.4s ease;
    }
`,
  Select: styled(Select)`
    && {
      width: 75%;
      margin: 0 auto;
      letter-spacing: 0.3px;
    }
    
    && .ant-select-content-value {
      background: none;
      color: ${Colors.primaryColor};
      border: none !important;
      box-shadow: none;
    }
    
`,
  Option: styled(Option)`
    
`,
  Text: styled.p`
    text-align: left;
    margin: 15px auto;
    width: 100%;
    padding-left: 13%;
`,
  ImageExample: styled.img`
    width: 60%;
    border-radius: 20px;
`
}


function mapStateToProps(state) {

  return {
    workspaces: state.workspacesReducer.workspaces
  }
}

export default connect(
  mapStateToProps,
)(SelectWorkspace)
