import React, { Fragment, useEffect, useState } from 'react'
//import { Tabs } from 'antd'

import Tabs from 'antd/es/tabs'
import styled from 'styled-components'
import { PulseLoader } from 'react-spinners'
import Colors from '../../../../constants/mainColors'
import InsightsTab from '../InsightsTab/InsightsTab'
import InteractionsTab from '../InteractionsTab/InteractionsTab'
import OverviewTab from '../RawView/RawView'

const { TabPane } = Tabs

const TAB_KEYS = {
  overview: 'overview',
  insights: 'insights',
  interactions: 'interactions'
}

const TabsView = ({focusElementById, unfocusElementById, selectNode, resetViewport, tabsWidth}) => {

  let [isLoading, setIsLoading] = useState(false)
  let [activeTab, setActiveTab] = useState(TAB_KEYS.overview)


  return (
    <Fragment>
      {isLoading ? (
        <PulseLoader css={{ 'margin': '0 auto', 'width': '100%', 'height': '100%' }} color={Colors.App.spinnerColor}
                    size={15} speedMultiplier={0.5} />) : (
        <S.Tabs defaultActiveKey={activeTab} activeKey={activeTab} onChange={(newActiveTab) => {
          setActiveTab(newActiveTab)
        }
        }
                animated={false}
                tabPosition={'top'}
        >
          <S.TabPane tab={'Overview'} key={TAB_KEYS.overview}>
            <OverviewTab resetViewport={resetViewport} tabsWidth={tabsWidth}  />
          </S.TabPane>
          <S.TabPane tab={'CustomTab'} key={TAB_KEYS.insights}>
            <InsightsTab  resetViewport={resetViewport} tabsWidth={tabsWidth}/>
          </S.TabPane>
          <S.TabPane tab={'Interactions'} key={TAB_KEYS.interactions}>
            <InteractionsTab resetViewport={resetViewport} tabsWidth={tabsWidth} />

          </S.TabPane>
        </S.Tabs>
      )
      }

    </Fragment>
  )
}


const S = {
  TabPane: styled(TabPane)`
    height: 100%;
    position: relative;
`,
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
        width: 33.33%;
        margin: 0;
        
    }
    
   }
   
`
}

export default TabsView
