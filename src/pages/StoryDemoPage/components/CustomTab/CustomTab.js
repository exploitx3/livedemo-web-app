import React, { useState } from 'react'
import Colors from '../../../../constants/mainColors'
import styled from 'styled-components'
//import { Icon } from 'antd'

import Icon from '../../../../components/Icon/Icon'

import Spinner from '../../../../components/Spinner/Spinner'
import CustomHeader from './CustomHeader/CustomHeader'
import Theme from './Theme/Theme'
import Background from './Background/Background'
import Misc from './Misc/Misc'
import Variables from './Variables/Variables'

/*
  tabsWidth is used to manually set the width of the element
  and the top property is set manually also of MainView
 */
const CustomTab = ({ storyDemo, authData, tabsWidth, changeIframeStep, reloadStoryDemo }) => {
  const marginTop = 116
  const viewName = 'insights'

  // let internalScriptStates = {}
  // for (let i = 0; i < storyDemo.scripts.length; i++) {
  //   internalScriptStates['script_' + storyDemo.scripts[i]._id] = useState(storyDemo.scripts[i].text)
  // }

  let [isUpdating, setIsUpdating] = useState(false)

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


  return (

    <S.Wrapper id={viewName}>

      <S.MainView style={{ top: marginTop, width: tabsWidth }}>
        {isUpdating ? (<Spinner/>) : ''}

        <CustomHeader
          storyDemo={storyDemo}
          workspaceId={storyDemo.workspaceId}
          authData={authData}
          reloadStoryDemo={reloadStoryDemo}
        />
        <Theme
          storyDemo={storyDemo}
          workspaceId={storyDemo.workspaceId}
          authData={authData}
          reloadStoryDemo={reloadStoryDemo}
        />
        <Background
          storyDemo={storyDemo}
          workspaceId={storyDemo.workspaceId}
          authData={authData}
          reloadStoryDemo={reloadStoryDemo}
        />
        <Misc
          storyDemo={storyDemo}
          workspaceId={storyDemo.workspaceId}
          authData={authData}
          reloadStoryDemo={reloadStoryDemo}
        />
        <Variables
          storyDemo={storyDemo}
          workspaceId={storyDemo.workspaceId}
          authData={authData}
          reloadStoryDemo={reloadStoryDemo}
        />
      </S.MainView>

    </S.Wrapper>
  )
}

const S = {
  Wrapper: styled.div`
    position: relative;
    width: 100%;
    height: 100%;

  `,

  MainView: styled.div`
    //margin-left: 50px;
    //overflow: auto;


    bottom: 0;
    position: fixed;
    overflow-y: scroll;
    overflow-x: hidden;
    padding: 0 35px 35px;


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
  ScriptWrapper: styled.div`

  `,

  TitleWrapper: styled.div`
    width: 100%;
    margin: 10px auto 45px auto;
    text-align: center;
  `,
  Title: styled.h2`
    font-size: 2em;
    text-align: center;
  `,
  TextDescription: styled.h3`
    margin: 0;
    font-size: 1.2em;
    text-align: center;
  `,

  SaveButton: styled.div`

    position: absolute;
    top: 20px;
    background: #1070ff;
    color: white;
    left: 5px;
    opacity: 0.2;
    text-align: center;
    display: flex;
    height: 35px;
    width: 75px;
    border-radius: 6px;
    justify-content: center;
    align-items: center;

    &:hover {
      opacity: 1;
      cursor: pointer;
    };
  `,
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

`
}

export default CustomTab

