import React, { useEffect, useState } from 'react'
import elementPicker from '../../storyElementPicker.js'
import mainColors from '../../../constants/mainColors.js'
import 'tippy.js/dist/tippy.css'
import styled from 'styled-components'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import TippyModule from '@tippyjs/react'

// Ensure we get the actual component (handle both default and named exports)
const Tippy = TippyModule?.default || TippyModule;


function EditText({ iframeRef, screenId }) {
  let [isVisible, setIsVisible] = useState(false)
  let [targetElement, setTargetElement] = useState(null)

  let [config, setConfig] = useState({})

  useEffect(() => {
    if (typeof window === 'undefined') {
      console.error('window is undefined')
    }

    window.editTextData = {
      screenId
    }

    window.editText = function (onFinishFunc) {

      let config = {}

      if (onFinishFunc) {
        config.onFinishFuncGlobal = onFinishFunc

        setConfig(config)
      }


      function onClick(element) {


        config.oldTextContent = element.textContent
        // config.screenId = screenId

        element.setAttribute('contenteditable', 'true')


        const selection = typeof window !== 'undefined' ? window.getSelection() : null
        if (!selection) return
        const range = document.createRange()
        selection.removeAllRanges()
        range.selectNodeContents(element)
        range.collapse(false)
        selection.addRange(range)
        element.focus()

        setTargetElement(element)
        setIsVisible(true)

        element.onkeypress = function (event) {
          if (event.charCode == 13) {
            event.preventDefault()
            onSave(element, config)
          }
        }
      }

      elementPicker.init({
        // document: document,
        document: iframeRef.current.contentDocument,
        onClick: onClick,
        backgroundColor: mainColors.primaryColor
      })
    }
    window.resetEditText = function () {


      elementPicker.reset()
    }

  }, [screenId])


  function onSave(targetElement, config) {
    setIsVisible(false)
    targetElement.setAttribute('contenteditable', 'false')

    if (config.onFinishFuncGlobal) {
      config.onFinishFuncGlobal({
        action: 'save',
        text: targetElement.textContent,
        screenId: typeof window !== 'undefined' && window.editTextData ? window.editTextData.screenId : screenId,
        oldText: config.oldTextContent,
        liveDemoTagId: targetElement.getAttribute('livedemo_id')
      })
    }
  }

  function onClose(config) {
    setIsVisible(false)
    targetElement.setAttribute('contenteditable', 'false')
    targetElement.textContent = config.oldTextContent


    if (config.onFinishFuncGlobal) {
      config.onFinishFuncGlobal({
        action: 'close',
        text: targetElement.textContent,
        oldText: config.oldTextContent,
        screenId: screenId,
        liveDemoTagId: targetElement.getAttribute('livedemo_id')
      })
    }
  }

  return (
    <React.Fragment>
    <Tippy
      visible={isVisible}
      getReferenceClientRect={() => {
        if (!targetElement) {
          return {
            width: 0,
            height: 0,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
          }
        }
        const rect = targetElement.getBoundingClientRect()
        return rect
      }}
      placement="top"
      interactive={true}
      appendTo={() => iframeRef.current?.contentDocument?.body || document.body}
      content={
        isVisible && targetElement ? (
          <div style={{
            width: targetElement.clientWidth + 'px',
            height: targetElement.clientHeight + 'px'
          }}>
            <S.ButtonsWrapper>
              <S.CheckIcon
                onClick={() => onSave(targetElement, config)}/>
              <S.CloseIcon
                onClick={() => onClose(config)}/>
            </S.ButtonsWrapper>
          </div>
        ) : null
      }
    >
      <span style={{ display: 'none' }} />
    </Tippy>
    </React.Fragment>
  )
}

const S = {
  ButtonsWrapper: styled.div`
       position: absolute;
       right: 0px;
       width: 60px;
       display: flex;
       justify-content: space-around;
       align-items: center;
       
    `,
  CloseIcon: styled(CloseOutlined)`

      && {
        width: 27px;
        height: 27px;
      }
      
      &&:hover svg{
        
        background: rgba(255,5,5,0.5);
        
      }
      
      && svg {
          border-radius: 25px;
          width: 100%;
          height: 100%;
          fill: #ff0505;
      }
    `,
  CheckIcon: styled(CheckOutlined)`
      && {
        width: 27px;
        height: 27px;
      }
      
      &&:hover svg{
        background: rgba(0,128,0,0.51);
      }
      
      
      && svg {
          border-radius: 25px;
          width: 100%;
          height: 100%;
          fill: green;
      }
    `,

}

export default EditText
