import React, { Fragment, useState } from 'react'

//import { Checkbox, Col, Select } from 'antd'

import Checkbox from 'antd/es/checkbox'
import Col from 'antd/es/col'
import Select from 'antd/es/select'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { capitalize } from '../../../../utils/helperFunctions'
import Colors from '../../../../constants/mainColors'

import SubscriptionTypesRank from '../../../../constants/SubscriptionTypesRank'
import SubscriptionTypes from '../../../../constants/SubscriptionTypes'
import SubscriptionPrices from '../../../../constants/SubscriptionPrices'
import ErrorBoundary from '../../../../components/utilComponents/HOCs/ErrorBoundary'

const { Option } = Select


const SelectWorkspace = (props) => {
  let {privateChannelsCheck, onPrivateChannelsCheck} = props

  let workspaces= props.workspaces === null ? [] : props.workspaces
  props.onInit()

  // let [allChannels, setAllChannels] = useState(props.selectedChannels.length !== 0 && props.selectedChannels.length === props.workspaceChannels.length)



  function handleChange(workSpaceName, onSelected, onSubscriptionSelected) {

    let selectedWorkspace = props.workspaces.find(workspace => workspace.name === workSpaceName)
    onSelected(selectedWorkspace)

    let keys = Object.values(SubscriptionTypes)
    let nextKeyIndex = selectedWorkspace ? Object.keys(SubscriptionTypesRank).indexOf(selectedWorkspace.type) + 1 : 0

    let nextAvailableSubscription = selectedWorkspace ? keys[nextKeyIndex] : SubscriptionTypes.STANDARD
    onSubscriptionSelected(nextAvailableSubscription)




    console.log(`selected ${workSpaceName}`)
  }

  function renderWorkspaceSelectElement(workspaces, handleChange, onSelected, onSubscriptionSelected) {

    return (
      <S.Select defaultValue={props.selectedWorkspace !== null ? props.selectedWorkspace.name : 'Select Workspace'}
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

    // let keys = Object.keys(SubscriptionTypes)
    // let nextKeyIndex = props.selectedWorkspace ? SubscriptionTypesRank[props.selectedWorkspace.type] + 1 : 0
    //
    // let nextAvailableSubscription = props.selectedWorkspace ? keys[nextKeyIndex] : SubscriptionTypes.STANDARD

    return (
      <S.Select
        value={props.selectedSubscription !== null ? props.selectedSubscription : SubscriptionTypes.STANDARD}
        defaultValue={props.selectedSubscription !== null ? props.selectedSubscription : SubscriptionTypes.STANDARD}
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

  function renderChannelsSelectElement(onChannelsSelected, workspaceChannels, selectedChannels, workspaceChannelsLoading) {

    let subTypesArr = Object.entries(SubscriptionTypes).reduce((accum, cur) => {
      accum.push(cur[1])

      return accum
    }, [])

    return (
      <S.ChannelSelect
        mode="multiple"
        // dropdownMenuStyle={{height:'110px', maxHeight: '110px'}}
        placeholder="Select Channels"
        defaultValue={[]}
        value={selectedChannels}
        onChange={onChannelsSelected}
        loading={workspaceChannelsLoading}
        size={'large'}
      >
        {workspaceChannels.map(channel => {

          return (<S.Option
            // disabled={}
            key={channel._id}
            value={channel._id}>{capitalize(channel.name)}</S.Option>)
        })
        }
      </S.ChannelSelect>
    )
  }

  return (
    <ErrorBoundary>
    <Fragment>


      <div style={{ height: '100%' }}>
        <S.Col span={12}
               style={{ display: 'inline-flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <h2 style={{ fontSize: '28px' }}>Select Workspace</h2>
          <S.SelectWrapper>

            {/*<S.Text>Please select the workspace which you want to upgrade:</S.Text>*/}
            {renderWorkspaceSelectElement(workspaces, handleChange, props.onSelected, props.onSubscriptionSelected)}
            {/*<S.Text>Select the plan you want to subscribe for:</S.Text>*/}
            {renderSubscriptionSelectElement(props.onSubscriptionSelected)}
          </S.SelectWrapper>
          <S.ChannelsWrapper>
            <S.CheckboxWrapper>

              <S.ChannelsCheckBox disabled={props.workspaceChannels.length === 0}
                                  checked={props.selectedChannels.length !== 0 && props.selectedChannels.length === props.workspaceChannels.length}
                                  onChange={(event) => {

                                    let newValue = event.target.checked
                                    // setAllChannels(newValue)
                                    if (newValue) {

                                      props.onChannelsSelected(props.workspaceChannels.map(c => c._id))
                                    } else {

                                      props.onChannelsSelected([])
                                    }
                                  }}>All Public channels</S.ChannelsCheckBox>

              <S.ChannelsCheckBox
                checked={privateChannelsCheck}
                onChange={(event) => {

                                    let newValue = event.target.checked
                                    onPrivateChannelsCheck(newValue)


                                  }}>Private channels</S.ChannelsCheckBox>
            </S.CheckboxWrapper>
            {renderChannelsSelectElement(props.onChannelsSelected, props.workspaceChannels, props.selectedChannels, props.workspaceChannelsLoading)}

          </S.ChannelsWrapper>



        </S.Col>
        <S.Col span={12}>
          {/*<S.ImageExample src={authExampleImg} alt="authentication-example"/>*/}
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
  SelectWrapper: styled.span`
    padding: 0 35px;
    display: flex;
    justify-content: space-between;
    
    margin-bottom: 30px;
  `,
  ChannelsWrapper: styled.span`
    
    padding: 0 35px;
    display: flex;
    align-items: start;
    justify-content: space-between;
  `,
  CheckboxWrapper: styled.span`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  `,
  ChannelSelect: styled(Select)`
    width: 65%;
    
    && .ant-select-content-value {
      background: none;
      color: ${Colors.primaryColor};
      border: none !important;
      box-shadow: none;
    }
    
    && .ant-select-selection {
      max-height: 180px;
      overflow: hidden;
    }
    
  `,
  ChannelsCheckBox: styled(Checkbox)`
    && {
    
      line-height: 40px;
      text-align: left;
      margin: 0px;
      width: 100%;
    }
  `,
  Select: styled(Select)`
    && {
      width: 45%;
      //margin: 0 auto;
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
