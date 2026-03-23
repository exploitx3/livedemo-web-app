import React, { useState } from 'react'
import Colors from '../../../../../constants/mainColors'
import styled from 'styled-components'
import NoProfileImage from '../../../../../static/images/noProfilePicture2.svg'
//import { Button, Icon, Input, message, Switch, Upload } from 'antd'

import Button from 'antd/es/button'
import Icon from '../../../../../components/Icon/Icon'
import Input from 'antd/es/input'
import message from 'antd/es/message'
import Switch from 'antd/es/switch'
import 'antd/es/switch/style'

import Upload from 'antd/es/upload'
import ENV from '../../../../../config'
import axios from 'axios'

/*
  tabsWidth is used to manually set the width of the element
  and the top property is set manually also of MainView
 */
const CustomHeader = ({ workspaceId, storyDemo, authData, reloadStoryDemo }) => {
  const marginTop = 116

  let [isSaving, setIsSaving] = useState(false)
  let [isOpen, setIsOpen] = useState(false)
  let [isChecked, setIsChecked] = useState((storyDemo.custom && storyDemo.custom.header && storyDemo.custom.header.isActive) || false)

  let [imageUrl, setImageUrl] = useState(
    (storyDemo.custom && storyDemo.custom.header && storyDemo.custom.header.imageUrl) || '')

  let defaultName = authData.name.split(' ').length !== 1 ? authData.name.split(' ')[0] : authData.name
  let name =  (storyDemo.custom && storyDemo.custom.header && storyDemo.custom.header.personName) || defaultName

  let [headerText, setHeaderText] = useState((storyDemo.custom && storyDemo.custom.header && storyDemo.custom.header.text) || ' from LiveDemo')
  let [headerName, setHeaderName] = useState(name)
  // function updateScript(text, liveDemoId, workspaceId, scriptId, authToken) {
  //
  //
  //   return axios.patch(`/workspaces/${workspaceId}/livedemos/${liveDemoId}/scripts/${scriptId}`, {
  //     text: text
  //   }, {
  //     headers: {
  //       Authorization: `Bearer ${authToken}`
  //     }
  //   }).then((res) => {
  //
  //     refreshIframe()
  //     setIsUpdating(false)
  //   })
  // }



  const uploadProps = {
    name: 'headerImage',
    action: `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemo._id}/custom/header/uploadImage`,
    headers: {
      authorization: `Bearer ${authData.token}`,
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);


        setImageUrl(info.file.response.imageUrl)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  // function onSave(workspaceId, storyDemo, isActive, imageUrlUpdate, personName, text, authData) {
  function onSave(isActive) {
    setIsSaving(true)

    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemo._id}/custom/header`, {
      isActive: isActive,
      imageUrl: imageUrl,
      personName: headerName,
      text: headerText,
    }, {
      headers: {
        Authorization: `Bearer ${authData.token}`
      }
    })
      .then((res) => {
        setIsSaving(false)

        return res.data
      })
      .then(() => reloadStoryDemo())

  }

  return (

    <CH.ScreenHeader>

      <CH.HeaderMain>
        <CH.HeaderLeftSide
          onClick={() => {
            setIsOpen(!isOpen)
          }}>
          <CH.OpenIcon type={isOpen ? 'down' : 'right'}/>
          <CH.HeaderTitle>Header</CH.HeaderTitle>

        </CH.HeaderLeftSide>
        <CH.HeaderRightSide>
          <CH.CheckBox checked={isChecked} onChange={(checked, event) => {
            if (checked) {
              setIsOpen(true)
            }

            setIsChecked(checked)
            onSave(checked)

          }}/>
        </CH.HeaderRightSide>
      </CH.HeaderMain>
      {!isOpen ? '' : (
        <CH.MainWrapper>
          {isChecked ? '' : (
            <CH.Overlay></CH.Overlay>
          )}

          <CH.Main__LeftSide>
            <CH.ProfileImage src={imageUrl === '' ? NoProfileImage : imageUrl} />
            <CH.Upload{...uploadProps}>
              <Button>
                <Icon type="upload" /> Upload
              </Button>
            </CH.Upload>
            <CH.SaveButton loading={isSaving} onClick={() => onSave(isChecked)}>Save</CH.SaveButton>
          </CH.Main__LeftSide>
          <CH.Main__RightSide>

            <CH.TextWrapper>
              <CH.TextTitle>Name:</CH.TextTitle>
              <CH.TextInput value={headerName} onChange={(event) => {
                setHeaderName(event.target.value)
              }}/>
            </CH.TextWrapper>

            <CH.TextWrapper>
              <CH.TextTitle>Additional text:</CH.TextTitle>
              <CH.TextInput value={headerText} onChange={(event) => {
                setHeaderText(event.target.value)
              }}/>
            </CH.TextWrapper>


          </CH.Main__RightSide>
        </CH.MainWrapper>
      )}


    </CH.ScreenHeader>
  )
}

const CH = {
  Overlay: styled.div`
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(3px);
    z-index: 1;
    border-radius: 4px;
  `,
  MainWrapper: styled.div`
    padding: 10px;
    display: flex;
    justify-content: flex-start;
    gap: 15px;
    margin-top: 10px;
    position: relative;
  `,
  Main__LeftSide: styled.span`
    margin: 0px 0px 0px 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
  `,
  Upload: styled(Upload)`
    max-width: 125px;
  `,
  SaveButton: styled(Button)`
    width: 105px;
  `,
  Main__RightSide: styled.span`
    margin: 0px 0px 0px 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
    justify-content: flex-end;
  `,
  TextTitle: styled.label`
    margin: 0px;
    font-size: 0.9em;
  `,
  TextWrapper: styled.span`
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: 5px;
  `,
  TextInput: styled(Input)`

  `,
  ProfileImage: styled.img`
    width: 70px;
    height: 70px;
    border-radius: 50%;
    //border: 1px solid #1070ff;
  `,
  OpenIcon: styled(Icon)`
    cursor: pointer;
  `,
  HeaderRightSide: styled.span`
    margin-right: 15px;
  `,
  HeaderLeftSide: styled.span`
    flex-grow: 1;
    display: flex;
    align-items: center;
    gap: 15px;

    cursor: pointer;
  `,
  CheckBox: styled(Switch)`
  `,
  HeaderTitle: styled.span`
    max-width: 160px;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
    overflow: hidden;

    font-size: 1.2em;
    color: ${Colors.primaryText};
  `,
  ScreenHeader: styled.header`
    position: relative;
    width: 100%;
    min-height: 65px;
    height: auto;
    margin-bottom: 15px;

    padding: 0px;
    border-radius: 6px;

    // &&:hover {
    //
    //   border: 1px solid ${Colors.primaryText};
    // }

  `,
  HeaderMain: styled.main`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1;
    gap: 15px;

    margin: 10px 5px;
    padding: 15px;
    background-color: #f3f3f3;
    height: 65px;
    border-radius: 6px;
    border: 1px solid #1070ff;

    &&:hover {

      cursor: pointer;
    }

    border: 1px solid ${Colors.primaryColor};

  `
}

export default CustomHeader
