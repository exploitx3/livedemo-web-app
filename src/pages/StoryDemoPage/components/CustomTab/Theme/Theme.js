import React, {useEffect, useMemo, useRef, useState} from 'react'
import Colors from '../../../../../constants/mainColors'
import GOOGLE_FONTS from '../../../../../constants/googleFontsTop200'
import styled from 'styled-components'
//import { Button, Icon, Input, Switch, Upload } from 'antd'
import Button from 'antd/es/button'
import Icon from '../../../../../components/Icon/Icon'
import Input from 'antd/es/input'
import Switch from 'antd/es/switch'
import Upload from 'antd/es/upload'
import Select from 'antd/es/select'
import ENV from '../../../../../config'
import axios from 'axios'
import {HexColorInput, HexColorPicker} from 'react-colorful'
import message from "antd/es/message";
import StaticUploadIcon from "../../../../../static/images/uploadIcon.svg";
import FooterButtons from '../../../../../constants/FooterButtons'

/*
  tabsWidth is used to manually set the width of the element
  and the top property is set manually also of MainView
 */


function loadGoogleFontPreview(fontFamily) {
  if (!fontFamily || document.getElementById(`ld-font-${fontFamily}`)) {
    return
  }

  const link = document.createElement('link')
  link.id = `ld-font-${fontFamily}`
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily).replace(/%20/g, '+')}:wght@400;500;600;700&display=swap`
  document.head.appendChild(link)
}

function applyDemoFont(fontFamily) {
  loadGoogleFontPreview(fontFamily)

  if (!/^[A-Za-z0-9 ]{1,50}$/.test(fontFamily || '')) {
    document.documentElement.style.removeProperty('--ld-demo-font')
    return
  }

  document.documentElement.style.setProperty('--ld-demo-font', `'${fontFamily}', sans-serif`)
}

function preloadFontSearchPreviews(query) {
  if (!query) {
    return
  }

  const normalized = query.toLowerCase()
  GOOGLE_FONTS
    .filter(font => font.toLowerCase().includes(normalized))
    .slice(0, 10)
    .forEach(loadGoogleFontPreview)
}


const Theme = ({workspaceId, storyDemo, authData, reloadStoryDemo}) => {
  const fontSearchTimerRef = useRef(null)
  const marginTop = 116

  let [isSaving, setIsSaving] = useState(false)
  let [isOpen, setIsOpen] = useState(false)
  let [isChecked, setIsChecked] = useState((storyDemo.custom && storyDemo.custom.theme && storyDemo.custom.theme.isActive) || false)


  const [textColor, setTextColor] = useState((storyDemo.custom.theme && storyDemo.custom.theme.textColor) || '#FFFFFF')
  const [stepBackgroundColor, setStepBackgroundColor] = useState(storyDemo.custom.theme && storyDemo.custom.theme.stepBackgroundColor || Colors.primaryColor)
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState((storyDemo.custom.theme && storyDemo.custom.theme.buttonBackgroundColor) || Colors.primaryColor)
  const [buttonTextColor, setButtonTextColor] = useState((storyDemo.custom.theme && storyDemo.custom.theme.buttonTextColor) || '#FFFFFF')
  const [fontFamily, setFontFamily] = useState((storyDemo.custom.theme && storyDemo.custom.theme.fontFamily) || '')
  const [showTooltipArrow, setShowTooltipArrow] = useState(storyDemo.custom?.theme?.showTooltipArrow ?? true)
  const [hoverGlow, setHoverGlow] = useState(storyDemo.custom?.theme?.hoverGlow ?? true)
  const [footerButtons, setFooterButtons] = useState(storyDemo.custom?.theme?.footerButtons || FooterButtons.backAndNext)
  const [watermarkConfigIsActive, setWatermarkConfigIsActive] = useState((storyDemo.custom.theme && !!storyDemo.custom.theme.watermarkConfig.isActive))
  const [watermarkConfigText, setWatermarkConfigText] = useState((storyDemo.custom.theme && storyDemo.custom.theme.watermarkConfig.text) || '')
  let [watermarkConfigImageUrl, setWatermarkConfigImageUrl] = useState(
    (storyDemo.custom && storyDemo.custom.theme && storyDemo.custom.theme.watermarkConfig.imageUrl) || '')
  let [watermarkConfigUrl, setWatermarkConfigUrl] = useState(
    (storyDemo.custom && storyDemo.custom.theme && storyDemo.custom.theme.watermarkConfig.url) || '')




  useEffect(() => applyDemoFont(fontFamily), [fontFamily])

  const fontOptions = useMemo(() => {
    const fonts = GOOGLE_FONTS.includes(fontFamily) || !fontFamily
      ? GOOGLE_FONTS
      : [fontFamily, ...GOOGLE_FONTS]

    return [
      {value: '', label: 'Default'},
      ...fonts.map(font => ({
        value: font,
        label: <span style={{fontFamily: `'${font}', sans-serif`}}>{font}</span>
      }))
    ]
  }, [fontFamily])

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
                  watermarkConfigIsActive,
                  watermarkConfigText,
                  watermarkConfigUrl,
                  fontFamily,
                  showTooltipArrow,
                  hoverGlow,
                  footerButtons
  ) {
    setIsSaving(true)


    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemo._id}/custom/theme`, {
      isActive: isChecked,
      stepBackgroundColor: stepBackgroundColor,
      textColor: textColor,
      buttonBackgroundColor: buttonBackgroundColor,
      buttonTextColor: buttonTextColor,
      fontFamily: fontFamily,
      showTooltipArrow: showTooltipArrow,
      hoverGlow: hoverGlow,
      footerButtons: footerButtons,
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
              watermarkConfigIsActive,
              watermarkConfigText,
              watermarkConfigUrl,
              fontFamily,
              showTooltipArrow,
              hoverGlow,
              footerButtons
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
                    checked,
                    watermarkConfigText,
                    watermarkConfigUrl,
                    fontFamily,
                    showTooltipArrow,
                    hoverGlow,
                    footerButtons
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
            <TH.TextWrapper>
              <TH.TextTitle>Font Family:</TH.TextTitle>
              <TH.Text>Applied to hotspot, popup, and button text in demos</TH.Text>
              <Select
                showSearch
                listHeight={256}
                value={fontFamily || ''}
                filterOption={(input, option) =>
                  String(option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                }
                onSearch={(query) => {
                  clearTimeout(fontSearchTimerRef.current)
                  fontSearchTimerRef.current = setTimeout(() => preloadFontSearchPreviews(query), 200)
                }}
                onChange={(value) => {
                  setFontFamily(value)
                  onSave(
                    isChecked,
                    stepBackgroundColor,
                    textColor,
                    buttonBackgroundColor,
                    buttonTextColor,
                    watermarkConfigIsActive,
                    watermarkConfigText,
                    watermarkConfigUrl,
                    value,
                    showTooltipArrow,
                    hoverGlow,
                    footerButtons
                  )
                }}
                options={fontOptions}
              />
            </TH.TextWrapper>
            <TH.TextWrapper style={{alignItems: 'flex-start'}}>
              <TH.TextAndButton>
                <TH.TextTitle>Show tooltip arrow:</TH.TextTitle>
                <TH.CheckBox checked={showTooltipArrow} onChange={(checked) => {
                  setShowTooltipArrow(checked)
                  onSave(
                    isChecked,
                    stepBackgroundColor,
                    textColor,
                    buttonBackgroundColor,
                    buttonTextColor,
                    watermarkConfigIsActive,
                    watermarkConfigText,
                    watermarkConfigUrl,
                    fontFamily,
                    checked,
                    hoverGlow,
                    footerButtons
                  )
                }}/>
              </TH.TextAndButton>
              <TH.Text>Applied to Pointer tooltips in demos</TH.Text>
            </TH.TextWrapper>
            <TH.TextWrapper style={{alignItems: 'flex-start'}}>
              <TH.TextAndButton>
                <TH.TextTitle>Hover glow:</TH.TextTitle>
                <TH.CheckBox checked={hoverGlow} onChange={(checked) => {
                  setHoverGlow(checked)
                  onSave(
                    isChecked,
                    stepBackgroundColor,
                    textColor,
                    buttonBackgroundColor,
                    buttonTextColor,
                    watermarkConfigIsActive,
                    watermarkConfigText,
                    watermarkConfigUrl,
                    fontFamily,
                    showTooltipArrow,
                    checked,
                    footerButtons
                  )
                }}/>
              </TH.TextAndButton>
              <TH.Text>Theme-colored glow on tooltip, hotspot, and transition cards</TH.Text>
            </TH.TextWrapper>
            <TH.TextWrapper>
              <TH.TextTitle>Footer buttons:</TH.TextTitle>
              <TH.Text>Back and Next, or a compact next arrow</TH.Text>
              <Select
                value={footerButtons}
                onChange={(value) => {
                  setFooterButtons(value)
                  onSave(
                    isChecked,
                    stepBackgroundColor,
                    textColor,
                    buttonBackgroundColor,
                    buttonTextColor,
                    watermarkConfigIsActive,
                    watermarkConfigText,
                    watermarkConfigUrl,
                    fontFamily,
                    showTooltipArrow,
                    hoverGlow,
                    value
                  )
                }}
                options={[
                  {value: FooterButtons.backAndNext, label: 'Back and Next'},
                  {value: FooterButtons.nextArrow, label: 'Next Arrow'},
                ]}
              />
            </TH.TextWrapper>
            <TH.SaveButton loading={isSaving}
                           onClick={() => onSave(
                             isChecked,
                             stepBackgroundColor,
                             textColor,
                             buttonBackgroundColor,
                             buttonTextColor,
                             watermarkConfigIsActive,
                             watermarkConfigText,
                             watermarkConfigUrl,
                             fontFamily,
                             showTooltipArrow,
                             hoverGlow,
                             footerButtons
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
    background-color: var(--ld-surface, #f3f3f3);
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
