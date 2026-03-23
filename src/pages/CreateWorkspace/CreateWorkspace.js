import React, { useState } from 'react'
//import { Button, Icon, Input, Layout } from 'antd'

import Button from 'antd/es/button'
import Icon from '../../components/Icon/Icon'
import Input from 'antd/es/input'
import Layout from 'antd/es/layout'

import ErrorBoundary from '../../components/utilComponents/HOCs/ErrorBoundary'
import styled from 'styled-components'
import Colors from '../../constants/mainColors'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { useNavigate, useLocation, useParams } from 'react-router-dom'

import * as workspaceActions from '../../actions/workspacesActions'

const { Content } = Layout


const AddWorkspacePage = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const [newWorkspaceName, setNewWorkspaceName] = useState('')

  function onCreateWorkspace(newWorkspaceName) {

    return props.workspaceActions.createWorkspace(props.authData.token, newWorkspaceName)
      .then((responseData) => {

        console.log(responseData)
      })
      .then(() => {
        navigate(`/`)
      })
  }

  return (
    <ErrorBoundary>
      <S.MainWrapper>

        <S.LeftSide>
          <S.MessageContainer>
            <S.GoBack>
              <S.GoBack__Icon size={'small'} type={'arrow-left'}/>
              <S.GoBack__Text onClick={() => {
                navigate(`/`)
              }}>
                Back</S.GoBack__Text>
            </S.GoBack>

            <S.Title>
              <span>Workspace.</span><br/>
              Give your team a name.
            </S.Title>

            <S.Splitter>

            </S.Splitter>

            <S.Subtitle>
              Each workspace is unique, with its own projects, team members, activity logs, and integrations.
            </S.Subtitle>

          </S.MessageContainer>
        </S.LeftSide>


        <S.RightSide>
          <S.Modal__Container>
            <S.Modal>
              <S.Modal__Title>
                <S.Modal__TitleText>Create Workspace</S.Modal__TitleText>
              </S.Modal__Title>
              <S.Modal__Content>
                <S.Modal__NameInput size="large" placeholder="Name (Pied Piper)"
                                    value={newWorkspaceName}
                                    onChange={(event) => {


                                      setNewWorkspaceName(event.target.value)
                                    }}
                                    onPressEnter={() => {
                                      onCreateWorkspace(newWorkspaceName)
                                    }}
                />
                <S.Modal__Button type={'Primary'}
                                 onClick={() => {
                                   onCreateWorkspace(newWorkspaceName)
                                 }}>
                  Create Workspace
                  <S.Modal__ButtonIcon size={'small'} type={'arrow-right'}/>
                </S.Modal__Button>
              </S.Modal__Content>
            </S.Modal>
          </S.Modal__Container>
        </S.RightSide>

      </S.MainWrapper>
    </ErrorBoundary>
  )

}
const S = {

  MainWrapper: styled.div`
    background: white;
    height: 100%;
    position: relative;
    overflow: hidden;

    width: 100%;
    padding: 30px 36px;
    min-height: calc(100vh - 170px);
    max-width: 1800px;
    margin: 0 auto;

  `,
  LeftSide: styled.div`
    position: absolute;
    top: 0;
    left: 0;
    min-height: 100%;
    width: calc(62% - 1px);
    background: #fff;
  `,
  MessageContainer: styled.div`
    position: relative;
    padding: 20px 35px;
    max-width: 900px;
    margin: 0 auto;

  `,
  GoBack: styled.div`
    display: flex;
    align-items: center;
    height: 60px;

    &&:hover {
      cursor: pointer;
    }
  `,
  GoBack__Icon: styled(Icon)`

    && {
      width: 30px;
      height: 20px;
      vertical-align: middle;

    }

    && svg {
      fill: ${Colors.primaryColor};
      width: 100%;
      height: 100%;
    }
  `,
  GoBack__Text: styled.span`
    margin: 0 0 0 5px;
    padding: 0;
    font-size: 1.7em;
    width: 70px;
    height: 40px;
    display: block;
    line-height: 40px;
    vertical-align: middle;
    
    
  `,
  Title: styled.div`
    font-size: 65px;
    line-height: 80px;
    color: #000;
    font-weight: 700;
    margin-top: 65px;

    && span {
      color: #516ff7;
    }
  `,
  Splitter: styled.div`
    position: relative;
    margin: 80px 0 15px;
    background: #8d9599;
    opacity: .15;
    width: 70px;
    height: 6px;
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
  `,
  Subtitle: styled.div`
    font-size: 30px;
    line-height: 45px;
    font-weight: lighter;
    color: #8d9599;
    width: 80%;
  `,
  RightSide: styled.div`
    position: fixed;
    top: 0;
    right: 0;
    min-height: 100%;
    height: 100%;
    width: calc(38% + 1px);
    background-image: linear-gradient(174.38deg, rgba(64,159,248,.9) 4%, ${Colors.primaryColor} 52.8%);
    background-repeat: no-repeat;
    background-attachment: fixed;
    border-left: solid 1px rgba(0,0,0,.5);

  `,
  Modal__Container: styled.div`
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;


  `,
  Modal: styled.div`
    
    width: 380px;
    height: 225px;
    vertical-align: middle;

    justify-content: space-between;
    display: flex;
    flex-direction: column;
    background: #fff;
    overflow: hidden;
    text-align: left;
    -webkit-box-shadow: 0 10px 25px rgb(0 0 0 / 15%);
    -moz-box-shadown: 0 10px 25px rgba(0,0,0,.15);
    box-shadow: 0 10px 25px rgb(0 0 0 / 15%);
    -webkit-border-radius: 12px;
    -moz-border-radius: 12px;
    border-radius: 12px;
  `,
  Modal__NameInput: styled(Input)`
    height: 50px;
    font-size: 1.3em;
    border: 1px solid black;
    
    &&:hover {
      border: 1px solid black !important;
    }
    
    &&:focus {
      border: 1px solid black !important;
    }

  `,
  Modal__Title: styled.div`
    height: 50px;
    border-bottom: 2px solid ${Colors.primaryColor};
  `,
  Modal__TitleText: styled.div`
    text-align: center;
    font-size: 1.4em;
    line-height: 50px;
    color: ${Colors.primaryColor};
}
  `,
  Modal__Content: styled.div`
    height: 100%;
    justify-content: center;
    display: flex;
    flex-direction: column;
    padding: 10px 35px;
  `,
  Modal__Button: styled(Button)`
    && {
      height: 50px;
      width: 100%;
      margin-top: 10px;
      background-color: ${Colors.primaryColor};  
      color: #FFF;
      font-size: 1.3em;
    }
    
    &&:hover {
      background-color: ${Colors.primaryColorDarker};
    }
  `,
  Modal__ButtonIcon: styled(Icon)`
    && {
      width: 30px;
      height: 20px;
      vertical-align: middle;
    
    }
    
    && svg {
      fill: #ffffff;
      width: 100%;
      height: 100%;
    }
  `


}

function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef()

  // Store current value in ref
  useEffect(() => {
    ref.current = value
  }, [value]) // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current
}

function mapStateToProps(state) {
  return {
    authData: state.authReducer.authData
  }
}

function mapDispatchToProps(dispatch) {
  return {

    workspaceActions: bindActionCreators(workspaceActions, dispatch)

  }
}


export default connect(mapStateToProps, mapDispatchToProps)(AddWorkspacePage)
