import Colors from "../../../../../../constants/mainColors";
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Input from "antd/es/input";
import Icon from "../../../../../../components/Icon/Icon";
import Button from "antd/es/button";
import { MdAdsClick } from "react-icons/md";
import Select from "antd/es/select";
import { HexColorInput, HexColorPicker, RgbaColorPicker } from "react-colorful";
import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'
import Tippy from '@tippyjs/react'

const GOTO_TYPES = {
  website: 'website',
  screen: 'screen',
  next: 'next'
}

function Tip({ children, ...props }) {

  return <S.Tippy {...props}>{children}</S.Tippy>
}

const PopupButton = ({ popupButton, setPopupButton, deleteButton, storyDemo }) => {
  let [text, setText] = useState(popupButton && popupButton.text ? popupButton.text : '')
  let [currentSelectedScreen, setCurrentSelectedScreen] = useState(popupButton && popupButton.gotoScreen ? popupButton.gotoScreen : (storyDemo.screens.length !== 0 ? storyDemo.screens[0] : {}))
  let [gotoType, setGotoType] = useState(popupButton && popupButton.gotoType && GOTO_TYPES[popupButton.gotoType] ? GOTO_TYPES[popupButton.gotoType] : GOTO_TYPES.next)
  let [gotoWebsite, setGotoWebsite] = useState(popupButton && popupButton.gotoWebsite ? popupButton.gotoWebsite : '')

  const [buttonTextColor, setButtonTextColor] = useState(popupButton && popupButton.textColor ? popupButton.textColor : '#FFFFFF')
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState(popupButton && popupButton.textColor ? popupButton.backgroundColor : Colors.primaryColor)

  let [isViewOpen, setIsViewOpen] = useState(false)

  const isInitialMountRef = useRef(true)

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      return
    }
    setPopupButton({
      ...popupButton,
      text,
      gotoScreen: currentSelectedScreen,
      gotoType: gotoType,
      gotoWebsite: gotoWebsite,
      textColor: buttonTextColor,
      backgroundColor: buttonBackgroundColor
    })
  }, [text, currentSelectedScreen, gotoType, gotoWebsite, buttonTextColor, buttonBackgroundColor])

  function getWebsiteInputComp() {
    return <S.WebsiteInput
      value={gotoWebsite}
      placeholder={'https://livedemo.ai'}
      style={{
        marginLeft: 10
      }}
      onChange={(event) => {
        setGotoWebsite(event.target.value)
      }
      }
    />
  }

  function formatScreenName(screen) {

    if (screen.type === 'Screen_Video') {

      return screen.name ? screen.name : 'Video'
    } else if (screen.type === 'Screen_Screenshot') {

      return screen.name ? screen.name : 'Screenshot'
    } else if (screen.name) {

      return screen.name.replace(/http(s)*\:\/\//g, '')
    } else {

      return ''
    }
  }

  function getSelectScreenComp(screens, currentSelectedScreen) {
    let loading = false


    if (!screens) {

      return null
    } else if (screens && screens.length === 0) {

      return <p style={{ color: 'white' }}>No Screens</p>
    } else {

      return (
        <S.Select
          // loading={loading}
          dropdownStyle={{
            background: Colors.App.sidebarColor,
            border: `1px solid ${Colors.primaryColor}`

            // boxShadow: `0 0 0 2px ${Colors.primaryColor}`
          }}
          defaultValue={
            currentSelectedScreen._id ? currentSelectedScreen._id : ''
          }
          value={
            currentSelectedScreen._id ? currentSelectedScreen._id : ''
          }
          style={{
            width: 100,
            marginLeft: 10

          }}
          onChange={(selectedScreenId) => {
            let screenDoc = screens.find(scr => scr._id === selectedScreenId)
            setCurrentSelectedScreen(screenDoc)
          }}>
          {screens.map((screen, index, array) => {
            let screenIndex = ++index
            let isLast = index === array.length - 1
            return <Option
              style={{
                background: 'none',
                color: Colors.primaryColor,
                borderBottom: isLast ? 'none' : '1px solid #d9d9d9',
                maxWidth: 115,
              }}
              key={screen._id}
              value={screen._id}>
              {`${screenIndex}. ${formatScreenName(screen)}`}</Option>
          })
          }
        </S.Select>
      )
    }
  }



  return (
    <S.PopupButtonWrapper>
      <S.SideComponent>
        <S.OpenArrow type={isViewOpen ? 'down' : 'right'}
          onClick={() => {
            setIsViewOpen(!isViewOpen)
          }} />

        <S.TextInput value={text} onClick={() => {
          if (!isViewOpen) {
            setIsViewOpen(true)
          }

        }}
          onChange={event => {
            setText(event.target.value)
          }} />
        <S.DeleteIcon
          type={'delete'}
          theme={'filled'}
          onClick={() => {
            deleteButton(popupButton.index)
          }}
        />
      </S.SideComponent>
      {!isViewOpen ? '' : (
        <span>
          <S.SideComponent style={{ justifyContent: 'space-between' }}>
            <S.Text>Color Text:</S.Text>
            <Tip
              zIndex={5}
              // disabled={!showTippy}
              arrow={true}
              animation={'shift-away'}
              trigger={'click'}
              offset={[0, 10]}
              popperOptions={{
                modifiers: [
                  {
                    name: 'flip',
                    options: {
                      fallbackPlacements: ['top', 'right', 'left', 'bottom'],
                    },
                  },
                ],
              }}
              interactive={true}
              placement={'bottom'}
              content={
                <span>
                  <S.ColorPicker color={buttonTextColor} onChange={setButtonTextColor} />
                  <S.ColorInput color={buttonTextColor} onChange={setButtonTextColor} />
                </span>
              }
            >
              <span>
                <S.ColorIcon
                  type={'bg-colors'}
                  color={buttonTextColor}
                  backgroundColor={buttonBackgroundColor}
                ></S.ColorIcon>
              </span>
            </Tip>

            <S.Text style={{ marginLeft: 15 }}>Color Background:</S.Text>
            <Tip
              zIndex={5}
              // disabled={!showTippy}
              arrow={true}
              animation={'shift-away'}
              trigger={'click'}
              offset={[0, 10]}
              popperOptions={{
                modifiers: [
                  {
                    name: 'flip',
                    options: {
                      fallbackPlacements: ['top', 'right', 'left', 'bottom'],
                    },
                  },
                ],
              }}
              interactive={true}
              placement={'bottom'}
              content={
                <span>
                  <S.ColorPicker color={buttonBackgroundColor} onChange={setButtonBackgroundColor} />
                  <S.ColorInput color={buttonBackgroundColor} onChange={setButtonBackgroundColor} />
                </span>
              }
            >
              <span>
                <S.ColorIcon
                  type={'bg-colors'}

                  color={buttonTextColor}
                  backgroundColor={buttonBackgroundColor}
                ></S.ColorIcon>
              </span>
            </Tip>
          </S.SideComponent>
          <S.SideComponent>
            <S.Text>Go to</S.Text>
            <S.Select
              dropdownStyle={{
                background: Colors.App.sidebarColor,
                border: `1px solid ${Colors.primaryColor}`
              }}
              defaultValue={
                gotoType
              }
              value={
                gotoType
              }
              style={{
                maxWidth: 115,
                width: 115
              }}
              onChange={(newGotoType) => {

                setGotoType(newGotoType)
              }}>
              {Object.keys(GOTO_TYPES).map((type, index, array) => {
                let isLast = index === array.length - 1
                return <Option
                  style={{
                    background: 'none',
                    color: Colors.primaryColor,
                    borderBottom: isLast ? 'none' : '1px solid #d9d9d9',
                  }}
                  key={type}
                  value={type}>
                  {type}</Option>
              })
              }
            </S.Select>

            {gotoType === GOTO_TYPES.next ? '' :
              (gotoType === GOTO_TYPES.screen ?
                getSelectScreenComp(storyDemo.screens, currentSelectedScreen) :
                getWebsiteInputComp(gotoWebsite, setGotoWebsite)
              )}
          </S.SideComponent>
        </span>
      )}

    </S.PopupButtonWrapper>

  )
}

