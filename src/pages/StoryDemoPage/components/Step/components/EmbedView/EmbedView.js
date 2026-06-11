import React, { useState, useEffect } from 'react'
import Input from 'antd/es/input'
import Colors from '../../../../../../constants/mainColors'
import styled from 'styled-components'
import OverlayConfig from '../OverlayConfig/OverlayConfig'
import 'antd/es/input/style'

const { TextArea } = Input

function decodeEmbedHtml(value) {
  if (!value || !value.trim()) return ''
  try {
    const attempt = atob(value)
    if (attempt.includes('<')) return attempt
  } catch (e) {
    // not base64
  }
  return value
}

const EmbedOptionsView = ({ internalStep, setInternalStep }) => {
  const rawValue = internalStep.view?.popup?.embedHtmlContent || ''

  function updateViewField(fieldName, value) {
    let newStep = JSON.parse(JSON.stringify(internalStep))
    if (newStep.view.popup[fieldName] !== value) {
      newStep.view.popup[fieldName] = value
      setInternalStep(newStep)
    }
  }

  const [displayValue, setDisplayValue] = useState(() => decodeEmbedHtml(rawValue))

  useEffect(() => {
    setDisplayValue(decodeEmbedHtml(rawValue))
  }, [internalStep._id, rawValue])

  function onEmbedChange(e) {
    const newRaw = e.target.value
    setDisplayValue(newRaw)

    let newStep = JSON.parse(JSON.stringify(internalStep))
    if (newStep.view.popup.embedHtmlContent !== newRaw) {
      newStep.view.popup.embedHtmlContent = newRaw
      setInternalStep(newStep)
    }
  }

  return (
    <E.Wrapper>
      <E.Label>Embed HTML:</E.Label>
      <E.EmbedTextArea
        rows={6}
        placeholder="Paste your embed HTML code here..."
        value={displayValue}
        onChange={onEmbedChange}
      />

      <OverlayConfig
        internalStep={internalStep}
        updateViewField={updateViewField}
      />
    </E.Wrapper>
  )
}

const E = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    width: 100%;
    margin-bottom: 15px;
  `,
  Label: styled.p`
    margin: 0;
    font-size: 0.95em;
    color: ${Colors.primaryText};
  `,
  EmbedTextArea: styled(TextArea)`
    && {
      width: 100%;
      font-family: monospace;
      font-size: 0.8em;
      resize: vertical;
    }
  `,
}

export default EmbedOptionsView
