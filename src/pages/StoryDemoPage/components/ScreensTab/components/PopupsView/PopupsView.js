import React, { useEffect, useState } from 'react'
import Colors from '../../../../../../constants/mainColors'
import FormView from '../../../Step/components/FormView/FormView'
//import { Button, Icon, Input, Modal, Select } from 'antd'

import Button from 'antd/es/button'
import Icon from '../../../../../../components/Icon/Icon'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import Select from 'antd/es/select'
import styled from 'styled-components'
import axios from '../../../../../../utils/axiosInstance'
import * as ENV from '../../../../../../config'
import { MdAdsClick } from 'react-icons/md'

const { confirm } = Modal
const { Option } = Select

const POPUP_TYPES = {
  none: 'none',
  form: 'form',
  start: 'start',
  iframe: 'iframe'
}

const PopupsView = function ({ screen, setScreen, storyDemo, setIsNavUpdating, authData }) {


  let defaultPopupConfig = screen && screen.popups ? screen.popups : {
    type: 'none',
    formId: '',
  }
  console.log(defaultPopupConfig)

  let [formHasChanged, setFormHasChanged] = useState(false)
  let [popupType, setPopupType] = useState(defaultPopupConfig.type)
  let [formData, setFormData] = useState(defaultPopupConfig.formId)


  useEffect(() => {
    if (popupType === POPUP_TYPES.form && !formData) {

      createForm(storyDemo.workspaceId, storyDemo._id, screen._id, authData.token)
    } else {
      console.log('No need to create form, using existing form')
    }

  }, [popupType])


  function createForm(workspaceId, storyDemoId, screenId, authToken) {
    setIsNavUpdating(true)

    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/forms`,
      {
        type: 'screen',
        storyId: storyDemoId,
        screenId: screenId
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((res) => {

      let newForm = res.data

      let newScreen = { ...screen }
      newScreen.popups.type = popupType
      newScreen.popups.formId = newForm

      setScreen(newScreen)

      setIsNavUpdating(false)
    })

  }

  function patchPopups(popupsObj, workspaceId, storyDemoId, screenId, authToken) {

    return axios.patch(
      `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/popups`,
      popupsObj,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      .then((res) => {
        return res.data
      })
  }


  function savePopups(popupsObj, workspaceId, storyDemoId, screenId, authToken) {

    setIsNavUpdating(true)


    patchPopups(popupsObj, workspaceId, storyDemoId, screenId, authToken)
      .then((data) => {

        let newPopupsConfig = data


        setPopupType(newPopupsConfig.type)
        setFormData(newPopupsConfig.formId)

        let newScreen = { ...screen }
        newScreen.popups = newPopupsConfig

        setScreen(newScreen)

        setIsNavUpdating(false)
      })
      .catch(err => {
        console.log(err)
        setIsNavUpdating(false)
      })
  }


  function updateForm(formUpdateObj, workspaceId, formId, authToken) {

    return axios.patch(`${ENV.STORIES_API}/workspaces/${workspaceId}/forms/${formId}`, {
      ...formUpdateObj
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((newFormRes) => {

      return newFormRes.data
    })
  }


  function onSave(popupSaveObj) {

    // console.log(popupSaveObj)

    let promiseChain = Promise.resolve()

    if (formHasChanged) {
      promiseChain = promiseChain.then(() => {
        return updateForm(
          {
            useCaptcha: !!formData.useCaptcha,
            showTopLabels: formData.showTopLabels !== false,
            showBackground: formData.showBackground !== false,
          },
          storyDemo.workspaceId, formData._id, authData.token)
      })
    }

    promiseChain = promiseChain.then(() => {
      return savePopups(popupSaveObj, storyDemo.workspaceId, storyDemo._id, screen._id, authData.token)
    })

    return promiseChain
  }

  function getPopupConfigView() {
    if (popupType === POPUP_TYPES.none) {
      return ''
    }

    if (popupType === POPUP_TYPES.form) {
      return (
        <NAV.FormStyleWrapper>
          <FormView
            formHasChanged={formHasChanged}
            setFormHasChanged={setFormHasChanged}
            formData={formData}
            setFormData={setFormData}
            workspaceId={storyDemo.workspaceId}
            authData={authData}
          />
        </NAV.FormStyleWrapper>
      )
    }

    return ''
  }

  return <NAV.ItemWrapper
    // key={transitionItem._id}
  >
    <NAV.Header>
      <NAV.Header__LeftSide>
        <NAV.ClickIcon/>
        <NAV.ClickType>Popup</NAV.ClickType>
      </NAV.Header__LeftSide>
      <NAV.Header__RightSide>
        <NAV.SaveButtonWrapper onClick={function () {
          onSave({
            type: popupType,
          })

        }} className={'Nav__SaveButton'}>
          <NAV.SaveButtonWrapperIcon type={'save'}/>
        </NAV.SaveButtonWrapper>

      </NAV.Header__RightSide>
    </NAV.Header>
    <NAV.RightSide>
      <NAV.FirstLine>
        <NAV.Text>Type</NAV.Text>
        <NAV.Select
          dropdownStyle={{
            background: Colors.App.sidebarColor,
            border: `1px solid ${Colors.primaryColor}`
          }}
          defaultValue={
            popupType
          }
          value={
            popupType
          }
          style={{
            marginLeft: 15,
            maxWidth: 115
          }}
          onChange={(newPopupType) => {

            setPopupType(newPopupType)
          }}>
          {Object.keys(POPUP_TYPES).map((type, index, array) => {
            let isLast = index === array.length - 1
            return <Option
              style={{
                background: 'none',
                color: Colors.primaryColor,
                borderBottom: isLast ? 'none' : '1px solid #d9d9d9',
              }}
              key={type}
              value={type}>
              {type}</Option>
          })
          }
        </NAV.Select>

      </NAV.FirstLine>
      <NAV.ThirdLine>
        {getPopupConfigView()}

      </NAV.ThirdLine>
    </NAV.RightSide>


  </NAV.ItemWrapper>
}


const NAV = {
  Wrapper: styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    
  `,
  Title: styled.p`
    margin: 0px;
  `,
  ItemWrapper: styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: auto;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.65);
    margin-bottom: 15px;
  `,
  Header: styled.div`
    height: 50px;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: 1px solid #896174;
    background: #f3f3f3;
  `,
  LeftSide: styled.span`
    height: 100%;
    width: 50px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  `,
  RightSide: styled.span`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 5px;
  `,

  FirstLine: styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
  `,
  SelectorInput: styled(Input)`
    && {
      min-width: 100px;
      flex-grow: 1;
    }
  `,
  WebsiteInput: styled(Input)`
    && {
      width: 100px;
      flex-grow: 1;
    }
  `,
  TextInput: styled(Input)`
    && {
      width: 100px;
      flex-grow: 1;
    }
  `,
  ClickType: styled.p`
    margin: 0px;
  `,
  Text: styled.p`
    margin: 0px;
    line-height: 50px;
  `,
  PickSelectorText: styled.p`
    margin: 0px;
  `,
  PickSelectorIcon: styled(Icon)`
    width: 105px;
  `,
  PickSelectorButton: styled(Button)`
    width: 70px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
    margin-right: 15px;
  `,
  ClickIcon: styled(MdAdsClick)`
    height: 25px;
    width: 45px;
    
    fill: ${Colors.primaryColor};
    
    &:hover {
      cursor: pointer;
      fill: ${Colors.primaryColorDarker};
    }
  `,
  SecondLine: styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
    
  `,
  ThirdLine: styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
    
  `,
  FormStyleWrapper: styled.span`
    && .form-body {
      border: none;
      padding: 0px;
    }
  `,
  Select: styled(Select)`
    flex-grow: 1;

    && .ant-select-content-value {
      background: none;
      color: ${Colors.primaryColor};
      border: none !important;
      box-shadow: none;
    }


    && .ant-select-selection {
      background: none;
      color: ${Colors.primaryColor};
      border: 1px solid #d9d9d9;
      box-shadow: none;
    }
    
    && .ant-select-selection:hover {
      border: 1px solid ${Colors.primaryColor};
    }
    
    && .ant-select-arrow {
      color: ${Colors.primaryColor};
    }
    
    && .ant-select-selection-selected-value {
      width: 90%;
    }
`,
  Header__LeftSide: styled.span`
    height: 100%;
    width: 100px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  `,
  Header__RightSide: styled.span`
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  `,
  SaveButtonWrapperIcon: styled(Icon)`
    width: 18px;
    height: 18px;
    
    && svg {
      fill: ${Colors.primaryColor};
      width: 100%;
      height: 100%;
    }
  `,
  SaveButtonWrapper: styled.div`
    display: flex;
    align-content: center;
    margin-right: 15px;
    
    &&:hover {
      cursor: pointer;
    }
  `,
  DeleteButton: styled.div`
    display: flex;
    align-content: center;
    margin-right: 15px;
    
    &&:hover {
      cursor: pointer;
    }
    
    
    
  `,
  DeleteIcon: styled(Icon)`
    width: 18px;
    height: 18px;
    
    && svg {
      fill: #ff0000c4;
      width: 100%;
      height: 100%;
    }
    `,

}

export default PopupsView
