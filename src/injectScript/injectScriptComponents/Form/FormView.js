import React, { useState, forwardRef } from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'
import {validateField} from '../../helpers.js'
import { Input } from 'antd'
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons'

function FormView({ formData, onNextHandler, updateFieldsObj, themeTextColor, style = {} }) {

  let [fieldsObjData, setFieldsObjData] = useState(formData.fields.reduce((accum, fieldData) => {
      accum[fieldData.label] = fieldData

      return accum
    }, {})
  )


  return <React.Fragment>
    <FS.FormWrapper style={{
      width: '100%',
      padding: '0px 2vw 0px 2vw',
      minHeight: '200px',
        ...style
    }}>
      <FS.Title className={'Form__Title'} themeTextColor={themeTextColor}>{formData.title}</FS.Title>


      {Object.entries(fieldsObjData).map(([key, obj, index]) => {
        let isValid = obj.isValid === undefined ? true : !!obj.isValid
        let showValid = obj.value && obj.value.length >= 3

        return <FS.FieldLine className={'FieldLine'} key={index} isValid={isValid}>
          <FS.FieldText className={'FieldText__Label'}>{key}</FS.FieldText>
          <FS.FieldInputWrapper>
            <FS.FieldLineValidIcon showValid={showValid} isValid={isValid}>
              {isValid ? <CheckCircleFilled /> : <CloseCircleFilled />}
            </FS.FieldLineValidIcon>
            <FS.FieldInput className={'FieldLine__Input'} onPressEnter={() => {
              onNextHandler()
            }} onChange={(event) => {

              let inputValue = event.target.value
              let newFieldsObjData = { ...fieldsObjData }
              newFieldsObjData[key].value = inputValue
              newFieldsObjData[key].isValid = validateField(obj.name, inputValue)

              // obj.state[1](inputValue)
              setFieldsObjData(newFieldsObjData)
              updateFieldsObj(newFieldsObjData)

            }} placeholder={key} value={fieldsObjData[key].value}/>
          </FS.FieldInputWrapper>

        </FS.FieldLine>
      })}

    </FS.FormWrapper>
  </React.Fragment>
}

const FS = {
  FormWrapper: styled.div`
    @media (max-width: 500px) {
      .Form__Title {
        margin-bottom: 0px;
        white-space: nowrap;
      }
    }
    
    @media (max-height: 290px) {
      .Form__Title {
        margin-bottom: 0px;
        white-space: nowrap;
      }
      
      
      .FieldText__Label {
        display: none;
      }
      
      .FieldLine {
        margin-bottom: 5px;
      }
      
      .FieldLine__Input {
        height: 2.2rem;
      }
    }

  `,
  Title: styled.h2.withConfig({
    shouldForwardProp: (prop) => prop !== 'themeTextColor',
  })`
     color: ${({themeTextColor}) => themeTextColor ? themeTextColor : Colors.primaryText};
    //color: #f9f9f9;
    font-size: 1.6rem;
    font-weight: bold;
    /* font-family: Monttserat, sans-serif; */
    text-align: center;
    margin-bottom: 20px;
  `,
  FieldLine: styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'isValid',
  })`
    width: 100%;
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    

  `,
  FieldLineValidIcon: styled.div.withConfig({
    shouldForwardProp: (prop) => !['showValid', 'isValid'].includes(prop),
  })`
    visibility: ${props => props.showValid ? 'visible' : 'hidden'};
    && svg {
      fill: ${props => props.isValid ? 'green' : '#fd2626b3'};
      width: 16px;
      height: 16px;
    }
    position: absolute;
    top: 10px;
    right: 8px;
    
    z-index: 3;
  `,
  FieldText: styled.p`
    text-transform: capitalize;
    margin: 0px 15px 0px 0px;
    //color: #615e7e;
    color: #f9f9f9;
    font-size: 1rem;
  `,
  FieldInputWrapper: styled.div`
    width: 100%;
    height: 100%;
    position: relative;
  `,
  FieldInput: styled(Input)`
    height: 2.5rem;
    
  `
}

export default FormView

