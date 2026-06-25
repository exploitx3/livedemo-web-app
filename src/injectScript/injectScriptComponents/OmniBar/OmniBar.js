import React from 'react'
import styled from 'styled-components'
import { LockFilled, ReloadOutlined } from '@ant-design/icons'
import Colors from '../../../constants/mainColors.js'
import AutoPlayToggle from '../AutoPlayToggle/AutoPlayToggle.js'
import CloseIcon from '../../assets/icons/closeIcon.svg'
import MinimizeIcon from '../../assets/icons/minimizeIcon.svg'
import MaximizeIcon from '../../assets/icons/maximizeIcon.svg'

const S = {
  OmniBar: styled.div`
    background: #f3f4f6;
    width: 100%;
    height: 40px;
    display: flex;
    padding: 0px 15px 0px 15px;
    position: relative;
    flex-direction: row;
    align-items: center;
    z-index: 999;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    ${({ $width }) => {
      if ($width < 150) {
        return `
                    padding: 0px 5px 0px 5px;
                    && .OmniBar__leftSide {
                        width: 20%;
                    }
                    && .OmniBar__rightSide {
                        width: 0%;
                        display: none;
                    }
                    && .OmniBar__url {
                        width: 80%
                    }

                    && .UrlWrapper__lockIcon {
                        display: none;
                    }

                    && .UrlWrapper__urlName {
                        margin: 2px;
                    }
                `
      }

      if ($width < 305) {
        return `
                padding: 0px 5px 0px 5px;

                && .OmniBar__leftSide {
                    width: 15%;
                }
                && .OmniBar__rightSide {
                    width: 25%;
                }

                && .OmniBar__url {
                    width: 60%;
                }
            `
      }
    }} @media (
    max-width: 420px) {
    && span.OmniBar__leftSide {
      min-width: 25%;
    }

    && span.OmniBar__url {
      min-width: 70%;
    }

    && span.OmniBar__rightSide {
      width: 0px;
      display: none
    }
  }


    @media (max-width: 390px) {
      && .OmniBar__exitBtn,
      && .OmniBar__minimizeBtn {
        display: none
      }

      && .OmniBar__maximizeBtn {
        margin: 0 auto;
      }

      && span.OmniBar__leftSide {
        min-width: 15%;
      }

      && span.OmniBar__url {
        min-width: 85%;
      }

    }

  `,

  OmniBar_Container: styled.span`
    width: 20%;

    &&.rightSide {
      @media (max-width: 400px) {
        width: 0px;
      }
    }

    &&.leftSide {
      @media (max-width: 400px) {
        width: 33vw;
      }
    }
  `,

  OmniBar__LineSpace: styled.span`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
  `,

  OmniBar__StepIndicator: styled.p`
    margin: 0px 10px;
    padding-left: 15px;
    color: ${Colors.primaryColor};
    font-weight: 550;
  `,

  OmniBar__urlWrapperLeft: styled.span`
    width: 15%;
  `,

  OmniBar__urlWrapperRight: styled.span`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    width: 45px;
  `,

  OmniBar__urlWrapperInner: styled.span`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;

    flex-grow: 1;
    max-width: 65%;

    @media (max-width: 400px) {
      width: 75%;
    }
  `,

  OmniBar__urlWrapper: styled.span`
    height: 30px;
    width: 60%;
    background-color: #e5e7eb;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    border-radius: 8px;
  `,

  UrlName: styled.p`
    margin: 0px;
    font-size: 0.8em;
    color: rgba(0, 0, 0, 0.65);
    font-family: ${Colors.fontFamilyApple};
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  `,

  UrlReload: styled(ReloadOutlined)`
    width: ${({ $width = 16 }) => $width}px;
    height: ${({ $height = 16 }) => $height}px;
    margin-left: 10px;
    margin-right: 10px;

    && svg {
      width: 100%;
      height: 100%;
      fill: ${({ $fill = '#9ca3af' }) => $fill};
    }

    cursor: pointer;

    &&:hover svg {
      fill: #333;
    }
  `,

  UrlLock: styled(LockFilled)`
    width: ${({ $width = 14 }) => $width}px;
    height: ${({ $height = 14 }) => $height}px;
    margin-left: 10px;
    margin-right: 10px;

    && svg {
      fill: ${({ $fill = '#9ca3af' }) => $fill};
      width: 100%;
      height: 100%;
    }
  `,

  OmniBar__Buttons: styled.span`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    max-width: 65px;
    height: 100%;
  `,

  ButtonIcon: styled.span`
    width: 16px;
    height: 16px;

    && img {
      width: 100%;
      height: 100%;
    }
  `,

  AudioToggleBtn: styled.div`
    display: flex;
    cursor: pointer;
    align-items: center;
    overflow: hidden;
    border-radius: 0.5rem;
    padding: 6px;
    color: #fff;
    background-color: ${({ $isAudioEnabled }) => $isAudioEnabled ? '#4d77b7' : 'rgba(77, 119, 183, 0.8)'};
    transition: all 0.15s cubic-bezier(0.6, 0.6, 0, 1);
    width: 26px;

    &&:hover {
      background-color: ${({ $isAudioEnabled }) => $isAudioEnabled ? '#4d77b7' : 'rgba(77, 119, 183, 0.9)'};
    }

    && svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      transition: all 0.15s cubic-bezier(0.6, 0.6, 0, 1);
    }
  `,

  AudioToggleLabel: styled.span`
    font-size: 0.75rem;
    font-family: ${Colors.fontFamilyApple};
    line-height: 14px;
    font-weight: 600;
    white-space: nowrap;
    margin-left: 6px;
    transition: opacity 0.15s cubic-bezier(0.6, 0.6, 0, 1);
    opacity: 0;
  `,
}

const SoundOnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M19.748 5A11.95 11.95 0 0 1 22 12c0 2.612-.835 5.03-2.252 7M15.745 8A6.97 6.97 0 0 1 17 12a6.97 6.97 0 0 1-1.255 4M9.635 4.366 6.468 7.53c-.173.173-.26.26-.36.322a1 1 0 0 1-.29.12C5.704 8 5.582 8 5.337 8H3.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C2 8.76 2 9.04 2 9.6v4.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C2.76 16 3.04 16 3.6 16h1.737c.245 0 .367 0 .482.028a1 1 0 0 1 .29.12c.1.061.187.148.36.32l3.165 3.166c.429.429.643.643.827.657a.5.5 0 0 0 .42-.174c.119-.14.119-.443.119-1.048V4.93c0-.606 0-.908-.12-1.049a.5.5 0 0 0-.42-.173c-.183.014-.397.228-.826.657"
      vectorEffect="non-scaling-stroke" />
  </svg>
)

const SoundOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M9.635 4.366 6.468 7.53c-.173.173-.26.26-.36.322a1 1 0 0 1-.29.12C5.704 8 5.582 8 5.337 8H3.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C2 8.76 2 9.04 2 9.6v4.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C2.76 16 3.04 16 3.6 16h1.737c.245 0 .367 0 .482.028a1 1 0 0 1 .29.12c.1.061.187.148.36.32l3.165 3.166c.429.429.643.643.827.657a.5.5 0 0 0 .42-.174c.119-.14.119-.443.119-1.048V4.93c0-.606 0-.908-.12-1.049a.5.5 0 0 0-.42-.173c-.183.014-.397.228-.826.657M17 7l-6 6m0-6 6 6"
      vectorEffect="non-scaling-stroke" />
  </svg>
)

const OmniBar = ({
  width,
  storyName,
  isInEditor,
  stepIndexValue,
  isAutoPlayActive,
  setIsAutoPlayActive,
  isAudioEnabled,
  shouldShowAudio,
  setIsAudioEnabled,
  onExitFullScreen,
  onMinimize,
  onFullScreenButtonClick,
  onReload,
}) => {
  return (
    <S.OmniBar $width={width}>
      <S.OmniBar_Container className={'OmniBar__leftSide'}>
        <S.OmniBar__Buttons>
          <S.ButtonIcon className={'OmniBar__exitBtn'} onClick={onExitFullScreen}>
            <img src={CloseIcon} />
          </S.ButtonIcon>
          <S.ButtonIcon className={'OmniBar__minimizeBtn'} onClick={onMinimize}>
            <img src={MinimizeIcon} />
          </S.ButtonIcon>
          <S.ButtonIcon className={'OmniBar__maximizeBtn'} style={{ cursor: 'pointer' }}
            onClick={onFullScreenButtonClick}>
            <img src={MaximizeIcon} />
          </S.ButtonIcon>
        </S.OmniBar__Buttons>
      </S.OmniBar_Container>

      <S.OmniBar__urlWrapper className={'OmniBar__url'}>
        <S.OmniBar__urlWrapperLeft className={'UrlWrapper__leftSide'}>
        </S.OmniBar__urlWrapperLeft>
        <S.OmniBar__urlWrapperInner className={'UrlWrapper__urlWrapper'}>
          <S.UrlLock className={'UrlWrapper__lockIcon'} />
          <S.UrlName className={'UrlWrapper__urlName'}>{storyName || ''}</S.UrlName>
        </S.OmniBar__urlWrapperInner>

        <S.OmniBar__urlWrapperRight className={'UrlWrapper__rightSide'}>
          <S.UrlReload onClick={onReload} />
        </S.OmniBar__urlWrapperRight>
      </S.OmniBar__urlWrapper>

      <S.OmniBar_Container className={'OmniBar__rightSide'}>
        <S.OmniBar__LineSpace>
          {isInEditor ? '' : (
            <AutoPlayToggle isAutoPlayActive={isAutoPlayActive}
              setIsAutoPlayActive={setIsAutoPlayActive} />
          )}
          {!isInEditor ? '' : (
            <S.OmniBar__StepIndicator>
              Step {stepIndexValue}
            </S.OmniBar__StepIndicator>
          )}
          {shouldShowAudio && (
            <S.AudioToggleBtn
            role="switch"
            $isAudioEnabled={isAudioEnabled}
            aria-checked={isAudioEnabled}
            aria-label={isAudioEnabled ? 'Turn sound off' : 'Turn sound on'}
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          >
            {isAudioEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
            <S.AudioToggleLabel aria-hidden="true">
              {isAudioEnabled ? 'Sound ON' : 'Sound OFF'}
            </S.AudioToggleLabel>
          </S.AudioToggleBtn>
          )}
        </S.OmniBar__LineSpace>
      </S.OmniBar_Container>
    </S.OmniBar>
  )
}

export default OmniBar
