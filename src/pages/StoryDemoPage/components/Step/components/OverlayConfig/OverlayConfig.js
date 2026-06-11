import React from 'react'
import Checkbox from 'antd/es/checkbox'
import styled from 'styled-components'
import { RgbaColorPicker } from 'react-colorful'

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

const OverlayConfig = ({ internalStep, updateViewField }) => {
  const overlayColorObj = (internalStep.view.popup && internalStep.view.popup.overlayBackgroundColor)
    ? rgbaToObj(internalStep.view.popup.overlayBackgroundColor)
    : DEFAULT_OVERLAY_COLOR

  return (
    <ST.OverlayContainer>
      <ST.OverlayCheckbox onClick={() => {
        updateViewField('showOverlay', !internalStep.view.popup.showOverlay)
      }}>
        <ST.Checkbox
          checked={internalStep.view.popup.showOverlay || false} />
        <ST.CheckboxText>Show overlay</ST.CheckboxText>
      </ST.OverlayCheckbox>

      {internalStep.view.popup.showOverlay && (
        <ST.OverlayColorContainer>
          <ST.OverlayColorPicker
            color={overlayColorObj}
            onChange={(colorObj) => {
              updateViewField('overlayBackgroundColor', objToRgba(colorObj))
            }}
          />
        </ST.OverlayColorContainer>
      )}
    </ST.OverlayContainer>
  )
}

const ST = {
  OverlayContainer: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin: 15px 0px;
  `,
  OverlayCheckbox: styled.div`
    display: flex;
    width: 100%;
    flex-grow: 1;
  `,
  OverlayColorContainer: styled.div`
    display: flex;
    justify-content: flex-end;
    width: 100%;
  `,
  Checkbox: styled(Checkbox)``,
  CheckboxText: styled.p`
    margin: 0px 0px 0px 15px;
  `,
  OverlayColorPicker: styled(RgbaColorPicker)`
    && {
      width: 125px;
      height: 125px;
    }
  `,
}

export default OverlayConfig
