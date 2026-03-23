import React, { useState, useEffect, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
//import { Button, Checkbox, Form, Icon, Input } from 'antd'

import Button from 'antd/es/button'
import Checkbox from 'antd/es/checkbox'
import Form from 'antd/es/form'
import Icon from '../Icon/Icon'
import Input from 'antd/es/input'
import styled from 'styled-components'
import { authWithEmailAndPassword } from '../../actions/authActions'
import {showErrorsForResponse} from '../../utils/helperFunctions'
import MainColors from '../../constants/mainColors'
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'


const LoginForm = (props) => {
  const [form] = Form.useForm()
  let [isLoading, setIsLoading] = useState(false)

  function handleSubmit(values) {
    setIsLoading(true)

    console.log('Received values of form: ', values)

    props.actions.authWithEmailAndPassword(values.email, values.password)
      .then(userData => {

        console.log(userData)
        setIsLoading(false)
      })
      .catch(error => {

        showErrorsForResponse(error)
        setIsLoading(false)
      })
  }

    const formItemLayout = {
      labelCol: {
        xs: { span: 8 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
      },
    }

    return (
      <ErrorBoundary>
      <S.Form {...formItemLayout} form={form} onFinish={handleSubmit} className="login-form">
        <S.FormItem 
          label={'E-mail'}
          name="email"
          rules={[{ required: false, message: 'Please input your email!' }]}
        >
          <S.Input
            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }}/>}
            placeholder="Email"
          />
        </S.FormItem>
        <S.FormItem 
          label={'Password'} 
          hasFeedback
          name="password"
          rules={[{ required: false, message: 'Please input your Password!' }]}
        >
          <S.Input
            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }}/>}
            type="password"
            placeholder="Password"
          />
        </S.FormItem>
        <S.FormItem className={"forgotPass"} wrapperCol={24}>
          <Form.Item 
            name="remember" 
            valuePropName="checked"
            initialValue={true}
            noStyle
          >
            <S.Checkbox style={{ color: MainColors.App.HomePage.inputText }}>Remember me</S.Checkbox>
          </Form.Item>
          <S.ForgotLink to={'/forgot-password'} className="login-form-forgot">
            Forgot password
          </S.ForgotLink>
          <S.Button loading={isLoading} type="primary" htmlType="submit" className="login-form-button">
            Log in
          </S.Button>
        </S.FormItem>
      </S.Form>
      </ErrorBoundary>
    )
  }

function mapStateToProps(state) {

  return {
    authData: state.authReducer.authData
  }
}

function mapDispatchToProps(dispatch) {
  return {

    actions: bindActionCreators({ authWithEmailAndPassword: authWithEmailAndPassword }, dispatch)

  }
}

const reduxLoginWrapped = connect(null, mapDispatchToProps)(LoginForm)

export default reduxLoginWrapped

const S = {
  Form: styled(Form)`
    color: ${MainColors.App.HomePage.inputText};
    padding: 15px;
    
        @media (max-width:921px) {
     
      
   
      
      && .forgotPass .ant-form-item-control-wrapper {
        width: 100%;
          
      }
      
      && .forgotPass .ant-form-item-children {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    } 
  `,
  ForgotLink: styled(Link)`
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
    @media (max-width:921px) {
      display: flex;
      align-items: center;
      justify-content: center;
      .ant-form-item-label {
        width: 20%;
        padding: 0;
        margin-right: 5px;

      }
      
      
      .ant-form-item-control-wrapper {
        width: 70%
      }
      
    } 
    
    
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

//
// ReactDOM.render(<WrappedNormalLoginForm />, mountNode);
// #components-form-demo-normal-login .login-form {
//   max-width: 300px;
// }
// #components-form-demo-normal-login .login-form-forgot {
//   float: right;
// }
// #components-form-demo-normal-login .login-form-button {
//   width: 100%;
// }
