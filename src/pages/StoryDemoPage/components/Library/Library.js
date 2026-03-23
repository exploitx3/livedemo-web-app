import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import 'tippy.js/dist/tippy.css' // optional
import 'tippy.js/animations/shift-away.css'
//import { Modal, Tabs } from 'antd'

import Modal from 'antd/es/modal'
import Tabs from 'antd/es/tabs'

import 'antd/es/modal/style'
import 'antd/es/tabs/style'

import { CSSTransition, TransitionGroup, } from 'react-transition-group'
import PagesTab from './components/PagesTab/PagesTab'
import ImagesTab from './components/ImagesTab/ImagesTab'
import VideosTab from './components/VideosTab/VideosTab'
import axios from '../../../../utils/axiosInstance'
import * as ENV from '../../../../config'
import Colors from '../../../../constants/mainColors'
import Spinner from '../../../../components/Spinner/Spinner'

// const { TabPane } = Tabs // Removed - deprecated in Ant Design v6, use items prop instead

const TAB_KEYS = {
  images: 'images',
  videos: 'videos',
  pages: 'pages',
}

const Library = ({ libraryObj, workspaceId, storyDemoId, authData, isOpen, onCancel, addScreen, isLoading, setIsLoading }) => {
  let [activeTab, setActiveTab] = useState(TAB_KEYS.images)
  let [libraryWithImages, setLibraryWithImages] = useState({ screenshots: [], videos: [], pages: [] })
  // let [isLoading, setIsLoading] = useState(true)

  useEffect(() => {



    if (isOpen && !isLoading) {
      setIsLoading(true)
      getLibrary(workspaceId, authData.token)
        .then((libraryDoc) => {

          setLibraryWithImages(libraryDoc)
          setIsLoading(false)
        })
    }


  }, [isOpen, libraryObj])

  function getLibrary(workspaceId, authToken) {

    return axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/library`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      .then((res) => {
        return res.data
      })
  }

  return (

    <React.Fragment>

      <MD.Modal
        title={null}
        footer={null}
        open={isOpen}
        onOk={() => {
        }}
        onCancel={() => {
          onCancel()
        }}
      >

        <TransitionGroup style={{ height: '100%' }} className="transition-group">
          <CSSTransition
            key={isOpen ? 'library-open' : 'library-closed'}
            timeout={{ enter: 300, exit: 300 }}
            classNames="fade"
          >
            <div style={{ width: '100%', height: '100%' }}>
              <MD.Tabs
                defaultActiveKey={activeTab}
                activeKey={activeTab}
                onChange={(newActiveTab) => {
                  setActiveTab(newActiveTab)
                  }
                }
                animated={false}
                tabPosition={'top'}
                items={[
                  {
                    key: TAB_KEYS.images,
                    label: 'Images',
                    children: isLoading ? (
                      <MD.SpinnerWrapper>
                        <Spinner/>
                      </MD.SpinnerWrapper>
                    ) : (
                      <ImagesTab
                        images={libraryWithImages.screenshots}
                        addScreen={addScreen}
                      />
                    )
                  },
                  {
                    key: TAB_KEYS.videos,
                    label: 'Videos',
                    children: isLoading ? (
                      <MD.SpinnerWrapper>
                        <Spinner/>
                      </MD.SpinnerWrapper>
                    ) : (
                      <VideosTab
                        videos={libraryWithImages.videos}
                        addScreen={addScreen}
                      />
                    )
                  },
                  {
                    key: TAB_KEYS.pages,
                    label: 'Pages',
                    children: isLoading ? (
                      <MD.SpinnerWrapper>
                        <Spinner/>
                      </MD.SpinnerWrapper>
                    ) : (
                      <PagesTab
                        pages={libraryWithImages.pages}
                        addScreen={addScreen}
                      />
                    )
                  }
                ]}
              />

            </div>
          </CSSTransition>
        </TransitionGroup>
      </MD.Modal>
    </React.Fragment>
  )
}

const MD = {
  Wrapper: styled.div`
    //display: flex;
    //flex-direction: column;
    //gap: 10px;
    //background: #1070ff;
    //justify-content: flex-start;
    //align-items: center;
    //padding: 10px 0px;
    //border-radius: 6px;

  `,
  Modal: styled(Modal)`
    && {
      width: 920px !important;
    }

    && .ant-modal-content {
      height: 650px;
      overflow-y: scroll;
    }
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
  `,
  SpinnerWrapper: styled.div`
    width: 80px;
    height: 80px;
    margin: 150px auto;
  `

}

export default Library
