import React, { useState } from 'react'
import Colors from '../../../../../../constants/mainColors'
//import { Button, Dropdown, Icon, Input, Menu, Modal } from 'antd'

import Button from 'antd/es/button'
import Dropdown from 'antd/es/dropdown'
import 'antd/es/dropdown/style'
import Icon from '../../../../../../components/Icon/Icon'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'

import styled from 'styled-components'
import axios from '../../../../../../utils/axiosInstance'
import Simmer from 'simmerjs'
import Step from '../../../Step/Step'
import * as ENV from '../../../../../../config'
import { Draggable } from '@hello-pangea/dnd'
import Spinner from '../../../../../../components/Spinner/Spinner'
import PointerTransition from '../PointerTransition/PointerTransition'
import {bindActionCreators} from "redux";
import {addStep, addTransition, updateScreen} from "../../../../../../actions/storyDemoActions";
import {connect} from "react-redux";

const { confirm } = Modal


const ScreenVideo = ({
                  storyDemo, iframeRef, setScreens, setStoryDemo, tabsWidth, authData, changeStep, reloadStoryDemo,
                  screen, screenIndex, calculatedStepIndex, previousStep, previousStepIndex, actions
                }) => {
  const screens = storyDemo && storyDemo.screens ? storyDemo.screens : []

  let [isScreenOpen, setIsScreenOpen] = useState(false)
  // last screen must stay open — add UI lives in the open body
  const isOpen = screenIndex === screens.length - 1 || isScreenOpen
  let [isTextEditing, setIsTextEditing] = useState(false)
  let [showTransition, setShowTransition] = useState(false)
  let [isNavUpdating, setIsNavUpdating] = useState(false)

  const marginTop = 116
  const viewName = 'overview'

  screen.name = formatScreenName(screen)
  let [isNameEditable, setIsNameEditable] = useState(false)
  let [screenInternal, setScreenInternal] = useState(screen)

  function getStepIndex(screens, stepId) {
    return screens.reduce((accum, screen) => {

      if (screen.steps) {
        accum = accum.concat(screen.steps.map(s => s._id))
      } else {
        accum = accum.concat([{
          screenId: screen._id
        }])
      }

      return accum
    }, []).indexOf(stepId)
  }


  function getSelector() {
    return new Promise((resolve, reject) => {
      function onClick(element) {


        const simmer = new Simmer(iframeRef.current.contentWindow.frames[0].document)

        let selector = `[livedemo_id="${element.getAttribute('livedemo_id')}"`

        let elementBounds = element.getBoundingClientRect()
        let selectorLocation = {
          positionX: elementBounds.x,
          positionY: elementBounds.y,
          width: elementBounds.width,
          height: elementBounds.height,
        }

        // console.log(selector)
        // console.log(element)
        resolve({
          selector,
          selectorLocation
        })

      }

      iframeRef.current.contentWindow.elementPicker.init({
        document: iframeRef.current.contentWindow.frames[0].document,
        onClick,
        backgroundColor: Colors.primaryColor
      })

      setTimeout(() => {
        reject('Timed-out after 1 minutes - waiting to select an element')
      }, 60 * 1000)
    })
  }

  function addStep(index, storyDemoId, screenId, workspaceId, authToken) {
    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps`, {
      index: index
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((res) => {
      return res.data
    })
  }

  function deleteStep(stepId, storyDemoId, screenId, workspaceId, authToken) {
    return axios.delete(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${stepId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((res) => {
      return res.data
    })
  }

  function deleteScreen(storyDemoId, screenId, workspaceId, authToken) {
    return axios.delete(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((res) => {
      return res.data
    })
  }

  function duplicateScreen(storyDemoId, screenId, workspaceId, authToken) {
    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/copy`, {}, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((res) => {
      return res.data
    })
  }

  function onEditText(workspaceId, storyDemoId, authToken) {

    if (isTextEditing) {
      setIsTextEditing(false)
      iframeRef.current.contentWindow.resetEditText()

      return
    }

    return new Promise((resolve, reject) => {
      setIsTextEditing(true)

      function onFinishEditting(result) {
        resolve(result)
      }

      setTimeout(() => {
        reject()
      }, 300 * 1000)

      iframeRef.current.contentWindow.editText(onFinishEditting)

    })
      .then((result) => {
        if (result.action === 'save' && result.text !== result.oldText) {
          let screenId = result.screenId
          let newText = result.text
          let liveDemoTagId = result.liveDemoTagId


          return axios.post(`${ENV.STORIES_API}/workspaces/${storyDemo.workspaceId}/stories/${storyDemo._id}/screens/${screenId}/editText`,
            {
              'selector': `[livedemo_id="${liveDemoTagId}"]`,
              'text': newText
            },
            {
              headers: {
                Authorization: `Bearer ${authToken}`
              }
            })
            .then((res) => {
              return res.data
            })
        } else {
          return Promise.resolve({})
        }

      })
      .then((result) => {
        setIsTextEditing(false)
        // console.log(result)
      })
  }


  function reorderArray(array, from, to) {
    let newArray = [...array]
    newArray.splice(to, 0, newArray.splice(from, 1)[0])

    return newArray
  }

  function onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    if (result.destination.index === result.source.index) {
      return
    }

    let sourceIndex = result.source.index
    let destinationIndex = result.destination.index
    let isSourceSmaller = sourceIndex < destinationIndex
    let screensToUpdate = isSourceSmaller ? screens.slice(sourceIndex + 1, destinationIndex + 1) : screens.slice(destinationIndex, sourceIndex)

    let changeNumber = isSourceSmaller ? -1 : +1
    // let itemsToUpdatePromises = Promise.all(
    //   screensToUpdate.map((screen, screenIndex) => {
    //
    //     return axios.patch(`${ENV.STORIES_API}/workspaces/${storyDemo.workspaceId}/stories/${storyDemo._id}/screens/${screen._id}`,
    //       {
    //         index: screen.index + changeNumber
    //       },
    //       {
    //         headers: {
    //           Authorization: `Bearer ${authData.token}`
    //         }
    //       })
    //       .then((res) => {
    //
    //
    //         return res.data
    //       })
    //   })
    // )

    // console.log(result)

    let screenId = result.draggableId
    let oldIndex = result.source.index
    let newIndex = result.destination.index


    let newScreensArray = reorderArray(screens, oldIndex, newIndex)

    setScreens(newScreensArray)


    return Promise.all([
        axios.post(`${ENV.STORIES_API}/workspaces/${storyDemo.workspaceId}/stories/${storyDemo._id}/updateScreenOrder`,
          {
            screens: newScreensArray.map((screen, index) => {
              return {
                _id: screen._id,
                index
              }
            })
          },
          {
            headers: {
              Authorization: `Bearer ${authData.token}`
            }
          })
          .then((res) => {


            return res.data
          })
        // itemsToUpdatePromises

      ])
      .then(() => {
        return reloadStoryDemo()
      })

    // const items = reorder(
    //   this.state.items,
    //   result.source.index,
    //   result.destination.index
    // );
    //
    // this.setState({
    //   items
    // });
  }

  function showDeleteScreenConfirm(deleteScreen) {
    confirm({
      title: 'Are you sure you want to delete this screen?',
      content: '',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {

        deleteScreen()

      },
      onCancel() {
      },
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
  // function renderTransition(navItem) {
  //   let [selector, setSelector] = useState('')
  //
  //   return <NAV.ItemWrapper key={navItem._id}>
  //     <NAV.FirstLine>
  //       <NAV.ClickIcon/>
  //       <NAV.Text>On Click</NAV.Text>
  //       <NAV.PickSelectorButton onClick={() => updateSelector(navItem._id, storyDemo._id, setSelector)}>
  //         <NAV.PickSelectorText>Pick</NAV.PickSelectorText>
  //         <NAV.PickSelectorIcon type={'right'}/>
  //       </NAV.PickSelectorButton>
  //       <NAV.SelectorInput onChange={(event) => {
  //         setSelector(event.target.value)
  //       }}/>
  //     </NAV.FirstLine>
  //     <NAV.SecondLine>
  //       <NAV.Text>Go to</NAV.Text>
  //
  //     </NAV.SecondLine>
  //   </NAV.ItemWrapper>
  // }

  function addTransition(storyDemoId, screenId, workspaceId, authToken) {
    let newNavObj = {
      selector: '',
      gotoType: 'screen',

    }

    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/transitions`, {
      ...newNavObj
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((res) => {
      let newNav = res.data

      let newNavs = [...screenInternal.customTransitions].map(nav => {
        if (nav._id === newNav._id) {
          return newNav
        }
        return nav
      })
      let newScreen = { ...screenInternal }
      newScreen.customTransition = newNavs

      let newScreens = [...screens].map(scr => {
        if (scr._id === newScreen._id) {
          return newScreen
        }
        return scr
      })

      setScreens(newScreens)

      return newNav
    })
  }

  function renderAllTransitions(isNavUpdating, transitionItems = []) {

    return <NAV.Wrapper>
      {isNavUpdating ? (
        <NAV.SpinnerWrapper>
          <Spinner/>
        </NAV.SpinnerWrapper>) : (
        <React.Fragment>
          <NAV.Title>Custom transition</NAV.Title>
          {transitionItems.map(navItem => {

            return <Transition
              key={navItem._id}
              navItem={navItem}
              screen={screenInternal}
              getSelector={getSelector}

              setIsNavUpdating={setIsNavUpdating}
              setScreens={setScreens}
              storyDemo={storyDemo}
              authData={authData}/>
          })}
        </React.Fragment>
      )}
      <SC.Line>
        <SC.AddStepIcon onClick={() => {

          addTransition(storyDemo._id, screenInternal._id, storyDemo.workspaceId, authData.token)
            .then((newTransition) => {

              screenInternal.customTransition.push(newTransition)
              let newScreens = [...screens]

              setScreens(newScreens)
            })
        }}
                        type="plus-square"
                        theme={'filled'}/>
      </SC.Line>
    </NAV.Wrapper>
  }

  const screenMenuItems = [
    {
      key: 'steps',
      label: 'Steps',
      onClick: () => {
        setShowTransition(false)
      }
    },
    {
      key: 'transitions',
      label: 'Transitions',
      onClick: () => {
        setShowTransition(true)
      }
    },
    {
      key: 'duplicate',
      label: 'Duplicate',
      onClick: () => {
        return duplicateScreen(storyDemo._id, screenInternal._id, storyDemo.workspaceId, authData.token)
          .then(() => {
            return reloadStoryDemo()
          })
      }
    },
    {
      key: 'delete',
      label: 'Delete',
      onClick: () => {
        let deleteClosure = function () {
          deleteScreen(storyDemo._id, screenInternal._id, storyDemo.workspaceId, authData.token)
            .then(() => {
              reloadStoryDemo()
            })
        }

        showDeleteScreenConfirm(deleteClosure)
      }
    }
  ]

  function getScreenIcon(screen) {
    if (screen.type === 'Screen_Page') {

      return <SC.ScreenIcon>
        <svg className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiBox-root css-1om0hkc" focusable="false"
             aria-hidden="true" viewBox="0 0 24 24" data-testid="WebIcon">
          <path
            d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"></path>
        </svg>
      </SC.ScreenIcon>
    } else if (screen.type === 'Screen_Screenshot') {

      return <SC.ScreenIcon>
        <Icon type={'picture'}/>
      </SC.ScreenIcon>
    } else if (screen.type === 'Screen_Video') {

      return <SC.ScreenIcon>
        <Icon type={'video-camera'}/>
      </SC.ScreenIcon>
    }
  }

  function getScreenImage(screen) {
    if(screen.type === 'Screen_Video') {

      return `https://image.mux.com/${screen.asset.playback_ids[0].id}/thumbnail.png`
    } else {

      return screen.imageUrl
    }
  }

  return (

    <SC.Wrapper id={viewName}>


      <Draggable key={screenInternal._id} draggableId={screenInternal._id} index={screenIndex}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
          >

            <SC.ScreenWrapper>
              <SC.ScreenHeader isOpen={isOpen}>
                <SC.DragWrapper {...provided.dragHandleProps}>
                  <SC.DragIcon width="12" height="13" viewBox="0 0 12 13" fill="none"
                               xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0 0H2V2H0V0ZM5 0H7V2H5V0ZM10 0H12V2H10V0ZM0 5H2V7H0V5ZM5 5H7V7H5V5ZM10 5H12V7H10V5ZM0 10H2V12H0V10ZM5 10H7V12H5V10ZM10 10H12V12H10V10Z"
                      fill="black"/>
                  </SC.DragIcon>
                </SC.DragWrapper>
                <SC.HeaderMain onClick={() => {
                  changeStep(calculatedStepIndex)

                  // last screen stays open so add controls remain visible
                  if (screenIndex === screens.length - 1) return
                  if (calculatedStepIndex === previousStepIndex || !isScreenOpen) {
                    setIsScreenOpen(!isScreenOpen)
                  }
                }}>
                  <SC.ScreenDemoImageWrapper>
                    <SC.ScreenDemoImage src={getScreenImage(screenInternal)}/>
                    {getScreenIcon(screenInternal)}
                  </SC.ScreenDemoImageWrapper>

                  <SC.ScreenTitle
                    className={isNameEditable ? 'editing' : ''}
                    onClick={(e) => {
                      if(e.detail === 2) {
                        setIsNameEditable(true)
                      }
                    }}
                    contentEditable={isNameEditable}
                    suppressContentEditableWarning={true}
                    onKeyPress={function (event) {
                      // console.log(event)
                      if (event.key === "Enter") {
                        event.preventDefault();

                        event.target.blur()
                      }

                    }}
                    onBlur={function (e) {
                      setIsNameEditable(false)

                      let newScreen = {...screenInternal}
                      newScreen.name = e.target.innerText

                      if(newScreen.name !== screenInternal.name) {
                        setScreenInternal(newScreen)

                        actions.updateScreen({name: newScreen.name}, storyDemo.workspaceId, storyDemo._id, newScreen._id, authData.token)
                      }
                    }}
                  >{screenInternal.name}</SC.ScreenTitle>
                </SC.HeaderMain>
                <Dropdown trigger={['click']} menu={{ items: screenMenuItems }}>
                  <SC.MenuButton>

                    <SC.MenuIcon type={'ellipsis'}/>
                  </SC.MenuButton>
                  {/*<a className="ant-dropdown-link" onClick={e => e.preventDefault()}>*/}
                  {/*  Hover me <Icon type="down" />*/}
                  {/*</a>*/}
                </Dropdown>

              </SC.ScreenHeader>
              {isOpen ? (
                <SC.ScreenEmptyText>
                  Videos cannot have steps
                </SC.ScreenEmptyText>
                ) : ''}


            </SC.ScreenWrapper>
          </div>
        )}
      </Draggable>


    </SC.Wrapper>
  )
}


