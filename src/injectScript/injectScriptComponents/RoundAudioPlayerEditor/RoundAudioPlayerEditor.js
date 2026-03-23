import React, {useRef, useState} from 'react'
import styled from 'styled-components'
import RoundAudioPlayer from '../RoundAudioPlayer/RoundAudioPlayer.js'
import {DeleteOutlined, EditOutlined} from '@ant-design/icons'
import EditAudio from './components/EditAudio/EditAudio.js'
import * as storyDemoActionsImport from '../../../actions/storyDemoActions.js'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import Modal from 'antd/es/modal/index.js'
// Note: antd v6 uses CSS-in-JS, so style imports are not needed
// import 'antd/es/button/style'
// import 'antd/es/col/style'
// import 'antd/es/layout/style'
// import 'antd/es/modal/style'
import {showErrorsForResponse} from "../../../utils/helperFunctions.js";

const {confirm} = Modal


const RoundAudioPlayerEditor = (props) => {
  let {
    stepAudio,
    setStepAudio,
    workspaceId,
    storyDemoId,
    screenId,
    step,
    authData,
    reloadStoryDemo,
    storyDemoActions,
    voices
  } = props


  const [showDropDownMenu, setShowDropDownMenu] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const isAudioPlayingRef = useRef(false)

  function showConfirmDeleteAudio() {
    return confirm({
      title: `Are you sure you want to delete this audio?`,
      content: '',
      okText: 'Confirm',
      okButtonProps: {type: 'danger'},
      cancelText: 'Cancel',
      onOk() {
        return storyDemoActions.deleteStepAudio(stepAudio._id, step._id, storyDemoId, screenId, workspaceId, authData.token)
          .catch(err => {

            return showErrorsForResponse(err)
          })
      },
      onCancel() {
      },
    })

  }

  return (
    <S.TopWrapper onMouseOver={() => {
      setShowDropDownMenu(true)
    }} onMouseLeave={() => {
      setShowDropDownMenu(false)
    }}>
      {stepAudio ? (
        <S.Wrapper>
          <RoundAudioPlayer isAudioPlaying={isAudioPlayingRef.current} setIsAudioPlaying={(value) => {
            isAudioPlayingRef.current = value
          }} stepAudio={stepAudio} autoPlay={false}/>

          <S.DropDownMenu className={showDropDownMenu ? 'visible' : ''}>
            <S.DropDownButton onClick={() => {
              setIsOpen(true)
            }}>
              <S.EditIcon/>
            </S.DropDownButton>
            <S.DropDownButton onClick={() => {
              showConfirmDeleteAudio()
            }}>
              <S.DeleteIcon/>
            </S.DropDownButton>
          </S.DropDownMenu>

        </S.Wrapper>
      ) : ''}
      <EditAudio
        voices={voices}
        stepAudio={stepAudio}
        setStepAudio={setStepAudio}
        workspaceId={workspaceId}
        storyDemoId={storyDemoId}
        screenId={screenId}
        step={step}
        authData={authData}
        isOpen={isOpen}
        onCancel={() => {
          setIsOpen(false)
        }}
        // setShowConfetti
        reloadStoryDemo={reloadStoryDemo}
      />

    </S.TopWrapper>

  )
}

const S = {
  DropDownMenu: styled.div`
    display: flex;
    width: 50px;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    transition: opacity 0.2s ease-in-out;
    visibility: hidden;
    opacity: 0;

    &&.visible {
      visibility: visible;
      opacity: 1;
    }

  `,
  DropDownButton: styled.div`
    margin-top: 10px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f3fe;
    border: 3px solid #f1f3fe;
    background: white;
    cursor: pointer;
  `,
  EditIcon: styled(EditOutlined)`
    && svg {
      width: 100%;
      height: 100%;
    }

    && {
      width: 25px;
      height: 25px;
    }
  `,
  DeleteIcon: styled(DeleteOutlined)`
    && svg {
      width: 100%;
      height: 100%;
    }

    && {
      width: 25px;
      height: 25px;
    }
  `,
  TopWrapper: styled.div`
    width: 100%;
    height: 100%;
    position: relative;
  `,

  Wrapper: styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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

export default connect(mapStateToProps, mapDispatchToProps)(RoundAudioPlayerEditor)
