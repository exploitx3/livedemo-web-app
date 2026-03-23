import React, { useState } from 'react'
import Colors from '../../../../constants/mainColors'
import styled from 'styled-components'
import axios from '../../../../utils/axiosInstance'
//import { Button, Icon, Input } from 'antd'

import Button from 'antd/es/button'
import Icon from '../../../../components/Icon/Icon'
import Input from 'antd/es/input'
import Spinner from '../../../../components/Spinner/Spinner'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/addon/search/search.js'
import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/jump-to-line.js'
import 'codemirror/addon/search/match-highlighter.js'
import 'codemirror/addon/search/matchesonscrollbar.css'
import 'codemirror/addon/search/matchesonscrollbar.js'
import 'codemirror/addon/search/searchcursor.js'

require('codemirror/mode/xml/xml')
require('codemirror/mode/javascript/javascript')
require('codemirror/theme/lesser-dark.css')
/*
  tabsWidth is used to manually set the width of the element
  and the top property is set manually also of MainView
 */
const TourTab = ({ liveDemo, setLiveDemo, authData, tabsWidth, refreshIframe, setSelectedTour }) => {
  const marginTop = 116

  const viewName = 'tourTab'
  const [isUpdating, setIsUpdating] = useState(false)
  const [tours, setTours] = useState(liveDemo.tours || [])
  const [newTourName, setNewTourName] = useState('')


  function createNewTour(tourName, workspaceId, liveDemoId, authToken) {
    setIsUpdating(true)

    return axios.post(`/workspaces/${workspaceId}/livedemos/${liveDemoId}/tours`, {
      name: tourName
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((newTourRes) => {

      return axios.get(`/workspaces/${workspaceId}/livedemos/${liveDemoId}?populateRequests=true`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        })
        .then((updatedLiveDemoRes) => {

          setIsUpdating(false)
          setSelectedTour(newTourRes.data)
          setLiveDemo(updatedLiveDemoRes.data)
        })
    })
  }

  return (

    <T.Wrapper>

      <T.MainView style={{ top: marginTop, width: tabsWidth }} id={viewName}>
        {isUpdating ? (<Spinner/>) :
          (<React.Fragment>
              {tours.length === 0 ?
                (<React.Fragment>
                    You have not created any tours yet
                  </React.Fragment>
                ) :
                (tours.map(tourObj => {
                    return <T.ToursList>
                      <T.TourItem onClick={() => {
                        setSelectedTour(tourObj)
                      }}>{tourObj.name}</T.TourItem>
                    </T.ToursList>
                  })
                )
              }

              <T.NewTourSection>
                <T.StyledInput
                  name={'name-input'}
                  size="large"
                  autoFocus
                  placeholder="NewTour"
                  value={newTourName}
                  onChange={(event) => {

                    setNewTourName(event.target.value)
                  }}
                  onPressEnter={(e) => {
                    return createNewTour(newTourName, liveDemo.workspaceId, liveDemo._id, authData.token)
                  }}
                />
                <T.Modal__Button type={'Primary'}
                                 onClick={() => {
                                   return createNewTour(newTourName, liveDemo.workspaceId, liveDemo._id, authData.token)
                                 }}>
                  Create Tour
                  <T.Modal__ButtonIcon size={'small'} type={'arrow-right'}/>
                </T.Modal__Button>
              </T.NewTourSection>
            </React.Fragment>
          )

        }

      </T.MainView>

    </T.Wrapper>
  )
}

const T = {
  Wrapper: styled.div`
    position: relative;
    width: 100%;
    height: 100%; 

  `,

  MainView: styled.div`
    //margin-left: 50px;
    //overflow: auto;
    
    
    position: fixed;
    overflow-y: scroll;
    overflow-x: hidden;
    padding: 35px;
    
    
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
  StyledInput: styled(Input)`
    height: 50px;
    font-size: 1.15em;
    box-sizing: border-box;
    border-radius: 4px;
    padding: 14px 16px;
    width: 191px;
    margin: 60px 0px 30px 0px;

    border: 1px solid #8d9599;
    
    &&:hover {
      border: 1px solid ${Colors.primaryColor};
    }
    
    &&:focus-visible {
      outline: none;
      border: 2px solid ${Colors.primaryColor};
    }

  `,
  NewTourSection: styled.div`
    margin: 20px 0px 10px;
  `,
  Modal__Button: styled(Button)`
    && {
      height: 50px;
      width: 100%;
      margin-top: 10px;
      background-color: ${Colors.primaryColor};  
      color: #FFF;
      font-size: 1.3em;
    }
    
    &&:hover {
      background-color: ${Colors.primaryColorDarker};
    }
  `,
  Modal__ButtonIcon: styled(Icon)`
    && {
      width: 30px;
      height: 20px;
      vertical-align: middle;
    
    }
    
    && svg {
      fill: #ffffff;
      width: 100%;
      height: 100%;
    }
  `,
  ToursList: styled.ul`
    list-style: none;
    
  `,
  TourItem: styled.li`
     
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



}

export default TourTab