const NAV = {
  Wrapper: styled.div`
    width: 100%;
    height: 100%;
    position: relative;
  `,
  Title: styled.p`
    margin: 0px;
    font-size: 1.1em;
    margin-bottom: 10px;
  `,
  SpinnerWrapper: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 80px;
    position: relative;
  `,
}

const SC = {
  HeaderMain: styled.main`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-grow: 1;
    height: 100%;
    gap: 15px;
    margin-left: 15px;

    &&:hover {

      cursor: pointer;
    }

  `,
  ScreenEmptyText: styled.p`
    text-align: center;
    margin: 0px;
  `,
  ScreenIcon: styled.span`

    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.8;
    line-height: 55px;
    display: flex;
    top: 0;
    justify-content: center;
    align-items: center;


    && svg {
      width: 100%;
      height: 100%;
      fill: ${Colors.primaryColor};
    }

    && i {
      width: 25px;
      height: 25px;
    }
  `,
  ScreenDemoImageWrapper: styled.span`
    width: 25%;
    min-height: 55%;
    border-radius: 6px;
    border: 2px solid ${Colors.primaryColor};
    position: relative;
    height: 80%;



  `,
  ScreenDemoImage: styled.img`
    // width: 25%;
    // min-height: 55%;
    // border-radius: 6px;
    // border: 1px solid ${Colors.primaryColor};

    width: 100%;
    height: 100%;
  `,
  DragWrapper: styled.div`
    margin-left: 15px;
  `,
  DragIcon: styled.svg`

  `,
  MenuButton: styled.div`

    transform: rotate(90deg);
    margin-right: 15px;


    &&:hover {
      cursor: pointer;
    }



  `,
  MenuIcon: styled(Icon)`
    width: 22px;
    height: 22px;

    && svg {
      width: 100%;
      height: 100%;
    }
    `,
  // ScreenMenuIcon: styled(Icon)`
  //
  // `,
  ScreenHeader: styled.header`
    position: relative;
    width: 100%;
    height: 65px;
    background: #F3F3F3;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    margin-bottom: 15px;

    padding: 0px;
    border-radius: 6px;
    border: 1px solid ${(props) => {
    return props.isOpen ? Colors.primaryText : Colors.primaryColor
  }
    };
    &&:hover {

      border: 1px solid ${Colors.primaryText};
    }

  `,
  ScreenWrapper: styled.div`
    position: relative;
    width: 100%;
    //padding: 25px;
    height: auto;
    //background: #F9F9F9;

    &&:hover .CloseButtonScreen {
      display: block;
    }
  `,
  ScreenTitle: styled.span`
    max-width: 160px;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
    overflow: hidden;
    outline: none;

    font-size: 1.2em;
    color: ${Colors.primaryText};

    user-select: none; /* standard syntax */
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */

    &&.editing {
        cursor: text;
        border-bottom: 1px solid black;
    }
  `,
  ReloadButton: styled(Button)`
    && {

      margin-top: -3px;
      margin-left: 5px;
      border: none;
      width: 25px;
      padding: 0px;
      height: 25px;
      font-size: 1.2em;
      background-color: #FFF;
      color: #c4cacd;
    }

`,
  EditTextButton: styled(Button)`

  `,
  ReloadIcon: styled(Icon)`

  `,
  SearchBar: styled.span`
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-top: -10px;
  `,
  SearchInput: styled(Input)`
    && {
      padding-left: 30px;
      padding-right: 30px;
    }

    &&:hover {
      border: 1px solid black !important;
    }

    &&:focus {
      border: 1px solid black !important;
    }

  `,
  SearchIcon: styled(Icon)`
    && {
      position: absolute;
      left: 0;
      width: 30px;
      height: 20px;
      vertical-align: middle;
      z-index: 2;
    }

    && svg {
      fill: #c4cacd;
      width: 100%;
      height: 100%;
    }
  `,
  SearchButton: styled(Button)`
    && {
      position: absolute;
      right: 5px;
      width: 25px;
      padding: 0px;
      height: 25px;
      font-size: 1.2em;
      background-color: ${(props) => props.isInputActive ? Colors.primaryColor : '#FFF'};
      color: ${(props) => props.isInputActive ? '#FFF' : '#c4cacd'};
    }

    // &&:hover {
    //   background-color: ${Colors.primaryColorDarker};
    // }


  `,
  TitleWrapper: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  `,
  Title: styled.h2`
    font-size: 1.0em;
    text-align: center;
    margin-left: 5px;
    min-width: 85px;
  `,
  SortIcon: styled(Icon)`
    && {
      width: 18px;
      height: 18px;
      vertical-align: middle;
    }

    && svg {
      fill: ${Colors.primaryColor}AA;
      width: 100%;
      height: 100%;
    }


    &&:hover svg {
      fill: ${Colors.primaryColor};
      width: 100%;
      height: 100%;
    }

  `,
  Requests: styled.div`

  `,
  Requests__List: styled.ul`
    padding: 0px;
    height: 500px;
    overflow-y: scroll;


    &&::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 10px;
      background-color: #fff;
    }

    &&::-webkit-scrollbar {
      width: 3px;
      background-color: #fff;
    }

    &&::-webkit-scrollbar-thumb {
      border-radius: 10px;
      //-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
      background-color: ${Colors.primaryColor};
    }

  `,
  Requests__ItemWrapper: styled.div`
    width: 100%;
    cursor: pointer;
    height: 32px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;

   &&.selected {
    width: 77%;
   }
  `,
  Request__Line: styled.div`
    width: 100%;
    height: 32px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  `,
  Requests__Item: styled.li`
    width: 100%;
    padding: 0px 0px 0px 16px;
    list-style: none;
    margin-bottom: 5px;

    height: 32px;
    line-height: 32px;
    border-radius: 6px;
    transition: height 1.3s;

    &&.modified {

      &&.modified .Requests__ItemUrl {
        color: #800080;
      }
    }


    &&.selected {


      @keyframes fadeInFromNone {
        0% {
            visibility: hidden;
            opacity: 0;
            transform: translateY(-150px);
        }

        1% {
            visibility: visible;
            opacity: 0;
            transform: translateY(-150px);
        }

        100% {
            visibility: visible;
            opacity: 1;
            transform: translateY(0px);
        }
      }

      && svg.loader {
        animation: fadeInFromNone 1s ease-in-out;
      }

      background: aliceblue;
      height: 400px;
      overflow-y: auto;

      &&::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
        border-radius: 10px;
        background-color: #fff;
      }

      &&::-webkit-scrollbar {
        width: 2px;
        background-color: #fff;
      }

      &&::-webkit-scrollbar-thumb {
        border-radius: 10px;
        //-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
        background-color: ${Colors.primaryColor};
      }


      .Requests__ItemUrl {
        color: black;
      }
    }

    &&:hover {
      background: aliceblue;
    }

    &:hover .Requests__ItemUrl{
      color: black;
    }
    //border: 1px solid #d9d9d9;
  `,
  Requests__ItemMethod: styled.span`
    width: 25%;
    color: #10b981;
    text-align: left;
    text-overflow: ellipsis;
    overflow: hidden;
  `,
  Requests__ItemUrl: styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    width: 75%;
    color: #737373;
    height: 32px;
    white-space: nowrap;

  `,
  Wrapper: styled.div`
    position: relative;
    width: 100%;
    height: 100%;

  `,
  LeaderBoardWrapper: styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  `,
  StickySidebar: styled.span`
    height: auto;
    width: 30px;
    position: fixed;
    z-index: 1;
    overflow-x: hidden;
    margin-left: 15px;
