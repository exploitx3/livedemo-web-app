import React, { useState, useEffect } from 'react'
import Input from 'antd/es/input'
import Colors from '../../../../../../constants/mainColors'
import styled from 'styled-components'
import { RgbaColorPicker } from 'react-colorful'
import 'antd/es/input/style'

const DEFAULT_OVERLAY_COLOR = { r: 0, g: 0, b: 0, a: 0.65 }

function rgbaToObj(rgbaString) {
  const keys = ['r', 'g', 'b', 'a']
  const values = rgbaString
    .slice(rgbaString.indexOf('(') + 1, rgbaString.indexOf(')'))
    .split(',')
    .map(c => parseFloat(c.trim()))
  return keys.reduce((acc, key, i) => { acc[key] = values[i]; return acc }, {})
}

function objToRgba(rgbObj) {
  return `rgba(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}, ${rgbObj.a})`
}

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

  const overlayColorObj = (internalStep.view.popup && internalStep.view.popup.overlayBackgroundColor)
    ? rgbaToObj(internalStep.view.popup.overlayBackgroundColor)
    : DEFAULT_OVERLAY_COLOR

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

      <E.ActionSelectorLineMargin style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
        <E.ActionSelectorText>Overlay Color:</E.ActionSelectorText>
        <E.OverlayColorPicker
          color={overlayColorObj}
          onChange={(colorObj) => {
            updateViewField('overlayBackgroundColor', objToRgba(colorObj))
          }}
        />
      </E.ActionSelectorLineMargin>
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
  ActionSelectorLineMargin: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 15px;
  `,
  ActionSelectorText: styled.p`
    margin: 0px;
  `,
  OverlayColorPicker: styled(RgbaColorPicker)`
    && {
      width: 125px;
      height: 125px;
    }
  `,
}

export default EmbedOptionsView
