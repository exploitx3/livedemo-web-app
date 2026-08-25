import React, { useEffect, useState } from 'react'
import Colors from '../../../../../../constants/mainColors'
//import { Icon, Input, Modal, Select } from 'antd'

import Icon from '../../../../../../components/Icon/Icon'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import Select from 'antd/es/select'
import styled from 'styled-components'
import axios from '../../../../../../utils/axiosInstance'
import * as ENV from '../../../../../../config'
import TRANSITION_TYPES from '../../../../../../constants/ScreenTransitionTypes'
import PointerIcon from '../../../../../../static/images/pointerIcon.svg'
import PostIcon from '../../../../../../static/images/postIcon.svg'
import TextView from '../../../Step/components/TextView/TextView'
import { deserialize } from '../../../ViewEditor/EditorInternal'
import { MdAdsClick, MdAspectRatio, MdOutlineMouse } from 'react-icons/md'
import { htmlSerialize } from '../../../../../../utils/helperFunctions'
import { deleteTransition, updateTransition } from '../../../../../../actions/storyDemoActions'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Spinner from "../../../../../../components/Spinner/Spinner";

const { confirm } = Modal
const { Option } = Select

const GOTO_TYPES = {
  website: 'website',
  screen: 'screen',
  next: 'next',
}

const OPEN_VIEWS = {
  TEXT_VIEW: 'TEXT_VIEW',
  OPTIONS_VIEW: 'OPTIONS_VIEW',
}

const PLACEMENT_TYPES = {
  TOP: 'top',
  TOP_START: 'top-start',
  TOP_END: 'top-end',
  LEFT: 'left',
  LEFT_START: 'left-start',
  LEFT_END: 'left-end',
  BOTTOM: 'bottom',
  BOTTOM_START: 'bottom-start',
  BOTTOM_END: 'bottom-end',
  RIGHT: 'right',
  RIGHT_START: 'right-start',
  RIGHT_END: 'right-end',
  AUTO: 'auto',
  CENTER: 'center'
}

const POINTER_SELECT_TYPES = {
  PICK: 'pick',
  SELECT: 'select',
}

