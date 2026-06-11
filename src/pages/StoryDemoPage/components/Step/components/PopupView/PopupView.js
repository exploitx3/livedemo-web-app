//import { Button, Icon, Input, Modal, Select } from 'antd'

import Button from 'antd/es/button'
import Icon from '../../../../../../components/Icon/Icon'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import Select from 'antd/es/select'
import Colors from '../../../../../../constants/mainColors'
import React, {useState} from 'react'
import ViewEditor from '../../../ViewEditor/ViewEditor'
import DescriptionEditor from '../../../ViewEditor/DescriptionEditor'
import styled from 'styled-components'
import PopupButton from '../PopupButton/PopupButton'
import OverlayConfig from '../OverlayConfig/OverlayConfig'
import CommonOptions from '../CommonOptions/CommonOptions'
import EmbedOptionsView from '../EmbedOptionsView/EmbedOptionsView'
import PreviewImageSection from '../PopupOptionsView/PreviewImageSection'
import PopupAlignments from '../../../../../../constants/PopupAlignments'
import { useNavigate } from 'react-router-dom'
import 'antd/es/select/style'

const { Option } = Select


const { confirm } = Modal

const VIEW_TYPE_NAMES = {
  HOTSPOT: 'hotspot',
  POINTER: 'pointer',
  POPUP: 'popup'
}


const VIEW_TYPES = {
  HOTSPOT: 'hotspot',
  POINTER: 'pointer',
  POPUP: 'popup'
}

const POPUP_TYPES = {
  POPUP: 'popup',
  NONE: 'none',
  FORM: 'form',
  EMBED: 'embed',
  START: 'start',
  IFRAME: 'iframe',
}

const POPUP_TYPES_LIMITED = {
  POST: 'popup',
  EMBED: 'embed',
  FORM: 'form',
}

const OPEN_VIEWS = {
  TEXT_VIEW: 'TEXT_VIEW',
  OPTIONS_VIEW: 'OPTIONS_VIEW',
}


const ACTION_TYPES = {
  NEXT_BUTTON: 'NextButton',
  ELEMENT_CLICK: 'ElementClick'
}


