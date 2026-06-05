import styled from 'styled-components'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Spinner from '../../components/Spinner/Spinner'
import Header from '../../components/Header/Header'
//import { Avatar, Checkbox, Col, Icon, Layout, List, Modal, Select } from 'antd'

import Avatar from 'antd/es/avatar'
import 'antd/es/avatar/style'
import Checkbox from 'antd/es/checkbox'
import 'antd/es/checkbox/style'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import 'antd/es/row/style'
import Icon from '../../components/Icon/Icon'
import Layout from 'antd/es/layout'
import List from 'antd/es/list'
import 'antd/es/list/style'
import Modal from 'antd/es/modal'
import 'antd/es/modal/style'
import Select from 'antd/es/select'
import 'antd/es/select/style'
import Switch from 'antd/es/switch'
import 'antd/es/switch/style'
import StyledInput from '../../components/StyledInput/StyledInput'
import Colors from '../../constants/mainColors'
import InviteUsersModal from './InviteUsersModal'
import axios from '../../utils/axiosInstance'
import { bindActionCreators } from "redux";
import { updateAllWorkspacesForUser, updateCurrentSelectedWorkspace } from "../../actions/workspacesActions";
import ENV from '../../config.json'
const { Option } = Select
const { Content, Footer, Sider } = Layout
const { confirm, info } = Modal


