//import { Input, Modal, Select } from 'antd'

import Input from 'antd/es/input'
import React, { useState } from 'react'
import styled from 'styled-components'
import CommonOptions from '../CommonOptions/CommonOptions'
import OverlayConfig from '../OverlayConfig/OverlayConfig'

const FormView = ({

                    formHasChanged,
                    setFormHasChanged,
                    formData,
                    setFormData,
                    internalStep,
                    setInternalStep,
                  }) => {


  let formTitle = (formData && formData.title) || 'Get in touch with us'

  function updateViewField(fieldName, value) {
    if (!internalStep || !setInternalStep) return
    let newStep = JSON.parse(JSON.stringify(internalStep))
    if (newStep.view.popup[fieldName] !== value) {
      newStep.view.popup[fieldName] = value
      setInternalStep(newStep)
    }
  }

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

    {internalStep && setInternalStep && (
      <CommonOptions
        setInternalStep={setInternalStep}
        internalStep={internalStep}
      />
    )}

    {internalStep && setInternalStep && (
      <OverlayConfig
        internalStep={internalStep}
        updateViewField={updateViewField}
      />
    )}
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

    // border: 1px solid black;
    // border-bottom-left-radius: 6px;
    // border-bottom-right-radius: 6px;
    // border-top: none;
    // padding: 10px;
  `,
  SelectorInput: styled(Input)`
    && {
      margin-left: 10px;
      width: 100%;
    }

  `,
}

export default FormView
