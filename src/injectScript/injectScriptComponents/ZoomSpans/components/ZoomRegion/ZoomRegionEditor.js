import React, {useRef, useState} from 'react'
import styled from 'styled-components'
import Colors from '../../../../../constants/mainColors.js'
import {InputNumber, Button, Checkbox} from 'antd'
import {CloseOutlined, DragOutlined} from '@ant-design/icons'

const resizeTypes = {
  topLeft: 'topLeft',
  topRight: 'topRight',
  bottomLeft: 'bottomLeft',
  bottomRight: 'bottomRight'
}

const ZoomRegion = React.forwardRef(({
                                      wrapperRef,
                                      mainRef,
                                       x = 0,
                                       y = 0,
                                       initBoxWidth = 335.275,
                                       initBoxHeight = 153.922,
                                       editorWidth,
                                       editorHeight,
                                       data = {},
                                       onChangeHandler = () => {
                                       },
                                       onRemoveHandler = () => {
                                       },
                                       omniBarHeight = 0,
                                       scaleWidth,
                                       scaleMain,
                                       showed,
                                       delay = 0,
                                       duration = 0,
                                       innerWidth,
                                       innerHeight,
                                       wrapperLeftPos,
                                       wrapperTopPos,
                                       isScreenshot
                                     }, ref) => {


  let offsetX
  let offsetY

  let scaleMultiplier = editorWidth === innerWidth ? 1 : innerWidth / editorWidth

  let calculatedBoxWidth = (initBoxWidth * scaleMultiplier) || 1
  let boxWidth = useRef(calculatedBoxWidth)
  let boxHeight = useRef(calculatedBoxWidth * scaleWidth)
  let [delayState, setDelay] = useState(delay)
  let [durationState, setDuration] = useState(duration)
  let [skipDelay, setSkipDelay] = useState(delay === 0)
  let [skipDuration, setSkipDuration] = useState(duration === 0)
  let lastDelayRef = useRef(delay > 0 ? delay : 0.5)
  let lastDurationRef = useRef(duration > 0 ? duration : 1.5)

  let boxTransformX = useRef(x)
  let boxTransformY = useRef(y)

  x = x * scaleMultiplier
  y = y * scaleMultiplier


  function onChange(overrides = {}) {
    let changeData = {
      x: boxTransformX.current,
      y: boxTransformY.current,
      width: boxWidth.current,
      height: boxHeight.current,
      delay: overrides.delay !== undefined ? overrides.delay : delayState,
      duration: overrides.duration !== undefined ? overrides.duration : durationState,
      data: data
    }

    onChangeHandler(changeData)
  }

  function onSkipDelayChange(checked) {
    setSkipDelay(checked)
    if (checked) {
      if (delayState > 0) {
        lastDelayRef.current = delayState
      }
      setDelay(0)
      onChange({delay: 0})
    } else {
      let restored = lastDelayRef.current > 0 ? lastDelayRef.current : 0.5
      setDelay(restored)
      onChange({delay: restored})
    }
  }

  function onSkipDurationChange(checked) {
    setSkipDuration(checked)
    if (checked) {
      if (durationState > 0) {
        lastDurationRef.current = durationState
      }
      setDuration(0)
      onChange({duration: 0})
    } else {
      let restored = lastDurationRef.current > 0 ? lastDurationRef.current : 1.5
      setDuration(restored)
      onChange({duration: restored})
    }
  }

  function dragMove(e) {
    const el = ref.current
    // const el = e.target
//
    // boxTransformX = e.pageX - offsetX
    // boxTransformY = e.pageY - offsetY

    let newBTransformX = (e.pageX - wrapperLeftPos) - offsetX
    let newBTransformY = (e.pageY - wrapperTopPos) - offsetY

    newBTransformX = Math.min(
      (e.pageX - wrapperLeftPos) - offsetX,
      (innerWidth - boxWidth.current))

    newBTransformX = Math.max(newBTransformX, 0)

    newBTransformY = Math.min(
      (e.pageY - wrapperTopPos) - offsetY,
      (innerHeight - omniBarHeight - boxHeight.current)
    )

    newBTransformY = Math.max(newBTransformY, 0)

    // if((newBTransformY + boxWidth.current) > (innerHeight - omniBarHeight) {
    //   newBTransformY = Math.min(
    //     (e.pageY - wrapperTopPos) - offsetY,
    //     (innerHeight - omniBarHeight - boxWidth.current)
    //   )
    // }

    boxTransformX.current = newBTransformX
    boxTransformY.current = newBTransformY


    el.style.transform = `translate(${boxTransformX.current.toFixed(2)}px, ${boxTransformY.current.toFixed(2)}px)`
  }

  function dragAdd(e) {
    e.preventDefault()
    e.stopPropagation()

    const el = ref.current
    if (!el) {
      return
    }

    let elRect = el.getBoundingClientRect()

    offsetX = e.clientX - elRect.left
    offsetY = e.clientY - elRect.top + omniBarHeight

    window.document.addEventListener('mousemove', dragMove)
    window.document.addEventListener('mouseup', dragRemove)
  }

  function dragRemove(e) {
    const el = ref.current

    onChange()
    window.document.removeEventListener('mousemove', dragMove)
    window.document.removeEventListener('mouseup', dragRemove)
  }

  function setElementStartingTopLeft(element) {
    element.style.top = '0px'
    element.style.left = '0px'
    if (element.style.bottom) {
      element.style.bottom = ''
    }
    if (element.style.right) {
      element.style.right = ''
    }
  }

  function resizeMove(type) {

    return function (e) {


      let newBoxWidth, newBoxHeight, offsetMarginX, offsetMarginY, offsetX, offsetY

      let el = ref.current
      let transformArr = ref.current.style.transform.split('(')[1].split(',')
      boxTransformX.current = parseFloat(transformArr[0].slice(0, -2))
      boxTransformY.current = parseFloat(transformArr[1].slice(0, -3))

      if (type === resizeTypes.bottomRight) {

        boxWidth.current = e.clientX - el.getBoundingClientRect().left //- el.getBoundingClientRect().width
        boxHeight.current = boxWidth.current * scaleWidth
        // boxHeight = e.clientY - el.getBoundingClientRect().top
        // el.style.transformOrigin = 'top left'

      } else if (type === resizeTypes.bottomLeft) {

        newBoxWidth = el.getBoundingClientRect().right - e.clientX
        // newBoxHeight = e.clientY - el.getBoundingClientRect().top
        newBoxHeight = newBoxWidth * scaleWidth

        offsetMarginX = newBoxWidth - boxWidth.current
        offsetMarginY = newBoxHeight - boxHeight.current

        boxWidth.current = newBoxWidth
        boxHeight.current = newBoxHeight


        offsetX = boxTransformX.current - offsetMarginX
        offsetY = boxTransformY.current

        el.style.transform = `translate(${offsetX}px, ${offsetY}px)`

      } else if (type === resizeTypes.topLeft) {

        newBoxWidth = el.getBoundingClientRect().right - e.clientX
        // newBoxHeight = el.getBoundingClientRect().bottom - e.clientY
        newBoxHeight = newBoxWidth * scaleWidth

        offsetMarginX = newBoxWidth - boxWidth.current
        offsetMarginY = newBoxHeight - boxHeight.current

        boxWidth.current = newBoxWidth
        boxHeight.current = newBoxHeight


        offsetX = boxTransformX.current - offsetMarginX
        offsetY = boxTransformY.current - offsetMarginY

        el.style.transform = `translate(${offsetX}px, ${offsetY}px)`


      } else if (type === resizeTypes.topRight) {

        newBoxWidth = e.clientX - el.getBoundingClientRect().left
        // newBoxHeight = el.getBoundingClientRect().bottom - e.clientY
        newBoxHeight = newBoxWidth * scaleWidth

        offsetMarginX = newBoxWidth - boxWidth.current
        offsetMarginY = newBoxHeight - boxHeight.current

        boxWidth.current = newBoxWidth
        boxHeight.current = newBoxHeight


        offsetX = boxTransformX.current
        offsetY = boxTransformY.current - offsetMarginY

        el.style.transform = `translate(${offsetX}px, ${offsetY}px)`
      }


      ref.current.style.width = (boxWidth.current * scaleMultiplier) + 'px'
      ref.current.style.height = (boxHeight.current * scaleMultiplier) + 'px'
    }
  }

  function resizeAdd(type) {

    return function (e) {


      let resizeMoveFunction = resizeMove(type)
      window.document.addEventListener('mousemove', resizeMoveFunction)
      window.document.addEventListener('mouseup', resizeRemoveClosure(resizeMoveFunction))
    }
  }

  function resizeRemoveClosure(resizeMoveFunction) {
    return function onRemove(e) {

      onChange()

      window.document.removeEventListener('mousemove', resizeMoveFunction)
      window.document.removeEventListener('mouseup', onRemove)
    }
  }


  return <RL.Box $boxWidth={boxWidth.current} $boxHeight={boxHeight.current} ref={ref}
                 style={{transform: `translate(${x}px, ${y}px)`, visibility: showed ? 'visible' : 'hidden'}}>
    <RL.InnerBox/>
    <RL.LeftLine/>
    <RL.RightLine/>
    <RL.BottomLine/>
    <RL.TopLine/>
    <RL.LeftTopCorner onMouseDown={resizeAdd(resizeTypes.topLeft)}/>
    <RL.LeftBottomCorner onMouseDown={resizeAdd(resizeTypes.bottomLeft)}/>
    <RL.RightTopCorner onMouseDown={resizeAdd(resizeTypes.topRight)}></RL.RightTopCorner>
    <RL.CloseButton
      title="Remove zoom"
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onClick={(e) => {
        e.stopPropagation()
        onRemoveHandler(data)
      }}
    >
      <CloseOutlined/>
    </RL.CloseButton>
    <RL.RightBottomCorner onMouseDown={resizeAdd(resizeTypes.bottomRight)}></RL.RightBottomCorner>
    <RL.ButtonsWrapper
      onMouseDown={(e) => {
        // keep clicks on controls from starting a region drag
        e.stopPropagation()
      }}
    >
      <RL.ActionColumn>
        <RL.PreviewButton
          onClick={() => {
            // Match ZoomSpans (preview) / scaleMain: left/top are content coords
            // (relative to Main), not wrapper — subtract omniBar from top.
            let refCordinates = ref.current.getBoundingClientRect()
            let scaleValue = innerWidth / refCordinates.width
            let left = Math.max(refCordinates.left - wrapperLeftPos, 0)
            let top = Math.max(refCordinates.top - wrapperTopPos - omniBarHeight, 0)
            top = Math.min(top, innerHeight)

            scaleMain(scaleValue, left, top)

            setTimeout(() => {
              scaleMain(1, 0, 0)
            }, 2000)
          }}>
          <RL.ButtonText>Zoom Preview</RL.ButtonText>
        </RL.PreviewButton>
        <RL.MoveButton
          title="Drag to move zoom region"
          onMouseDown={dragAdd}
        >
          <DragOutlined/>
          <RL.ButtonText>Move</RL.ButtonText>
        </RL.MoveButton>
      </RL.ActionColumn>
      {!isScreenshot ? '' : (<RL.TextFieldWrapper>
        <RL.TextFieldRow>
          <RL.TextField>Delay:</RL.TextField>
          <RL.InputNumber min={0} max={10} step={0.5} value={delayState ?? 0}
                          disabled={skipDelay}
                          onBlur={() => {
                            onChange()
                          }}
                          onChange={(newDelay) => {
                            let next = newDelay ?? 0
                            setDelay(next)
                            if (next > 0) {
                              lastDelayRef.current = next
                            }
                          }}/>
        </RL.TextFieldRow>
        <RL.TextFieldRow>
          <RL.TextField>Duration:</RL.TextField>
          <RL.InputNumber min={0} max={10} step={0.5} value={durationState ?? 0}
                          disabled={skipDuration}
                          onBlur={() => {
                            onChange()
                          }}
                          onChange={(newDuration) => {
                            let next = newDuration ?? 0
                            setDuration(next)
                            if (next > 0) {
                              lastDurationRef.current = next
                            }
                          }}/>
        </RL.TextFieldRow>
        <RL.SkipRow>
          <RL.SkipCheckbox
            checked={skipDelay}
            onChange={(e) => onSkipDelayChange(e.target.checked)}
          >
            Skip delay
          </RL.SkipCheckbox>
        </RL.SkipRow>
        <RL.SkipRow>
          <RL.SkipCheckbox
            checked={skipDuration}
            onChange={(e) => onSkipDurationChange(e.target.checked)}
          >
            Skip duration
          </RL.SkipCheckbox>
        </RL.SkipRow>
      </RL.TextFieldWrapper>)}

    </RL.ButtonsWrapper>
  </RL.Box>
})

