import React, {useEffect, useState} from 'react'
import Colors from '../../../../../../constants/mainColors'
//import { Button, Dropdown, Icon, Input, Menu, Modal } from 'antd'
import Button from 'antd/es/button'
import 'antd/es/button/style'
import Dropdown from 'antd/es/dropdown'
import 'antd/es/dropdown/style'
import Icon from '../../../../../../components/Icon/Icon'
import Input from 'antd/es/input'
import 'antd/es/input/style'
import Modal from 'antd/es/modal'
import 'antd/es/modal/style'
import Tooltip from 'antd/es/tooltip'
import 'antd/es/tooltip/style'
import styled from 'styled-components'
import axios from '../../../../../../utils/axiosInstance'
import StepViewTypes from '../../../../../../constants/StepViewTypes'
import Simmer from 'simmerjs'
import Step from '../../../Step/Step'
import * as ENV from '../../../../../../config'
import {Draggable} from '@hello-pangea/dnd'
import Spinner from '../../../../../../components/Spinner/Spinner'
import AddLine from '../../../AddLine/AddLine'
import PointerTransition from '../PointerTransition/PointerTransition'
import HotspotTransition from '../HotspotTransition/HotspotTransition'
import {MdAdsClick, MdOutlineMouse} from 'react-icons/md'
import {addStep, addTransition, updateScreen} from '../../../../../../actions/storyDemoActions'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import elementPicker from '../../../../../../injectScript/storyElementPicker.js'

const {confirm} = Modal

// Editor embeds Walkthrough in the same window (not a nested iframe), so pick
// against the active rrweb replayer / story_iframe document on window.
function getEditorDemoDocument() {
  try {
    if (window.__livedemoActiveReplayer && window.__livedemoActiveReplayer.iframe) {
      return window.__livedemoActiveReplayer.iframe.contentDocument
    }
  } catch (e) {
    // ignore
  }
  const storyIframe = document.getElementById('story_iframe')
  return storyIframe ? storyIframe.contentDocument : null
}


