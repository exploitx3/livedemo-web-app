import React, { useRef, useEffect } from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'

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
                      wrapperTopPos
}) {

  let boxRef = useRef(null)
  let offsetX
  let offsetY

  // Use refs to track transform values and dimensions since they're modified during drag/resize
  const boxTransformXRef = useRef(x)
  const boxTransformYRef = useRef(y)
  const currentBoxWidthRef = useRef(boxWidth)
  const currentBoxHeightRef = useRef(boxHeight)
  
  // Update refs when props change
  useEffect(() => {
    currentBoxWidthRef.current = boxWidth
    currentBoxHeightRef.current = boxHeight
    boxTransformXRef.current = x
    boxTransformYRef.current = y
  }, [boxWidth, boxHeight, x, y])

  // Track active event listeners for cleanup
  const activeListenersRef = useRef({
    mousemove: null,
    mouseup: null
  })
  const isMountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      // Clean up any active listeners on unmount
      if (activeListenersRef.current.mousemove) {
        window.document.removeEventListener('mousemove', activeListenersRef.current.mousemove)
        activeListenersRef.current.mousemove = null
      }
      if (activeListenersRef.current.mouseup) {
        window.document.removeEventListener('mouseup', activeListenersRef.current.mouseup)
        activeListenersRef.current.mouseup = null
      }
    }
  }, [])

  function onChange() {
    // console.log('onChange triggered')
    let changeData = {
      x: boxTransformXRef.current,
      y: boxTransformYRef.current,
      width: currentBoxWidthRef.current,
      height: currentBoxHeightRef.current,
      data: data
    }

    onChangeHandler(changeData)
  }

  function dragMove(e) {
    e.preventDefault()

    const el = boxRef.current

    boxTransformXRef.current = (e.pageX - wrapperLeftPos) - offsetX
    boxTransformYRef.current = (e.pageY - wrapperTopPos) - offsetY

    console.log(`offsetX = ${offsetX}, offsetY = ${offsetY}`)
    console.log(`boxTransformX = ${boxTransformXRef.current}, boxTransformY = ${boxTransformYRef.current}`)

    el.style.transform = `translate(${boxTransformXRef.current}px, ${boxTransformYRef.current}px)`
  }

  function dragAdd(e) {
    e.preventDefault()

    // Clean up any existing listeners first
    if (activeListenersRef.current.mousemove) {
      window.document.removeEventListener('mousemove', activeListenersRef.current.mousemove)
    }
    if (activeListenersRef.current.mouseup) {
      window.document.removeEventListener('mouseup', activeListenersRef.current.mouseup)
    }

    const el = e.target
    let elRect = el.getBoundingClientRect()

    offsetX = e.clientX - elRect.left
    offsetY = e.clientY - elRect.top + omniBarHeight

    console.log(`offsetX = ${offsetX}, offsetY = ${offsetY}`)

    // Store references for cleanup
    activeListenersRef.current.mousemove = dragMove
    activeListenersRef.current.mouseup = dragRemove

    window.document.addEventListener('mousemove', dragMove)
    window.document.addEventListener('mouseup', dragRemove)
  }

  function dragRemove(e) {
    const el = boxRef.current

    if (isMountedRef.current) {
      onChange()
    }

    if (activeListenersRef.current.mousemove) {
      window.document.removeEventListener('mousemove', activeListenersRef.current.mousemove)
      activeListenersRef.current.mousemove = null
    }
    if (activeListenersRef.current.mouseup) {
      window.document.removeEventListener('mouseup', activeListenersRef.current.mouseup)
      activeListenersRef.current.mouseup = null
    }
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

      let el = boxRef.current
      
      // Try to read transform from inline style first, fallback to computed style or ref values
      let transformStr = el.style.transform
      if (!transformStr || transformStr === 'none' || transformStr === '') {
        // If no inline transform, get from computed style
        const computedStyle = window.getComputedStyle(el)
        transformStr = computedStyle.transform
        if (transformStr && transformStr !== 'none') {
          // Parse matrix from computed style (matrix(a, b, c, d, tx, ty))
          const matrixMatch = transformStr.match(/matrix\(([^)]+)\)/)
          if (matrixMatch) {
            const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()))
            boxTransformXRef.current = values[4] || boxTransformXRef.current
            boxTransformYRef.current = values[5] || boxTransformYRef.current
          }
        }
        // If still no transform found, use current ref values (initialized from props)
      } else {
        // Parse from inline style (format: "translate(Xpx, Ypx)")
        try {
          let transformArr = transformStr.split('(')[1].split(',')
          boxTransformXRef.current = parseFloat(transformArr[0].slice(0, -2))
          boxTransformYRef.current = parseFloat(transformArr[1].slice(0, -3))
        } catch (err) {
          // If parsing fails, keep current ref values
          console.warn('Failed to parse transform:', transformStr)
        }
      }
      
      // Get current values from refs
      let boxTransformX = boxTransformXRef.current
      let boxTransformY = boxTransformYRef.current
      let currentBoxWidth = currentBoxWidthRef.current
      let currentBoxHeight = currentBoxHeightRef.current

      if (type === resizeTypes.bottomRight) {

        currentBoxWidthRef.current = e.clientX - el.getBoundingClientRect().left
        currentBoxHeightRef.current = e.clientY - el.getBoundingClientRect().top
        // el.style.transformOrigin = 'top left'

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

      // Update box dimensions in DOM
      el.style.width = currentBoxWidthRef.current + 'px'
      el.style.height = currentBoxHeightRef.current + 'px'
    }
  }

  function resizeAdd(type) {

    return function (e) {
      // Clean up any existing listeners first
      if (activeListenersRef.current.mousemove) {
        window.document.removeEventListener('mousemove', activeListenersRef.current.mousemove)
      }
      if (activeListenersRef.current.mouseup) {
        window.document.removeEventListener('mouseup', activeListenersRef.current.mouseup)
      }

      let resizeMoveFunction = resizeMove(type)
      const onRemove = resizeRemoveClosure(resizeMoveFunction)

      // Store references for cleanup
      activeListenersRef.current.mousemove = resizeMoveFunction
      activeListenersRef.current.mouseup = onRemove

      window.document.addEventListener('mousemove', resizeMoveFunction)
      window.document.addEventListener('mouseup', onRemove)
    }
  }

  function resizeRemoveClosure(resizeMoveFunction) {
    return function onRemove(e) {
      if (isMountedRef.current) {
        onChange()
      }

      if (activeListenersRef.current.mousemove === resizeMoveFunction) {
        window.document.removeEventListener('mousemove', resizeMoveFunction)
        activeListenersRef.current.mousemove = null
      }
      if (activeListenersRef.current.mouseup === onRemove) {
        window.document.removeEventListener('mouseup', onRemove)
        activeListenersRef.current.mouseup = null
      }
    }
  }


  return <RL.Box $y={y} $x={x} $boxWidth={boxWidth} $boxHeight={boxHeight} ref={boxRef}>
      <RL.InnerBox onMouseDown={dragAdd}/>
      <RL.LeftLine/>
      <RL.RightLine/>
      <RL.BottomLine/>
      <RL.TopLine/>
      <RL.LeftTopCorner onMouseDown={resizeAdd(resizeTypes.topLeft)}/>
      <RL.LeftBottomCorner onMouseDown={resizeAdd(resizeTypes.bottomLeft)}/>
      <RL.RightTopCorner onMouseDown={resizeAdd(resizeTypes.topRight)}/>
      <RL.RightBottomCorner onMouseDown={resizeAdd(resizeTypes.bottomRight)}/>
    </RL.Box>
}

const RL = {
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
    user-select: auto;
    width: ${({$boxWidth}) => $boxWidth}px;
    height: ${({$boxHeight}) => $boxHeight}px;
    display: inline-block;
    top: 0px;
    left: 0px;

    transform: translate(${({$x, $y}) => $x + 'px, ' + $y + 'px'});

    cursor: move;

    z-index: 3;
    //box-shadow: rgba(17, 24, 39, 0.5) 0px 0px 0px 100vmax;
    box-sizing: border-box;

    border: 2px solid ${Colors.primaryColor};

  `,
  InnerBox: styled.div`
    position: absolute;
    user-select: auto;
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

export default RegionLite
