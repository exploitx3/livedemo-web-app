import React, { useEffect, useState } from 'react'
import Colors from '../../../../constants/mainColors'
//import { Button, Icon, Input, Modal } from 'antd'

import Button from 'antd/es/button'
import Icon from '../../../../components/Icon/Icon'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import styled from 'styled-components'
import axios from '../../../../utils/axiosInstance'
import Simmer from 'simmerjs'
import * as ENV from '../../../../config'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import ScreenPage from './components/ScreenPage/ScreenPage'
import ScreenVideo from './components/ScreenVideo/ScreenVideo'
import ScreenScreenshot from './components/ScreenScreenshot/ScreenScreenshot'
import Spinner from '../../../../components/Spinner/Spinner'

import { updateCurrentSelectedWorkspace } from '../../../../actions/workspacesActions'
import { getWorkspaceEncryptionKey } from '../../../../actions/secureStorageActions'
import { refreshToken } from '../../../../actions/authActions'
import { getStoryDemo, updateStoryDemo } from '../../../../actions/storyDemoActions'
import { connect } from 'react-redux'

const { confirm } = Modal;

/*
  tabsWidth is used to manually set the width of the element
  and the top property is set manually also of MainView
 */
const TAB_KEYS = {
  json: 'JSON',
  raw: 'Raw',
  headers: 'Headers',
}

