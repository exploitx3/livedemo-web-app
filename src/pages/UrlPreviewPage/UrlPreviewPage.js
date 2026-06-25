


import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import UrlPreviewTopBar from './components/UrlPreviewTopBar'
import { connect } from 'react-redux'
import Logo from '../../static/images/logo-round.svg'
import Carousel from 'antd/es/carousel'
import 'antd/es/carousel/style'
import mainColors from '../../constants/mainColors'
import ENV from '../../config.json'
import axios from 'axios'
import Colors from '../../constants/mainColors'

const INITIAL_ROTATE_TEXT = [
  'A few seconds left...',
]

const RANDOM_LOADING_TEXT = [
  'Optimizing demo for space travel',
  'Exploiting rip in space-time continuum',
  'Measuring gravitational time dilation',
  'Disrupting warp fields with an inverse graviton burst',
  'Bypassing control of the matter-antimatter integrator',
  'Rupturing the subspace barrier',
  'Synergising impactful cut-through',
  'Squandering Earth\'s resources',
  'Please wait while the minions do their work',
  'Grabbing extra minions',
  'Doing the heavy lifting',
  'We\'re working very Hard .... Really',
  'Waking up the minions',
  'You are number 2843684714 in the queue',
  'Please wait while we serve other customers...',
  'Still faster than Windows update',
  'Our premium plan is faster',
  'Subliminally adding the word \'obey\' throughout your demo',
  'Primping, preening, and preparing pixels',
  'Herding loose pixels into a corral',
  'Processing stuff for your demo',
  'Getting distracted by squirrel',
  'Swiping right on your demo',
  'Pixelating nudity',
  'Cocking a quizzical eyebrow at your demo',
  'Caching text',
  'Syncing audio',
  'Measuring font',
  'Coloring icons',
  'Installing background',
  'Processing demo',
  'Looking busy',
  'Reticulating splines',
  'High-fiving server',
  'Baking demo in the oven',
  'Adding chocolate sprinkles',
  'Lovingly handcrafting demo',
  'Forging your demo in the heavenly fire of a million suns',
  'Removing cat paw prints from your demo',
  'Fighting off rogue pixels',
  'Seasoning pixels',
  'Roasting animations',
  'Blowing dust off server',
]

const shimmer = keyframes`
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
`

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  font-family: Inter, system-ui, sans-serif;
  color: #111827;
  -webkit-font-smoothing: antialiased;
`

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  height: 64px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  padding: 0 16px;
  z-index: 300;
  background: #fff;
  border-bottom: 1px solid #f3f4f6;
`

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  flex: 1 1 33%;
  font-size: 14px;
  color: #6b7280;
`

const Divider = styled.div`
  width: 1px;
  height: 20px;
  background: #e5e7eb;
  flex-shrink: 0;
  margin-left: 12px;
`

const GeneratingLabel = styled.span`
  font-size: 14px;
  color: #111;
  margin-left: 12px;
`

const RightSection = styled.div`
  display: flex;
  flex: 1 1 33%;
  align-items: center;
  justify-content: flex-end;
`

const EditButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  width: fit-content;
  padding: 0 15px;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
  border-radius: 6px;
  border: solid 1px #dae3f2;
  background: #1070ff;
  color: #fff;
  margin-left: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  user-select: none;
  outline: none;

  &:hover {
    background: #0058d9;
    border-color: #0058d9;
  }

  &:active {
    background: #0040b0;
    border-color: #0040b0;
  }

  &:disabled {
    background: rgba(0, 0, 0, 0.04);
    border-color: #d9d9d9;
    color: rgba(0, 0, 0, 0.25);
    cursor: not-allowed;
  }
`

