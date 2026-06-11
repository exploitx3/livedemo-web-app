import React, { useEffect, useRef, useMemo, useState } from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'
import { CloseOutlined } from '@ant-design/icons'

function EmbedView({
    step,
    onNext,
    onBack,
    size,
    themeBackgroundColor,
    themeTextColor,
    themeButtonBackgroundColor,
    themeButtonTextColor,
}) {
    const containerRef = useRef(null)

    let nextButtonText = (step.view && step.view.nextButtonText) || 'Next'
    let showStepNumbers = (step.view && step.view.showStepNumbers)
    let showFooter = step.view.showFooter
    let embedHtmlContent = step.view && step.view.popup && step.view.popup.embedHtmlContent

    let nextButtonTextString = nextButtonText ? nextButtonText : 'Next'
    let stepNumbersString = showStepNumbers ? `(${step.index + 1}/${size})` : ''

    function decodeAndSanitize(raw) {
        if (!raw || !raw.trim()) return ''
        let decoded = raw
        try {
            const attempt = atob(raw)
            if (attempt.includes('<')) decoded = attempt
        } catch (e) {
            // not base64 — use raw
        }
        return decoded
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/(?<!:)\/\/[^\n]*/g, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
    }

    const [decodedHtml, setDecodedHtml] = useState(() => decodeAndSanitize(embedHtmlContent))

    useEffect(() => {
        setDecodedHtml(decodeAndSanitize(embedHtmlContent))
    }, [embedHtmlContent])

    const sanitizedHtml = decodedHtml

    const sandboxSrcdoc = useMemo(() => {
        if (!sanitizedHtml) return ''
        return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>body{margin:0;padding:0;overflow:auto;}</style></head>
<body>${sanitizedHtml}</body></html>`
    }, [sanitizedHtml])

    return (
        <E.Wrapper themeBackgroundColor={themeBackgroundColor} arrowColor={themeBackgroundColor}>
            <E.WrapperInner>
                <E.ContentWrapper>
                    {sanitizedHtml ? (
                        <E.SandboxFrame
                            ref={containerRef}
                            srcDoc={sandboxSrcdoc}
                            sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
                            title="embed"
                        />
                    ) : (
                        <E.EmptyState>No embed content configured.</E.EmptyState>
                    )}
                </E.ContentWrapper>
              
            </E.WrapperInner>
        </E.Wrapper>
    )
}

const E = {
    WrapperInner: styled.div`
        height: 100%;
        width: 100%;
    `,
    Wrapper: styled.div.withConfig({
        shouldForwardProp: (prop) => !['themeBackgroundColor', 'themeTextColor', 'arrowColor'].includes(prop),
    })`
        transition: 0.5s all ease-out;
        transform-origin: top left;
        font-size: 1.5vw;
        font-family: ${Colors.fontFamilyApple};
        min-width: 32vw;
        max-width: 90%;
        width: 90%;
        height: 90%;
        max-height: 90%;
        padding: 10px;
        
        // background: ${({ themeBackgroundColor }) => themeBackgroundColor};
        border-radius: 5px;
        box-sizing: border-box;
        color: ${({ themeTextColor }) => themeTextColor};
        // border: 1px solid ${({ themeBackgroundColor }) => themeBackgroundColor};

        #arrow,
        #arrow::before {
            position: absolute;
            width: 18px;
            height: 18px;
            background: ${({ themeBackgroundColor }) => themeBackgroundColor};
        }

        #arrow { visibility: hidden; }

        #arrow::before {
            visibility: visible;
            content: '';
            transform: rotate(45deg);
        }
    `,
    ContentWrapper: styled.div`
        width: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        max-height: 100%;
        height: 100%;
        display: block;
        font-size: 1.4vw;
        padding: 5px 20px;

        // @media (min-width: 1200px) {
        //     max-height: 240px;
        // }

        &&::-webkit-scrollbar-track {
            border-radius: 10px;
            background-color: transparent;
        }

        &&::-webkit-scrollbar {
            width: 5px;
            background-color: transparent;
        }

        &&::-webkit-scrollbar-thumb {
            border-radius: 10px;
            background-color: ${Colors.primaryColor};
        }

        &&::-webkit-scrollbar-thumb:hover {
            background-color: ${Colors.primaryColorDarker};
        }
    `,
    SandboxFrame: styled.iframe`
        width: 100%;
        height: 100%;
        min-height: 200px;
        border: none;
        display: block;
    `,
    EmptyState: styled.p`
        color: ${Colors.primaryText};
        font-size: 1em;
        text-align: center;
        padding: 20px 0;
    `,
    LeftButtonsWrapper: styled.span``,
    RightButtonsWrapper: styled.span``,
    TooltipFooter: styled.div`
        align-items: center;
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
        height: 30%;
        padding: 5px 15px 15px 15px;

        && .TooltipContent__Button {
            font-size: 1.4rem;
            line-height: 1;
            padding: 8px;
            appearance: none;
            margin-left: auto;
            margin-right: 5px;
            font-weight: 600;
        }
    `,
    EmptyFooter: styled.div`
        padding-bottom: 0;
    `,
    BackButton: styled.button`
        background-color: transparent;
        border: 0px;
        border-radius: 0px;
        color: ${(props) => props.themeTextColor};
        cursor: pointer;
        font-size: 1.4vw;
        line-height: 1;
        padding: 8px;
        appearance: none;
        margin-left: auto;
        margin-right: 5px;
        font-weight: 600;
    `,
    NextButton: styled.button`
        background-color: ${(props) => props.themeButtonBackgroundColor};
        border: 0px;
        border-radius: 4px;
        color: ${({ themeButtonTextColor }) => themeButtonTextColor};
        cursor: pointer;
        font-size: 1.4vw;
        line-height: 1;
        padding: 8px;
        appearance: none;
        font-weight: 600;
    `,
    FormattedMessage: styled.p`
        margin: 0px;
    `,
    CloseIcon: styled(CloseOutlined)`
        position: absolute;
        right: 15px;
        top: 15px;
        cursor: pointer;

        && svg {
            transition: 0.3s ease-in-out;
            fill: #a1a1a1;
        }

        &&:hover svg {
            fill: #f9f9f9;
        }
    `,
}

export default EmbedView