const PointerTransition = function ({
                                      transitionItem,
                                      transitionId,
                                      iframeRef,
                                      storyDemo,
                                      getSelector,
                                      cancelSelector,
                                      screen,
                                      authData,
                                      setScreens,
                                      screens,
                                      disablePointerPickButton,
                                      actions
                                    }) {

  let [isUpdating, setIsUpdating] = useState(false)

  let [selector, setSelector] = useState(transitionItem && transitionItem.selector ? transitionItem.selector : '')
  let [currentSelectedScreen, setCurrentSelectedScreen] = useState(transitionItem && transitionItem.gotoScreen ? transitionItem.gotoScreen : (screens && screens.length !== 0 ? screens[0] : {}))
  let [gotoType, setGotoType] = useState(transitionItem && transitionItem.gotoType && GOTO_TYPES[transitionItem.gotoType] ? GOTO_TYPES[transitionItem.gotoType] : GOTO_TYPES.screen)
  let [gotoWebsite, setGotoWebsite] = useState(transitionItem && transitionItem.gotoWebsite ? transitionItem.gotoWebsite : '')

  let [pointerSelectType, setPointerSelectType] = useState(POINTER_SELECT_TYPES.SELECT)
  let [isPickingElement, setIsPickingElement] = useState(false)

  let [pointerSelector, setPointerSelector] = useState((transitionItem.pointer && transitionItem.pointer.selector) || '')
  let [pointerPlacement, setPointerPlacement] = useState((transitionItem.pointer && transitionItem.pointer.placement) || 'auto')
  let [pointerSelectorLocation, setPointerSelectorLocation] = useState(
    (transitionItem.pointer && transitionItem.pointer.selectorLocation) || {
      positionX: 200,
      positionY: 200,
      width: 150,
      height: 50,
    }
  )

  let [openView, setOpenView] = useState(OPEN_VIEWS.TEXT_VIEW)


  const parsed = new DOMParser().parseFromString(transitionItem.content, 'text/html')
  const initialValue = deserialize(parsed.body)
  let [editorValue, setEditorValue] = useState(initialValue)

  let viewType = transitionItem.type

  useEffect(() => {

    window.postMessage({
      type: 'editor_show_regions',
      editorShowRegions: pointerSelectType === POINTER_SELECT_TYPES.SELECT
    }, '*')


  }, [pointerSelectType])

  useEffect(() => {

    setPointerSelector((transitionItem.pointer && transitionItem.pointer.selector) || '')
    setPointerPlacement((transitionItem.pointer && transitionItem.pointer.placement) || 'auto')
    setPointerSelectorLocation(
      (transitionItem.pointer && transitionItem.pointer.selectorLocation) || {
        positionX: 200,
        positionY: 200,
        width: 150,
        height: 50,
      }
    )


  }, [transitionItem])


  function saveTransition(navUpdateObj, navId, storyDemoId, screenId, workspaceId, authToken) {

    setIsUpdating(true)
    return actions.updateTransition(navUpdateObj, workspaceId, storyDemoId, screenId, navId, authToken)
      .then((res) => {

        let newTransition = res.data


        window.postMessage({
          type: 'transition_update',
          transitionType: 'pointer',
          transition: newTransition
        }, '*')


      setIsUpdating(false)
    })
      .catch(err => {
        console.log(err)
        setIsUpdating(false)
      })
  }

  function updateSelector() {
    return getSelector()
      .then(({ selector, selectorLocation }) => {

        setPointerSelector(selector)
        setPointerSelectorLocation(selectorLocation)

        let updateObj = {
          pointer: {
            selector: selector,
            selectorLocation: selectorLocation,
            placement: pointerPlacement
          }
        }

        return saveTransition(updateObj, transitionId, storyDemo._id, screen._id, storyDemo.workspaceId, authData.token)
      })
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
        <NAV.Select
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
            width: 100
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
              }}
              key={screen._id}
              value={screen._id}>
              {`${screenIndex}. ${formatScreenName(screen)}`}</Option>
          })
          }
        </NAV.Select>
      )
    }
  }

  function getWebsiteInputComp() {
    return <NAV.WebsiteInput
      value={gotoWebsite}
      placeholder={'https://livedemo.ai'}
      onChange={(event) => {
        setGotoWebsite(event.target.value)
        }
      }
    />
  }

  function showDeleteConfirm() {
    confirm({
      title: 'Are you sure you want to delete this transition item?',
      content: '',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setIsUpdating(true)

        actions.deleteTransition(storyDemo.workspaceId, storyDemo._id, screen._id, transitionItem._id, authData.token)
          .then(() => {

            window.postMessage({
              type: 'transition_delete',
              transition: transitionItem,
              screenId: screen._id
            }, '*')

            setIsUpdating(false)

          })
      },
      onCancel() {
      },
    });
  }

  function onSave(saveObj, transitionItem) {

    return saveTransition(saveObj, transitionItem._id, storyDemo._id, screen._id, storyDemo.workspaceId, authData.token)

  }

  let isViewOpen = true

  return <NAV.ViewContainer

    isViewOpen={isViewOpen}
  >

    <React.Fragment>
      <NAV.ViewHeader>
        <NAV.HeaderMain onClick={() => {


        }}>
          {viewType === TRANSITION_TYPES.POINTER ? <img src={PointerIcon}/> : <img src={PostIcon}/>}
          <NAV.OpenArrow type={'down'}/>
          <NAV.ViewTitle>{TRANSITION_TYPES[viewType.toUpperCase()]}</NAV.ViewTitle>
        </NAV.HeaderMain>
        <NAV.EditTextButton
          type="edit"
          className={'Step__EditTextButton'}
          onClick={function () {
            setOpenView(OPEN_VIEWS.TEXT_VIEW)
          }}>
        </NAV.EditTextButton>
        <NAV.SettingsButton
          type="setting"
          className={'Step__SettingsButton'}
          onClick={function () {
            setOpenView(OPEN_VIEWS.OPTIONS_VIEW)
          }}
        >
        </NAV.SettingsButton>
        <NAV.SaveButtonWrapper onClick={() => {


          let contentHtml = htmlSerialize(editorValue)

          let saveObj = {
            content: contentHtml,
            pointer: {
              selector: pointerSelector,
              selectorLocation: pointerSelectorLocation,
              placement: pointerPlacement,
            },
            gotoType: gotoType,
            gotoWebsite: gotoWebsite,
            gotoScreen: currentSelectedScreen._id,
          }

          onSave(saveObj, transitionItem)
        }}
                               className={'Step__SaveButton'}>
            <NAV.SaveButtonWrapperIcon type={'save'}/>
          </NAV.SaveButtonWrapper>
          <NAV.DeleteButton onClick={() => {
            showDeleteConfirm()
          }} className={'Step__DeleteButton'}>

            <NAV.DeleteIcon type={'delete'} theme={'filled'}/>
          </NAV.DeleteButton>
      </NAV.ViewHeader>
      {isUpdating ? <NAV.SpinnerWrapper><Spinner/></NAV.SpinnerWrapper> : (

      <NAV.ViewWrapper>
      {openView === OPEN_VIEWS.TEXT_VIEW ? (
        <TextView
          editorValue={editorValue}
          setEditorValue={setEditorValue}
        />) : (
        <NAV.ViewContent>
          <React.Fragment>


            <NAV.ActionSelectorLine style={{ justifyContent: 'center', gap: '10px', margin: '15px 0px 30px 0px' }}>
              {!disablePointerPickButton ? (
                <NAV.PickSelectorButton isSelected={pointerSelectType === POINTER_SELECT_TYPES.PICK} onClick={() => {
                  setPointerSelectType(POINTER_SELECT_TYPES.PICK)

                  let newIsPickingElementValue = !isPickingElement
                  setIsPickingElement(newIsPickingElementValue)

                  if (newIsPickingElementValue) {
                    Promise.resolve(updateSelector())
                      .then(() => {
                        setIsPickingElement(false)
                        setPointerSelectType(POINTER_SELECT_TYPES.SELECT)
                      })
                      .catch(() => {
                        setIsPickingElement(false)
                        setPointerSelectType(POINTER_SELECT_TYPES.SELECT)
                      })
                  } else {
                    cancelSelector()
                    setIsPickingElement(false)
                    setPointerSelectType(POINTER_SELECT_TYPES.SELECT)
                  }

                }}>
                  <NAV.PickSelectorText>{!isPickingElement ? 'Pick' : 'Cancel'}</NAV.PickSelectorText>
                  <NAV.PickClickIcon/>
                </NAV.PickSelectorButton>
              ) : ''}

              <NAV.PickSelectorButton isSelected={pointerSelectType === POINTER_SELECT_TYPES.SELECT} onClick={() => {
                setPointerSelectType(POINTER_SELECT_TYPES.SELECT)
                cancelSelector()
                setIsPickingElement(false)

              }}>
                <NAV.PickSelectorText>Select</NAV.PickSelectorText>
                <NAV.SelectClickIcon/>
              </NAV.PickSelectorButton>
            </NAV.ActionSelectorLine>

            <NAV.ActionSelectorLine>
              <NAV.ActionSelectorText>Placement:</NAV.ActionSelectorText>

              <NAV.Select
                dropdownStyle={{
                  background: Colors.App.sidebarColor,
                  border: `1px solid ${Colors.primaryColor}`
                  // boxShadow: `0 0 0 2px ${Colors.primaryColor}`
                }}
                value={pointerPlacement}
                style={{
                  width: 120
                }}
                onChange={(placementKey) => {

                  setPointerPlacement(PLACEMENT_TYPES[placementKey])
                }}>
                {Object.entries(PLACEMENT_TYPES).map(([key, value], index, array) => {
                  let isLast = index === array.length - 1
                  return <Option style={{
                    background: 'none',
                    color: Colors.primaryColor,
                    borderBottom: isLast ? 'none' : '1px solid #d9d9d9',
                  }} key={key} value={key}>{value}</Option>
                })
                }
              </NAV.Select>
            </NAV.ActionSelectorLine>

          </React.Fragment>
          <NAV.RightSide>
            <NAV.SecondLine>
              <NAV.Text>Go to</NAV.Text>
              <NAV.Select
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
                  maxWidth: 115
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
              </NAV.Select>

              {gotoType === GOTO_TYPES.next ? '' : (gotoType === GOTO_TYPES.screen ?
                  getSelectScreenComp(screens, currentSelectedScreen) :
                  getWebsiteInputComp(gotoWebsite, setGotoWebsite)
              )}
            </NAV.SecondLine>
          </NAV.RightSide>
        </NAV.ViewContent>
      )}


    </NAV.ViewWrapper>
      )}
    </React.Fragment>

  </NAV.ViewContainer>
}


