//import { Button, Checkbox, Icon, Input, Modal, Select } from 'antd'

import Button from 'antd/es/button'
import Checkbox from 'antd/es/checkbox'
import Icon from '../../../../../../components/Icon/Icon'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import Select from 'antd/es/select'
import Colors from '../../../../../../constants/mainColors'
import React from 'react'
import styled from 'styled-components'
import { MdAdsClick, MdArrowRightAlt } from 'react-icons/md'

import 'antd/es/select/style'

const { Option } = Select


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
  START: 'start',
  IFRAME: 'iframe',
}

const OPEN_VIEWS = {
  TEXT_VIEW: 'TEXT_VIEW',
  OPTIONS_VIEW: 'OPTIONS_VIEW',
}

/*
  top, top-start, top-end
  bottom, bottom-start, bottom-end
  left, left-start, left-end
  right, right-start, right-end
  auto (it will choose the best position)
  center (set the target to body)
 */
const PLACEMENT_TYPES = {
  TOP: 'top',
  TOP_START: 'top-start',
  TOP_END: 'top-end',
  LEFT: 'left',
  LEFT_START: 'left-start',
  LEFT_END: 'left-end',
  BOTTOM: 'bottom',
  BOTTOM_START: 'bottom-start',
  BOTTOM_END: 'bottom-end',
  RIGHT: 'right',
  RIGHT_START: 'right-start',
  RIGHT_END: 'right-end',
  AUTO: 'auto',
  CENTER: 'center'
}


const { confirm } = Modal

const CommonOptions = ({
  setInternalStep,
  internalStep,
}) => {


  function updateViewField(fieldName, value) {

    let newStep = JSON.parse(JSON.stringify(internalStep))
    newStep.view[fieldName] = value

    setInternalStep(newStep)
  }

  function setFieldClosure(fieldName) {
    return (event) => {

      updateViewField(fieldName, event.target.checked)
    }
  }

  return <React.Fragment>

    <ST.CommonOptionsLine>
      <ST.ActionSelectorLineTitle>Options:</ST.ActionSelectorLineTitle>

    <ST.ActionSelectorLineMargin>
      <ST.CheckboxLineMargin
        onClick={() => {
          updateViewField('showHeader', !internalStep.view.showHeader)
        }}>
        <ST.Checkbox
          checked={internalStep.view.showHeader} />
        <ST.CheckboxText>Show header</ST.CheckboxText>
      </ST.CheckboxLineMargin>
    </ST.ActionSelectorLineMargin>
    <ST.ActionSelectorLineMargin>
      <ST.CheckboxLineMargin
        onClick={() => {
          updateViewField('showFooter', !internalStep.view.showFooter)
        }}>
        <ST.Checkbox
          checked={internalStep.view.showFooter} />
        <ST.CheckboxText>Show footer</ST.CheckboxText>
      </ST.CheckboxLineMargin>
    </ST.ActionSelectorLineMargin>
    <ST.ActionSelectorLineMargin>
      <ST.CheckboxLineMargin onClick={() => {
        updateViewField('showStepNumbers', !internalStep.view.showStepNumbers)
      }}>
        <ST.Checkbox

          checked={internalStep.view.showStepNumbers} />
        <ST.CheckboxText>Show step number</ST.CheckboxText>
      </ST.CheckboxLineMargin>
    </ST.ActionSelectorLineMargin>

    <ST.ActionSelectorLineMargin>

      <ST.ActionSelectorText>Next Button text:</ST.ActionSelectorText>
      <ST.NextButtonTextInput
        onChange={(event) => {
          let newStep = JSON.parse(JSON.stringify(internalStep))
          newStep.view.nextButtonText = event.target.value
          setInternalStep(newStep)

        }}
        value={internalStep.view.nextButtonText} />
    </ST.ActionSelectorLineMargin>
  </ST.CommonOptionsLine>


  </React.Fragment >
}


const ST = {
  ActionSelectorLineTitle: styled.p`
    margin: 10px 0px;
  `,
  CommonOptionsLine: styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
  `,
  NextButtonTextInput: styled(Input)`
    && {
      width: 45%;
    }

  `,
  Checkbox: styled(Checkbox)`

  `,
  CheckboxText: styled.p`
    margin: 0px 0px 0px 15px;
  `,
  CheckboxLineMargin: styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
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
  ActionSelectorLineMargin: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 10px;
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
  ViewContainer: styled.div`
    padding: 0px 10px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 100%;
    // width: ${(props) => props.isViewOpen ? '275' : '125'}px;
    // height: ${(props) => props.isViewOpen ? '325' : '125'}px;
    border-radius: 4px;
    //background: #F9F9F9;



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
  SelectorInput: styled(Input)`
    && {
      width: 100%;
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
  ClickIcon: styled(MdAdsClick)`
    height: 25px;
    width: 45px;

    fill: ${Colors.primaryColor};

    &:hover {
      cursor: pointer;
      fill: ${Colors.primaryColorDarker};
    }
  `,
  ActionTypeButton: styled.div`

  `,
  Next__Button: styled(Button)`
    && {
      background-color: ${Colors.primaryColor};
      color: #FFF;
      font-size: 0.7em;

      height: 20px;
      width: 30px;
      padding: 2px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-evenly;
    }

    &&:hover {
      background-color: ${Colors.primaryColorDarker};
    }
  `,
  Next__ButtonIcon: styled(MdArrowRightAlt)`
    && {
      //fill: #ffffff;
      width: 22px;
      height: 35px;
      margin: 0px;

    }
  `,
  SaveButton: styled.div`

    position: relative;
    //bottom: 20px;
    //left: 5px;
    //background: #1070ff;
    color: ${Colors.primaryColor};
    text-align: center;
    display: flex;
    height: 25px;
    width: 65px;
    border-radius: 6px;
    justify-content: center;
    align-items: center;

    &:hover {
      cursor: pointer;
    };
  `,
  SaveButton__Image: styled(Icon)`
    height: 15px;
    width: 15px;

    && svg {
      fill: ${Colors.primaryColor};
      height: 15px;
      width: 15px;
    }
  `,
  SaveButton__Text: styled.p`
    height: 30px;
    text-align: center;
    line-height: 30px;
    margin: 0px 5px;
    font-size: 1.1em;
    color: ${Colors.primaryColor};


`

}

export default CommonOptions
