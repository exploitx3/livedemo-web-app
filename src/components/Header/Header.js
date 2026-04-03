import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
//import { Button, Layout, Select } from 'antd'

import Layout from 'antd/es/layout'
import 'antd/es/layout/style'
import Select from 'antd/es/select'
import 'antd/es/select/style'
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'
const LayoutHeader = Layout.Header
const { Option } = Select
import mainColors from '../../constants/mainColors'
import axios from '../../utils/axiosInstance'
import ENV from '../../config'
import * as workspaceActions from '../../actions/workspacesActions'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'


const Header = (props) => {
  let {liveDemo, title, authData, workspaceActions, workspaces, currentSelectedWorkspace} = props
  let [liveDemoName, setLiveDemoName] = useState(title)

  let [isNameEditable, setIsNameEditable] = useState(false)

  useEffect(() => {
    setLiveDemoName(props.title)
  }, [props.title])


  function getSelectWorkspaceComp(workspaces, currentSelectedWorkspace, collapsed) {
    let loading = false


    if (!workspaces) {

      return null
    } else if (workspaces && workspaces.length === 0) {

      return <p style={{ color: 'white' }}>No workspaces</p>
    } else {

      return (
        <S.SelectWorkspaceWrapper>
          <S.SelectWorkspace__Label>Workspace:</S.SelectWorkspace__Label>
        <S.Select
          loading={loading}
          dropdownStyle={{
            background: mainColors.App.sidebarColor,
            border: `1px solid ${mainColors.primaryColor}`,
            borderRadius: 8
          }}
          defaultValue={
            currentSelectedWorkspace._id ? currentSelectedWorkspace._id : ''
          }
          value={
            currentSelectedWorkspace._id ? currentSelectedWorkspace._id : ''
          }
          style={{
            // display: (collapsed ? 'none' : 'block'),
            width: 120

          }} onChange={(selectedWorkspaceId) => {

          workspaceActions.updateCurrentSelectedWorkspace(
            authData.token,
            selectedWorkspaceId
          )

        }}>
          {workspaces.map((workspace, index, array) => {
            // let isSelected = workspace._id === currentSelectedWorkspace._id


            let isLast = index === array.length-1
            return <Option style={{
              background: 'none',
              color: mainColors.primaryColor,
              borderBottom: isLast ? 'none' : '1px solid #d9d9d9',
              textTransform: 'capitalize'
            }} key={workspace._id} value={workspace._id}>{workspace.name}</Option>
          })
          }
        </S.Select>
        </S.SelectWorkspaceWrapper>

      )
    }
  }



  function updateLiveDemoName(liveDemo, name, authToken) {
    return axios.patch(`${ENV.STORIES_API}/workspaces/${liveDemo.workspaceId}/stories/${liveDemo._id}`,
      {
        name: name
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      .then((res) => {


        return res.data
      })
  }

  return (
    <ErrorBoundary>
    <S.Header style={props.style ? props.style : {}} title={props.title} >
      <S.DemoName
        className={isNameEditable ? 'editing' : ''}
        onClick={(e) => {
          if(e.detail === 2) {
            setIsNameEditable(true)
          }
        }}
        contentEditable={isNameEditable}
        suppressContentEditableWarning={true}
        onKeyPress={function (event) {
          console.log(event)

          if (event.key === "Enter") {
            event.preventDefault();

            event.target.blur()
          }

        }}
        onBlur={function (e) {
          setIsNameEditable(false)

          let newLiveDemoName = e.target.innerText

          if(newLiveDemoName !== liveDemoName) {

            updateLiveDemoName(liveDemo, newLiveDemoName, authData.token)
            setLiveDemoName(newLiveDemoName)
          }
        }}
      >{liveDemoName}</S.DemoName>

      {props.rightSideComponent || getSelectWorkspaceComp(workspaces, currentSelectedWorkspace, false)}
    </S.Header>
    </ErrorBoundary>
  )
}

const S = {
  DemoName: styled.h1`
    font-family: ${mainColors.fontFamily};
    font-weight: 300;

    user-select: none; /* standard syntax */
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */

    &&.editing {
        cursor: text;
        text-decoration: underline;
    }
  `,
  SelectWorkspaceWrapper: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 250px;
    margin-right: 34px;
  `,
  SelectWorkspace__Label: styled.p`

    font-family: ${mainColors.fontFamily};
    color: ${mainColors.primaryText};
  `,
  Select: styled(Select)`
    text-transform: capitalize;

    && .ant-select-content-value {
      background: none;
      color: ${mainColors.primaryColor};
      border: none !important;
      box-shadow: none;
    }


    && .ant-select-selection:hover {
      border: none;
    }

    && .ant-select-arrow {
      color: ${mainColors.primaryColor};
    }

    && .ant-select-selection-selected-value {
      width: 90%;
    }

    /* Ant Design v6 compatible selectors - keeping old ones for backward compatibility */
    && .ant-select-selector {
      background: none !important;
      color: ${mainColors.primaryColor} !important;
      border: none !important;
      border-radius: 14px !important;
      box-shadow: none !important;
    }

    && .ant-select-selector:hover {
      border: none !important;
    }
  `,
  RightSide: styled.span`
    height: 100%;
    flex: 1;
    width: 50%;

`,
  Header: styled(LayoutHeader)`
      && h1,
      && p {
        margin: 0;
      }

      font-size: 1.4em;
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;

    &.ant-layout-header {
      text-transform: capitalize;
      z-index: 2;
      padding: 0px 25px;
      background: ${mainColors.App.sidebarColor};
      position: relative;
      width: 100%;
      @media (min-width:567px) {

        //box-shadow: 0px 1px 10px #aaaaaa;
      }

    }

    && h1{
      width: 50%;
      color: ${mainColors.primaryText};
      font-size: 1.2em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;


    }

     @media (max-width:567px) {
        //&& {
        //  width: 50%;
        //}

        && h1 {
          width: 90%;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

        }

        && p {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

      }

  `
}

Header.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
}



function mapStateToProps(state) {
  return {
    workspaces: state.workspacesReducer.workspaces,
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace,
    authData: state.authReducer.authData
  }
}

function mapDispatchToProps(dispatch) {
  return {

    workspaceActions: bindActionCreators(workspaceActions, dispatch)

  }
}


export default connect(mapStateToProps, mapDispatchToProps)(Header)
