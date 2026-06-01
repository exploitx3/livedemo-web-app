import React, {useState} from 'react'
import TippyPremium from '../../../../../components/TippyPremium/TippyPremium'
import Colors from '../../../../../constants/mainColors'
import styled from 'styled-components'
//import { Button, Icon, Input, Switch, Upload } from 'antd'
import Button from 'antd/es/button'
import Icon from '../../../../../components/Icon/Icon'
import Input from 'antd/es/input'
import Switch from 'antd/es/switch'
import Upload from 'antd/es/upload'
import ENV from '../../../../../config'
import axios from 'axios'
import {HexColorInput, HexColorPicker} from 'react-colorful'


/*
  tabsWidth is used to manually set the width of the element
  and the top property is set manually also of MainView
 */
const Variables = ({workspaceId, storyDemo, disabled, authData, reloadStoryDemo}) => {
  const marginTop = 116

  let [isSaving, setIsSaving] = useState(false)
  let [isOpen, setIsOpen] = useState(false)


  const [variables, setVariables] = useState((storyDemo.custom.variables && storyDemo.custom.variables) || [])
  const [newVariableName, setNewVariableName] = useState("")
  const [newVariableValue, setNewVariableValue] = useState("")


  // function onSave(workspaceId, storyDemo, isActive, imageUrlUpdate, personName, text, authData) {
  function onUpdateVariable(variableId, newValue) {
    setIsSaving(true)

    return axios.patch(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemo._id}/custom/variables/${variableId}`, {
      value: newValue,
    }, {
      headers: {
        Authorization: `Bearer ${authData.token}`
      }
    })
      .then((res) => {
        setIsSaving(false)

        return res.data
      })
      .then(() => reloadStoryDemo())
  }

  function onDeleteVariable(variableId) {
    setIsSaving(true)

    return axios.delete(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemo._id}/custom/variables/${variableId}`, {
      headers: {
        Authorization: `Bearer ${authData.token}`
      }
    })
      .then((res) => {
        setIsSaving(false)

        setVariables(res.data)
        return res.data
      })
      .then(() => reloadStoryDemo())
  }

  function onAddNewVariable(name, value) {
    setIsSaving(true)

    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemo._id}/custom/variables`, {
      name: name,
      value: value,
    }, {
      headers: {
        Authorization: `Bearer ${authData.token}`
      }
    })
      .then((res) => {
        setIsSaving(false)

        setVariables(res.data)

        return res.data
      })
      .then(() => reloadStoryDemo())
  }

  return (

    <TH.ScreenHeader>

      <TippyPremium
        placement={"top"}
        arrow={true}
        title="Unlock Personalization & Variables"
        description="Upgrade your plan to use dynamic variables and personalize your demos for each viewer."
        disabled={!disabled}
      >
        <TH.HeaderMain>
          <TH.HeaderLeftSide
            onClick={() => {
              setIsOpen(!isOpen)
            }}>
            <TH.OpenIcon type={isOpen ? 'down' : 'right'}/>
            <TH.HeaderTitle>Variables</TH.HeaderTitle>
          </TH.HeaderLeftSide>
          <TH.HeaderRightSide>

          </TH.HeaderRightSide>
        </TH.HeaderMain>
      </TippyPremium>
      {!isOpen ? '' : (
        <TH.MainWrapper className={disabled ? 'locked' : ''}>
          <TH.Text>Variables enable you to pass dynamic values into your LiveDemo to personalize the text.</TH.Text>
          <TH.Text>Once added, you can generate custom links for the same LiveDemo with unique variable values</TH.Text>

          <TH.Variables__Row style={{borderBottom: '1px solid #ddd'}}>
            <TH.Variables__LeftSide>
              <TH.Variables__HeaderTitle>Name</TH.Variables__HeaderTitle>
            </TH.Variables__LeftSide>
            <TH.Variables__MiddleSide>
              <TH.Variables__HeaderTitle>Default Value</TH.Variables__HeaderTitle>
            </TH.Variables__MiddleSide>
            <TH.Variables__RightSide>
            </TH.Variables__RightSide>
          </TH.Variables__Row>


          {variables.map((variable, index) => {
            return (
              <TH.Variables__Row>
                <TH.Variables__LeftSide>
                  <TH.Variables__InputName value={`{{ ${variable.name} }}`} disabled/>
                </TH.Variables__LeftSide>
                <TH.Variables__MiddleSide>
                  <TH.Variables__InputValue value={variable.value} disabled/>
                </TH.Variables__MiddleSide>
                <TH.Variables__RightSide>
                  <TH.Variables__Button type="danger" size="small" onClick={() => {
                    return onDeleteVariable(variable._id)
                  }}>Delete</TH.Variables__Button>
                </TH.Variables__RightSide>
              </TH.Variables__Row>

            )
          })}

          <TH.Variables__Row>
            <TH.Variables__LeftSide>
              <TH.Variables__InputName
                value={newVariableName}
                onChange={(newValue) => {
                  setNewVariableName(newValue.target.value)
                }}
                placeholder={"first_name"}/>
            </TH.Variables__LeftSide>
            <TH.Variables__MiddleSide>
              <TH.Variables__InputValue
                value={newVariableValue}
                onChange={(newValue) => {
                  setNewVariableValue(newValue.target.value)
                }}
                placeholder={"John Snow"}/>
            </TH.Variables__MiddleSide>
            <TH.Variables__RightSide>
              <TH.Variables__Button type="primary" size="small" onClick={() => onAddNewVariable(newVariableName, newVariableValue)}>Add</TH.Variables__Button>
            </TH.Variables__RightSide>
          </TH.Variables__Row>
        </TH.MainWrapper>
      )}


    </TH.ScreenHeader>
  )
}

const TH = {
  Variables__Button: styled(Button)`
  `,
  Variables__Row: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  `,
  Variables__InputName: styled(Input)`
  `,
  Variables__InputValue: styled(Input)`
  `,
  Variables__LeftSide: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 40%;
  `,
  Variables__MiddleSide: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 40%;
  `,
  Variables__RightSide: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 16%;
  `,
  Variables__HeaderTitle: styled.p`
    width: 100%;
    text-align: left;
  `,
  ColorPicker: styled(HexColorPicker)`
    && {
      width: 125px;
      height: 125px;
    }

  `,
  ColorInput: styled(HexColorInput)`
    && {
      width: 125px;
    }
  `,
  ColorPreview: styled.span`
    width: 100px;
    height: 100px;
  `,
  Overlay: styled.div`
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(3px);
    z-index: 1;
    border-radius: 4px;
  `,
  MainWrapper: styled.div`
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 15px;
    margin-top: 10px;
    position: relative;

    &.locked {
      pointer-events: none;
      user-select: none;
      filter: blur(2px);
      opacity: 0.6;
    }
  `,
  Main__LeftSide: styled.span`
    margin: 0px 0px 0px 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
  `,
  Upload: styled(Upload)`
    max-width: 125px;
  `,
  SaveButton: styled(Button)`
    width: 105px;
  `,
  Main__RightSide: styled.span`
    margin: 0px 0px 0px 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
    justify-content: flex-end;
  `,
  TextTitle: styled.label`
    margin: 0px;
    font-size: 1.2em;
  `,
  Text: styled.p`
    font-size: 0.85em;
    margin: 0px;
  `,
  TextAndButton: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    gap: 10px;
    margin-bottom: 10px;

  `,
  TextWrapper: styled.span`
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: 5px;
  `,
  TextInput: styled(Input)`

  `,
  ProfileImage: styled.img`
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 1px solid #1070ff;
  `,
  OpenIcon: styled(Icon)`
    cursor: pointer;
  `,
  HeaderRightSide: styled.span`
    margin-right: 15px;
  `,
  HeaderLeftSide: styled.span`
    flex-grow: 1;
    display: flex;
    align-items: center;
    gap: 15px;

    cursor: pointer;
  `,
  CheckBox: styled(Switch)`
  `,
  HeaderTitle: styled.span`
    max-width: 160px;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
    overflow: hidden;

    font-size: 1.2em;
    color: ${Colors.primaryText};
  `,
  ScreenHeader: styled.header`
    position: relative;
    width: 100%;
    min-height: 65px;
    height: auto;
    margin-bottom: 15px;

    padding: 0px;
    border-radius: 6px;

  }

  }
  ;

  // &&:hover {
  //
  //   border: 1px solid ${Colors.primaryText};
  // }

  `,
  HeaderMain: styled.main`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1;
    gap: 15px;

    margin: 10px 5px;
    padding: 15px;
    background-color: #f3f3f3;
    height: 65px;
    border-radius: 6px;
    border: 1px solid #1070ff;

    &&:hover {

      cursor: pointer;
    }

    border: 1px solid ${Colors.primaryColor};
  `
}

export default Variables
