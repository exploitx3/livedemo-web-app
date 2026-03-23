import React, { Fragment, useState } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { useLocation, useNavigate } from 'react-router-dom'
import * as queryString from 'query-string/index'
import { authWithToken } from '../../actions/authActions'
//import { Col, Layout, Row } from 'antd'

import Col from 'antd/es/col'
import Layout from 'antd/es/layout'
import Row from 'antd/es/row'
import HeaderComponent from '../../components/Header/HeaderHomePage'
import ChangePasswordForm from '../../components/ChangePassword/ChangePasswordForm'
import { showErrorsForResponse } from '../../utils/helperFunctions'
import axios from '../../utils/axiosInstance'
import ErrorBoundary from '../../components/utilComponents/HOCs/ErrorBoundary'

const {Header, Content} = Layout

const ChangePassword = (props) => {
  const location = useLocation()
  const navigate = useNavigate()
  let [isLoading, setIsLoading] = useState(false)

  let token = queryString.parse(location.search).token
  if(!token) {

    navigate('/')
  }


    // props.actions.authWithToken(token)
    //   .then(() => {
    //     props.history.push('/')
    //   })
  let headers = {
    Authorization: `Bearer ${token}`,
    ClientId: 'customScopes'
  }
  function onSubmit(newPassword) {

    setIsLoading(true)

    return axios.post('/users/changePassword', {
      newPassword
    }, {
      headers
    })
      .then((response) => {
        setIsLoading(false)


        navigate(`/auth?token=${response.data.token}`)

      })
      .catch(err => {
        setIsLoading(false)

        showErrorsForResponse(err)
      })
    // props.actions.authWithToken(token)
    //   .then(userData => {
    //
    //     console.log(userData)
    //     setIsLoading(false)
    //   })
    //   .catch(error => {
    //
    //     showErrorsForResponse(error)
    //     setIsLoading(false)
    //   })
  }

  return (
    <ErrorBoundary>
    <Fragment>
      <Layout>
        <S.Header>
          <HeaderComponent/>
        </S.Header>
        <Content style={{padding: '50px'}}>
          <Row type={'flex'} gutter={10} justify={'center'}>
            <Col span={7}>
              <ChangePasswordForm isLoading={isLoading} onSubmit={onSubmit}/>
            </Col>
          </Row>
        </Content>

      </Layout>
    </Fragment>
    </ErrorBoundary>
  )
}

function mapDispatchToProps(dispatch) {
  return {

    actions: bindActionCreators({ authWithToken: authWithToken }, dispatch)

  }
}

const S = {
  Header: styled(Header)`
  && {
    height: 64px;
    padding: 0 100px;
    line-height: 64px;
    background: white;
    display: flex;
    align-items: center;
  
  }
    
`
}

export default connect(null, mapDispatchToProps)(ChangePassword)