const SettingsPage = ({ authData, currentSelectedWorkspace, actions }) => {
  const [user, setUser] = useState([])

  const [userLoading, setUserLoading] = useState(false)

  const [isLoading, setIsLoading] = useState(true)

  const [selectedWorkspace, setSelectedWorkspace] = useState(currentSelectedWorkspace)

  const [hubspotEnabled, setHubspotEnabled] = useState(currentSelectedWorkspace.integrations?.hubspot || false)

  let [newEmail, setNewEmail] = useState('')
  let [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  let [pendingAdminId, setPendingAdminId] = useState(null)
  let [isAdminSaving, setIsAdminSaving] = useState(false)
  let [adminSaveStatus, setAdminSaveStatus] = useState(null)

  useEffect(() => {

    if (currentSelectedWorkspace._id) {

      actions.updateCurrentSelectedWorkspace(
        authData.token,
        currentSelectedWorkspace._id
      )
    }
  }, []);

  useEffect(() => {
    if (currentSelectedWorkspace._id) {
      setIsLoading(false)
    }

    setSelectedWorkspace(currentSelectedWorkspace)
    setHubspotEnabled(currentSelectedWorkspace.integrations?.hubspot || false)
  }, [currentSelectedWorkspace])


  function showConfirmDeleteUser(userId, userName, authToken) {


    return confirm({
      title: 'Delete User?',
      content: `Do you want to delete ${userName}?`,
      okText: 'Confirm',
      okButtonProps: { type: 'danger' },
      cancelText: 'Cancel',
      onOk() {
        return axios.post(`/users/changeWorkspaceMemberRole`, {}, { headers: { 'Authorization': `Bearer ${authToken}` } })
          .then(req => {

            console.log(req.data)
          })
          .catch(err => {

            console.log(err)
          })
      },
      onCancel() {
      },
    })


  }


  function renderUser(user, selectedWorkspace, currentUserId) {

    let currentUserIsAdmin = currentUserId === selectedWorkspace.adminUser._id
    let userRole = user._id === selectedWorkspace.adminUser._id ? 'Admin' : 'Collaborator'
    let inviteSendingForMember = false
    return (
      <U.ListItem key={user._id}>
        <U.Name>
          <U.ChannelIcon type={'user'} />
          <U.NameText>{user.name}</U.NameText>
        </U.Name>
        <U.Role>
          {userRole}
        </U.Role>
        <U.Action>
          {(userRole === 'Admin' || !currentUserIsAdmin) ? ' - ' : (
            <U.ActionDeleteButton onClick={() => {

              return showConfirmDeleteUser(user._id, user.name, authData.token)
            }}>Delete</U.ActionDeleteButton>
          )}
        </U.Action>

      </U.ListItem>
    )
  }

  //
  function updateWorkspace(selectedWorkspace, updateObj, token) {

    return axios.patch(`workspaces/${selectedWorkspace._id}`, updateObj, {
      headers: {
        Authorization: `Bearer ${token}`
      }

    })
      .then((response) => {
        console.log('workspace updated successfully')
        return response.data
      })
      .catch(err => {
        console.log(err)
        // showErrorsForResponse(err)
      })
  }
  function updateWorkspaceIntegrations(selectedWorkspace, updateObj, token) {

    return axios.patch(`workspaces/${selectedWorkspace._id}/integrations`, updateObj, {
      headers: {
        Authorization: `Bearer ${token}`
      }

    })
      .then((response) => {
        console.log('workspace integrations updated successfully')
        return response.data
      })
      .catch(err => {
        console.log(err)
        // showErrorsForResponse(err)
      })
  }


  return (
    <React.Fragment>

      <Header title={'Settings'} />
      <S.Content>
        {isLoading ? <Spinner /> : (
          <React.Fragment>

            <S.FirstLine>
              <S.DashboardRow gutter={[16, 16]}>
                <S.ColTopLeft xs={24} lg={10}>
                  <F.Form>
                    <F.TitleSection>
                      <F.Title>Workspace</F.Title>
                    </F.TitleSection>
                    <F.MainSection>
                      <F.InputLine>
                        <F.InputLabel>Workspace Name</F.InputLabel>
                        <F.Input value={selectedWorkspace.name} onChange={(e) => {
                          setSelectedWorkspace({ ...selectedWorkspace, name: e.target.value })
                        }} />
                      </F.InputLine>
                      <F.AdminSection>
                        <F.InputLabel>Admin User</F.InputLabel>
                        {authData.id !== selectedWorkspace.adminUser._id ? (
                          <F.AdminReadOnly>
                            <F.AdminReadOnlyAvatar>
                              {selectedWorkspace.adminUser.name ? selectedWorkspace.adminUser.name[0].toUpperCase() : '?'}
                            </F.AdminReadOnlyAvatar>
                            <F.AdminReadOnlyInfo>
                              <F.AdminReadOnlyName>{selectedWorkspace.adminUser.name}</F.AdminReadOnlyName>
                              <F.AdminReadOnlyEmail>{selectedWorkspace.adminUser.email}</F.AdminReadOnlyEmail>
                            </F.AdminReadOnlyInfo>
                            <F.AdminReadOnlyBadge>Admin</F.AdminReadOnlyBadge>
                          </F.AdminReadOnly>
                        ) : (
                          <>
                            <F.AdminSelect
                              value={pendingAdminId || selectedWorkspace.adminUser._id}
                              onChange={(userId) => {
                                setPendingAdminId(userId)
                                setAdminSaveStatus(null)
                              }}
                              dropdownStyle={{
                                background: Colors.App.sidebarColor,
                                border: `1px solid ${Colors.primaryColor}`
                              }}
                            >
                              {selectedWorkspace.users.map((user) => (
                                <Option key={user._id} value={user._id}>
                                  <F.AdminOptionInner>
                                    <F.AdminOptionAvatar>
                                      {user.name ? user.name[0].toUpperCase() : '?'}
                                    </F.AdminOptionAvatar>
                                    <span>{user.name}</span>
                                    <F.AdminOptionEmail>{user.email}</F.AdminOptionEmail>
                                  </F.AdminOptionInner>
                                </Option>
                              ))}
                            </F.AdminSelect>
                            {pendingAdminId && pendingAdminId !== selectedWorkspace.adminUser._id && (
                              <F.AdminTransferWarning>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                  <line x1="12" y1="9" x2="12" y2="13" />
                                  <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                You will lose admin rights after saving
                              </F.AdminTransferWarning>
                            )}
                          </>
                        )}
                      </F.AdminSection>
                      <F.LastLine>
                        <F.SaveButton onClick={() => {
                          updateWorkspace(selectedWorkspace, { name: selectedWorkspace.name }, authData.token)
                            .then(() => {
                              return actions.updateAllWorkspacesForUser(authData.token)
                                .then(() => {
                                  return actions.updateCurrentSelectedWorkspace(
                                    authData.token,
                                    currentSelectedWorkspace._id
                                  )
                                })
                            })
                        }}>
                          <F.SaveButton__Image type="save" />
                          <F.SaveButton__Text>Save</F.SaveButton__Text>
                        </F.SaveButton>
                        {pendingAdminId && pendingAdminId !== selectedWorkspace.adminUser._id && (
                          <>
                            <F.AdminSaveBtn
                              disabled={isAdminSaving}
                              onClick={() => {
                                setIsAdminSaving(true)
                                setAdminSaveStatus(null)
                                updateWorkspace(selectedWorkspace, { adminUser: pendingAdminId }, authData.token)
                                  .then(() => actions.updateAllWorkspacesForUser(authData.token))
                                  .then(() => actions.updateCurrentSelectedWorkspace(authData.token, currentSelectedWorkspace._id))
                                  .then(() => {
                                    setPendingAdminId(null)
                                    setAdminSaveStatus('success')
                                    setIsAdminSaving(false)
                                  })
                                  .catch(() => {
                                    setAdminSaveStatus('error')
                                    setIsAdminSaving(false)
                                  })
                              }}
                            >
                              {isAdminSaving ? <F.AdminSpinner /> : 'Transfer Admin'}
                            </F.AdminSaveBtn>
                            <F.AdminCancelBtn onClick={() => { setPendingAdminId(null); setAdminSaveStatus(null) }}>
                              Cancel
                            </F.AdminCancelBtn>
                          </>
                        )}
                        {adminSaveStatus === 'success' && <F.AdminSuccessMsg>Admin transferred successfully</F.AdminSuccessMsg>}
                        {adminSaveStatus === 'error' && <F.AdminErrorMsg>Failed to transfer admin</F.AdminErrorMsg>}
                      </F.LastLine>
                    </F.MainSection>
                  </F.Form>
                  <F.IntegrationsForm style={{ marginTop: '20px' }}>
                    <F.TitleSection>
                      <F.Title>Integrations</F.Title>
                    </F.TitleSection>
                    <F.MainSection>
                      <F.IntegrationItem>
                        <F.IntegrationItemLeft>
                          <F.IntegrationName>HubSpot</F.IntegrationName>
                          <F.IntegrationDescription>
                            Sync demo engagement data, form submissions, and timeline events to HubSpot
                          </F.IntegrationDescription>
                        </F.IntegrationItemLeft>
                        <F.IntegrationItemRight>
                          <Switch
                            checked={hubspotEnabled}
                            onChange={(checked) => {
                              if (checked) {

                                window.open(`https://app-na2.hubspot.com/oauth/authorize?client_id=1ac61fc3-1041-4fb9-85ae-db06c8774754&redirect_uri=${ENV.API_URL}%2Fintegrations%2Fhubspot-callback&scope=crm.schemas.companies.write+crm.objects.contacts.write+crm.schemas.contacts.write+timeline+oauth+forms+crm.objects.companies.write+crm.objects.companies.read+crm.objects.deals.read+crm.objects.deals.write+crm.objects.contacts.read&state=workspaceId%3D${currentSelectedWorkspace._id}`, '_blank')
                              }

                              if (!checked) {

                                updateWorkspaceIntegrations(selectedWorkspace, { 'hubspot': false }, authData.token)
                                  .then(() => {
                                    return actions.updateCurrentSelectedWorkspace(
                                      authData.token,
                                      currentSelectedWorkspace._id
                                    )
                                  })
                              }

                            }}
                          />
                        </F.IntegrationItemRight>
                      </F.IntegrationItem>
                    </F.MainSection>
                  </F.IntegrationsForm>
                </S.ColTopLeft>
                <S.ColTopRight xs={24} lg={14}>
                  <U.FormUsers>
                    <U.TitleSection>
                      <U.Title>
                        <U.TitleText>Users</U.TitleText>
                        <U.AddUserIcon onClick={() => {
                          setIsInviteModalOpen(true)
                        }} type="plus-square" theme={'filled'} />
                      </U.Title>
                      <U.TitleDesc>{selectedWorkspace.users.length} user{selectedWorkspace.users.length === 1 ? '' : 's'} in
                        the workspace</U.TitleDesc>
                      <U.UsersListHeaders>
                        <U.HeaderName style={{ width: '65%' }}>User</U.HeaderName>
                        <U.HeaderName style={{ width: '23%' }}>Role</U.HeaderName>
                        <U.HeaderName style={{ width: '12%' }}>Action</U.HeaderName>
                      </U.UsersListHeaders>
                    </U.TitleSection>
                    <F.MainSection>
                      <List
                        itemLayout="horizontal"
                        dataSource={selectedWorkspace.users}
                        renderItem={user => renderUser(user, selectedWorkspace, authData._id)}
                      />
                    </F.MainSection>
                  </U.FormUsers>
                </S.ColTopRight>
              </S.DashboardRow>
            </S.FirstLine>
            <S.SecondLine>
              <S.DashboardRow gutter={[16, 16]}>

              </S.DashboardRow>
            </S.SecondLine>
            <S.ThirdLine>
              <S.DashboardRow gutter={[16, 16]}>

              </S.DashboardRow>
            </S.ThirdLine>
            <S.FourthLine>
              <S.DashboardRow gutter={[16, 16]}>

              </S.DashboardRow>
            </S.FourthLine>
          </React.Fragment>)
        }

        {isInviteModalOpen && (
          <InviteUsersModal
            workspace={currentSelectedWorkspace}
            authToken={authData.token}
            onClose={() => setIsInviteModalOpen(false)}
          />
        )}
      </S.Content>
    </React.Fragment>

  )
}

const U = {
  ListItem: styled.li`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 15px;
`,
  ChannelIcon: styled(Icon)`
    width: 25px;
    height: 25px;
    border-radius: 9px;

    && svg {
      border-radius: 9px;
      width: 25px;
      height: 25px;
      fill: ${Colors.primaryColor};
    }
  `,
  InnerMemberText: styled.p`

  `,
  ListItemMeta: styled.span`

`,
  Checkbox: styled(Checkbox)`

 `,
  Name: styled.span`
    margin-left:15px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 63%;
    height: 50px;
    line-height: 50px;
    white-space: none;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  NameText: styled.p`
    font-size: 16px;
    margin: 0px 0px 0px 15px;

  `,
  Role: styled.p`
    width: 24%;
    text-align: left;
    margin: 0px;
    line-height: 50px;
  `,
  Action: styled.span`
    width: 13%;
    text-align: left;
    line-height: 50px;


  `,
  ActionDeleteButton: styled.p`
    color: red;
    margin: 0px;
    line-height: 50px;

    &&:hover {
      text-decoration: underline;
      text-underline: red;
      cursor: pointer;
    }
  `,
  FormUsers: styled.div`
    height: 350px;
    border: solid 1px #dae3f2;
    -webkit-box-shadow: 0 1px 5px rgb(0 0 0 / 5%);
    -moz-box-shadown: 0 1px 5px rgba(0,0,0,.05);
    box-shadow: 0 1px 5px rgb(0 0 0 / 5%);
    border-radius: 6px;

    display: flex;
    flex-direction: column;
  `,
  TitleSection: styled.section`
    padding: 15px 20px;
    border-bottom: 1px solid #dae3f2;
    text-align: left;
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
  Title: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 5px;
  `,
  TitleText: styled.h2`
    font-weight: 500;
    font-size: 18px;
    margin: 0px 15px 0px 0px;
  `,
  TitleDesc: styled.p`
    font-size: 12px;
    margin: 0px;
  `,
  AddUserIcon: styled(Icon)`
    width: 30px;
    height: 30px;
    border-radius: 9px;

    &&:hover svg {
      cursor: pointer;
      fill: #0554c8;
    }

    &&:hover {
      cursor: pointer;
    }

    && svg {
      border-radius: 9px;
      width: 30px;
      height: 30px;
      fill: ${Colors.primaryColor};


    }
  `,

  UsersListHeaders: styled.div`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    line-height: 50px;
    align-items: flex-end;
    padding-top: 15px;

  `,
  HeaderName: styled.p`
    font-size: 16px;
    font-weight: 550;
    color: #8a94a6;
    display: inline-block;
    margin: 0px;

  `,

}

const F = {
  Form: styled.div`
    height: 350px;
    border: 1px solid #e8edf5;
    box-shadow: 0 2px 8px rgba(16, 112, 255, 0.06), 0 1px 3px rgba(0,0,0,0.05);
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `,
  IntegrationsForm: styled.div`
    height: 100%
    border: 1px solid #e8edf5;
    box-shadow: 0 2px 8px rgba(16, 112, 255, 0.06), 0 1px 3px rgba(0,0,0,0.05);
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`,
  TitleSection: styled.section`
    padding: 18px 24px;
    border-bottom: 1px solid #e8edf5;
    text-align: left;
    background: white;
  `,
  Title: styled.h2`
    font-weight: 600;
    font-size: 16px;
    margin: 0;
    color: #1a202c;
    font-family: ${Colors.fontFamilyLexend};
    letter-spacing: -0.2px;
  `,

  MainSection: styled.section`
    background: #f7f9fc;
    flex-grow: 1;
    overflow-y: auto;
    padding: 8px 0 16px;

    &&::-webkit-scrollbar { width: 3px; }
    &&::-webkit-scrollbar-track { background: transparent; }
    &&::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background-color: ${Colors.primaryColor};
    }
  `,
  InputLine: styled.div`
    padding: 12px 24px 4px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  InputLabel: styled.label`
    font-size: 16px;
    font-weight: 550;
    // letter-spacing: 0.07em;
    // text-transform: uppercase;
    color: #8a94a6;
    font-family: ${Colors.fontFamily};
  `,
  Input: styled(StyledInput)`
    && {
      width: 100%;
      height: 42px;
      border: 1.5px solid #d0d9e8;
      border-radius: 10px;
      font-size: 14px;
      font-family: ${Colors.fontFamily};
      color: #2d3748;
      background: white;
      padding: 0 14px;
      transition: border-color 0.15s, box-shadow 0.15s;

      &:focus, &:hover {
        border-color: ${Colors.primaryColor};
        box-shadow: 0 0 0 3px rgba(16, 112, 255, 0.1);
      }
    }
  `,
  Checkbox: styled(Checkbox)`
    width: 70%;
  `,
  Select: styled(Select)`
    text-transform: capitalize;
    width: 70%;
    background: white;

    && .ant-select-content-value {
      background: none;
      color: ${Colors.primaryColor};
      border: none !important;
      box-shadow: none;
    }

    && .ant-select-selection {
      background: none;
      // color: ${Colors.primaryColor};
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
`,
  InviteButton: styled.div`
    margin-left: 10px;

    background: #1070ff;
    color: white;
    text-align: center;
    display: flex;
    height: 35px;
    width: 75px;
    border-radius: 6px;
    justify-content: center;
    align-items: center;

    &:hover {
      cursor: pointer;
    };
  `,
  LastLine: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    padding: 12px 24px 16px;
  `,
  SaveButton: styled.div`
    margin: 0;
    background: ${Colors.primaryColor};
    color: white;
    display: flex;
    height: 40px;
    width: fit-content;
    min-width: 90px;
    padding: 0 20px;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    font-family: ${Colors.fontFamily};

    &:hover {
      opacity: 0.88;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  `,
  SaveButton__Image: styled(Icon)`
    height: 14px;
    width: 14px;

    && svg {
      height: 14px;
      width: 14px;
      fill: white;
    }
  `,
  SaveButton__Text: styled.p`
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    font-family: ${Colors.fontFamily};
  `,
  IntegrationItem: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e8e8e8;

    &:last-child {
      border-bottom: none;
    }
  `,
  IntegrationItemLeft: styled.div`
    display: flex;
    text-align: left;
    flex-direction: column;
    flex: 1;
    padding-right: 20px;
  `,
  IntegrationItemRight: styled.div`
    display: flex;
    align-items: center;
    flex-shrink: 0;
  `,
  IntegrationName: styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: #1a1a1a;
    margin: 0 0 8px 0;
    font-family: ${Colors.fontFamily || 'inherit'};
  `,
  IntegrationDescription: styled.p`
    font-size: 13px;
    color: #666;
    margin: 0;
    line-height: 1.5;
    font-family: ${Colors.fontFamily || 'inherit'};
  `,
  AdminSection: styled.div`
    padding: 12px 24px 4px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `,
  AdminSectionLabel: styled.p`
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #8a94a6;
    margin: 0 0 2px 0;
    font-family: ${Colors.fontFamily};
  `,
  AdminReadOnly: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: #f7f9fc;
    border: 1px solid #e8edf5;
    border-radius: 10px;
  `,
  AdminReadOnlyAvatar: styled.div`
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: ${Colors.primaryColor};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
    font-family: ${Colors.fontFamily};
  `,
  AdminReadOnlyInfo: styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  `,
  AdminReadOnlyName: styled.span`
    font-size: 13px;
    font-weight: 600;
    color: #2d3748;
    font-family: ${Colors.fontFamily};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  AdminReadOnlyEmail: styled.span`
    font-size: 11px;
    color: #8a94a6;
    font-family: ${Colors.fontFamily};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  AdminReadOnlyBadge: styled.span`
    font-size: 11px;
    font-weight: 600;
    color: ${Colors.primaryColor};
    background: rgba(16, 112, 255, 0.08);
    border-radius: 20px;
    padding: 3px 10px;
    flex-shrink: 0;
    font-family: ${Colors.fontFamily};
  `,
  AdminSelect: styled(Select)`
    width: 100%;

    && .ant-select-selection {
      border: 1.5px solid #d0d9e8;
      border-radius: 10px;
      background: white;
      box-shadow: none;
      height: 44px;
      display: flex;
      align-items: center;
    }

    && .ant-select-selection:hover,
    && .ant-select-selection:focus {
      border-color: ${Colors.primaryColor};
      box-shadow: 0 0 0 3px rgba(16, 112, 255, 0.1);
    }

    && .ant-select-selection__rendered {
      line-height: 42px;
      margin: 0 12px;
    }

    && .ant-select-arrow {
      color: ${Colors.primaryColor};
    }
  `,
  AdminOptionInner: styled.span`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  AdminOptionAvatar: styled.span`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${Colors.primaryColor};
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
    font-family: ${Colors.fontFamily};
  `,
  AdminOptionEmail: styled.span`
    font-size: 11px;
    color: #8a94a6;
    margin-left: auto;
    font-family: ${Colors.fontFamily};
  `,
  AdminTransferWarning: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #fffbeb;
    border: 1px solid #fcd34d;
    border-radius: 8px;
    font-size: 12px;
    color: #92400e;
    font-family: ${Colors.fontFamily};

    svg { flex-shrink: 0; stroke: #d97706; }
  `,
  AdminSaveRow: styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
  `,
  AdminSaveBtn: styled.button`
    height: 38px;
    padding: 0 18px;
    background: ${Colors.primaryColor};
    color: white;
    border: none;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 600;
    font-family: ${Colors.fontFamily};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: opacity 0.15s, transform 0.1s;

    &:hover:not(:disabled) {
      opacity: 0.88;
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none;
    }
  `,
  AdminCancelBtn: styled.button`
    height: 38px;
    padding: 0 16px;
    background: transparent;
    border: 1.5px solid #d0d9e8;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 500;
    color: #4a5568;
    font-family: ${Colors.fontFamily};
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;

    &:hover {
      border-color: ${Colors.primaryColor};
      color: ${Colors.primaryColor};
    }
  `,
  AdminSpinner: styled.span`
    width: 13px;
    height: 13px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: adminSpin 0.7s linear infinite;

    @keyframes adminSpin {
      to { transform: rotate(360deg); }
    }
  `,
  AdminSuccessMsg: styled.p`
    margin: 0;
    font-size: 12px;
    color: #38a169;
    font-family: ${Colors.fontFamily};
  `,
  AdminErrorMsg: styled.p`
    margin: 0;
    font-size: 12px;
    color: #e53e3e;
    font-family: ${Colors.fontFamily};
  `,
}

const S = {
  Content: styled(Content)`
    && {
        background: white;
        padding: 16px;
        overflow: scroll;
        overflow-x: hidden;
        border-top-left-radius: 18px;
        border-top-right-radius: 4px;
        width: 100%;
        height: 100%;

        border-top: 1.6px solid #1070ff;
        border-left: 1.6px solid #1070ff;

        //Scroll Bar styles

      &&::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
        border-radius: 10px;
        background-color: #FFF;
      }

      &&::-webkit-scrollbar {
        width: 0px;
        background-color: #FFF;
      }

      &&::-webkit-scrollbar-thumb {
        border-radius: 10px;
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
        background-color: ${Colors.primaryColor};
      }
    }

`,
  WorkspaceColTitle: styled.h2`
    width: 50%;
    margin: 0 auto;
    display: flex;
    justify-content: space-evenly;
    font-size: 24px;
`,
  FirstLine: styled.div`
    width: 100%;
    margin-top: 0;

    @media only screen and (max-width: 577px) {
      table {
        font-size: 0.9em;
      }

      & table td {
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
      }
    }
  `,
  SecondLine: styled.div`
    width: 100%;

    @media only screen and (max-width: 577px) {
      table {
        font-size: 0.9em;
      }

      & table td {
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
      }
    }
  `,
  ThirdLine: styled.div`
    width: 100%;

    @media only screen and (max-width: 577px) {
      table {
        font-size: 0.9em;
      }

      & table td {
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
      }
    }
  `,
  FourthLine: styled.div`
    width: 100%;

    @media only screen and (max-width: 577px) {
      table {
        font-size: 0.9em;
      }

      & table td {
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
      }
    }
  `,

  CardImg: styled.img`
          width: 50px;
          display: inline-block;
          `,
  CardText: styled.p`
          display: inline;
          margin: 0;
          `,
  Avatar: styled(Avatar)`
          display: inline-block;

          @media only screen and (max-width: 577px) {
            && {
              margin-left: 15px;
            }

          }
          `,
  UserProfile: styled.div`

          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          //width: 50%;
          text-align: left;
          //padding-left: 5%;
          //padding-top: 2.5%;
          min-height: 130px;

          @media only screen and (max-width: 577px) {
            flex-direction: column;

          }
          `,
  ProfileText: styled.p`
          margin: 2px;

          `,
  UserProfileInfo: styled.div`
          justify-content: space-between;
          display: flex;
          flex-direction: column;
          margin-left: 15px;
          height: 100%;
          `,
  CardInfoWrapper: styled.span`
          && {
          display: flex;
          margin-left: 10px;
          justify-content: space-between;
          align-items: center;

          }
          `,
  DashboardRow: styled(Row)`
    && {
      width: 100%;
    }
  `,
  ColTopLeft: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
    }

    @media only screen and (max-width: 577px) {
      width: 100%;
      margin-top: 35px;
    }

    margin-top: 35px;
  `,
  ColTopRight: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
    }

    @media only screen and (max-width: 577px) {
      width: 100%;
      margin-top: 35px;
    }

    margin-top: 35px;
  `,
  WorkspacesCol: styled.span`
   @media only screen and (max-width: 577px) {
          width: 100%;

    }
          width: 45%;
          padding-left: 1.25%;
          margin-top: 50px;
          `,
  WorkspacesColCards: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
    }

    @media only screen and (max-width: 577px) {
      width: 100%;
    }
  `,
  WorkspacesColSubs: styled(Col)`
    && {
      display: flex;
      flex-direction: column;
    }

    @media only screen and (max-width: 577px) {
      width: 100%;
    }
  `,
  PictureWorkspace: styled.img`
          width: 25px;
          `,
  BelowButtons: styled.span`
    display: flex;
    margin: 15px 0;
    width: 100%;
    `
}

function mapStateToProps(state) {

  return {
    authData: state.authReducer.authData,
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace,
    workspaces: state.workspacesReducer.workspaces
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      updateCurrentSelectedWorkspace,
      updateAllWorkspacesForUser
    }, dispatch)
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage)
