import React from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'
import {Circle} from 'rc-progress';
import {Modal} from 'antd'
import {PauseOutlined} from "@ant-design/icons";
import {showErrorsForResponse} from "../../../utils/helperFunctions.js";
import {bindActionCreators} from "redux";
import * as storyDemoActionsImport from "../../../actions/storyDemoActions.js";
import {connect} from "react-redux";

const {confirm} = Modal

const AddAudio = (props) => {
  let {
    workspaceId,
    storyDemoId,
    screenId,
    step,
    authData,
    storyDemoActions,
    reloadStoryDemo
  } = props


  function showConfirmAddAudio() {

    if (!step || !step._id) {
      console.error('AddAudio: step or step._id is undefined', step)
      return
    }

    return confirm({
      title: `Add voiceover audio?`,
      content: '',
      okText: 'Confirm',
      okButtonProps: {type: 'primary'},
      cancelText: 'Cancel',
      onOk() {
        return storyDemoActions.addStepAudio(workspaceId, storyDemoId, screenId, step._id, authData.token)
          .then(() => {
            if (reloadStoryDemo) {
              reloadStoryDemo()
            }
          })
          .catch(err => {

            return showErrorsForResponse(err)
          })
      },
      onCancel() {
      },
    })

  }

  return (
    <S.TopWrapper className={'RoundAudioPlayerSimple'}
                  onClick={() => {
                    showConfirmAddAudio()
                  }}
    >

      <S.Wrapper>
        <S.Container className="">
          <S.PlayButtonContainer>
            <S.PlayButton xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                          className=""
            >
              <path fill-rule="evenodd"
                    d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                    clip-rule="evenodd">
              </path>
            </S.PlayButton>
          </S.PlayButtonContainer>

          <S.InnerContainer className="">
            <Circle
              strokeLinecap={"round"} style={{
              transform: "rotate(-90deg)",
              transition: "stroke-dashoffset .3s ease 0s, stroke-dasharray .3s ease 0s, stroke .3s, stroke-width .06s ease .3s, opacity .3s ease 0s",
              fillOpacity: 0
            }}
              strokeWidth={6} percent={1}/>
          </S.InnerContainer>
        </S.Container>
      </S.Wrapper>

    </S.TopWrapper>

  )
}

const S = {
  TopWrapper: styled.div`
    border: 8px solid #f1f3fe;
    border-radius: 50%;
    width: 100%;
    height: 100%;
    position: relative;

    opacity: 0.6;

    &&:hover {
      opacity: 1;
    }
  `,

  Wrapper: styled.div`
    cursor: pointer;
    height: 50px;
    width: 50px;

  `,
  PlayButton: styled.svg`
    width: 100%;
    height: 100%;
  `,
  PauseButton: styled(PauseOutlined)`
    && svg {
      width: 100%;
      height: 100%;
    }

    && {
      width: 25px;
      height: 25px;
    }
  `,
  PlayButtonContainer: styled.div`
    z-index: 4;
    //position: absolute;
    //top: 0;
    width: 25px;
    height: 25px;
    justify-content: center;
    align-items: center;
    display: flex;
  `,
  InnerContainer: styled.div`
    position: absolute;
    display: flex;
    justify-content: center;
    width: 50px;
    height: 50px;
    top: 0;

    && .rc-progress-circle-path {
      stroke: ${Colors.primaryColor}BB !important;
    }

    && .rc-progress-circle-trail {
      stroke: #f1f3fe !important;
      stroke-width: 6px;
    }

    //absolute inset-0 flex items-center justify-center p-0.5
  `,
  Container: styled.div`
    background: white;
    border-radius: 50%;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px, rgb(255 255 255) 0px 0px 0px 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    //display: flex;
    //justify-content: center;

    //flex items-center justify-center shadow-md rounded-full
  `
}

function mapStateToProps(state) {

  return {
    authData: state.authReducer.authData,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    storyDemoActions: bindActionCreators(storyDemoActionsImport, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddAudio)