const ScreensTab = ({ currentStoryDemo, storyDemoRef, iframeRef, setStoryDemo, tabsWidth, authData, currentStepIndex, previousStepIndex, previousStep, changeStep, reloadStoryDemo }) => {
  let screens = JSON.parse(JSON.stringify(currentStoryDemo.screens))
  let [isLoading, setIsLoading] = useState(false)

  function setScreens(newScreens) {
    // console.log('setScreens')
    // console.log(newScreens)


    let newStoryDemo = JSON.parse(JSON.stringify(currentStoryDemo))
    newStoryDemo.screens = JSON.parse(JSON.stringify(newScreens))

    setStoryDemo(newStoryDemo)
  }
  // let [screens, setScreens] = useState(storyDemo && storyDemo.screens ? storyDemo.screens : [])
  // let [openScreenId, setOpenScreenId] = useState('')


  // let [isTextEditing, setIsTextEditing] = useState(false)

  const marginTop = 116
  const viewName = 'overview'

  // useEffect(() => {
  //   setScreens(storyDemo.screens)
  // }, [storyDemo, storyDemo.screens])


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
    // let screensToUpdate = isSourceSmaller ? screens.slice(sourceIndex + 1, destinationIndex + 1) : screens.slice(destinationIndex, sourceIndex)

    // let changeNumber = isSourceSmaller ? -1 : +1
    // console.log(result)

    let screenId = result.draggableId
    let oldIndex = result.source.index
    let newIndex = result.destination.index



    let newScreensArray = reorderArray(screens, oldIndex, newIndex)

    // Base screens are draggable; keep their deltas immediately after (chain stays valid).
    const dragged = screens[oldIndex]
    if (dragged && dragged.recordingRole === 'base') {
      const baseId = String(dragged._id)
      const deltas = newScreensArray
        .filter((s) => s.recordingRole === 'delta' && String(s.baseScreenId) === baseId)
        .sort((a, b) => {
          if (a.fromTimeMs != null && b.fromTimeMs != null) {
            return a.fromTimeMs - b.fromTimeMs
          }
          return (a.index || 0) - (b.index || 0)
        })
      if (deltas.length) {
        const withoutDeltas = newScreensArray.filter(
          (s) => !(s.recordingRole === 'delta' && String(s.baseScreenId) === baseId)
        )
        const basePos = withoutDeltas.findIndex((s) => String(s._id) === baseId)
        if (basePos >= 0) {
          withoutDeltas.splice(basePos + 1, 0, ...deltas)
          newScreensArray = withoutDeltas
        }
      }
    }

    // Client-side guard: do not allow breaking rrweb chain order.
    // Non-rrweb screens (screenshot/video) may sit between chain members.
    const proposed = newScreensArray.map((screen, index) => ({
      _id: screen._id,
      index,
      recordingRole: screen.recordingRole,
      baseScreenId: screen.baseScreenId,
      fromTimeMs: screen.fromTimeMs,
    }))
    for (const screen of proposed) {
      if (screen.recordingRole !== 'delta' || !screen.baseScreenId) continue
      const base = proposed.find((s) => String(s._id) === String(screen.baseScreenId))
      if (!base || screen.index <= base.index) {
        console.warn('Blocked reorder that would break rrweb chain')
        return
      }
    }
    const chains = new Map()
    for (const screen of proposed) {
      if (!screen.recordingRole) continue
      const chainId = screen.recordingRole === 'base'
        ? String(screen._id)
        : String(screen.baseScreenId)
      if (!chains.has(chainId)) chains.set(chainId, [])
      chains.get(chainId).push(screen)
    }
    for (const [, members] of chains) {
      members.sort((a, b) => a.index - b.index)
      if (members[0].recordingRole !== 'base') {
        console.warn('Blocked reorder that would break rrweb chain')
        return
      }
      for (let i = 1; i < members.length; i++) {
        if (members[i].recordingRole !== 'delta') {
          console.warn('Blocked reorder that would break rrweb chain')
          return
        }
        if (
          members[i - 1].fromTimeMs != null &&
          members[i].fromTimeMs != null &&
          members[i].fromTimeMs < members[i - 1].fromTimeMs
        ) {
          console.warn('Blocked reorder that would break rrweb chain')
          return
        }
      }
    }

    // setScreens(newScreensArray)


    setIsLoading(true)

    return Promise.all([
        axios.post(`${ENV.STORIES_API}/workspaces/${currentStoryDemo.workspaceId}/stories/${currentStoryDemo._id}/updateScreenOrder`,
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
          .then(() => {
            setIsLoading(false)
          })
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
    });
  }

  function formatScreenName(screenName) {
    return screenName.replace(/http(s)*\:\/\//g, '')
  }

  function getScreenComponent(screen, screens, screenIndex, calculatedStepIndex) {
    if(screen.type === 'Screen_Video') {

      return <ScreenVideo
        key={screen._id}
        storyDemo={currentStoryDemo}
        screen={screen}
        screenIndex={screenIndex}
        calculatedStepIndex={calculatedStepIndex}
        iframeRef={iframeRef}
        setStoryDemo={setStoryDemo}
        screens={screens}

        previousStep={previousStep}
        previousStepIndex={previousStepIndex}
        setScreens={setScreens}
        tabsWidth={tabsWidth}
        changeStep={changeStep}
        reloadStoryDemo={reloadStoryDemo}
        authData={authData}
      />
    } else if(screen.type === 'Screen_Screenshot') {

      return <ScreenScreenshot
        key={screen._id}
        storyDemo={currentStoryDemo}
        screen={screen}
        screenIndex={screenIndex}
        calculatedStepIndex={calculatedStepIndex}
        iframeRef={iframeRef}
        setStoryDemo={setStoryDemo}
        screens={screens}

        previousStep={previousStep}
        previousStepIndex={previousStepIndex}
        setScreens={setScreens}
        tabsWidth={tabsWidth}
        changeStep={changeStep}
        reloadStoryDemo={reloadStoryDemo}
        authData={authData}
      />
    } else  {

      return <ScreenPage
        key={screen._id}
        storyDemo={currentStoryDemo}
        screen={screen}
        screenIndex={screenIndex}
        calculatedStepIndex={calculatedStepIndex}
        iframeRef={iframeRef}
        setStoryDemo={setStoryDemo}
        screens={screens}

        previousStep={previousStep}
        previousStepIndex={previousStepIndex}
        setScreens={setScreens}
        tabsWidth={tabsWidth}
        changeStep={changeStep}
        reloadStoryDemo={reloadStoryDemo}
        authData={authData}
      />
    }
  }

  return (

    <ST.Wrapper id={viewName}>
      <ST.StickySidebar style={{ top: '45%' }}>

      </ST.StickySidebar>
      <ST.MainView style={{ top: marginTop, width: tabsWidth }}>
        <ST.BodyWrapper style={{height: window.innerHeight - 120}} id={'ScreensTab__Body'}>

          <ST.IntroWrapper>
            <ST.TourName>Screens</ST.TourName>
            {/*<ST.EditTextButton onClick={() => onEditText(storyDemo.workspaceId, storyDemo._id, authData.token)}>*/}
            {/*  {isTextEditing ? 'Cancel' : 'Edit Text'}</ST.EditTextButton>*/}
          </ST.IntroWrapper>
          {isLoading ? (<Spinner/>) : (
            <ST.Section>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={'droppable'}>
                  {(provided, snapshot) => (
                    <ST.DroppableWrapper
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {screens && screens.map((screen, screenIndex) => {


                        let stepString = "Step "
                        let calculatedStepIndex = 1
                        if (screenIndex !== 0) {
                          let totalStepsBefore = screens.slice(0, screenIndex).reduce((accum, scr) => {
                            return accum + ((scr.steps && scr.steps.length) || 1)
                          }, 0)

                          calculatedStepIndex += totalStepsBefore
                        }

                        if(screen.steps && screen.steps.length > 1) {
                          stepString = stepString + `${calculatedStepIndex}..${calculatedStepIndex + screen.steps.length - 1}`
                        } else {
                          stepString = stepString + calculatedStepIndex
                        }

                        let isSelected = currentStepIndex >= calculatedStepIndex && currentStepIndex <= calculatedStepIndex + Math.max((screen.steps?.length ? screen.steps.length : 0) - 1, 0)

                        // console.log('screenObject')
                        // console.log(screen)
                        // console.log('screen calculatedSTepIndex')
                        // console.log(calculatedStepIndex)

                        return <ST.ScreenWrapper>
                          <ST.StepIndex isSelected={isSelected}>{stepString}</ST.StepIndex>
                          {getScreenComponent(screen, screens, screenIndex, calculatedStepIndex)}
                        </ST.ScreenWrapper>
                      })
                      }
                    </ST.DroppableWrapper>
                  )}


                </Droppable>
              </DragDropContext>

            </ST.Section>

          )}


        </ST.BodyWrapper>

      </ST.MainView>

    </ST.Wrapper>
  )
}

const ST = {

  DroppableWrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
  `,
  HeaderMain: styled.main`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-grow: 1;
    height: 100%
    gap: 15px;
    margin-left: 15px;

    &&:hover {

      cursor: pointer;
    }

  `,
  ScreenDemoImage: styled.img`
    width: 25%;
    min-height: 55%;
    border-radius: 6px;
    border: 1px solid ${Colors.primaryColor};

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
  ScreenTitle: styled.span`
    max-width: 160px;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
    overflow: hidden;

    font-size: 1.2em;
    color: ${Colors.primaryText};
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

    padding: 0px 0px 14px 14px;
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

  ScreenWrapper: styled.div`
    position: relative;
    width: 100%;
    //padding: 25px;
    height: auto;
    //background: #F9F9F9;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &&:hover .CloseButtonScreen {
      display: block;
    }
  `,
  StepIndex: styled.p`
    margin: 0px 0px 0px 12px;
    min-width: 65px;
    flex-grow: 1;
    ${({isSelected}) => {
      if(isSelected) {
        return `
          color: ${Colors.primaryColor};
          font-weight: 550;
        `
      } else {

        return ''
      }
  }}

  `,
  StepSeperator: styled.span`
    width:6px;
    height:15px;
    border-radius: 12px;
    background: ${Colors.primaryColor};
    margin: 5px 0px;
  `,

}

function mapStateToProps(state) {
  return {
    currentStoryDemo: state.storyDemoReducer.currentStoryDemo,
    renderSteps: state.storyDemoReducer.renderSteps
  }
}

// function mapDispatchToProps(dispatch) {
//   return {
//     actions: bindActionCreators({
//       updateCurrentSelectedWorkspace,
//       getWorkspaceEncryptionKey,
//       refreshToken,
//       getStoryDemo,
//       updateStoryDemo
//     }, dispatch)
//   }
// }

export default connect(mapStateToProps, null)(ScreensTab)