const Body = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
`

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  flex-shrink: 0;
`

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 24px;
  padding: 16px;

  @media (min-width: 640px) {
    padding: 24px;
  }

  @media (min-width: 980px) {
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
`

const SidePanel = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  width: 100%;
  max-width: 304px;
  flex-direction: column;
  justify-content: center;
`

const SidePanelTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`

const ButtonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 32px;
`

const ActiveOptionButton = styled.button`
  position: relative;
  border: none;
  height: 36px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  border-radius: 12px;
  font-weight: 500;
  text-align: left;
  color: #6b7280;
  background: rgba(17, 24, 39, 0.03);
  transition: all 0.15s;

  &:hover {
    background: rgba(17, 24, 39, 0.06);
    color: #111827;
  }
`

const DisabledOptionButton = styled(ActiveOptionButton)`
  cursor: not-allowed;
  opacity: 0.3;

  &:hover {
    background: rgba(17, 24, 39, 0.03);
    color: #6b7280;
  }
`

const IconBox = styled.div`
  border: 1px solid rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 1px rgba(17, 24, 39, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  background: ${p => p.bg || '#f3f4f6'};
  transition: background 0.15s;
`

const SpinnerRing = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #d1d5db;
  border-top-color: #4b5563;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  flex-shrink: 0;
`

const PreviewArea = styled.div`
  position: relative;
  height: auto;
  min-height: 360px;
  width: 60%;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (min-width: 980px) {
    flex: 1;
    height: 100%;
    min-height: 0;
  }
`

const PreviewInner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  flex: 1;
  height: 100%;
  width: 100%;
  max-height: 800px;
  min-height: 480px;

  @media (min-width: 980px) {
    max-height: none;
  }
`

const PreviewCard = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 480px;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
`

const GlowBorder = styled.div`
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  border-radius: 16px;
  box-shadow:
    0 0 0 1px rgba(148, 163, 184, 0.18),
    inset 0 0 0 1px rgba(148, 163, 184, 0.22),
    inset 0 0 0 3px rgba(255, 255, 255, 0.16);
`

const IFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 16px;
`

const GeneratingText = styled.span`
  font-size: 14px;
  font-weight: 500;
  background: linear-gradient(
    90deg,
    rgba(17, 24, 39, 0.3) 0%,
    rgba(17, 24, 39, 0.5) 40%,
    rgba(17, 24, 39, 0.3) 60%,
    rgba(17, 24, 39, 0.3) 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 2s linear infinite;
  white-space: nowrap;
`

const LoadingCarousel = styled(Carousel)`
  width: 100%;
  max-width: 880px;

  && {
    z-index: 5;
  }

  && .slick-slider,
  && .slick-list,
  && .slick-track {
    height: 80px;
  }

  && .slick-slide {
    text-align: center;
    height: 80px;
    display: flex !important;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  && .slick-slide > div {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

const LoadingText = styled.p`
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
  font-size: 1.3em;
  font-weight: 500;
  font-family: ${mainColors.fontFamily};
  text-align: center;
  padding: 0 24px;
  margin: 0;
  line-height: 1.4;
  background: linear-gradient(
    90deg,
    rgba(17, 24, 39, 0.5) 0%,
    rgba(17, 24, 39, 0.9) 40%,
    rgba(17, 24, 39, 0.5) 60%,
    rgba(17, 24, 39, 0.5) 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 2s linear infinite;
`

const CenteredContent = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
`

const TextHolder = styled.div`
  font-size: 14px;
  font-weight: 500;
  height: 28px;
  min-width: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`

const DemoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: 14, height: 14, flexShrink: 0, strokeWidth: 1.5, color: '#2563eb' }}>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
      d="m3.507 5.415 5.127 14.833c.451 1.307 2.28 1.359 2.805.08l2.35-5.72a1.5 1.5 0 0 1 .818-.818l5.721-2.351c1.279-.525 1.227-2.354-.08-2.805L5.415 3.507C4.232 3.1 3.1 4.232 3.507 5.415" />
  </svg>
)

const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: 14, height: 14, flexShrink: 0, strokeWidth: 1.5, color: '#6b7280' }}>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
      d="M3 12h4.364M3 12V7.5M3 12v4.5M7.364 12h9.272m-9.272 0v4.5m0-4.5V7.5M3 7.5V6.273A3.273 3.273 0 0 1 6.273 3h1.09M3 7.5h4.364M3 16.5v1.227A3.273 3.273 0 0 0 6.273 21h1.09M3 16.5h4.364m9.272-4.5H21m-4.364 0v4.5m0-4.5V7.5m-9.272 9V21m0-13.5V3M21 12V7.5m0 4.5v4.5m-4.364 0V21m0-4.5H21m-4.364-9V3m0 4.5H21m0 0V6.273A3.273 3.273 0 0 0 17.727 3h-1.09M21 16.5v1.227A3.273 3.273 0 0 1 17.727 21h-1.09m0 0H7.363m9.272-18H7.364" />
  </svg>
)

const VisualsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: 14, height: 14, flexShrink: 0, strokeWidth: 1.5, color: '#6b7280' }}>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
      d="M12.177 6.82a2.727 2.727 0 1 1-5.454 0 2.727 2.727 0 0 1 5.454 0m-6.614 6.515c-1.077 0-1.992 1.1-2.697 2.4-.567 1.047-.851 1.57-.765 2.264.066.531.462 1.196.897 1.507.57.406 1.296.406 2.751.406h10.379c2.37 0 3.555 0 4.403-.598.668-.471 1.244-1.418 1.355-2.227.142-1.029-.315-1.913-1.23-3.683-1.2-2.321-2.408-3.398-3.57-3.301-3.248.269-4.673 5.357-6.546 5.357-1.557 0-3.01-2.125-4.977-2.125" />
  </svg>
)

