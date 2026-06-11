//import { Button, Icon, Input, Modal, Select } from 'antd'

import Button from 'antd/es/button'
import Icon from '../../../../../../components/Icon/Icon'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import Select from 'antd/es/select'
import Colors from '../../../../../../constants/mainColors'
import React from 'react'
import ViewEditor from '../../../ViewEditor/ViewEditor'
import styled from 'styled-components'

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

const OPEN_VIEWS = {
  TEXT_VIEW: 'TEXT_VIEW',
  OPTIONS_VIEW: 'OPTIONS_VIEW',
}


const ACTION_TYPES = {
  NEXT_BUTTON: 'NextButton',
  ELEMENT_CLICK: 'ElementClick'
}


const TextView = ({

                    editorValue,
                    setEditorValue,
                  }) => {


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


  editorValue = editorValue ? editorValue : []
  editorValue = editorValue.map(value => {

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



  return <React.Fragment>
    <ViewEditor
      editorValue={editorValue}
      setEditorValue={setEditorValue}

    />

  </React.Fragment>
}


const ST = {
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
      margin-top: 10px;
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
`

}

export default TextView
