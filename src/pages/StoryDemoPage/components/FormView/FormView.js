//import { Input, Modal, Select } from 'antd'

import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import Select from 'antd/es/select'
import Colors from '../../../../constants/mainColors'
import React, { useState } from 'react'
import styled from 'styled-components'

import 'antd/es/select/style'

const { Option } = Select


const { confirm } = Modal

const VIEW_TYPES = {
  Popup: 'Popup',
  POINTER: 'Pointer',
  FORM: 'Form'
}

const VIEW_TYPE_NAMES = {
  POPUP: 'Popup',
  POINTER: 'Pointer',
  FORM: 'Form'
}

const ACTION_TYPES = {
  NEXT_BUTTON: 'NextButton',
  ELEMENT_CLICK: 'ElementClick'
}


const FormView = ({

                    formHasChanged,
                    setFormHasChanged,
                    formData,
                    setFormData
                  }) => {


  let formTitle = (formData && formData.title) || 'Get in touch with us'

  return <ST.ViewSelectorWrapper className={'form-body'}>
    <ST.ActionSelectorLine>
      <ST.Text>Title:</ST.Text>

      <ST.SelectorInput
        onChange={(event) => {

          if (!formHasChanged) {
            setFormHasChanged(true)
          }

          let newTitle = event.target.value
          let newFormData = {...formData}

          newFormData.title = newTitle

          setFormData(newFormData)

        }}
        value={formTitle}/>
    </ST.ActionSelectorLine>
    <ST.ActionSelectorLine>
      <ST.Text>Fields:</ST.Text>
    </ST.ActionSelectorLine>
    <ST.FieldsWrapper>
      <ST.FieldWrapper>
        <ST.FieldLabel>Name</ST.FieldLabel>
        <ST.TextField disabled={true}/>
      </ST.FieldWrapper>

      <ST.FieldWrapper>
        <ST.FieldLabel>Email</ST.FieldLabel>
        <ST.TextField disabled={true}/>
      </ST.FieldWrapper>
    </ST.FieldsWrapper>


    <ST.ActionSelectorLine>
    </ST.ActionSelectorLine>
  </ST.ViewSelectorWrapper>
}


const ST = {
  ActionSelectorLine: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 15px;
  `,

  ActionSelectorLineMargin: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 15px;
  `,
  Text: styled.p`
    margin: 0px;
  `,
  FieldLabel: styled.p`
    margin: 0px;
    font-size: 0.8em;
  `,
  TextField: styled(Input)`
    && {
      //margin-top: 10px;
      width: 100%;
    }

  `,

  FieldsWrapper: styled.div`
    width: 90%;
  `,
  FieldWrapper: styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    width: 100%;
  `,
  ViewSelectorWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    background: #fff;
    //background: #f1f1f1;
    min-height: 200px;

    border: 1px solid black;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    border-top: none;
    padding: 10px;
  `,
  SelectorInput: styled(Input)`
    && {
      //margin-top: 10px;
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

export default FormView