`,
  SideMenu: styled.ul`
    display: flex;
    flex-direction: column;
    justify-content: center;
    left: 20px;
    z-index: 1;
    height: 200px;
    top: 30%;
    padding: 0;


  `,
  SideButton: styled.li`
    list-style: none;

    height: 40px;
    width: 6px;
    background: #b7b7b7;
    border-radius: 4px;
    margin-bottom: 20px;
    transition: all 0.5s linear;

    &:hover {
      background: ${Colors.primaryColor}aa;
      //height: 24px;
      cursor: pointer;
    }

    &.active-menu {
      background: ${Colors.primaryColor};
      transform: scaleY(1.45);
      //height: 24px;

    }

    & button{
      visibility: hidden;
      background: ${Colors.primaryColor};

    }

  `,
  MainView: styled.div`
    //margin-left: 50px;
    //overflow: auto;

    padding: 14px;
    bottom: 0;
    //position: fixed;
    overflow-y: scroll;
    overflow-x: hidden;



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

  `,
  SaveButton: styled.div(props => ({
    color: '#8d9599',
    textAlign: 'center',
    display: 'flex',
    height: '35px',
    width: '23%',
    borderRadius: '6px',
    justifyContent: 'center',
    alignItems: 'center',
    '&:hover': {
      cursor: 'pointer',
    },

    ...props.buttonStyles,
  })),
  SaveButton__Image: styled(Icon)`
    height: 15px;
    width: 15px;

    && svg {

      height: 15px;
      width: 15px;
    }
  `,
  SaveButton__Text: styled.p`
    height: 50px;
    text-align: center;
    line-height: 50px;
    margin: 0px 5px;
    font-size: 1.1em;

