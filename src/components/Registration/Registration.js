import React, { useState } from 'react'
//import { AutoComplete, Button, Checkbox, Col, Form, Icon, Input, Row, Select, } from 'antd'

import AutoComplete from 'antd/es/autocomplete'
import Button from 'antd/es/button'
import Checkbox from 'antd/es/checkbox'
import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Icon from '../Icon/Icon'
import Input from 'antd/es/input'
import Row from 'antd/es/row'
import Select from 'antd/es/select'
import styled from 'styled-components'
import MainColors from '../../constants/mainColors'
import RecaptchaItem from '../utilComponents/RecaptchaItem/RecaptchaItem'
import { showErrorsForResponse } from '../../utils/helperFunctions'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { registerWithEmailAndPassword } from '../../actions/authActions'
import Media from 'react-media'
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'

const { Option } = Select
const AutoCompleteOption = AutoComplete.Option

const RegistrationForm = (props) => {
  const [form] = Form.useForm()
  const [confirmDirty, setConfirmDirty] = useState(false)
  const [captchaValid, setCaptchaValid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (values) => {
    setIsLoading(true)

    console.log('Received values of form: ', values)

    props.actions.registerWithEmailAndPassword(values.email, values.password)
      .then(userData => {

        console.log(userData)

        setIsLoading(true)

      })
      .catch(error => {


        showErrorsForResponse(error)

        setIsLoading(false)

      })
  }

  const handleConfirmBlur = e => {
    const value = e.target.value
    setConfirmDirty(confirmDirty || !!value)
  }

  const captchaVerified = () => {
    setCaptchaValid(true)
    console.log('verified')
  }

  const captchaExpired = () => {
    setCaptchaValid(false)
    console.log('expired')
  }

  const formItemLayout = {
    labelCol: {
      xs: { span: 4 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 12 },
      sm: { span: 14 },
    },
  }
  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 16,
        offset: 0,
      },
      sm: {
        span: 18,
        offset: 6,
      },
    },
  }

  return (
    <ErrorBoundary>
      <S.Form {...formItemLayout} form={form} onFinish={handleSubmit} scrollToFirstError>
        <S.FormItem 
          label="E-mail"
          name="email"
          rules={[
            {
              type: 'email',
              message: 'The input is not valid E-mail!',
            },
            {
              required: true,
              message: 'Please input your E-mail!',
            },
          ]}
        >
          <S.Input
            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }}/>}
            placeholder="Email"
          />
        </S.FormItem>
        <S.FormItem 
          label="Password" 
          hasFeedback
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your password!',
            },
          ]}
        >
          <S.InputPassword 
            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }}/>}
            placeholder="Password"
            onBlur={handleConfirmBlur}
          />
        </S.FormItem>
        <S.FormItem 
          className={"captcha"} 
          label="Captcha" 
          extra="We must make sure that your are a human."
          name="captcha"
          rules={[
            {
              required: true,
              message: 'Please input the captcha you got!',
              validator: () => {
                if (captchaValid) {
                  return Promise.resolve()
                } else {
                  return Promise.reject(new Error('Please input the captcha you got!'))
                }
              }
            }
          ]}
        >
          <S.RecaptchaItemRow gutter={8}>
            <S.RecaptchaItemCol span={12}>
              <React.Fragment>
                <Media query="(min-width: 577px)" render={
                  () =>                 <RecaptchaItem
                    onVerify={captchaVerified}
                    onExpire={captchaExpired}
                    compact={false}
                  />
                }/>
                <Media query="(max-width: 576px)" render={
                  () =>                 <RecaptchaItem
                    onVerify={captchaVerified}
                    onExpire={captchaExpired}
                    compact={true}
                  />
                }/>
              </React.Fragment>
            </S.RecaptchaItemCol>
          </S.RecaptchaItemRow>
        </S.FormItem>
        <S.FormItem className={'readTOC'} {...tailFormItemLayout}>
          <Form.Item 
            name="agreement" 
            valuePropName="checked"
            noStyle
          >
            <S.Checkbox style={{ color: MainColors.App.HomePage.inputText }}>
              I have read the <a style={{ color: MainColors.App.HomePage.inputText, textDecoration: 'underline' }}
                                 href="https://telltrail.ai/terms">agreement</a>
            </S.Checkbox>
          </Form.Item>
        </S.FormItem>
        <S.FormItem {...tailFormItemLayout}>
          <S.Button loading={isLoading} type="primary" htmlType="submit">
            Register
          </S.Button>
        </S.FormItem>
      </S.Form>
    </ErrorBoundary>
  )
}

