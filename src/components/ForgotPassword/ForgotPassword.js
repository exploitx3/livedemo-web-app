import React, { useState } from 'react'
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
import { showErrorsForResponse } from '../../utils/helperFunctions'
import MainColors from '../../constants/mainColors'
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'
import axios from '../../utils/axiosInstance'


const ForgotPassword = (props) => {
  const [form] = Form.useForm()
  let [isLoading, setIsLoading] = useState(false)
  let [isSent, setIsSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()

    form.validateFields().then((values) => {
      console.log('Received values of form: ', values)

      return axios.post('/users/forgotPassword', {
          email: values.email
        }, {
        })
        .then((response) => {
          setIsLoading(false)
          setIsSent(true)

        })
        .catch(err => {
          setIsLoading(false)

          showErrorsForResponse(err)
        })
    }).catch((err) => {
      console.log('Validation failed:', err)
    })

  }

    const formItemLayout = {
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
      },
    }

    return (
      <ErrorBoundary>

      <S.Form {...formItemLayout} form={form} onFinish={handleSubmit} className="forgotPassword-form">
        <S.Title>Forgot password</S.Title>
        {isSent ? (
          <p>Done. Check your email and follow the instructions.</p>
        ) : (
          <React.Fragment>

            <p>Enter your email and we'll send you a link to reset your password.</p>
            <S.FormItem
              name="email"
              rules={[{ required: false, message: 'Please input your email' }]}
            >
              <S.Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }}/>}
                placeholder="Email"
              />
            </S.FormItem>

            <S.FormItem className={"forgotPass"} wrapperCol={24}>
              <S.Button loading={isLoading} type="primary" htmlType="submit" className="forgotPass-form-button">
                Reset
              </S.Button>
            </S.FormItem>
          </React.Fragment>)}
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

const reduxLoginWrapped = connect(null, mapDispatchToProps)(ForgotPassword)

export default reduxLoginWrapped

const S = {
  Title: styled.h2`
    font-size: 1.4em;
    text-align: center;
  `,
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
// #components-form-demo-normal-login .forgotPass-form {
//   max-width: 300px;
// }
// #components-form-demo-normal-login .forgotPass-form-forgot {
//   float: right;
// }
// #components-form-demo-normal-login .forgotPass-form-button {
//   width: 100%;
// }
