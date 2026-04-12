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
import {HexColorInput, HexColorPicker, RgbaColorPicker} from 'react-colorful'
import message from "antd/es/message";
import StaticUploadIcon from "../../../../../static/images/uploadIcon.svg";

/*
  tabsWidth is used to manually set the width of the element
  and the top property is set manually also of MainView
 */

function rgbaToObj(rgbaString) {
  const colors = [
    'r',
    'g',
    'b',
    'a'
  ]
  let colorArr = rgbaString.slice(
    rgbaString.indexOf("(") + 1,
    rgbaString.indexOf(")")
  ).split(",").map(c => parseFloat(c.trim()));

  return colorArr.reduce((accum, color, index) => {

    accum[colors[index]] = color

    return accum
  }, {})
}


function objToRgb(rgbObj) {

  return `rgba(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}, ${rgbObj.a})`
}


const Theme = ({workspaceId, storyDemo, authData, reloadStoryDemo}) => {
  const marginTop = 116

  let [isSaving, setIsSaving] = useState(false)
  let [isOpen, setIsOpen] = useState(false)
  let [isChecked, setIsChecked] = useState((storyDemo.custom && storyDemo.custom.theme && storyDemo.custom.theme.isActive) || false)


  const [textColor, setTextColor] = useState((storyDemo.custom.theme && storyDemo.custom.theme.textColor) || '#FFFFFF')
  const [stepBackgroundColor, setStepBackgroundColor] = useState(storyDemo.custom.theme && storyDemo.custom.theme.stepBackgroundColor || Colors.primaryColor)
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState((storyDemo.custom.theme && storyDemo.custom.theme.buttonBackgroundColor) || Colors.primaryColor)
  const [buttonTextColor, setButtonTextColor] = useState((storyDemo.custom.theme && storyDemo.custom.theme.buttonTextColor) || '#FFFFFF')
  const [watermarkConfigIsActive, setWatermarkConfigIsActive] = useState((storyDemo.custom.theme && !!storyDemo.custom.theme.watermarkConfig.isActive))
  const [watermarkConfigText, setWatermarkConfigText] = useState((storyDemo.custom.theme && storyDemo.custom.theme.watermarkConfig.text) || '')
  let [watermarkConfigImageUrl, setWatermarkConfigImageUrl] = useState(
    (storyDemo.custom && storyDemo.custom.theme && storyDemo.custom.theme.watermarkConfig.imageUrl) || '')
  let [watermarkConfigUrl, setWatermarkConfigUrl] = useState(
    (storyDemo.custom && storyDemo.custom.theme && storyDemo.custom.theme.watermarkConfig.url) || '')

  const [overlayBackgroundColor, setOverlayBackgroundColor] = useState((storyDemo.custom.theme && storyDemo.custom.theme.overlayBackgroundColor && rgbaToObj(storyDemo.custom.theme.overlayBackgroundColor)) || rgbaToObj('rgba(0,0,0,0.5)'))



  const uploadProps = {
    name: 'watermarkImage',
    action: `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemo._id}/custom/theme/uploadWatermarkImage`,
    headers: {
      authorization: `Bearer ${authData.token}`,
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);


        setWatermarkConfigImageUrl(info.file.response.imageUrl)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  // function onSave(workspaceId, storyDemo, isActive, imageUrlUpdate, personName, text, authData) {
  function onSave(isChecked,
                  stepBackgroundColor,
                  textColor,
                  buttonBackgroundColor,
                  buttonTextColor,
                  overlayBackgroundColor,
                  watermarkConfigIsActive,
                  watermarkConfigText,
                  watermarkConfigUrl
  ) {
    setIsSaving(true)


    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemo._id}/custom/theme`, {
      isActive: isChecked,
      stepBackgroundColor: stepBackgroundColor,
      textColor: textColor,
      buttonBackgroundColor: buttonBackgroundColor,
      buttonTextColor: buttonTextColor,
      overlayBackgroundColor: overlayBackgroundColor,
      watermarkConfig: {
        isActive: watermarkConfigIsActive,
        text: watermarkConfigText,
        url: watermarkConfigUrl
      }
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
          <TH.HeaderTitle>Theme</TH.HeaderTitle>

        </TH.HeaderLeftSide>
        <TH.HeaderRightSide>
          <TH.CheckBox checked={isChecked} onChange={(checked, event) => {
            if (checked) {
              setIsOpen(true)
            }
            setIsChecked(checked)
            onSave(checked,
              stepBackgroundColor,
              textColor,
              buttonBackgroundColor,
              buttonTextColor,
              objToRgb(overlayBackgroundColor),
              watermarkConfigIsActive,
              watermarkConfigText,
              watermarkConfigUrl
            )

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
              <TH.TextTitle>Step Background Color:</TH.TextTitle>
              <TH.ColorPicker color={stepBackgroundColor} onChange={setStepBackgroundColor}/>
              <TH.ColorInput color={stepBackgroundColor} onChange={setStepBackgroundColor}/>
            </TH.TextWrapper>
            <TH.TextWrapper>
              <TH.TextTitle>Button Background Color:</TH.TextTitle>
              <TH.ColorPicker color={buttonBackgroundColor} onChange={setButtonBackgroundColor}/>
              <TH.ColorInput color={buttonBackgroundColor} onChange={setButtonBackgroundColor}/>
            </TH.TextWrapper>
            <TH.TextWrapper>
              <TH.TextTitle>Overlay Background Color:</TH.TextTitle>
              <TH.ColorPickerRGB color={overlayBackgroundColor} onChange={(colorObj) => {

                setOverlayBackgroundColor(colorObj)
              }}/>
            </TH.TextWrapper>
            <TH.TextWrapper style={{alignItems: 'flex-start'}}>
              <TH.TextAndButton>

                <TH.TextTitle>Custom Watermark:</TH.TextTitle>

                <TH.CheckBox checked={watermarkConfigIsActive} onChange={(checked, event) => {
                  if (checked) {
                    setIsOpen(true)
                  }

                  setWatermarkConfigIsActive(checked)

                  onSave(
                    isChecked,
                    stepBackgroundColor,
                    textColor,
                    buttonBackgroundColor,
                    buttonTextColor,
                    objToRgb(overlayBackgroundColor),
                    checked,
                    watermarkConfigText,
                    watermarkConfigUrl
                  )
                }}/>

              </TH.TextAndButton>
            </TH.TextWrapper>
            <TH.TextWrapper style={{alignItems: 'flex-start'}}>

              <TH.WatermarkImage src={watermarkConfigImageUrl === '' ? StaticUploadIcon : watermarkConfigImageUrl} />
              <TH.Upload{...uploadProps}>
                <Button>
                  <Icon type="upload" /> Upload
                </Button>
              </TH.Upload>
              <TH.TextTitle>Company Name:</TH.TextTitle>
              <TH.TextInput value={watermarkConfigText} onChange={(event) => {
                setWatermarkConfigText(event.target.value)
              }}/>
              <TH.TextTitle>Company Url:</TH.TextTitle>
              <TH.TextInput value={watermarkConfigUrl} onChange={(event) => {
                setWatermarkConfigUrl(event.target.value)
              }}/>
            </TH.TextWrapper>
          </TH.Main__LeftSide>
          <TH.Main__RightSide>
            <TH.TextWrapper>
              <TH.TextTitle>Text Color:</TH.TextTitle>
              <TH.ColorPicker color={textColor} onChange={setTextColor}/>
              <TH.ColorInput color={textColor} onChange={setTextColor}/>
            </TH.TextWrapper>
            <TH.TextWrapper>
              <TH.TextTitle>Button Text Color:</TH.TextTitle>
              <TH.ColorPicker color={buttonTextColor} onChange={setButtonTextColor}/>
              <TH.ColorInput color={buttonTextColor} onChange={setButtonTextColor}/>
            </TH.TextWrapper>
            <TH.SaveButton loading={isSaving}
                           onClick={() => onSave(
                             isChecked,
                             stepBackgroundColor,
                             textColor,
                             buttonBackgroundColor,
                             buttonTextColor,
                             objToRgb(overlayBackgroundColor),
                             watermarkConfigIsActive,
                             watermarkConfigText,
                             watermarkConfigUrl
                           )
                           }>Save</TH.SaveButton>
          </TH.Main__RightSide>

        </TH.MainWrapper>
      )}


    </TH.ScreenHeader>
  )
}


const TH = {
  WatermarkImage: styled.img`
    width: 70px;
    height: 70px;
    border-radius: 50%;
    //border: 1px solid #1070ff;
  `,
  ColorPicker: styled(HexColorPicker)`
    && {
      width: 125px;
      height: 125px;
    }

  `,


  ColorPickerRGB: styled(RgbaColorPicker)`
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
    justify-content: flex-start;
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
    width: 100%;
  `,
  TextAndButton: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    gap: 10px;
    margin-bottom: 10px;
    width: 100%;

  `,
  Text: styled.p`
    font-size: 0.85em;
    margin: 0px;
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

export default Theme