const PopupView = ({
                    popupDescriptionValue,
                    setPopupDescriptionValue,
                    setPopupTitle,
                    popupTitle,
                     setInternalStep,
                     internalStep,
                     storyDemo,
                     popupType,
                     setPopupType,
                     alignment,
                     setAlignment,
                     authData,
                     workspaceId,
                     storyDemoId,
                     screenId,
                  }) => {

  let navigate = useNavigate()
  let featureFlags = authData ? authData.featureFlags : {}

  function updateViewField(fieldName, value) {
    let newStep = JSON.parse(JSON.stringify(internalStep))
    if (newStep.view.popup[fieldName] !== value) {
      newStep.view.popup[fieldName] = value
      setInternalStep(newStep)
    }
  }


  /*
  [
  {
    "type": "paragraph",
    "children": [
      {
        "text": "test"
      }
    ]
  }
]
   */


  let [buttons, setButtons] = useState(internalStep.view.popup.buttons ? internalStep.view.popup.buttons : [

  ])

  popupDescriptionValue = popupDescriptionValue ? popupDescriptionValue : []
  popupDescriptionValue = popupDescriptionValue.map(value => {

    if (value && (!value.children || value.children.length === 0)) {
      return {
        'type': 'paragraph',
        'children': [
          {
            'text': ''
          }
        ]
      }
    } else {

      return value
    }

  })

function addButton(buttonObj){
  let newButtons = JSON.parse(JSON.stringify(buttons))

  newButtons.push(buttonObj)

  let newStep = JSON.parse(JSON.stringify(internalStep))
  newStep.view.popup.buttons = newButtons

  setButtons(newButtons)
  setInternalStep(newStep)
}


  return <React.Fragment>
      <ST.ActionSelectorLineMargin>
        <ST.ActionSelectorText>Alignment:</ST.ActionSelectorText>
        <ST.Select
          dropdownStyle={{
            background: Colors.App.sidebarColor,
            border: `1px solid ${Colors.primaryColor}`
          }}
          value={alignment}
          style={{ width: 120 }}
          onChange={(newAlignment) => {
            setAlignment(PopupAlignments[newAlignment])
          }}>
          {Object.entries(PopupAlignments).map(([key, value], index, array) => {
            let isLast = index === array.length - 1
            return <Option style={{
              background: 'none',
              color: Colors.primaryColor,
              borderBottom: isLast ? 'none' : '1px solid #d9d9d9',
              textTransform: 'capitalize',
            }} key={key} value={key}>{value}</Option>
          })}
        </ST.Select>
      </ST.ActionSelectorLineMargin>

      <PreviewImageSection
        internalStep={internalStep}
        setInternalStep={setInternalStep}
        storyDemo={storyDemo}
        workspaceId={workspaceId}
        storyDemoId={storyDemoId}
        screenId={screenId}
        authData={authData}
      />

      <ST.TitleComponent>
        <ST.TextLabel>Title: </ST.TextLabel>
        <ST.TitleInput
          onChange={(event) => {
            let newStep = JSON.parse(JSON.stringify(internalStep))
            if(newStep.view.popup.title && newStep.view.popup.title !== event.target.value){ 
              newStep.view.popup.title = event.target.value
              setInternalStep(newStep)
            }
          }}
          value={internalStep.view.popup.title}/>

      </ST.TitleComponent>
      <ST.TextLabel>Description: </ST.TextLabel>
      <ST.DescripitonWrapper>
        <DescriptionEditor
          editorValue={popupDescriptionValue}
          setEditorValue={setPopupDescriptionValue}
        />
      </ST.DescripitonWrapper>
      <ST.TextLabel style={{marginTop: 10}}>Buttons: </ST.TextLabel>
      <ST.ButtonsContainer>
        {buttons.map(popupButton => {
          return <PopupButton
            key={popupButton.index}
            popupButton={popupButton}
            deleteButton={(index) => {
              let newButtons = JSON.parse(JSON.stringify(buttons))
              newButtons = newButtons.filter(b => b.index !== index)

              setButtons(newButtons)
              let newStep = JSON.parse(JSON.stringify(internalStep))
              newStep.view.popup.buttons = newButtons
              setInternalStep(newStep)
            }}
            setPopupButton={(popupButton) => {

              let newButtons = JSON.parse(JSON.stringify(buttons))
              newButtons = newButtons.map(b => b.index === popupButton.index ? popupButton : b)

              let newStep = JSON.parse(JSON.stringify(internalStep))
              newStep.view.popup.buttons = newButtons
              setInternalStep(newStep)
            }}
            storyDemo={storyDemo}
          />
        })}
      </ST.ButtonsContainer>
      <ST.AddButtonLine>

        <ST.AddButtonIcon
          className={'AddLine_AddStepIcon'}
          title={"Add button"}
          onClick={() => {

            addButton({
              text: 'Button',
              index: buttons.length,
              gotoType: 'next', // screen | website | next | none
              gotoWebsite: '',
              gotoScreen: '',
            })
          }}
        >
          <ST.AddButtonIconText>+</ST.AddButtonIconText>
        </ST.AddButtonIcon>
      </ST.AddButtonLine>

      <OverlayConfig
        internalStep={internalStep}
        updateViewField={updateViewField}
      />


  </React.Fragment>
}

/*
      buttons: [{
        index: {type: Number, default: 0},
        text: {type: String}, // screen | website | none
        gotoType: {type: String}, // screen | website | next | none
        gotoWebsite: {type: String},
        gotoScreen: {type: mongoose.Schema.Types.ObjectId, ref: 'Screen'},
      }]
 */

