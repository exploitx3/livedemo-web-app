import React from 'react'
//import { Button, Checkbox, Form, Icon, Input } from 'antd'

import Button from 'antd/es/button'
import Checkbox from 'antd/es/checkbox'
import Form from 'antd/es/form'
import Icon from '../Icon/Icon'
import Input from 'antd/es/input'
import styled from 'styled-components'
import MainColors from '../../constants/mainColors'
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'


const ChangePasswordForm = (props) => {
  const [form] = Form.useForm()
  const {onSubmit} = props

  function handleSubmit(values) {
    console.log('Received values of form: ', values)

    return onSubmit(values.confirmPassword)
  }

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  }

  return (
    <ErrorBoundary>
      <S.Form {...formItemLayout} form={form} onFinish={handleSubmit} className="change-password-form">
      <S.FormItem 
        label={'New Password'} 
        hasFeedback
        name="newPassword"
        rules={[{
          required: true, min: 8, message: 'New password must be at least 8 characters',
        }]}
      >
        <S.Input
          prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }}/>}
          type="password"
          placeholder="Password"
        />
      </S.FormItem>

      <S.FormItem 
        label={'Confirm Password'} 
        hasFeedback
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: 'Please confirm your password!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('Confirm password must be the same as New Password!'))
            },
          }),
        ]}
      >
        <S.Input
          prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }}/>}
          type="password"
          placeholder="Password"
        />
      </S.FormItem>
      <S.FormItem wrapperCol={24}>
        <S.Button loading={props.isLoading} type="primary" htmlType="submit" className="change-password-form-button">
          Change Password
        </S.Button>
      </S.FormItem>
    </S.Form>
    </ErrorBoundary>


  )
}


export default ChangePasswordForm



const S = {
  Form: styled(Form)`
    color: ${MainColors.App.HomePage.inputText};
    
    
  `,
  ForgotLink: styled.a`
    float: right;
    color: ${MainColors.App.HomePage.inputText};
  `,
  Button: styled(Button)`
    
    && {
      background-color: ${MainColors.App.HomePage.buttonInactive};
      width: 100%;
      color: ${MainColors.App.HomePage.buttonText};
      display: block;
      border-radius: 50px;
      cursor: pointer;
    }
    
    &&:hover {
      background-color: ${MainColors.App.HomePage.buttonActive};
      color: ${MainColors.App.HomePage.buttonInactive};
      cursor: pointer;
    }
  `,
  FormItem: styled(Form.Item)`
    color: ${MainColors.App.HomePage.inputText};
     & .ant-form-item-label label {
      color: ${MainColors.App.HomePage.inputText};
    }
    
    & .ant-form-item-required::before {
      color: ${MainColors.App.HomePage.inputText};
    }
  `,
  Checkbox: styled(Checkbox)`
    & .ant-checkbox-checked .ant-checkbox-inner {
      background-color: ${MainColors.App.HomePage.buttonInactive};
      border-color: ${MainColors.App.HomePage.buttonInactive};
    }
    
    & > label.ant-checkbox-wrapper {
      color: ${MainColors.App.HomePage.inputText};
    }
  `,
  Input: styled(Input)`

    && input {
    
      color: ${MainColors.App.HomePage.inputText};
      border-radius: 50px;
    }
    
    & input::placeholder {
      color: ${MainColors.App.HomePage.inputText};
    }
    
    & i svg {
      color: ${MainColors.App.HomePage.inputText};
    }

`

}
