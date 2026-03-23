import React, {useRef} from 'react'
import styled from 'styled-components'
import Colors from '../../../../../constants/mainColors.js'
import { Button } from 'antd'

const resizeTypes = {
    topLeft: 'topLeft',
    topRight: 'topRight',
    bottomLeft: 'bottomLeft',
    bottomRight: 'bottomRight'
}

// React 19: This component uses ref.current internally, so we still need forwardRef
const ZoomRegion = React.forwardRef(({
                                         id,
                                         wrapperRef,
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
                                         isScaled,
                                         isTriggered,
                                         innerWidth,
                                         innerHeight,
                                         onClick,
                                         onPreview
                                     }, ref) => {


    let offsetX
    let offsetY

    let scaleMultiplierWidth = editorWidth === innerWidth ? 1 : innerWidth / editorWidth
    let scaleMultiplierHeight = editorHeight === innerHeight ? 1 : (innerHeight) / editorHeight

    let scaleMultiplier = editorHeight / editorWidth
    let scaleMultiplierNew = innerHeight / innerWidth

    let calculatedBoxWidth = initBoxWidth * scaleMultiplierWidth
    let calculatedBoxHeight = innerWidth * scaleMultiplier
    let boxWidth = useRef(calculatedBoxWidth)
    let boxHeight = useRef(calculatedBoxHeight)

    console.log('boxWidth')
    console.log(boxWidth)
    console.log('boxHeight')
    console.log(boxHeight)
    let boxTransformX = 0
    let boxTransformY = 0

    x = x * scaleMultiplierWidth
    y = y * scaleMultiplierHeight

    console.log(`ZoomRegion - x ${x}, y ${y}`)

    function onChange() {
        console.log('onChange triggered')
        let changeData = {
            x: boxTransformX,
            y: boxTransformY,
            width: boxWidth.current,
            height: boxHeight.current,
            data: data
        }

        onChangeHandler(changeData)
    }

    function dragMove(e) {
        const el = ref.current
        // const el = e.target

        // boxTransformX = e.pageX - offsetX
        // boxTransformY = e.pageY - offsetY

        boxTransformX = e.layerX - offsetX
        boxTransformY = e.layerY - offsetY

        el.style.transform = `translate(${boxTransformX}px, ${boxTransformY}px)`
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
            boxTransformX = parseFloat(transformArr[0].slice(0, -2))
            boxTransformY = parseFloat(transformArr[1].slice(0, -3))

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


                offsetX = boxTransformX - offsetMarginX
                offsetY = boxTransformY

                el.style.transform = `translate(${offsetX}px, ${offsetY}px)`

            } else if (type === resizeTypes.topLeft) {

                newBoxWidth = el.getBoundingClientRect().right - e.clientX
                // newBoxHeight = el.getBoundingClientRect().bottom - e.clientY
                newBoxHeight = newBoxWidth * scaleWidth

                offsetMarginX = newBoxWidth - boxWidth.current
                offsetMarginY = newBoxHeight - boxHeight.current

                boxWidth.current = newBoxWidth
                boxHeight.current = newBoxHeight


                offsetX = boxTransformX - offsetMarginX
                offsetY = boxTransformY - offsetMarginY

                el.style.transform = `translate(${offsetX}px, ${offsetY}px)`


            } else if (type === resizeTypes.topRight) {

                newBoxWidth = e.clientX - el.getBoundingClientRect().left
                // newBoxHeight = el.getBoundingClientRect().bottom - e.clientY
                newBoxHeight = newBoxWidth * scaleWidth

                offsetMarginX = newBoxWidth - boxWidth.current
                offsetMarginY = newBoxHeight - boxHeight.current

                boxWidth.current = newBoxWidth
                boxHeight.current = newBoxHeight


                offsetX = boxTransformX
                offsetY = boxTransformY - offsetMarginY

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


    return <RL.Box
        id={id}
        y={y} x={x} boxWidth={boxWidth.current} boxHeight={boxHeight.current} ref={ref}
                   style={{
                       transform: `translate(${x}px, ${y}px)`,
                       opacity: showed ? 1 : 0,
                       cursor: (isScaled ? 'zoom-out' : 'zoom-in'),
                       zIndex: (isTriggered ? '998' : '2')
                   }}
        onClick={onClick}
        >
        <RL.InnerBox onMouseDown={dragAdd}/>
        <RL.LeftLine/>
        <RL.RightLine/>
        <RL.BottomLine/>
        <RL.TopLine/>
        <RL.LeftTopCorner onMouseDown={resizeAdd(resizeTypes.topLeft)}/>
        <RL.LeftBottomCorner onMouseDown={resizeAdd(resizeTypes.bottomLeft)}/>
        <RL.RightTopCorner onMouseDown={resizeAdd(resizeTypes.topRight)}></RL.RightTopCorner>
        <RL.RightBottomCorner onMouseDown={resizeAdd(resizeTypes.bottomRight)}></RL.RightBottomCorner>
        <RL.ButtonsWrapper>
            <RL.PreviewButton
                onClick={() => {
                    onPreview()
                }}>
                <RL.ButtonText>Zoom Preview</RL.ButtonText>
            </RL.PreviewButton>
        </RL.ButtonsWrapper>
    </RL.Box>
})

const RL = {
    ButtonsWrapper: styled.div`
        position: absolute;
        bottom: -50px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 50px;

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
            background: `${Colors.primaryColor}`,
        },
        '&:active': {
            border: `solid 1px #dae3f2`,
            background: `${Colors.primaryColor}`,
        },
        '&:focus': {
            border: `solid 1px #dae3f2`,
            background: `${Colors.primaryColor}`,
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
        user-select: auto;
        width: ${({boxWidth}) => boxWidth}px;
        height: ${({boxHeight}) => boxHeight}px;
        display: inline-block;
        top: 0px;
        left: 0px;



        z-index: 2;
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

export default ZoomRegion
