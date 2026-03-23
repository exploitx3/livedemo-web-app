import React, { Fragment, useState } from 'react'
//import { Tabs } from 'antd'

import Tabs from 'antd/es/tabs'
import 'antd/es/tabs/style'
import styled from 'styled-components'
import { PulseLoader } from 'react-spinners'
import Colors from '../../../../constants/mainColors'
import CustomTab from '../CustomTab/CustomTab'
import ScreensTab from '../ScreensTab/ScreensTab'

// const { TabPane } = Tabs // Removed - deprecated in Ant Design v6, use items prop instead

const TAB_KEYS = {
  screens: 'screens',
  custom: 'custom',
  tours: 'tours',
}

const TabsView = ({ storyDemo, storyDemoRef, setStoryDemo, authData, tabsWidth, iframeRef, currentStepIndex, previousStepIndex, previousStep, changeStep, reloadStoryDemo }) => {
  // console.log('TabsView rendered')
  let [isLoading, setIsLoading] = useState(false)
  let [activeTab, setActiveTab] = useState(TAB_KEYS.screens)

  const tabItems = [
    {
      key: TAB_KEYS.screens,
      label: 'Screens',
      children: (
        <ScreensTab setStoryDemo={setStoryDemo}
          storyDemoRef={storyDemoRef}
          storyDemo={storyDemo}
          authData={authData}
          tabsWidth={tabsWidth}
          currentStepIndex={currentStepIndex}
          previousStepIndex={previousStepIndex}
          previousStep={previousStep}
          changeStep={changeStep}
          reloadStoryDemo={reloadStoryDemo}
          iframeRef={iframeRef}
        />
      )
    },
    {
      key: TAB_KEYS.custom,
      label: 'Custom',
      children: (
        <CustomTab storyDemo={storyDemo}
          authData={authData}
          tabsWidth={tabsWidth}
          reloadStoryDemo={reloadStoryDemo}
        />
      )
    }
  ]

  return (
    <Fragment>
      {isLoading ? (
        <PulseLoader css={{ 'margin': '0 auto', 'width': '100%', 'height': '100%' }} color={Colors.App.spinnerColor}
          size={15} speedMultiplier={0.5} />) : (
        <S.Tabs
          defaultActiveKey={activeTab}
          activeKey={activeTab}
          onChange={(newActiveTab) => {
            setActiveTab(newActiveTab)
          }}
          items={tabItems}
          animated={false}
          tabPosition={'top'}
        />
      )
      }

    </Fragment>
  )
}


const S = {
  Tabs: styled(Tabs)`
    && .ant-tabs-tab{
     font-family: ${Colors.fontFamily};
    }

    && .ant-tabs-nav-list {
        width: 100%;
    }

    && .ant-tabs-tab {
        justify-content: center;
    }

   && .ant-tabs-bar {

      margin: 0 0px 0 0;
   }
    && .ant-tabs {
        overflow: initial;
    }
   @media (min-width:900px) {
    && .ant-tabs-nav {
        width: 100%;
    }


    && .ant-tabs-nav > div {
        width: 100%;
        display: flex;
        justify-content: space-evenly;
    }

    && .ant-tabs-nav > div .ant-tabs-tab {
        font-size: 1.1em;

        padding: 12px 0;
        text-align: center;
        width: 50%;
        margin: 0;

    }

   }

`
}

export default TabsView
