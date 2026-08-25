import React, { useRef, useEffect } from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'
import { Button } from 'antd'
import { DragOutlined } from '@ant-design/icons'

const resizeTypes = {
  topLeft: 'topLeft',
  topRight: 'topRight',
  bottomLeft: 'bottomLeft',
  bottomRight: 'bottomRight'
}

function RegionLite({
                      x = 0,
                      y = 0,
                      boxWidth = 335.275,
                      boxHeight = 153.922,
                      data = {},
                      onChangeHandler = () => {},
                      omniBarHeight = 0,
                      wrapperLeftPos,
                      wrapperTopPos,
                      innerWidth,
                      innerHeight
}) {

  let boxRef = useRef(null)
  const offsetXRef = useRef(0)
  const offsetYRef = useRef(0)
  const isDraggingRef = useRef(false)

  const boxTransformXRef = useRef(x)
  const boxTransformYRef = useRef(y)
  const currentBoxWidthRef = useRef(boxWidth)
  const currentBoxHeightRef = useRef(boxHeight)

  useEffect(() => {
    // Don't clobber live drag/resize geometry when parent re-renders mid-gesture
    if (isDraggingRef.current) {
      return
    }
    currentBoxWidthRef.current = boxWidth
    currentBoxHeightRef.current = boxHeight
    boxTransformXRef.current = x
    boxTransformYRef.current = y
  }, [boxWidth, boxHeight, x, y])

  const activeListenersRef = useRef({
    move: null,
    up: null,
    captureTarget: null
  })
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      removeActiveListeners()
    }
  }, [])

  function removeActiveListeners() {
    if (activeListenersRef.current.move) {
      window.document.removeEventListener('pointermove', activeListenersRef.current.move)
      activeListenersRef.current.move = null
    }
    if (activeListenersRef.current.up) {
      window.document.removeEventListener('pointerup', activeListenersRef.current.up)
      activeListenersRef.current.up = null
    }
    activeListenersRef.current.captureTarget = null
  }

  function onChange() {
    let changeData = {
      x: boxTransformXRef.current,
      y: boxTransformYRef.current,
      width: currentBoxWidthRef.current,
      height: currentBoxHeightRef.current,
      data: data
    }

    onChangeHandler(changeData)
  }

  function clampPosition(nextX, nextY) {
    let maxX = innerWidth != null
      ? Math.max(0, innerWidth - currentBoxWidthRef.current)
      : nextX
    let maxY = innerHeight != null
      ? Math.max(0, innerHeight - omniBarHeight - currentBoxHeightRef.current)
      : nextY

    if (innerWidth != null) {
      nextX = Math.min(Math.max(nextX, 0), maxX)
    }
    if (innerHeight != null) {
      nextY = Math.min(Math.max(nextY, 0), maxY)
    }
    return { x: nextX, y: nextY }
  }

  function dragMove(e) {
    e.preventDefault()

    const el = boxRef.current
    if (!el) {
      return
    }

    let next = clampPosition(
      (e.pageX - wrapperLeftPos) - offsetXRef.current,
      (e.pageY - wrapperTopPos) - offsetYRef.current
    )

    boxTransformXRef.current = next.x
    boxTransformYRef.current = next.y

    el.style.transform = `translate(${boxTransformXRef.current}px, ${boxTransformYRef.current}px)`
  }

  function dragAdd(e) {
    e.preventDefault()
    e.stopPropagation()

    const el = boxRef.current
    if (!el) {
      return
    }

    removeActiveListeners()
    isDraggingRef.current = true

    let elRect = el.getBoundingClientRect()
    offsetXRef.current = e.clientX - elRect.left
    offsetYRef.current = e.clientY - elRect.top + omniBarHeight

    // Keep receiving moves even when cursor crosses the rrweb iframe underneath
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
      activeListenersRef.current.captureTarget = e.currentTarget
    } catch (err) {
      // older browsers — document listeners still help when not over iframe
    }

    activeListenersRef.current.move = dragMove
    activeListenersRef.current.up = dragRemove

    window.document.addEventListener('pointermove', dragMove)
    window.document.addEventListener('pointerup', dragRemove)
  }

  function dragRemove(e) {
    isDraggingRef.current = false

    if (isMountedRef.current) {
      onChange()
    }

    const captureTarget = activeListenersRef.current.captureTarget
    removeActiveListeners()

    if (captureTarget && captureTarget.releasePointerCapture && e) {
      try {
        captureTarget.releasePointerCapture(e.pointerId)
      } catch (err) {
        // ignore
      }
    }
  }

  function resizeMove(type) {
    return function (e) {
      let newBoxWidth, newBoxHeight, offsetMarginX, offsetMarginY, offsetX, offsetY

      let el = boxRef.current
      if (!el) {
        return
      }

      let transformStr = el.style.transform
      if (!transformStr || transformStr === 'none' || transformStr === '') {
        const computedStyle = window.getComputedStyle(el)
        transformStr = computedStyle.transform
        if (transformStr && transformStr !== 'none') {
          const matrixMatch = transformStr.match(/matrix\(([^)]+)\)/)
          if (matrixMatch) {
            const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()))
            boxTransformXRef.current = values[4] || boxTransformXRef.current
            boxTransformYRef.current = values[5] || boxTransformYRef.current
          }
        }
      } else {
        try {
          let transformArr = transformStr.split('(')[1].split(',')
          boxTransformXRef.current = parseFloat(transformArr[0].slice(0, -2))
          boxTransformYRef.current = parseFloat(transformArr[1].slice(0, -3))
        } catch (err) {
          // keep current ref values
        }
      }

      let boxTransformX = boxTransformXRef.current
      let boxTransformY = boxTransformYRef.current
      let currentBoxWidth = currentBoxWidthRef.current
      let currentBoxHeight = currentBoxHeightRef.current

      if (type === resizeTypes.bottomRight) {

        currentBoxWidthRef.current = e.clientX - el.getBoundingClientRect().left
        currentBoxHeightRef.current = e.clientY - el.getBoundingClientRect().top

      } else if (type === resizeTypes.bottomLeft) {

        newBoxWidth = el.getBoundingClientRect().right - e.clientX
        newBoxHeight = e.clientY - el.getBoundingClientRect().top

        offsetMarginX = newBoxWidth - currentBoxWidth
        offsetMarginY = newBoxHeight - currentBoxHeight

        currentBoxWidthRef.current = newBoxWidth
        currentBoxHeightRef.current = newBoxHeight

        offsetX = boxTransformX - offsetMarginX
        offsetY = boxTransformY

        boxTransformXRef.current = offsetX
        boxTransformYRef.current = offsetY
        el.style.transform = `translate(${offsetX}px, ${offsetY}px)`

      } else if (type === resizeTypes.topLeft) {

        newBoxWidth = el.getBoundingClientRect().right - e.clientX
        newBoxHeight = el.getBoundingClientRect().bottom - e.clientY

        offsetMarginX = newBoxWidth - currentBoxWidth
        offsetMarginY = newBoxHeight - currentBoxHeight

        currentBoxWidthRef.current = newBoxWidth
        currentBoxHeightRef.current = newBoxHeight

        offsetX = boxTransformX - offsetMarginX
        offsetY = boxTransformY - offsetMarginY

        boxTransformXRef.current = offsetX
        boxTransformYRef.current = offsetY
        el.style.transform = `translate(${offsetX}px, ${offsetY}px)`

      } else if (type === resizeTypes.topRight) {

        newBoxWidth = e.clientX - el.getBoundingClientRect().left
        newBoxHeight = el.getBoundingClientRect().bottom - e.clientY

        offsetMarginX = newBoxWidth - currentBoxWidth
        offsetMarginY = newBoxHeight - currentBoxHeight

        currentBoxWidthRef.current = newBoxWidth
        currentBoxHeightRef.current = newBoxHeight

        offsetX = boxTransformX
        offsetY = boxTransformY - offsetMarginY

        boxTransformXRef.current = offsetX
        boxTransformYRef.current = offsetY
        el.style.transform = `translate(${offsetX}px, ${offsetY}px)`
      }

      el.style.width = currentBoxWidthRef.current + 'px'
      el.style.height = currentBoxHeightRef.current + 'px'
    }
  }

  function resizeAdd(type) {
    return function (e) {
      e.preventDefault()
      e.stopPropagation()

      removeActiveListeners()
      isDraggingRef.current = true

      try {
        e.currentTarget.setPointerCapture(e.pointerId)
        activeListenersRef.current.captureTarget = e.currentTarget
      } catch (err) {
        // ignore
      }

      let resizeMoveFunction = resizeMove(type)
      const onRemove = resizeRemoveClosure(resizeMoveFunction)

      activeListenersRef.current.move = resizeMoveFunction
      activeListenersRef.current.up = onRemove

      window.document.addEventListener('pointermove', resizeMoveFunction)
      window.document.addEventListener('pointerup', onRemove)
    }
  }

  function resizeRemoveClosure(resizeMoveFunction) {
    return function onRemove(e) {
      isDraggingRef.current = false

      if (isMountedRef.current) {
        onChange()
      }

      const captureTarget = activeListenersRef.current.captureTarget

      if (activeListenersRef.current.move === resizeMoveFunction) {
        window.document.removeEventListener('pointermove', resizeMoveFunction)
        activeListenersRef.current.move = null
      }
      if (activeListenersRef.current.up === onRemove) {
        window.document.removeEventListener('pointerup', onRemove)
        activeListenersRef.current.up = null
      }
      activeListenersRef.current.captureTarget = null

      if (captureTarget && captureTarget.releasePointerCapture && e) {
        try {
          captureTarget.releasePointerCapture(e.pointerId)
        } catch (err) {
          // ignore
        }
      }
    }
  }


  return <RL.Box $y={y} $x={x} $boxWidth={boxWidth} $boxHeight={boxHeight} ref={boxRef}>
      <RL.InnerBox />
      <RL.LeftLine/>
      <RL.RightLine/>
      <RL.BottomLine/>
      <RL.TopLine/>
      <RL.LeftTopCorner onPointerDown={resizeAdd(resizeTypes.topLeft)}/>
      <RL.LeftBottomCorner onPointerDown={resizeAdd(resizeTypes.bottomLeft)}/>
      <RL.RightTopCorner onPointerDown={resizeAdd(resizeTypes.topRight)}/>
      <RL.RightBottomCorner onPointerDown={resizeAdd(resizeTypes.bottomRight)}/>
      <RL.ButtonsWrapper
        onPointerDown={(e) => {
          e.stopPropagation()
        }}
      >
        <RL.MoveButton
          title="Drag to move pointer region"
          onPointerDown={dragAdd}
        >
          <DragOutlined/>
          <RL.ButtonText>Move</RL.ButtonText>
        </RL.MoveButton>
      </RL.ButtonsWrapper>
    </RL.Box>
}

const RL = {
  Wrapper: styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
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
    transform: translate(${({$x, $y}) => $x + 'px, ' + $y + 'px'});
    /* Hollow like ZoomSpan: clicks pass through interior to content underneath */
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
    border-radius: 9999px;
    pointer-events: auto;
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
    border-radius: 9999px;
    pointer-events: auto;
    background-color: ${Colors.primaryColor};
    border: 2px solid white;
  `,
  ButtonsWrapper: styled.div`
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    width: max-content;
    max-width: calc(100% - 16px);
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
  `
}

export default RegionLite