const ST = {
  AddButtonLine: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    margin-top: 30px;
  `,
  AddButtonIcon: styled.div`

    background: #1070ff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    transition: 0.2s ease-in-out;



  `,
  AddButtonIconText: styled.p`
    margin: 0px;
    font-size: 30px;
    line-height: 40px;
    color: white;
  `,
  ButtonsContainer: styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    gap: 20px;
  `,
  TitleComponent: styled.div`
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  `,
  TextLabel: styled.p`
    margin: 0px 5px 0px 0px;
    flex-grow: 1;
  `,
  TitleInput: styled(Input)`
    max-width: 250px;
  `,
  ViewContainer: styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 400px;
    border: 1px solid black;
    border-radius: 6px;
    padding: 0px 5px;
    justify-content: flex-start;
    background: #ffffff;

    display: flex;
    align-items: flex-start;
    justify-content: start;
    padding: 20px;

    overflow-y: scroll;
    overflow-x: hidden;

    && .slate-editor ol,
    && .slate-editor ul {
      padding: 0px;
    }
  `,
  DescripitonWrapper: styled.div`
    width: 375px;
    height: 125px;
    min-height: 125px;
  `,
  SpinnerWrapper: styled.div`
    width: 80px;
    height: 80px;
    position: relative;
  `,
  ActionSelectorLine: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;

  `,
  ViewSelectorWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;

    border: 1px solid black;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    border-top: none;
    padding: 10px;
  `,
  ActionSelectorWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 25px;

  `,
  ActionMain: styled.div`
     width: 100%;
  `,
  ActionMain__Text: styled.p`
    font-size: 0.9em;
    margin: 10px 0px;
  `,
  ActionHeader: styled.header`
    display: flex;
    justify-content: center;
    gap: 15px;
    align-items: center;
    width: 100%;
  `,
  OpenArrow: styled(Icon)`
    justify-self: flex-end;
    align-self: center;
    margin-right: 15px;
    cursor: pointer;
  `,
  ViewHeader: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;

    height: 35px;

    width: 100%;
    border: 1px solid black;
    border-radius: 6px;
    padding: 0px 5px;
    &&:hover .Step__DeleteButton,
    &&:hover .Step__SaveButton {
     visibility: visible;
    }


  `,
  HeaderMain: styled.span`
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-grow: 1;
    gap: 10px;

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
    visibility: hidden;

    &&:hover {
      cursor: pointer;
    }
  `,
  DeleteButton: styled.div`
    display: flex;
    align-content: center;
    margin-right: 15px;
    visibility: hidden;

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
  CloseButton: styled.div`
    position: absolute;
    top: -2px;
    right: -2px;

    display: none;

    &&:hover {
      cursor: pointer;
    }



  `,
  CloseIcon: styled(Icon)`
    width: 22px;
    height: 22px;

    && svg {
      fill: #4c94ff;
      width: 100%;
      height: 100%;
    }
  `,
  StepContainer: styled.div`
    margin: 0px;
    padding: 0px 0px 0px 0px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    &&:hover .CloseButton {
      display: block;
    }


    && .Step__DeleteButton,
    && .Step__SaveButton {
      ${(props) => {
    if (props.isViewOpen) {
      return 'visibility: visible'
    } else {
      return ''
    }
  }}
    }
  `,
  ViewTitle: styled.h2`
    font-size: 1em;
    color: #111;
    text-align: center;

    margin-bottom: 0px;

  `,
  StepSeperator: styled.span`
    width:2px;
    height:15px;
    border-radius: 12px;
    margin: 5px 0px;
    background: ${Colors.primaryColor};
  `,
  ActionContainer: styled.span`
    ${(props) => {
    if (props.isActionOpen) {
      return 'justify-content: flex-start;\n' +
        'align-items: flex-start;\n' +
        `border: 1px solid ${Colors.primaryText};\n` +
        'padding: 10px 5px;\n'
    } else {
      return `border: none;\n` +
        'justify-content: flex-start;\n' +
        'align-items: center;\n' +
        'padding: 0px 5px;\n'
    }
  }}

    box-sizing: content-box;
    overflow: hidden;
    width: 225px;
    //width: ${(props) => props.isActionOpen ? '275' : '60'}px;
    //height: ${(props) => props.isActionOpen ? '200' : '45'}px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;



  `,
  ChangeViewTypeText: styled.p`
    margin: 0px;
  `,
  ChangeViewTypeSection: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    width: 90%;
  `,
  ViewTypeOption: styled.p`
    &:hover {
      cursor: pointer;
      text-decoration: underline;
    }
    margin: 0px;
    text-decoration: ${(props) => props.isSelected ? 'underline' : 'none'};

  `,
  PickSelectorButton: styled(Button)`
    width: 150px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
  `,
  PickSelectorText: styled.p`
    margin: 0px;
  `,
  PickSelectorIcon: styled(Icon)`

  `,
  ActionSelectorText: styled.p`
    margin: 0px;
  `,
  ActionSelectorLineMargin: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 15px;
  `,
  LockedOptionRow: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
  `,
  LockedOptionLabel: styled.span`
    color: #bfbfbf;
    font-size: 0.875rem;
  `,
  LockedOptionUpgradeBtn: styled.button`
    background: ${Colors.primaryColor};
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 2px 8px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: opacity 0.15s ease;

    &:hover { opacity: 0.88; }
    &:active { opacity: 0.75; }
  `,
  SelectorInput: styled(Input)`
    && {
      margin-top: 10px;
      width: 100%;
    }

  `,
  Select: styled(Select)`
    flex-grow: 1;
    margin-left: 10px;
    max-width: 250px;
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

}

export default PopupView