`,

  ButtonWrapper: styled.span`
    display:  flex;
    align-items: center;
    height: 100%;
    width: fit-content;
    margin-left: 15px;

    &:hover {
      cursor: pointer;
    }

  `,
  ButtonText: styled.p`
    margin: 0 0 0 5px;
    padding: 0;
    font-size: 1.3em;

  `,
  ArrowIcon: styled(Icon)`
    && {
      width: 12px;
      height: 12px;
      vertical-align: middle;

    }

    && svg {
      fill: ${Colors.primaryColor};
      width: 100%;
      height: 100%;
    }
  `,
  BodyWrapper: styled.div`
    padding: 0 5px;
    width: 100%;
    height: 500px;
    overflow-y: scroll;
  `,
  IntroWrapper: styled.div`
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    width: 100%;
    margin: 30px 0 10px 0;

  `,
  TourName: styled.p`
    margin: 0;
    padding: 0;
    font-weight: bold;
    font-size: 1.8em;
    text-transform: capitalize;
    color: ${Colors.primaryColor};
  `,
  NodeIcon: styled.img`
    width: 60px;
    height: 60px;
    border-radius: 8px;
  `,
  Section: styled.section`

    padding-bottom: 35px;
  `,
  ChartRows: styled.span`
    height: 88%;
    justify-content: center;
    //height: 50%;
    width: 100%;
    display: flex;
    flex-direction: column;
    //justify-content: space-evenly;
    align-items: center;
  `,

  AddStepIcon: styled(Icon)`
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
  Line: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `,
  StepWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `,
  StepIndex: styled.p`
    margin: 5px 0px 0px 12px;
    min-width: 65px;
    flex-grow: 1;
  `,
  StepSeperator: styled.span`
    width:6px;
    height:15px;
    border-radius: 12px;
    background: ${Colors.primaryColor};
    margin: 5px 0px;
  `,

}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      updateScreen
    }, dispatch)
  }
}

export default connect(null, mapDispatchToProps)(ScreenVideo)
