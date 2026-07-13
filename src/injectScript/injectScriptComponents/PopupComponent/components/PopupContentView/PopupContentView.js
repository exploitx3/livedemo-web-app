import React from 'react'
import styled from 'styled-components'
import Colors from '../../../../../constants/mainColors.js'
import PopupButton from '../PopupButton/PopupButton.js'

/*
  Layout rules based on alignment:
    left   → text occupies left ~50%, image floats right — partially overflows right + bottom edge
    right  → text occupies right ~50%, image floats left — partially overflows left + bottom edge
    center → text on top, image floats below — partially overflows bottom edge, centered
*/

const PopupContentView = ({
    popupTitle,
    popupDescription,
    buttons,
    alignment,      // 'start' | 'end' | 'center'
    rawAlignment,   // 'left' | 'right' | 'center'
    titleFontSize,
    textFontSize,
    buttonFontSize,
    showPreviewImage,
    previewImageUrl,
    liveDemo,
    changeToScreen,
    onNext,
}) => {
    const hasImage = showPreviewImage && previewImageUrl

    const textContent = (
        <>
            <C.Title alignment={alignment} titleFontSize={titleFontSize}>{popupTitle}</C.Title>
            <C.Spacer />
            {popupDescription === '<p></p>' ? null : (
                <C.Description
                    alignment={alignment}
                    textFontSize={textFontSize}
                    dangerouslySetInnerHTML={{ __html: popupDescription }}
                />
            )}
            <C.Spacer />
            <C.ButtonsWrapper alignment={alignment} showPreviewImage={!!showPreviewImage}>
                {buttons.map(popupButton => (
                    <PopupButton
                        fontSize={buttonFontSize}
                        key={popupButton.index}
                        popupButton={popupButton}
                        storyDemo={liveDemo}
                        changeToScreen={changeToScreen}
                        onNext={onNext}
                        alignment={alignment}
                    />
                ))}
            </C.ButtonsWrapper>
        </>
    )

    if (!hasImage) {
        return <C.TextOnly>{textContent}</C.TextOnly>
    }

    if (rawAlignment === 'center') {
        return (
            <C.CenterWrapper>
                <C.CenterTextBlock>{textContent}</C.CenterTextBlock>
                <C.CenterImageWrapper>
                    <C.PreviewImage src={previewImageUrl} alt="" aria-hidden="true" />
                </C.CenterImageWrapper>
            </C.CenterWrapper>
        )
    }

    // left or right: text takes left half, image floats on opposite side
    const imageOnRight = rawAlignment === 'left'

    return (
        <C.SideWrapper>
            <C.SideTextBlock imageOnRight={imageOnRight}>{textContent}</C.SideTextBlock>
            <C.SideImageWrapper imageOnRight={imageOnRight}>
                <C.PreviewImage src={previewImageUrl} alt="" aria-hidden="true" />
            </C.SideImageWrapper>
        </C.SideWrapper>
    )
}

const C = {
    /* ── no-image fallback ── */
    TextOnly: styled.div`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    `,

    /* ── left / right layout ── */
    SideWrapper: styled.div`
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: stretch;
        overflow: hidden;
    `,

    SideTextBlock: styled.div`
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        width: 50%;
        height: 100%;
        padding: 7% 0px 0px 35px;
        flex-shrink: 0;
        z-index: 1;
        /* when image is on the left, push text block to the right half */
        ${({ imageOnRight }) => !imageOnRight && 'margin-left: 50%;'}
    `,

    /*
      The image card mirrors the reference screenshot:
      - positioned absolute on the opposite side of the text
      - width ~85% of the container, top ~15%, bottom overflowing by ~6%
      - rounded corners + shadow, overflow visible so it peeks out
    */
    SideImageWrapper: styled.div`
        position: absolute;
        top: 12%;
        bottom: -6%;
        ${({ imageOnRight }) => imageOnRight
            ? 'left: 46%; right: -3%;'
            : 'right: 46%; left: -3%;'
        }
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18);
    `,

    /* ── center layout ── */
    CenterWrapper: styled.div`
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;
    `,

    CenterTextBlock: styled.div`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        max-height: 63%;
        /* text takes ~55% of height, leaving room for the image below */
        flex: 0 0 55%;
        padding: 3% 0 1%;
    `,

    CenterImageWrapper: styled.div`
        position: absolute;
        /* starts at ~50% so it overlaps the text slightly */
        top: 60%;
        bottom: -6%;
        left: 4%;
        right: 4%;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18);
    `,

    /* ── shared ── */
    PreviewImage: styled.img`
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top left;
        display: block;
    `,

    Spacer: styled.div`
        height: 4%;

        @media (max-height: 235px) {
            && {
                display: none;
            }
        }
    `,

    ButtonsWrapper: styled.div`
        display: flex;
        align-items: ${({ alignment }) => alignment};
        justify-content: ${({ alignment }) => alignment};
        flex-direction: ${({ alignment, showPreviewImage }) => showPreviewImage && alignment === 'center' ? 'row' : 'column'};
        gap: ${({ alignment }) => alignment === 'center' ? '10px' : '0px'};
        margin: 0;
        width: 85%;
        overflow-y: scroll;
        min-height: 95px;

        && {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        &&::-webkit-scrollbar {
            display: none;
        }

        padding: 1vw 0 0 0.85vw;
    `,

    Title: styled.p`
        text-align: ${({ alignment }) => alignment};
        width: 85%;
        font-size: ${({ titleFontSize }) => titleFontSize};
        color: white;
        font-family: ${Colors.fontFamilyApple};
        margin: 0;
        font-weight: 750;
        padding-left: 10px;

        @media (max-width: 391px) {
            max-height: 20%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `,

    Description: styled.p`
        text-align: ${({ alignment }) => alignment};
        max-height: 40%;
        font-size: ${({ textFontSize }) => textFontSize};
        color: white;
        font-family: ${Colors.fontFamilyApple};
        margin: 0;
        padding-left: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 85%;
        font-weight: 300;

        p:last-child {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        p:first-child { white-space: inherit; }
        p:not(:last-child) { white-space: inherit; }

        && p { margin: 0; }

        @media (max-height: 235px) {
            && { display: none; }
        }
    `,
}

export default PopupContentView
