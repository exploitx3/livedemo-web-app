import React, { useEffect, useState } from 'react'
import elementPicker from '../../storyElementPicker.js'
import mainColors from '../../../constants/mainColors.js'
import 'tippy.js/dist/tippy.css'
import styled from 'styled-components'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import TippyModule from '@tippyjs/react'
import { getDemoDocument } from '../../helpers.js'

// Ensure we get the actual component (handle both default and named exports)
const Tippy = TippyModule?.default || TippyModule;


function resolveRrwebTextNodeId(element) {
  const replayer = typeof window !== 'undefined' ? window.__livedemoActiveReplayer : null
  if (!replayer || !replayer.getMirror || !element) {
    return null
  }
  const mirror = replayer.getMirror()

  function idOf(node) {
    if (!node) {
      return null
    }
    try {
      const id = mirror.getId(node)
      if (id != null && id !== -1 && id !== -2) {
        return id
      }
    } catch (e) {
      // ignore
    }
    return null
  }

  if (element.nodeType === 3) {
    return idOf(element)
  }

  // Prefer a direct text child that rrweb knows about.
  const childNodes = element.childNodes
  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i]
    if (child.nodeType === 3) {
      const id = idOf(child)
      if (id != null) {
        return id
      }
    }
  }

  // Fall back to first descendant text node with a mirror id.
  try {
    const doc = element.ownerDocument
    if (doc && typeof doc.createTreeWalker === 'function') {
      const walker = doc.createTreeWalker(element, NodeFilter.SHOW_TEXT)
      let node = walker.nextNode()
      while (node) {
        const id = idOf(node)
        if (id != null) {
          return id
        }
        node = walker.nextNode()
      }
    }
  } catch (e) {
    // ignore
  }

  return null
}

function getEditTargetDocument(iframeRef) {
  try {
    const demoDoc = getDemoDocument()
    if (demoDoc) {
      return demoDoc
    }
  } catch (e) {
    // ignore
  }
  if (iframeRef && iframeRef.current && iframeRef.current.contentDocument) {
    return iframeRef.current.contentDocument
  }
  return null
}

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

      const targetDoc = getEditTargetDocument(iframeRef)
      if (!targetDoc) {
        console.error('EditText: no demo document')
        return
      }

      window.__livedemoEditTextActive = true


      function onClick(element) {


        config.oldTextContent = element.textContent
        config.rrwebNodeId = resolveRrwebTextNodeId(element)
        // config.screenId = screenId

        element.setAttribute('contenteditable', 'true')


        const selection = typeof window !== 'undefined' ? window.getSelection() : null
        const sel = targetDoc.getSelection ? targetDoc.getSelection() : selection
        if (!sel) {
          return
        }
        const range = targetDoc.createRange ? targetDoc.createRange() : document.createRange()
        sel.removeAllRanges()
        range.selectNodeContents(element)
        range.collapse(false)
        sel.addRange(range)
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
        document: targetDoc,
        onClick: onClick,
        backgroundColor: mainColors.primaryColor
      })
    }
    window.resetEditText = function () {

      window.__livedemoEditTextActive = false
      elementPicker.reset()
      setIsVisible(false)
    }

  }, [screenId, iframeRef])


  function onSave(targetElement, config) {
    setIsVisible(false)
    targetElement.setAttribute('contenteditable', 'false')
    window.__livedemoEditTextActive = false
    elementPicker.reset()

    if (config.onFinishFuncGlobal) {
      config.onFinishFuncGlobal({
        action: 'save',
        text: targetElement.textContent,
        screenId: typeof window !== 'undefined' && window.editTextData ? window.editTextData.screenId : screenId,
        oldText: config.oldTextContent,
        liveDemoTagId: targetElement.getAttribute('livedemo_id'),
        rrwebNodeId: config.rrwebNodeId != null ? config.rrwebNodeId : resolveRrwebTextNodeId(targetElement),
      })
    }
  }

  function onClose(config) {
    setIsVisible(false)
    targetElement.setAttribute('contenteditable', 'false')
    targetElement.textContent = config.oldTextContent
    window.__livedemoEditTextActive = false
    elementPicker.reset()


    if (config.onFinishFuncGlobal) {
      config.onFinishFuncGlobal({
        action: 'close',
        text: targetElement.textContent,
        oldText: config.oldTextContent,
        screenId: screenId,
        liveDemoTagId: targetElement.getAttribute('livedemo_id'),
        rrwebNodeId: config.rrwebNodeId,
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
      appendTo={() => {
        try {
          const doc = getEditTargetDocument(iframeRef)
          if (doc && doc.body) {
            return doc.body
          }
        } catch (e) {
          // ignore
        }
        return iframeRef.current?.contentDocument?.body || document.body
      }}
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