const ScreenPage = ({
                      storyDemo, iframeRef, setScreens, setStoryDemo, tabsWidth, authData, changeStep, reloadStoryDemo,
                      screen, screenIndex, calculatedStepIndex, previousStepIndex, previousStep, actions
                    }) => {
  // const screens = storyDemo && storyDemo.screens ? storyDemo.screens : []

  let screens = storyDemo.screens

  let [isLoading, setIsLoading] = useState(false)
  let [addStepIsLoading, setAddStepIsLoading] = useState(false)

  let [isScreenOpen, setIsScreenOpen] = useState(false)
  // last screen must stay open — add-step/transition UI lives in the open body
  const isOpen = screenIndex === screens.length - 1 || isScreenOpen
  let [isTextEditing, setIsTextEditing] = useState(false)
  let [showTransition, setShowTransition] = useState(false)
  let [isNavUpdating, setIsNavUpdating] = useState(false)

  const isOmniBarDisabled = (storyDemo.custom && storyDemo.custom.misc && storyDemo.custom.misc.isOmniBarDisabled) || false
  let omniBarHeight = !isOmniBarDisabled ? 40 : 0

  let [addLineText, setAddLineText] = useState('')


  const marginTop = 116
  const viewName = 'overview'

  let [isNameEditable, setIsNameEditable] = useState(false)
  screen.name = formatScreenName(screen)
  let [screenInternal, setScreenInternal] = useState(screen)

  useEffect(() => {
    // console.log(screen)
    setScreenInternal(screen)

  }, [screen])

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
      const demoDoc = getEditorDemoDocument()
      if (!demoDoc) {
        reject(new Error('Demo document not available for element pick'))
        return
      }

      function onClick(element) {
        const simmer = new Simmer(demoDoc)

        let livedemoId = element.getAttribute('livedemo_id')
        let selector = livedemoId
          ? `[livedemo_id="${livedemoId}"]`
          : simmer(element)

        // Bounds are iframe-local (recording content coords) — same space as region pixelData
        let elementBounds = element.getBoundingClientRect()
        let selectorLocation = {
          positionX: elementBounds.x,
          positionY: elementBounds.y,
          width: elementBounds.width,
          height: elementBounds.height,
        }

        resolve({
          selector,
          selectorLocation
        })
      }

      elementPicker.init({
        document: demoDoc,
        onClick,
        backgroundColor: Colors.primaryColor
      })

      setTimeout(() => {
        elementPicker.reset()
        reject('Timed-out after 1 minutes - waiting to select an element')
      }, 60 * 1000)
    })
  }

  function cancelSelector() {
    elementPicker.reset()
    if (typeof window.resetEditText === 'function') {
      window.resetEditText()
    }
  }

  function addStep(index, viewType, storyDemoId, screenId, workspaceId, authToken) {
    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps`, {
      index: index,
      view: {
        viewType: viewType
      }
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

  function baseMergeScreen(storyDemoId, screenId, workspaceId, authToken) {
    return axios.post(
      `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/baseMerge`,
      { afterScreenId: screenId },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    ).then((res) => {
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

  function onEditText() {
    // Legacy static HTML EditText removed. Use Toolbar Edit for DOM/rrweb screens.
    return
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

  function addTransition(type, storyDemoId, screenId, workspaceId, authToken) {
    let newNavObj = {
      pointer: {
        selector: ''
      },
      gotoType: 'screen',
      type: type,
      hotspot: {
        frameX: 200,
        frameY: 200
      },
      content: '<p>Click here</p>'

    }

    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/transitions`, {
      ...newNavObj
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((res) => {
      let newTransition = res.data

      let newNavs = [...screenInternal.customTransitions]
      newNavs.push(newTransition)
      let newScreen = {...screenInternal}
      newScreen.customTransitions = newNavs

      let newScreens = [...screens].map(scr => {
        if (scr._id === newScreen._id) {
          return newScreen
        }
        return scr
      })

      setScreenInternal(newScreen)
      setScreens(newScreens)

      window.postMessage({
        type: 'transition_add',
        transition: newTransition,
        screenId: screenId
      }, '*')

      return newTransition
    })
  }

  function renderAllTransitions(isNavUpdating, transitionItems = []) {

    return <NAV.Wrapper>
      {isNavUpdating ? (
        <NAV.SpinnerWrapper>
          <Spinner/>
        </NAV.SpinnerWrapper>) : (
        <React.Fragment>
          <NAV.Title>Custom transitions</NAV.Title>
          {transitionItems.map(transitionItem => {

            if (transitionItem.type === 'hotspot') {
              return <span
                key={transitionItem._id}

              >
                <HotspotTransition
                  transitionItem={transitionItem}
                  transitionId={transitionItem._id}
                  screen={screenInternal}
                  getSelector={getSelector}
                  iframeRef={iframeRef}
                  setIsNavUpdating={setIsNavUpdating}
                  setScreens={setScreens}
                  storyDemo={storyDemo}
                  authData={authData}/>
                </span>
            } else {

              return <PointerTransition
                key={transitionItem._id}
                transitionItem={transitionItem}
                transitionId={transitionItem._id}
                iframeRef={iframeRef}

                screen={screenInternal}
                screens={screens}
                getSelector={getSelector}
                cancelSelector={cancelSelector}

                setIsNavUpdating={setIsNavUpdating}
                setScreens={setScreens}
                storyDemo={storyDemo}
                authData={authData}/>
            }


          })}
        </React.Fragment>
      )}
      {addStepIsLoading ? <div style={{
        height: '65px',
        display: 'block',
        position: 'relative',
        width: '100%'
      }}><Spinner/></div> :(
      <React.Fragment>
        <SC.AddLine onMouseLeave={() => {
          setAddLineText('')
        }}>
          <SC.PointerClickIcon
            onMouseEnter={() => {
              setAddLineText('Add pointer click')
            }}

            onClick={() => {
              setAddStepIsLoading(true)
              addTransition('pointer', storyDemo._id, screenInternal._id, storyDemo.workspaceId, authData.token)
                .then((newTransition) => {
                  setAddStepIsLoading(false)

                })
            }}
            className={'AddLine_PointerIcon'}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 6.2C4 5.98 4.18 5.8 4.4 5.8H11.6C11.82 5.8 12 5.98 12 6.2V6.8C12 6.90609 11.9579 7.00783 11.8828 7.08284C11.8078 7.15786 11.7061 7.2 11.6 7.2H4.4C4.29391 7.2 4.19217 7.15786 4.11716 7.08284C4.04214 7.00783 4 6.90609 4 6.8V6.2ZM4.4 8.8C4.34747 8.8 4.29546 8.81035 4.24693 8.83045C4.1984 8.85055 4.1543 8.88001 4.11716 8.91716C4.08001 8.9543 4.05055 8.9984 4.03045 9.04693C4.01035 9.09546 4 9.14747 4 9.2V9.8C4 10.021 4.18 10.2 4.4 10.2H9.6C9.70609 10.2 9.80783 10.1579 9.88284 10.0828C9.95786 10.0078 10 9.90609 10 9.8V9.2C10 9.14747 9.98965 9.09546 9.96955 9.04693C9.94945 8.9984 9.91999 8.9543 9.88284 8.91716C9.8457 8.88001 9.8016 8.85055 9.75307 8.83045C9.70454 8.81035 9.65253 8.8 9.6 8.8H4.4Z"
                fill="black"/>
              <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M6 2H4.8C3.12 2 2.28 2 1.638 2.327C1.07354 2.61462 0.614616 3.07354 0.327 3.638C0 4.28 0 5.12 0 6.8V9.2C0 10.88 0 11.72 0.327 12.362C0.614616 12.9265 1.07354 13.3854 1.638 13.673C2.28 14 3.12 14 4.8 14H11.2C12.88 14 13.72 14 14.362 13.673C14.9265 13.3854 15.3854 12.9265 15.673 12.362C16 11.72 16 10.88 16 9.2V6.8C16 5.12 16 4.28 15.673 3.638C15.3854 3.07354 14.9265 2.61462 14.362 2.327C13.72 2 12.88 2 11.2 2H10L9.131 1.131C8.735 0.735 8.537 0.537 8.31 0.463C8.10917 0.397749 7.89283 0.397749 7.692 0.463C7.464 0.537 7.266 0.735 6.87 1.131L6 2ZM10.083 3.4C9.838 3.4 9.716 3.4 9.601 3.372C9.49862 3.34751 9.40075 3.30701 9.311 3.252C9.211 3.191 9.124 3.104 8.951 2.932L8.141 2.122L8 1.98L7.859 2.121L7.049 2.931C6.876 3.104 6.789 3.191 6.689 3.253C6.59925 3.30801 6.50138 3.34851 6.399 3.373C6.284 3.4 6.162 3.4 5.917 3.4H4.8C3.937 3.4 3.374 3.401 2.944 3.436C2.53 3.47 2.364 3.528 2.274 3.574C1.97253 3.72747 1.72747 3.97253 1.574 4.274C1.528 4.364 1.47 4.53 1.436 4.944C1.401 5.374 1.4 5.937 1.4 6.8V9.2C1.4 10.063 1.401 10.626 1.436 11.056C1.47 11.47 1.528 11.636 1.574 11.726C1.72747 12.0275 1.97253 12.2725 2.274 12.426C2.364 12.472 2.53 12.53 2.944 12.564C3.374 12.599 3.937 12.6 4.8 12.6H11.2C12.063 12.6 12.626 12.599 13.056 12.564C13.47 12.53 13.636 12.472 13.726 12.426C14.0275 12.2725 14.2725 12.0275 14.426 11.726C14.472 11.636 14.53 11.47 14.564 11.056C14.599 10.626 14.6 10.063 14.6 9.2V6.8C14.6 5.937 14.599 5.374 14.564 4.944C14.53 4.53 14.472 4.364 14.426 4.274C14.2725 3.97253 14.0275 3.72747 13.726 3.574C13.636 3.528 13.47 3.47 13.056 3.436C12.626 3.401 12.063 3.4 11.2 3.4H10.083V3.4Z"
                    fill="black"/>
            </svg>
          </SC.PointerClickIcon>
          <SC.AddStepIcon className={'AddLine_AddStepIcon'}>
            <SC.AddStepIconText>+</SC.AddStepIconText>
          </SC.AddStepIcon>
          <SC.HotspotIcon
            onMouseEnter={() => {
              setAddLineText('Add hotspot')
            }}
            className={'AddLine_HotspotIcon'}
            onClick={() => {
              setAddStepIsLoading(true)
              addTransition('hotspot', storyDemo._id, screenInternal._id, storyDemo.workspaceId, authData.token)
                .then((newTransition) => {

                  setAddStepIsLoading(false)
                })
            }}
          />

        </SC.AddLine>
        <SC.AddLine_TextLine>
          <SC.AddLine_Text>{addLineText}</SC.AddLine_Text>
        </SC.AddLine_TextLine>
      </React.Fragment>)}
    </NAV.Wrapper>
  }

  const screenMenuItems = [
    {
      key: 'steps',
      label: 'Steps',
      onClick: () => {
        if(!isOpen) {
          setIsScreenOpen(true)
        }
        setShowTransition(false)
      }
    },
    {
      key: 'transition',
      label: 'Transition',
      onClick: () => {
        if(!isOpen) {
          setIsScreenOpen(true)
        }
        setShowTransition(true)
      }
    },
    ...(screenInternal.recordingRole ? [] : [{
      key: 'duplicate',
      label: 'Duplicate',
      onClick: () => {
        setIsLoading(true)

        return duplicateScreen(storyDemo._id, screenInternal._id, storyDemo.workspaceId, authData.token)
          .then(() => {
            return reloadStoryDemo()
              .then(() => {
                setIsLoading(false)
              })
          })
      }
    }]),
    ...(screenInternal.recordingRole === 'delta' ? [{
      key: 'baseMerge',
      label: (
        <Tooltip
          title="Creates a new Base screen from this Delta merged with its Base (standalone DOM snapshot at this step)."
          placement="left"
        >
          <span>BaseMerge</span>
        </Tooltip>
      ),
      onClick: () => {
        setIsLoading(true)
        return baseMergeScreen(storyDemo._id, screenInternal._id, storyDemo.workspaceId, authData.token)
          .then(() => reloadStoryDemo())
          .then(() => {
            setIsLoading(false)
          })
          .catch(() => {
            setIsLoading(false)
          })
      }
    }] : []),
    ...((() => {
      // Base with linked deltas still blocked (server 409). Any delta may be deleted.
      if (screenInternal.recordingRole === 'base') {
        const hasDeltas = screens.some((s) => s.recordingRole === 'delta' && String(s.baseScreenId) === String(screenInternal._id))
        if (hasDeltas) {
          return []
        }
      }
      return [{
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
      }]
    })())
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
    if (screen.type === 'Screen_Video') {

      return `https://image.mux.com/${screen.asset.playback_ids[0].id}/thumbnail.png`
    } else {

      return screen.imageUrl
    }
  }

  let currentScreen = screens.find(scr => scr._id === screen._id)

  return (

    <SC.Wrapper id={viewName}>

      {isLoading ? <Spinner/> : (
        <Draggable
          key={currentScreen._id}
          draggableId={currentScreen._id}
          index={screenIndex}
          isDragDisabled={currentScreen.recordingRole === 'delta'}
        >
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
                      <SC.ScreenDemoImage src={getScreenImage(currentScreen)}/>
                      {getScreenIcon(currentScreen)}
                    </SC.ScreenDemoImageWrapper>

                    <SC.ScreenTitle
                      className={isNameEditable ? 'editing' : ''}
                      onClick={(e) => {
                        if (e.detail === 2) {
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

                        if (newScreen.name !== screenInternal.name) {
                          setScreenInternal(newScreen)

                          actions.updateScreen({name: newScreen.name}, storyDemo.workspaceId, storyDemo._id, newScreen._id, authData.token)
                        }
                      }}
                    >{screenInternal.name}</SC.ScreenTitle>
                    {screenInternal.recordingRole ? (
                      <SC.RecordingRoleBadge $role={screenInternal.recordingRole}>
                        {screenInternal.recordingRole === 'base' ? 'Base' : 'Delta'}
                      </SC.RecordingRoleBadge>
                    ) : null}
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
                {isOpen ?
                  showTransition ? renderAllTransitions(isNavUpdating, currentScreen.customTransitions) : (

                    <React.Fragment>
                      {currentScreen.steps && currentScreen.steps.map((step, stepIndex, array) => {


                        let calculatedStepIndex = stepIndex + 1
                        if (screenIndex !== 0) {
                          let totalStepsBefore = screens.slice(0, screenIndex).reduce((accum, scr) => {
                            return accum += (scr.steps && scr.steps.length ? scr.steps.length : 1)
                          }, 0)

                          calculatedStepIndex += totalStepsBefore
                        }

                        return (
                          <React.Fragment>
                            <SC.StepWrapper key={step._id}>
                              <SC.StepIndex>Step {calculatedStepIndex}</SC.StepIndex>
                              <Step
                                deleteStep={() => {
                                  setIsLoading(true)

                                  return deleteStep(step._id, storyDemo._id, screenInternal._id, storyDemo.workspaceId, authData.token)
                                    .then(() => {
                                      let newScreen = {...screenInternal}

                                      // let prevStepData = null
                                      newScreen.steps = []
                                      screenInternal.steps.forEach((stepItem, index) => {
                                        if (stepItem._id !== step._id) {
                                          newScreen.steps.push(stepItem)
                                        } else {

                                          // prevStepData = newScreen.steps[index - 1]
                                        }

                                      })
                                      setScreenInternal(newScreen)

                                      window.postMessage({
                                        type: 'delete_step',
                                        stepData: step,
                                        // prevStepData: prevStepData
                                      }, '*')

                                      setIsLoading(false)

                                    })
                                }}
                                storyDemoId={storyDemo._id}
                                storyDemo={storyDemo}
                                screenId={screenInternal._id}
                                workspaceId={storyDemo.workspaceId}
                                stepObj={step}
                                authData={authData}
                                getSelector={getSelector}
                                cancelSelector={cancelSelector}
                                changeStep={changeStep}
                                calculatedStepIndex={calculatedStepIndex}
                                iframeRef={iframeRef}
                              />
                            </SC.StepWrapper>

                          </React.Fragment>
                        )
                      })}
                      {addStepIsLoading ? <div style={{
                        height: '65px',
                        display: 'block',
                        position: 'relative',
                        width: '100%'
                      }}><Spinner/></div> : (
                        <AddLine

                          onPointerClick={() => {
                            setAddStepIsLoading(true)
                            let newStepIndex = screenInternal.steps.length

                            return actions.addStep(newStepIndex, StepViewTypes.POINTER, storyDemo._id, screenInternal._id, storyDemo.workspaceId, authData.token)
                              .then(() => {
                                setAddStepIsLoading(false)
                                setTimeout(() => changeStep(calculatedStepIndex + newStepIndex), 0)
                              })
                          }}

                          onHotspotClick={() => {
                            setAddStepIsLoading(true)
                            let newStepIndex = screenInternal.steps.length
                            return actions.addStep(newStepIndex, StepViewTypes.HOTSPOT, storyDemo._id, screenInternal._id, storyDemo.workspaceId, authData.token)
                              .then(() => {
                                setAddStepIsLoading(false)
                                setTimeout(() => changeStep(calculatedStepIndex + newStepIndex), 0)
                              })
                          }}

                          onPopupClick={() => {
                            setAddStepIsLoading(true)

                            let newStepIndex = screenInternal.steps.length
                            return actions.addStep(newStepIndex, StepViewTypes.POPUP, storyDemo._id, screenInternal._id, storyDemo.workspaceId, authData.token)
                              .then(() => {
                                setAddStepIsLoading(false)
                                setTimeout(() => changeStep(calculatedStepIndex + newStepIndex), 0)
                              })
                          }}

                        />)}

                    </React.Fragment>

                  )
                  : ''}


              </SC.ScreenWrapper>
            </div>
          )}
        </Draggable>
      )}


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
  ScreenIcon: styled.span`

    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.6;
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
  RecordingRoleBadge: styled.span.withConfig({
    shouldForwardProp: (prop) => prop !== '$role',
  })`
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    margin-left: 8px;
    padding: 0 6px;
    height: 18px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.01em;
    line-height: 1;
    border-radius: 3px;
    border: 1px solid ${({ $role }) => (
      $role === 'base' ? Colors.primaryColor : Colors.fourthColor
    )};
    color: ${({ $role }) => (
      $role === 'base' ? Colors.primaryColorDarker : Colors.sixthColor
    )};
    background: ${({ $role }) => (
      $role === 'base' ? 'rgba(16, 112, 255, 0.08)' : 'rgba(194, 194, 194, 0.22)'
    )};
    vertical-align: middle;
    user-select: none;
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
      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
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
        -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
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

    &:hover .Requests__ItemUrl {
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

    & button {
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
      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
      border-radius: 10px;
      background-color: #FFF;
    }

    &&::-webkit-scrollbar {
      width: 0px;
      background-color: #FFF;
    }

    &&::-webkit-scrollbar-thumb {
      border-radius: 10px;
      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
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
    display: flex;
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

  EClickIcon: styled(MdOutlineMouse)`
    height: 25px;
    width: 45px;

    fill: ${Colors.primaryColor};

    &:hover {
      cursor: pointer;
      fill: ${Colors.primaryColorDarker};
    }

    transition: 0.4s ease-in-out;

    transform: translate(40px, 0px) scale(0.9);
    opacity: 0;


  `,
  HotspotIcon: styled(MdAdsClick)`
    height: 25px;
    width: 45px;

    fill: ${Colors.primaryColor};

    &:hover {
      cursor: pointer;
      fill: ${Colors.primaryColorDarker};
    }

    transition: 0.4s ease-in-out;

    transform: translate(-40px, 0px) scale(0.9);
    opacity: 0;


  `,
  PointerClickIcon: styled.div`
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
  AddStepIcon: styled.div`

    background: #1070ff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    transition: 0.2s ease-in-out;



  `,
  AddStepIconText: styled.p`
    margin: 0px;
    font-size: 30px;
    line-height: 40px;
    color: white;
  `,
  Line: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `,
  AddLine_TextLine: styled.div`
    margin-top: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `,
  AddLine_Text: styled.p`
    line-height: 20px;
    min-height: 20px;
    text-align: center;
    margin: 0px;
    color: ${Colors.primaryColor};
  `,
  AddLine: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    margin-top: 10px;

    &&:hover .AddLine_HotspotIcon,
    &&:hover .AddLine_PointerIcon {
      opacity: 1;
      transform: translate(0px, 0px);
    }

    &&:hover .AddLine_AddStepIcon {
      opacity: 0;
    }

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
    width: 6px;
    height: 15px;
    border-radius: 12px;
    background: ${Colors.primaryColor};
    margin: 5px 0px;
  `,

}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      addStep,
      addTransition,
      updateScreen
    }, dispatch)
  }
}

export default connect(null, mapDispatchToProps)(ScreenPage)