const S = {
  AddIcon: styled.div`
    height: 25px;
    width: 45px;

    && svg path {
      fill: ${Colors.primaryColor};
    }

    && svg {
      width: 100%;
      height: 100%;
    }


    &:hover svg {
      cursor: pointer;
      fill: ${Colors.primaryColorDarker};
    }
    margin: 0 10px;

    transition: 0.4s ease-in-out;

    transform: translate(50px, 0px) scale(0.9);
    opacity: 0;
  `,
  DeleteIcon: styled(Icon)`
    width: 18px;
    height: 18px;
    margin-left: 15px;

    cursor: pointer;

    && svg {
      fill: #ff0000c4;
      width: 100%;
      height: 100%;
    }
    `,
  OpenArrow: styled(Icon)`
    justify-self: flex-end;
    align-self: center;
    margin-right: 15px;
    cursor: pointer;
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

  Tippy: styled(Tippy)`

    background: #FFF !important;
    color: #111;
    //font-size: 1rem;
    //padding: 5px 10px;
    max-width: 250px;
    border-radius: 6px;

    && .tippy-arrow::before {
      color: #333 !important;
    }
  `,
  ColorIcon: styled(Icon)`
    width: 26px;
    height: 26px;
    background: ${(props) => props.backgroundColor};
    border-radius: 5px;
    padding: 3px;
    cursor: pointer;

    svg {
      width: 100%;
      height: 100%;
      fill: #fff;
      fill: ${({ color }) => color};
    }
  `,
  SideComponent: styled.div`
    display: flex;
    justify-content: start;
    align-items: center;
    position: relative;
    width: 100%;
  `,
  SelectorInput: styled(Input)`
    && {
      min-width: 100px;
      flex-grow: 1;
    }
  `,
  WebsiteInput: styled(Input)`
    && {
      width: 100px;
      flex-grow: 1;
    }
  `,
  PopupButtonWrapper: styled.div`
    width: 350px;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    padding-left: 15px;
    border-left: 3px solid #1070ff;
  `,
  TextInput: styled(Input)`
    && {
      width: 200px;
      flex-grow: 1;
    }
  `,
  ClickType: styled.p`
    margin: 0px;
  `,
  Text: styled.p`
    margin: 0 5px 0 0;
    line-height: 50px;
  `,
  PickSelectorText: styled.p`
    margin: 0px;
  `,
  PickSelectorIcon: styled(Icon)`
    width: 105px;
  `,
  PickSelectorButton: styled(Button)`
    width: 70px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
    margin-right: 15px;
  `,
  ClickIcon: styled(MdAdsClick)`
    height: 25px;
    width: 45px;

    fill: ${Colors.primaryColor};

    &:hover {
      cursor: pointer;
      fill: ${Colors.primaryColorDarker};
    }
  `,
  SecondLine: styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;

  `,
  ThirdLine: styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    gap: 5px;

  `,
  Select: styled(Select)`

    flex-grow: 1;

    && .ant-select-content-value {
      background: none;
      color: ${Colors.primaryColor};
      border: none !important;
      box-shadow: none;
    }

    && .ant-select-selection {
      background: none;
      color: ${Colors.primaryColor};
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
}

export default PopupButton
