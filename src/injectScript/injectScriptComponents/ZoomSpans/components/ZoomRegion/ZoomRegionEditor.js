import React, {useRef, useState} from 'react'
import styled from 'styled-components'
import Colors from '../../../../../constants/mainColors.js'
import {InputNumber, Button} from 'antd'

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


  console.log('boxWidth')
  console.log(boxWidth)
  console.log('boxHeight')
  console.log(boxHeight)
  let boxTransformX = useRef(x)
  let boxTransformY = useRef(y)

  x = x * scaleMultiplier
  y = y * scaleMultiplier


  function onChange() {
    console.log('onChange triggered')

    console.log('delayState')
    console.log(delayState)
    console.log('durationState')
    console.log(durationState)
    let changeData = {
      x: boxTransformX.current,
      y: boxTransformY.current,
      width: boxWidth.current,
      height: boxHeight.current,
      delay: delayState,
      duration: durationState,
      data: data
    }

    onChangeHandler(changeData)
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

    const el = e.target
    let elRect = el.getBoundingClientRect()

    offsetX = e.clientX - elRect.left
    offsetY = e.clientY - elRect.top + omniBarHeight

    // let result = beforeMove({offsetX, offsetY})
    // offsetX = result.offsetX
    // offsetY = result.offsetY


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
    <RL.InnerBox onMouseDown={dragAdd}/>
    <RL.LeftLine/>
    <RL.RightLine/>
    <RL.BottomLine/>
    <RL.TopLine/>
    <RL.LeftTopCorner onMouseDown={resizeAdd(resizeTypes.topLeft)}/>
    <RL.LeftBottomCorner onMouseDown={resizeAdd(resizeTypes.bottomLeft)}/>
    <RL.RightTopCorner onMouseDown={resizeAdd(resizeTypes.topRight)}></RL.RightTopCorner>
    <RL.RightBottomCorner onMouseDown={resizeAdd(resizeTypes.bottomRight)}></RL.RightBottomCorner>
    <RL.ButtonsWrapper
      onMouseDown={(e) => {
        // keep clicks on controls from starting a region drag
        e.stopPropagation()
      }}
    >
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
      {!isScreenshot ? '' : (<RL.TextFieldWrapper>
        <RL.TextFieldRow>
          <RL.TextField>Delay:</RL.TextField>
          <RL.InputNumber min={1} max={10} step={0.5} value={delayState ?? 0}
                          onBlur={() => {
                            onChange()
                          }}
                          onChange={(newDelay) => {
                            setDelay(newDelay ?? 0)
                          }}/>
        </RL.TextFieldRow>
        <RL.TextFieldRow>
          <RL.TextField>Duration:</RL.TextField>
          <RL.InputNumber min={0} max={10} step={0.5} value={durationState ?? 0}
                          onBlur={() => {
                            onChange()
                          }}
                          onChange={(newDuration) => {
                            setDuration(newDuration ?? 0)
                          }}/>
        </RL.TextFieldRow>

      </RL.TextFieldWrapper>)}

    </RL.ButtonsWrapper>
  </RL.Box>
})

ZoomRegion.displayName = 'ZoomRegion'

const RL = {
  InputNumber: styled(InputNumber)`
    &&&& {
      width: 55px;
      height: 30px;
      margin: 5px 0px;
      z-index: 3;
      background: transparent;
      color: #f9f9f9;
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
      padding: 0px 5px;
      color: white !important;
    }
  `,
  TextField: styled.p`
    text-align: center;
    margin: 0px 15px;
    font-size: 1em;
    line-height: 2em;
    color: #f9f9f9;
    font-weight: 550;
    font-family: ${Colors.fontFamily};
  `,
  TextFieldWrapper: styled.div`
    &&&& {
      background: #1070ff;
      padding: 0px 5px;
      border-radius: 5px;
      width: 170px;
      height: auto;
      z-index: 3;
      margin-left: 10px;
    }
  `,
  TextFieldRow: styled.div`
    display: flex;
    align-content: center;
    justify-content: space-between;
  `,
  ButtonsWrapper: styled.div`
    position: absolute;
    // sit inside the box so parent overflow can't clip the controls
    bottom: 8px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    width: 100%;
    height: auto;
    z-index: 4;
    pointer-events: auto;
  `,
  ButtonText: styled.p`
    text-align: center;
    margin: 0px 15px;
    font-size: 1em;
    color: white;
    //font-weight: 550;
    font-family: ${Colors.fontFamily};

  `,
  PreviewButton: styled(Button)(props => ({

    background: `${Colors.primaryColor}`,
    textAlign: 'center',
    display: 'flex',
    border: `solid 1px ${Colors.primaryColor}`,
    height: '30px',
    width: '110px',
    borderRadius: '5px',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgb(0 0 0 / 5%)',
    cursor: 'pointer',

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


    cursor: move;

    z-index: 3;
    //box-shadow: rgba(17, 24, 39, 0.5) 0px 0px 0px 100vmax;
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
    //cursor: move;

    width: 100%;
    height: 100%;
  `,
  LeftLine: styled.div`
    position: absolute;
    height: 100%;
    width: 10px;
    left: -5px;

  `,
  RightLine: styled.div`
    position: absolute;
    height: 100%;
    width: 10px;
    right: -5px;
  `,
  BottomLine: styled.div`
    position: absolute;
    height: 10px;
    width: 100%;
    bottom: -5px;
  `,
  TopLine: styled.div`
    position: absolute;
    height: 10px;
    width: 100%;
    top: -5px;
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

    background-color: ${Colors.primaryColor};
    border: 2px solid white;

  }
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

    background-color: ${Colors.primaryColor};
    border: 2px solid white;
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

    background-color: ${Colors.primaryColor};
    border: 2px solid white;
  `
}

export default ZoomRegion
