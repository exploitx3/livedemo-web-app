import React, {useState} from 'react'
import Colors from '../../../../../constants/mainColors'
import styled from 'styled-components'
//import { Button, Icon, Input, Switch, Upload } from 'antd'
import Button from 'antd/es/button'
import Icon from '../../../../../components/Icon/Icon'
import Input from 'antd/es/input'
import Switch from 'antd/es/switch'
import Upload from 'antd/es/upload'
import ENV from '../../../../../config'
import axios from 'axios'
import {HexColorInput, HexColorPicker} from 'react-colorful'


/*
  tabsWidth is used to manually set the width of the element
  and the top property is set manually also of MainView
 */
const Misc = ({workspaceId, storyDemo, authData, reloadStoryDemo}) => {
  const marginTop = 116

  let [isSaving, setIsSaving] = useState(false)
  let [isOpen, setIsOpen] = useState(false)
  let [isChecked, setIsChecked] = useState((storyDemo.custom && storyDemo.custom.misc && storyDemo.custom.misc.isActive) || false)


  const [enableConfetti, setEnableConfetti] = useState((storyDemo.custom.misc && storyDemo.custom.misc.confettiOnLastStep) || false)
  const [isOmniBarDisabled, setIsOmniBarDisabled] = useState((storyDemo.custom.misc && storyDemo.custom.misc.isOmniBarDisabled) || false)
  const [isLiveDemoWatermarkEnabled, setIsLiveDemoWatermarkEnabled] = useState((storyDemo.custom.misc && storyDemo.custom.misc.isLiveDemoWatermarkEnabled) || false)
  const [isTabsEnabled, setIsTabsEnabled] = useState((storyDemo.custom.misc && storyDemo.custom.misc.isTabsEnabled) || false)


  // function onSave(workspaceId, storyDemo, isActive, imageUrlUpdate, personName, text, authData) {
  function onSaveMisc(isChecked, sendConfetti, isOmniBarDisabled, isLiveDemoWatermarkEnabled, isTabsEnabled) {
    setIsSaving(true)

    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemo._id}/custom/misc`, {
      isActive: isChecked,
      confettiOnLastStep: sendConfetti,
      isOmniBarDisabled: isOmniBarDisabled,
      isLiveDemoWatermarkEnabled: isLiveDemoWatermarkEnabled,
      isTabsEnabled: isTabsEnabled
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

    <TH.ScreenHeader>

      <TH.HeaderMain>
        <TH.HeaderLeftSide
          onClick={() => {
            setIsOpen(!isOpen)
          }}>
          <TH.OpenIcon type={isOpen ? 'down' : 'right'}/>
          <TH.HeaderTitle>Misc</TH.HeaderTitle>

        </TH.HeaderLeftSide>
        <TH.HeaderRightSide>
          <TH.CheckBox checked={isChecked} onChange={(checked, event) => {
            if (checked) {
              setIsOpen(true)
            }

            setIsChecked(checked)
            onSaveMisc(checked, enableConfetti, isOmniBarDisabled, isLiveDemoWatermarkEnabled, isTabsEnabled)

          }}/>
        </TH.HeaderRightSide>
      </TH.HeaderMain>
      {!isOpen ? '' : (
        <TH.MainWrapper>
          {isChecked ? '' : (
            <TH.Overlay></TH.Overlay>
          )}

          <TH.Main__LeftSide>
            <TH.TextWrapper>

              <TH.TextTitle>Celebrate completion</TH.TextTitle>

              <TH.TextAndButton>
                <TH.CheckBox checked={enableConfetti} onChange={(checked, event) => {

                  setEnableConfetti(checked)
                }}/>
                <TH.Text>Send confetti on last step</TH.Text>

              </TH.TextAndButton>
              <TH.TextTitle>Remove wrapper</TH.TextTitle>

              <TH.TextAndButton>
                <TH.CheckBox checked={isOmniBarDisabled} onChange={(checked, event) => {

                  setIsOmniBarDisabled(checked)
                }}/>
                <TH.Text>Remove browser wrapper</TH.Text>

              </TH.TextAndButton>
              <TH.TextTitle>Navigation Tabs</TH.TextTitle>

              <TH.TextAndButton>
                <TH.CheckBox disabled={false} checked={isTabsEnabled} onChange={(checked, event) => {

                  setIsTabsEnabled(checked)
                }}/>
                <TH.Text>Enable/disable step navigation tabs placed at the bottom of the screen</TH.Text>

              </TH.TextAndButton>
              <TH.TextTitle>Watermark</TH.TextTitle>

              <TH.TextAndButton>
                <TH.CheckBox disabled={true} checked={isLiveDemoWatermarkEnabled} onChange={(checked, event) => {

                  setIsLiveDemoWatermarkEnabled(checked)
                }}/>
                <TH.Text>Enable/disable watermark</TH.Text>

              </TH.TextAndButton>

              <TH.SaveButton loading={isSaving}
                             onClick={() => onSaveMisc(isChecked, enableConfetti, isOmniBarDisabled, isLiveDemoWatermarkEnabled, isTabsEnabled)}>Save
              </TH.SaveButton>

            </TH.TextWrapper>

          </TH.Main__LeftSide>
          <TH.Main__RightSide>


          </TH.Main__RightSide>
        </TH.MainWrapper>
      )}


    </TH.ScreenHeader>
  )
}

const TH = {
  ColorPicker: styled(HexColorPicker)`
    && {
      width: 125px;
      height: 125px;
    }

  `,
  ColorInput: styled(HexColorInput)`
    && {
      width: 125px;
    }
  `,
  ColorPreview: styled.span`
    width: 100px;
    height: 100px;
  `,
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
    font-size: 1.2em;
  `,
  Text: styled.p`
    font-size: 0.85em;
    margin: 0px;
  `,
  TextAndButton: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    gap: 10px;
    margin-bottom: 10px;

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
    border: 1px solid #1070ff;
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

  }

  }
  ;

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

export default Misc