ZoomRegion.displayName = 'ZoomRegion'

const RL = {
  InputNumber: styled(InputNumber)`
    &&&& {
      width: 68px;
      height: 34px;
      margin: 4px 0;
      z-index: 3;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 6px;
      color: #f9f9f9;
    }

    &&&&.ant-input-number-disabled {
      opacity: 0.55;
      background: rgba(0, 0, 0, 0.18);
    }

    .ant-input-number-handler-wrap {
      opacity: 1;
      background: transparent;
      color: #f9f9f9;
    }

    .ant-input-number-handler-wrap span {
      background: transparent !important;
    }


    .ant-input-number-handler-wrap i {
      color: #f9f9f9 !important;
      font-size: 15px;
    }

    .ant-input-number-input {
      padding: 0 8px;
      height: 34px;
      font-size: 14px;
      color: white !important;
    }
  `,
  TextField: styled.p`
    text-align: left;
    margin: 0 10px 0 0;
    font-size: 14px;
    line-height: 34px;
    color: #f9f9f9;
    font-weight: 550;
    font-family: ${Colors.fontFamily};
    min-width: 72px;
  `,
  TextFieldWrapper: styled.div`
    &&&& {
      background: #1070ff;
      padding: 10px 12px;
      border-radius: 8px;
      width: 210px;
      height: auto;
      z-index: 3;
      margin-left: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
    }
  `,
  TextFieldRow: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  `,
  SkipRow: styled.div`
    display: flex;
    align-items: center;
    margin-top: 6px;
  `,
  SkipCheckbox: styled(Checkbox)`
    && {
      color: #f9f9f9;
      font-family: ${Colors.fontFamily};
      font-size: 13px;
      font-weight: 500;
      line-height: 1.3;
    }

    && .ant-checkbox {
      top: 0;
    }

    && .ant-checkbox-inner {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border-color: rgba(255, 255, 255, 0.7);
      background: rgba(255, 255, 255, 0.12);
    }

    && .ant-checkbox-checked .ant-checkbox-inner {
      background: #fff;
      border-color: #fff;
    }

    && .ant-checkbox-checked .ant-checkbox-inner::after {
      border-color: #1070ff;
    }

    && .ant-checkbox + span {
      padding-right: 0;
      padding-left: 8px;
      color: #f9f9f9;
    }

    &&:hover .ant-checkbox-inner {
      border-color: #fff;
    }
  `,
  ButtonsWrapper: styled.div`
    position: absolute;
    // sit inside the box so parent overflow can't clip the controls
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    width: max-content;
    max-width: calc(100% - 16px);
    height: auto;
    z-index: 4;
    pointer-events: auto;
  `,
  ButtonText: styled.p`
    text-align: center;
    margin: 0;
    font-size: 13px;
    color: white;
    font-family: ${Colors.fontFamily};
  `,
  ActionColumn: styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    pointer-events: auto;
  `,
  PreviewButton: styled(Button)(props => ({

    background: `${Colors.primaryColor}`,
    textAlign: 'center',
    display: 'flex',
    border: `solid 1px ${Colors.primaryColor}`,
    height: '34px',
    width: '120px',
    borderRadius: '6px',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgb(0 0 0 / 5%)',
    cursor: 'pointer',
    pointerEvents: 'auto',

    '&:hover': {
      border: `solid 1px #dae3f2`,
      background: `${Colors.primaryColor} !important`,
    },
    '&:active': {
      border: `solid 1px #dae3f2`,
      background: `${Colors.primaryColor} !important`,
    },
    '&:focus': {
      border: `solid 1px #dae3f2`,
      background: `${Colors.primaryColor} !important`,
    },
    '&& .anticon > svg': {
      width: '1.5em',
      height: '1.5em'
    },
  })),
  MoveButton: styled(Button)`
    &&& {
      background: ${Colors.primaryColor};
      text-align: center;
      display: flex;
      border: solid 1px ${Colors.primaryColor};
      height: 34px;
      width: 120px;
      border-radius: 6px;
      justify-content: center;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 5px rgb(0 0 0 / 5%);
      cursor: grab;
      pointer-events: auto;
      color: white;
    }

    &&&:hover,
    &&&:active,
    &&&:focus {
      border: solid 1px #dae3f2;
      background: ${Colors.primaryColor} !important;
      color: white;
    }

    &&&:active {
      cursor: grabbing;
    }

    && .anticon {
      font-size: 15px;
      color: white;
    }
  `,
  Wrapper: styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
    //bottom: 0px;
    //right: 0px;
  `,
  Box: styled.div`
    position: absolute;
    user-select: none;
    -webkit-user-select: none;
    width: ${({$boxWidth}) => $boxWidth}px;
    height: ${({$boxHeight}) => $boxHeight}px;
    display: inline-block;
    top: 0px;
    left: 0px;
    /* Hollow: clicks pass through the interior to content underneath */
    pointer-events: none !important;
    cursor: default;
    z-index: 3;
    box-sizing: border-box;
    border: 2px solid ${Colors.primaryColor};
  `,
  InnerBox: styled.div`
    position: absolute;
    user-select: none;
    -webkit-user-select: none;
    display: inline-block;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    pointer-events: none;
    cursor: default;
  `,
  LeftLine: styled.div`
    position: absolute;
    height: 100%;
    width: 10px;
    left: -5px;
    pointer-events: none;
  `,
  RightLine: styled.div`
    position: absolute;
    height: 100%;
    width: 10px;
    right: -5px;
    pointer-events: none;
  `,
  BottomLine: styled.div`
    position: absolute;
    height: 10px;
    width: 100%;
    bottom: -5px;
    pointer-events: none;
  `,
  TopLine: styled.div`
    position: absolute;
    height: 10px;
    width: 100%;
    top: -5px;
    pointer-events: none;
  `,
  LeftTopCorner: styled.div`
    position: absolute;
    user-select: none;
    width: 20px;
    height: 20px;
    left: -10px;
    top: -10px;
    cursor: nw-resize;
    border-width: 2px;
    border-radius: 9999px;
    pointer-events: auto;
    background-color: ${Colors.primaryColor};
    border: 2px solid white;
  `,
  LeftBottomCorner: styled.div`
    position: absolute;
    user-select: none;
    width: 20px;
    height: 20px;
    left: -10px;
    bottom: -10px;
    cursor: sw-resize;
    border-width: 2px;
    border-radius: 9999px;
    pointer-events: auto;
    background-color: ${Colors.primaryColor};
    border: 2px solid white;
  `,
  RightTopCorner: styled.div`
    position: absolute;
    user-select: none;
    width: 20px;
    height: 20px;
    right: -10px;
    top: -10px;
    cursor: ne-resize;
    border-width: 2px;
    border-radius: 9999px;
    pointer-events: auto;
    background-color: ${Colors.primaryColor};
    border: 2px solid white;
  `,
  CloseButton: styled.button`
    position: absolute;
    right: -28px;
    top: -36px;
    width: 22px;
    height: 22px;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 5;
    border-radius: 9999px;
    border: 2px solid white;
    background-color: transparent;
    color: white;
    line-height: 1;
    box-sizing: border-box;
    pointer-events: auto;

    && .anticon {
      font-size: 11px;
      color: white;
    }
  `,
  RightBottomCorner: styled.div`
    position: absolute;
    user-select: none;
    width: 20px;
    height: 20px;
    right: -10px;
    bottom: -10px;
    cursor: se-resize;
    border-width: 2px;
    border-radius: 9999px;
    pointer-events: auto;
    background-color: ${Colors.primaryColor};
    border: 2px solid white;
  `
}

export default ZoomRegion
