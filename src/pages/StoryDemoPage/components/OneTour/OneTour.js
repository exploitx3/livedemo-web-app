//import { Icon } from 'antd'

import Icon from '../../../../components/Icon/Icon'
import React, { Fragment, useState } from 'react'
import styled from 'styled-components'
import Colors from '../../../../constants/mainColors'
import Step from '../Step/Step'
import { updateCurrentSelectedWorkspace } from '../../../../actions/workspacesActions'
import { getWorkspaceEncryptionKey } from '../../../../actions/secureStorageActions'
import { refreshToken } from '../../../../actions/authActions'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Simmer from 'simmerjs'
import axios from '../../../../utils/axiosInstance'

const OneTour = ({ liveDemoId, workspaceId, tour, onGoBack, iframeRef, authData }) => {

  let [internalTour, setInternalTour] = useState(tour)

  function getSelector() {
    return new Promise((resolve, reject) => {
      function onClick(element) {


        const simmer = new Simmer(iframeRef.current.contentWindow)

        let selector = simmer(element)
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

      iframeRef.current.contentWindow.elementPicker.init({ onClick, backgroundColor: '#00ff00' })

      setTimeout(() => {
        reject('Timed-out after 1 minutes - waiting to select an element')
      }, 60 * 1000)
    })


  }

  function addStep(index, liveDemoId, workspaceId, tourId, authToken) {
    return axios.post(`/workspaces/${workspaceId}/livedemos/${liveDemoId}/tours/${tourId}/steps`, {
      index: index
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((res) => {
      return res.data
    })
  }

  return (
    <Fragment>
      <O.Header>
        <O.ButtonWrapper onClick={() => {
          onGoBack()
        }}>
          <O.ArrowIcon size={'small'} type={'arrow-left'}/>
          <O.ButtonText>Back</O.ButtonText>
        </O.ButtonWrapper>
      </O.Header>
      <O.BodyWrapper>

        <O.IntroWrapper>
          <O.TourName>{internalTour.name}</O.TourName>
        </O.IntroWrapper>
        <O.Section>
          {internalTour.steps.map((step,index, array) => {

            let shouldAddSeperator = index !== array.length -1
            return (
              <O.StepWrapper key={step._id}>
                <Step liveDemoId={liveDemoId} workspaceId={workspaceId} tour={internalTour}
                      stepObj={step}
                      authData={authData}
                      getSelector={getSelector}
                />
                {shouldAddSeperator ? <O.StepSeperator/> : ''}
              </O.StepWrapper>
            )
          })}
        </O.Section>
        <O.Line>
          <O.AddStepIcon onClick={() => {
            return addStep(tour.steps.length, liveDemoId, workspaceId, internalTour._id, authData.token)
              .then((newStep) => {
                let newTour = { ...internalTour }
                newTour.steps.push(newStep)
                setInternalTour(newTour)
              })
          }} type="plus-square" theme={'filled'}/>
        </O.Line>

      </O.BodyWrapper>
    </Fragment>
  )
}

const O = {
  Header: styled.header`
    height: 40px;
    border-bottom: 1px solid #EEE;
    width: 100%;
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
    padding: 0 35px;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
  `,
  IntroWrapper: styled.div`
    display: flex;
    justify-content: center;
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
  StepSeperator: styled.span`
    width:6px;
    height:15px;
    border-radius: 12px;
    background: ${Colors.primaryColor};
  `,
}


function mapStateToProps(state) {
  return {
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace,
    authData: state.authReducer.authData,
    secureStorage: state.secureStorageReducer
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ updateCurrentSelectedWorkspace, getWorkspaceEncryptionKey, refreshToken }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OneTour)