const NAV = {
  SpinnerWrapper: styled.div`
    position: relative;
    width: 80px;
    height: 80px;
  `,
  SelectClickIcon: styled(MdAspectRatio)`
    height: 25px;
    width: 45px;

    transition: all 0.3s;
  `,
  PickClickIcon: styled(MdAdsClick)`
    height: 25px;
    width: 45px;

    // &:hover {
    //   cursor: pointer;
    //   fill: ${Colors.primaryColor};
    //   // fill: ${Colors.primaryColorDarker};
    // }
  `,
  PickSelectorButton: styled.button`
    width: 100px;
    display: flex;
    flex-direction: row;
    align-items: center;
    outline: none;
    padding: 5px 10px;
    color: ${({ isSelected }) => isSelected ? '#f9f9f9' : Colors.primaryColor};
    justify-content: center;
    border: 1px solid ${({ isSelected }) => isSelected ? Colors.primaryColor : '#f9f9f9'};
    cursor: pointer;

    border-radius: 8px;
    background: ${({ isSelected }) => isSelected ? Colors.primaryColor : '#f9f9f9'};
    &:hover {
      border-color: ${Colors.primaryColor};
    }

    & svg {
      fill: ${({ isSelected }) => isSelected ? '#f9f9f9' : Colors.primaryColor};
    }

  `,
  PickSelectorText: styled.p`
    margin: 0px;
    font-family: ${Colors.fontFamily};
  `,
  ActionSelectorLine: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 15px;

  `,
  ActionSelectorText: styled.p`
    margin: 0px;
  `,
  ViewWrapper: styled.div`
    width: 100%;
  `,
  OpenArrow: styled(Icon)`
    justify-self: flex-end;
    align-self: center;
    margin-right: 15px;
    cursor: pointer;
    `,
  ViewHeader: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;

    height: 35px;

    width: 100%;
    border: 1px solid black;
    border-radius: 6px;
    padding: 0px 5px;

    &&:hover .Step__DeleteButton,
    &&:hover .Step__SaveButton,
    &&:hover .Step__EditTextButton,
    &&:hover .Step__SettingsButton
     {
      visibility: visible;
    }


  `,
  HeaderMain: styled.span`
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-grow: 1;
    gap: 10px;

  `,
  CloseButton: styled.div`
    position: absolute;
    top: -2px;
    right: -2px;

    display: none;

    &&:hover {
      cursor: pointer;
    }
`,
  CloseIcon: styled(Icon)`
    width: 22px;
    height: 22px;

    && svg {
      fill: #4c94ff;
      width: 100%;
      height: 100%;
    }
    `,
  SettingsButton: styled(Icon)`
    display: flex;
    align-content: center;
    margin-right: 15px;
    visibility: hidden;

    &&:hover {
      cursor: pointer;
    }

    && svg {
      fill: black;
      width: 100%;
      height: 100%;
    }

  `,
  EditTextButton: styled(Icon)`
    display: flex;
    align-content: center;
    margin-right: 15px;
    visibility: hidden;

    &&:hover {
      cursor: pointer;
    }

    && svg {
      fill: ${Colors.primaryColor};
      width: 100%;
      height: 100%;
    }
  `,
  ViewContainer: styled.div`
    padding: 0px 10px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    border-radius: 4px;

    width: 100%;

    margin-bottom: 20px;

    // width: ${(props) => props.isViewOpen ? '275' : '125'}px;
    // height: ${(props) => props.isViewOpen ? '325' : '125'}px;
    //background: #F9F9F9;
  `,
  ViewContent: styled.div`

    width: 100%;

    border: 1px solid black;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    border-top: none;
    padding: 10px;
  `,
  ViewTitle: styled.h2`
    font-size: 1em;
    color: #111;
    text-align: center;
    text-transform: capitalize;
    margin-bottom: 0px;

  `,
  Wrapper: styled.div`
    width: 100%;
    height: 100%;
    position: relative;

  `,
  Title: styled.p`
    margin: 0px;
  `,
  ItemWrapper: styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 200px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.65);
    margin-bottom: 15px;
  `,
  Header: styled.div`
    height: 50px;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: 1px solid #896174;
    background: #f3f3f3;
  `,
  LeftSide: styled.span`
    height: 100%;
    width: 50px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  `,
  RightSide: styled.span`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 5px;
  `,
  FirstLine: styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    align-items: center;
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
  Text: styled.p`
    margin: 0px;
    line-height: 50px;
  `,
  PickSelectorIcon: styled(Icon)`
    width: 105px;
  `,
  // PickSelectorButton: styled(Button)`
  //   width: 70px;
  //   display: flex;
  //   flex-direction: row;
  //   justify-content: space-between;
  //   align-items: center;
  //   gap: 5px;
  //   margin-right: 15px;
  // `,
  ClickType: styled.p`
    margin: 0px;
  `,
  EClickIcon: styled(MdOutlineMouse)`
    height: 25px;
    width: 45px;

    fill: ${Colors.primaryColor};

    &:hover {
      cursor: pointer;
      fill: ${Colors.primaryColorDarker};
    }

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
  Header__LeftSide: styled.span`
    height: 100%;
    width: auto;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  `,
  Header__RightSide: styled.span`
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  `,
  SaveButtonWrapperIcon: styled(Icon)`
    width: 18px;
    height: 18px;

    && svg {
      fill: ${Colors.primaryColor};
      width: 100%;
      height: 100%;
    }
  `,
  SaveButtonWrapper: styled.div`
    display: flex;
    align-content: center;
    margin-right: 15px;

    &&:hover {
      cursor: pointer;
    }
  `,
  DeleteButton: styled.div`
    display: flex;
    align-content: center;
    margin-right: 15px;

    &&:hover {
      cursor: pointer;
    }



  `,
  DeleteIcon: styled(Icon)`
    width: 18px;
    height: 18px;

    && svg {
      fill: #ff0000c4;
      width: 100%;
      height: 100%;
    }
    `,

}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      updateTransition,
      deleteTransition
    }, dispatch)
  }
}

export default connect(null, mapDispatchToProps)(PointerTransition)