const S = {
  Form: styled(Form)`
  @media only screen and (max-width: 921px) {
     
      
      .captcha .ant-form-item-label {
        display: none;
      }
      .captcha .ant-form-item-control-wrapper  {
        width: 100%;
        display: flex;
        justify-content: flex-end;
}
      }

    }
    
  @media only screen and (max-width: 567px) {

      .readTOC .ant-form-item-control-wrapper  {
        width: 100%;
      }
      .captcha label {
        display: none;
      }
      .captcha .ant-form-item-control-wrapper  {
        width: 100%;
        height: 150px;
        display: flex;
        justify-content: center;

      }
      
      .captcha .ant-form-extra {
        display: none;
      }
    } 
    
    
  `,
  FormItem: styled(Form.Item)`
  @media only screen and (max-width: 921px) {
      display: flex;
      align-items: center;
      justify-content: center;
      .ant-form-item-label {
        width: 40%;
        padding: 0;
        margin-right: 5px;

      }
      
      .ant-form-item-control-wrapper {
        width: 55%;
      }
    } 

    color: ${MainColors.App.HomePage.inputText};
    margin-bottom: 10px;
    & .ant-form-item-label label {
      color: ${MainColors.App.HomePage.inputText};
    }
    
    & div.ant-form-extra {
      color: ${MainColors.App.HomePage.inputText};
    }
    
    & .ant-form-item-required::before {
      color: ${MainColors.App.HomePage.inputText};
    }
    
    & .has-error .ant-form-explain {
     color: ${MainColors.App.HomePage.inputText};
    }
  `,
  Checkbox: styled(Checkbox)`
    color: ${MainColors.App.HomePage.inputText};
    
    & .ant-checkbox-checked .ant-checkbox-inner {
      background-color: ${MainColors.App.HomePage.buttonInactive};
      border-color: ${MainColors.App.HomePage.buttonInactive};
    }
    
  `,
  Input: styled(Input)`
    
    && input {
      
      border-radius: 50px;
      color: ${MainColors.App.HomePage.inputText};
    }
    
    & input::placeholder {
      color: ${MainColors.App.HomePage.inputText};
    }
    
    & i svg {
      color: ${MainColors.App.HomePage.inputText};
    }
  `,
  InputPassword: styled(Input.Password)`
    && input {
      border-radius: 50px;
    }
    
    & input::placeholder {
      color: ${MainColors.App.HomePage.inputText};
    }
    
    & i svg {
      color: ${MainColors.App.HomePage.inputText};
    }
    
  `,
  Button: styled(Button)`
    width: 100%;
    color: ${MainColors.App.HomePage.buttonText};
    
    && input {
      border-radius: 50px;
    }
    
    && {
      background-color: ${MainColors.App.HomePage.buttonInactive};
      border-radius: 50px;
    }
    
    &&:hover, &&:focus {
      background-color: ${MainColors.App.HomePage.buttonActive};
      color: ${MainColors.App.HomePage.buttonInactive};
    }

  `,
  RecaptchaItemCol: styled(Col)`
    
      height: 75px;
  `,
  RecaptchaItemRow: styled(Row)`
    
      height: 75px;
  `
}


function mapDispatchToProps(dispatch) {
  return {

    actions: bindActionCreators({ registerWithEmailAndPassword: registerWithEmailAndPassword }, dispatch)

  }
}

const reduxRegistrationForm = connect(null, mapDispatchToProps)(RegistrationForm)

export default reduxRegistrationForm