function UrlPreviewPage({ authData }) {
  const [searchParams] = useSearchParams()
  const urlDemoId = searchParams.get('urlDemoId')
  const browserSessionId = searchParams.get('browserSessionId')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [urlDemo, setUrlDemo] = useState(null)
  const [storyDemo, setStoryDemo] = useState(null)
  const [hasDemoLoaded, setHasDemoLoaded] = useState(false)
  const pollIntervalRef = useRef(null)


  useEffect(() => {
    setIsAuthenticated(!!(authData && authData.token))
  }, [authData])

  useEffect(() => {
    if (!urlDemoId) return

    const poll = () => {
      axios.get(`${ENV.API_URL}/urldemos/${urlDemoId}?browserSessionId=${browserSessionId}`)
        .then((res) => {
          const demo = res.data
          setUrlDemo(demo)
          if (demo.status === 'completed' && demo.storyDoc) {
            clearInterval(pollIntervalRef.current)
            setStoryDemo(demo.storyDoc)
            setHasDemoLoaded(true)
          }
        })
        .catch((err) => {
          console.error('[UrlPreviewPage] poll error', err)
        })
    }

    poll()
    pollIntervalRef.current = setInterval(poll, 3000)

    return () => clearInterval(pollIntervalRef.current)
  }, [urlDemoId])

  const loadingTextArray = useMemo(
    () =>
      INITIAL_ROTATE_TEXT.concat(
        [...Array(RANDOM_LOADING_TEXT.length).keys()]
          .map(() => Math.floor(Math.random() * RANDOM_LOADING_TEXT.length))
          .map((randomIndex) => RANDOM_LOADING_TEXT[randomIndex])
      ),
    []
  )

  

  return (
    <Wrapper>
      <TopBar>
        <LeftSection>
          <a href={`${ENV.LANDING_URL}`} title="Home" style={{ display: 'flex', alignItems: 'center' }}>
            <img src={Logo} alt="LiveDemo" style={{ height: 20 }} />
          </a>
          <Divider />
          <GeneratingLabel>{hasDemoLoaded? storyDemo && storyDemo.name : 'Generating...'}</GeneratingLabel>
        </LeftSection>
        <RightSection>
          <EditButton
            disabled={!hasDemoLoaded}
            aria-disabled={!hasDemoLoaded}
            onClick={hasDemoLoaded ? () => window.location.href = `${ENV.APP_URL}/workspace/${storyDemo.workspaceId}/storydemo/${storyDemo._id}` : undefined}
          >Edit</EditButton>
        </RightSection>
      </TopBar>

      <Body>
        <MainContainer>
          <ContentArea>
            <SidePanel>
              <SidePanelTitle>Your demo is being created</SidePanelTitle>
              <ButtonList>
                <ActiveOptionButton>
                  <IconBox bg="#eff6ff">
                    <DemoIcon />
                  </IconBox>
                  <span style={{ paddingLeft: 8, paddingRight: 8 }}>Interactive Demo</span>
                  {!hasDemoLoaded ? <SpinnerRing /> : null}
                </ActiveOptionButton>
              </ButtonList>
            </SidePanel>

            <PreviewArea>
              <PreviewInner>
                {hasDemoLoaded && storyDemo ? (
                  <IFrame
                    src={`${ENV.STORIES_API}/workspaces/${storyDemo.workspaceId}/stories/${storyDemo._id}/preview?embed`}
                    frameBorder={'0'}
                    scrolling={'no'}
                    webkitallowfullscreen={true}
                    mozallowfullscreen={true}
                    allowFullScreen={true}
                    allow={'fullscreen'}
                    title={'LiveDemo Preview'}
                  />
                ) : (
                  <PreviewCard>
                    <GlowBorder />
                    <CenteredContent>
                      <LoadingCarousel
                        autoplay
                        dots={false}
                        autoplaySpeed={3900}
                        speed={800}
                        infinite
                        pauseOnHover={false}
                        slidesToShow={1}
                        slidesToScroll={1}
                      >
                        {loadingTextArray.map((text, index) => (
                          <LoadingText key={index}>{text}</LoadingText>
                        ))}
                      </LoadingCarousel>
                    </CenteredContent>
                  </PreviewCard>
                )}
              </PreviewInner>
            </PreviewArea>
          </ContentArea>
        </MainContainer>
      </Body>
    </Wrapper>
  )
}

function mapStateToProps(state) {
  return {
    authData: state.authReducer.authData,
  }
}

export default connect(mapStateToProps)(UrlPreviewPage)
