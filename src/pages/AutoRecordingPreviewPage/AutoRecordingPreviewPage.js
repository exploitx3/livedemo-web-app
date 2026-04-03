import React, {useEffect, useRef, useState} from 'react'
//import { Carousel, Form, Layout, Menu, Modal, Tabs } from 'antd'
import Carousel from 'antd/es/carousel'
import Form from 'antd/es/form'
import Layout from 'antd/es/layout'
import Menu from 'antd/es/menu'
import Modal from 'antd/es/modal'
import Tabs from 'antd/es/tabs'

import 'antd/es/carousel/style'
import 'antd/es/form/style'
import 'antd/es/layout/style'
import 'antd/es/menu/style'
import 'antd/es/modal/style'
import 'antd/es/tabs/style'


import Header from './components/Header/Header'
import Spinner from '../../components/Spinner/Spinner'
import IconTextButton from '../../components/IconTextButton/IconTextButton'
import Icon from '../../components/Icon/Icon'
import {useLocation, useNavigate, useParams} from 'react-router-dom'
import styled from 'styled-components'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {updateCurrentSelectedWorkspace} from '../../actions/workspacesActions'
import {refreshToken} from '../../actions/authActions'
import {getWorkspaceEncryptionKey} from '../../actions/secureStorageActions'
import mainColors from '../.././constants/mainColors'
import AutoRecordingStatuses from '../.././constants/AutoRecordingStatuses'
import ENV from '../../config'
import axios from '../../utils/axiosInstance'


const {Content, Footer, Sider} = Layout
const {confirm} = Modal
const {getFieldDecorator} = Form
const {TabPane} = Tabs
const {SubMenu} = Menu


// const ROTATE_LOADING_TEXT = [
//   'Preparing your demo...',
//   'Optimizing demo for space travel',
//   'Exploiting rip in space-time continuum',
//   'Measuring gravitational time dilation',
//   'Disrupting warp fields with an inverse graviton burst',
//   'Bypassing control of the matter-antimatter integrator',
//   'Rupturing the subspace barrier',
//   'Synergising impactful cut-through',
//   'Squandering Earth’s resources',
//   'Please wait while the minions do their work',
//   'Grabbing extra minions',
//   'Doing the heavy lifting',
//   'We\'re working very Hard .... Really',
//   'Waking up the minions',
//   'You are number 2843684714 in the queue',
//   'Please wait while we serve other customers...',
//   'Still faster than Windows update',
//   'Our premium plan is faster',
//   ]


const INITIAL_ROTATE_TEXT = [
  'Preparing your recording...',
]
const RANDOM_LOADING_TEXT = [
  'Optimizing recording for space travel',
  'Exploiting rip in space-time continuum',
  'Measuring gravitational time dilation',
  'Disrupting warp fields with an inverse graviton burst',
  'Bypassing control of the matter-antimatter integrator',
  'Rupturing the subspace barrier',
  'Synergising impactful cut-through',
  'Squandering Earth’s resources',
  'Please wait while the minions do their work',
  'Grabbing extra minions',
  'Doing the heavy lifting',
  'We\'re working very Hard .... Really',
  'Waking up the minions',
  'You are number 2843684714 in the queue',
  'Please wait while we serve other customers...',
  'Still faster than Windows update',
  'Our premium plan is faster',
  'Subliminally adding the word ‘obey’ throughout your recording',
  'Disguising recording as washerwoman to get it out of jail',
  'Primping, preening, and preparing pixels',
  'Herding loose pixels into a corral',
  'Processing stuff for your recording',
  'Getting distracted by squirrel',
  'Swiping right on your recording',
  'Lowering recording into the sheep-dip',
  'Pixelating nudity',
  'Cocking a quizzical eyebrow at your recording',
  'Caching text',
  'Syncing audio',
  'Measuring font',
  'Coloring icons',
  'Installing background',
  'Processing recording',
  'Pumping up volume',
  'Going to lunch',
  'Looking busy',
  'Stapling clips together',
  'Squaring the serifs',
  'Adding that certain ‘je ne sais quoi’',
  'Giving recording a ‘noogie’',
  'Popping the bubble wrap your recording will be swaddled in',
  'Introducing recording to important industry figures',
  'Integrating kitchen sink',
  'Cocking a quizzical eyebrow at your recording',
  'Setting course for 373 mark 8',
  'Checking for spoilers',
  'Looking for plot holes',
  'Exploiting rip in space-time continuum',
  'Measuring gravitational time dilation',
  'Checking for trans-dimensional attunement',
  'Removing cat paw prints from your recording',
  'Fighting off rogue pixels',
  'Pixelating nudity',
  'Awakening render mice',
  'Fixing plot holes',
  'Unshackling animators',
  'Seasoning pixels',
  'Roasting animations',
  'Blowing dust off server',
  'Turning renderers to MAXIMUM CAPACITY',
  'Initializing internal grammatical debate over capitalization',
  'Compressing life out of your recording',
  'Reticulating splines',
  'Hanging finished scenes on the the line to dry',
  'Hammering square pixels into the round holes',
  'High-fiving server',
  'Glueing scenes together',
  'Baking recording in the oven',
  'Capturing escaped pixels',
  'Spreading marmalade on your recording',
  'Herding loose pixels into a corral',
  'Forging your recording in the heavenly fire of a million suns',
  'Inserting Rick-Roll at the end of your recording',
  'Sweeping extra pixels under the rug',
  'Preparing pixels for next scene, talk amongst yourselves for a second',
  'Flushing cat gifs from server memory to make room for your recording',
  'Noticing lack of cat gifs in your recording',
  'Giving it that ‘wow factor’',
  'Cleaning up spilled pixels',
  'Making your recording ‘shmick’',
  'Spooling your recording onto an ancient tape reel',
  'Adding chocolate sprinkles',
  'Creating each frame of the recording',
  'Ordering pixels into neat piles',
  'Sifting pixels to get rid of clumps',
  'Chomping pixels like a brandy snap',
  'Admiring your taste in music',
  'Analyzing your color choices (Freudian-style)',
  'Pushing files and things around',
  'Noticing lack of LOLcats in your recording',
  'Kneading recording with a rolling pin',
  'Sorting out where pixels fit',
  'Processing stuff for your recording',
  'Running recording up flagpole and saluting',
  'Throwing recording into the fiery maw of Mount Doom',
  'Launching Improbability Drive',
  'Turning recording over and shaking it to see if any change falls out',
  'Building recording like it’s going out of fashion',
  'Ordering pixels to get me a cup of coffee',
  'Checking use of ‘your’ and ‘you’re’',
  'Creating more pixels and stuff',
  'Overlaying text n’ stuff',
  'Nudging pixels gently into place',
  'Penalizing pixels for being offside',
  'Calibrating color profile with a hammer',
  'Optimizing recording for space travel',
  'Color matching recording to your socks',
  'Trying to focus on recording after a big night out',
  'Stitching recording together with yarn',
  'Calculating recording likeability',
  'Assembling pixel matrix',
  'Synergising impactful cut-through',
  'Reversing polarity of shield harmonics',
  'Adding bits and bobs',
  'Attaching bells and whistles',
  'Checking audio’s ‘got that swing’',
  'Lowering recording into the sheep-dip',
  'Going through recording with a fine-tooth comb',
  'Froofing up recording',
  'Giving recording a nice bouffant',
  'Giving recording an extreme makeover',
  'Lovingly handcrafting recording',
  'Challenging recording to a dance-off',
  'Disguising recording as washerwoman to get it out of jail',
  'What was I doing again? Oh yeah, your recording',
  'I like what you’ve done with your hair today',
  'Human saliva has a boiling point three times that of regular water. Fact!',
  'Getting distracted by squirrel',
  'Punishing bad pixels',
  'Stealing pixels from someone else’s recording',
  'Sweating small stuff',
  'Admiring cut of your jib',
  'Showing recording to my mom',
  'Buying pixels from the pixel shop',
  'Subliminally adding the word ‘obey’ throughout your recording',
  'Rolling recording into the shop and putting it up on the hoist',
  'Squandering Earth’s resources',
  'Swiping right on your recording'
]

const AutoRecordingPreviewPage = ({collapsed, currentSelectedWorkspace, authData}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  let [autoRecordingDoc, setAutoRecordingDoc] = useState(null)


  let [visibleStepsIndex, setVisibleStepsIndex] = useState(null)
  let [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(null)
  let checkUploadedTimer = useRef(null)

  const autoRecordingIdFromUrl = params.autoRecordingId


  let innerHeight = window.innerHeight
  let innerWidth = window.innerWidth

  console.log('authData ')
  console.log(JSON.stringify(authData, null, 2))

  console.log('currentSelectedWorkspace')
  console.log(JSON.stringify(currentSelectedWorkspace, null, 2))


  function getAutoRecording(workspaceId, autoRecordingId, authToken) {

    if (autoRecordingDoc && autoRecordingDoc._id) {
      return autoRecordingDoc
    }

    let url = `${ENV.STORIES_API}/workspaces/${workspaceId}/auto-recordings/${autoRecordingId}`

    return axios.get(url, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {
        return res.data
      })
  }

  function intervalCheckIfReady(workspaceId) {
    if (!workspaceId) {
      console.warn('workspaceId is required for intervalCheckIfReady');
      return;
    }

    let retryCount = 0

    checkUploadedTimer.current = setInterval(function () {
      getAutoRecording(workspaceId, autoRecordingIdFromUrl, authData.token)
        .then((autoRecordingDoc) => {

          if (autoRecordingDoc.status === AutoRecordingStatuses.completed || retryCount >= 30) {

            clearInterval(checkUploadedTimer.current)
            checkUploadedTimer.current = null

            setAutoRecordingDoc(autoRecordingDoc)
          }

          retryCount++

        })
    }, 3000)
  }


  useEffect(() => {
    // Handle fullscreen errors
    function handleError(event) {
      console.error('an error occurred changing into fullscreen');
      console.log(event);
    }

    document.addEventListener('fullscreenerror', handleError);

    // Check if currentSelectedWorkspace exists and has an _id before making API call
    const workspaceId = currentSelectedWorkspace?._id;
    if (!workspaceId) {
      console.warn('currentSelectedWorkspace is not available yet');
      return () => {
        document.removeEventListener('fullscreenerror', handleError);
      }
    }

    getAutoRecording(workspaceId, autoRecordingIdFromUrl, authData.token)
      .then((autoRecordingDoc) => {
        if (autoRecordingDoc.status !== AutoRecordingStatuses.completed) {
          intervalCheckIfReady(workspaceId)
        }
        setAutoRecordingDoc(autoRecordingDoc)
      })
      .catch(() => {
        navigate('/')
      })

    return () => {
      document.removeEventListener('fullscreenerror', handleError);
    }

  }, [currentSelectedWorkspace?._id, autoRecordingIdFromUrl, authData?.token, navigate])


  let wrapperHeight = '100%'

  let demoScalePercentage = autoRecordingDoc && autoRecordingDoc.windowMeasures && (autoRecordingDoc.windowMeasures.innerHeight / autoRecordingDoc.windowMeasures.innerWidth) * 100

  let scalePercentage = innerWidth > innerHeight ? (innerHeight / innerWidth) * 100 : (innerWidth / innerHeight) * 100

  if (demoScalePercentage) {
    scalePercentage = scalePercentage < demoScalePercentage ? demoScalePercentage : scalePercentage

    // wrapperHeight = innerWidth > innerHeight ? ((((scalePercentage / 100) * innerWidth) / innerHeight) * 100) + '%' : ((((scalePercentage / 100) * innerHeight) / innerWidth) * 100) + '%'

    // if (innerWidth < 500) {
    //   wrapperHeight = '100%'
    // }
  }

  /*
    Loading the initial text array and then loading on random all of the RANDOM_LOADING_TEXT strings
   */
  let LOADING_TEXT_ARRAY = INITIAL_ROTATE_TEXT
    .concat(
      [...Array(RANDOM_LOADING_TEXT.length).keys()]
        .map(() => Math.floor(Math.random() * RANDOM_LOADING_TEXT.length))
        .map((randomIndex) => RANDOM_LOADING_TEXT[randomIndex])
    )


  function generateLiveDemoFromDemoSuggestion(demoSuggestion, authToken) {

    if (!(demoSuggestion._id && demoSuggestion.workspaceId)) {
      throw new Error("Failed to generateLiveDemoFromDemoSuggestion")
    }

    let url = `${ENV.STORIES_API}/workspaces/${demoSuggestion.workspaceId}/demo-suggestions/${demoSuggestion._id}/generate-livedemo`

    return axios.post(url, {}, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {
        return res.data
      })
  }


  return (
    <React.Fragment>
      <Header
        workspaceName={autoRecordingDoc && autoRecordingDoc.workspaceId.name}
        liveDemoName={autoRecordingDoc && !!autoRecordingDoc.aiName ? autoRecordingDoc.aiName :
          (autoRecordingDoc && autoRecordingDoc.demoSuggestions) ? (autoRecordingDoc.demoSuggestions &&
            autoRecordingDoc.demoSuggestions.length > 0 &&
            autoRecordingDoc.demoSuggestions[0].name
          ) : ''
        }
        authData={authData}
        liveDemo={autoRecordingDoc}
        isAutoRecording={true}
        style={{boxShadow: 'none'}}
      />
      <S.Content>
        {autoRecordingDoc && autoRecordingDoc.status === AutoRecordingStatuses.completed ? (
          <S.Wrapper
            wrapperHeight={wrapperHeight}
          >
            <S.AutoRecordingDescriptionWrapper>
              <S.AutoRecordingTitle>Select an AI generated demo suggestion to be created into a
                LiveDemo</S.AutoRecordingTitle>
              <S.GenerateLiveDemoButtonWrapper>
                <IconTextButton
                  onClick={async () => {
                    // Handle generate LiveDemo action
                    if (autoRecordingDoc && selectedSuggestionIndex !== null) {
                      console.log('Generate LiveDemo for suggestion:', selectedSuggestionIndex)

                      let selectedSuggestion = autoRecordingDoc.demoSuggestions[selectedSuggestionIndex]
                      console.log('selectedSuggestion', JSON.stringify(selectedSuggestion, null, 2))

                      let liveDemoDoc = await generateLiveDemoFromDemoSuggestion(selectedSuggestion, authData.token)

                      let url = '/livedemos/' + liveDemoDoc._id
                      const newWindow = window.open(url, '_blank');
                      if (newWindow) {
                        newWindow.focus();
                      }


                    }
                  }}
                  img={
                    <S.LiveDemoIcon
                      width="24"
                      height="24"
                      viewBox="0 0 94 106"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        className="icon-inner-layer"
                        d="M0.5 6.85552C0.5 3.52841 3.43103 0.963143 6.72881 1.40402L76.0839 10.6761C85.7686 11.9708 93 20.2333 93 30.0041V82.0433C93 89.997 86.9798 96.6599 79.0668 97.4639L6.55596 104.831C3.31524 105.161 0.5 102.617 0.5 99.3595V6.85552Z"
                        fill={mainColors.primaryColor}
                        stroke="#999"
                      />
                      <path
                        className="icon-play"
                        d="M31 35.6795C31 31.0607 36 28.1739 40 30.4833L70 47.8039C74 50.1133 74 55.8868 70 58.1962L40 75.5167C36 77.8261 31 74.9393 31 70.3205L31 35.6795Z"
                        fill="white"
                      />
                      <path
                        className="icon-play"
                        d="M31 35.6795C31 31.0607 36 28.1739 40 30.4833L70 47.8039C74 50.1133 74 55.8868 70 58.1962L40 75.5167C36 77.8261 31 74.9393 31 70.3205L31 35.6795Z"
                        stroke={mainColors.primaryColor}
                        strokeWidth="3"
                      />
                      <path
                        className="icon-play-outline"
                        d="M31 35.6795C31 31.0607 36 28.1739 40 30.4833L70 47.8039C74 50.1133 74 55.8868 70 58.1962L40 75.5167C36 77.8261 31 74.9393 31 70.3205L31 35.6795Z"
                        stroke="white"
                        strokeOpacity="0.15"
                        strokeWidth="3"
                      />
                    </S.LiveDemoIcon>
                  }
                  text="Generate LiveDemo"
                  disabled={selectedSuggestionIndex === null}
                  buttonStyles={{
                    backgroundColor: selectedSuggestionIndex !== null ? `${mainColors.primaryColor} !important` : '#d9d9d9 !important',
                    color: selectedSuggestionIndex !== null ? '#111 !important' : '#FFF !important',
                    border: selectedSuggestionIndex !== null ? `2px solid ${mainColors.primaryColor} !important` : 'none',
                    cursor: selectedSuggestionIndex !== null ? 'pointer' : 'not-allowed',
                    opacity: selectedSuggestionIndex !== null ? 1 : 0.6,
                  }}
                  textStyles={{
                    color: selectedSuggestionIndex !== null ? '#FFF' : '#8c8c8c',
                    fontSize: '1em',
                  }}
                  isImgOnLeftSide={false}
                />
              </S.GenerateLiveDemoButtonWrapper>
            </S.AutoRecordingDescriptionWrapper>
            <S.AutoRecordingWrapper>
              {autoRecordingDoc && autoRecordingDoc.demoSuggestions && autoRecordingDoc.demoSuggestions.length > 0 && (
                <S.DemoSuggestionsList>
                  {autoRecordingDoc.demoSuggestions.map((suggestion, index) => {
                      let selected = selectedSuggestionIndex === index
                      let isStepsVisible = visibleStepsIndex === index

                      return (<S.DemoSuggestionItem
                        key={index}
                        onClick={() => {
                          if (selectedSuggestionIndex === index) {
                            setSelectedSuggestionIndex(null)
                            setVisibleStepsIndex(null)

                          } else {
                            setSelectedSuggestionIndex(index)
                            setVisibleStepsIndex(index)
                          }


                        }}
                        isSelected={selectedSuggestionIndex === index}
                      >
                        {suggestion.thumbnailImageData && (
                          <S.DemoSuggestionThumbnailWrapper>
                            <S.DemoSuggestionThumbnail
                              src={suggestion.thumbnailImageData}
                              alt={suggestion.name}
                            />
                          </S.DemoSuggestionThumbnailWrapper>
                        )}
                        <S.DemoSuggestionName
                          isSelected={selectedSuggestionIndex === index}>{suggestion.name}</S.DemoSuggestionName>
                        {suggestion.steps && suggestion.steps.length > 0 && (
                          <>
                            <IconTextButton
                              img={<S.Icon type={isStepsVisible ? 'down' : 'right'}/>}
                              text={'See steps'}

                              textStyles={{
                                fontSize: '1em',
                                color: selected ? '#111 !important' : '#FFF !important',

                              }}
                              buttonStyles={{
                                color: selected ? '#111 !important' : '#FFF !important',
                                boxShadow: 'none',
                                justifyContent: 'space-between',
                                width: 'auto',
                                height: '30px',
                                borderRadius: '6px',
                                marginTop: '15px',
                                background: selected ? 'white !important' : `${mainColors.primaryColor} !important`,
                                // '&&:hover': {
                                //   background: selected ? 'white' : mainColors.primaryColor,
                                // },
                                // '&& p:hover': {
                                //   color: selected ? 'white' : '#FFF',
                                // },
                                // '&&:focus': {
                                //   background: !selected ? 'white' : mainColors.primaryColor,
                                //   color: 'white'
                                // },
                                // '&& p:focus': {
                                //   color: !selected ? '#111' : '#FFF',
                                // }

                              }}
                              isImgOnLeftSide={false}

                            />
                            {isStepsVisible && (
                              <S.DemoSuggestionStepsList>
                                {suggestion.steps.map((step, stepIndex) => (
                                  <S.DemoSuggestionStepItem key={stepIndex}>
                                    <S.DemoSuggestionStepNumber>{stepIndex + 1}.</S.DemoSuggestionStepNumber>
                                    <S.DemoSuggestionStepExplanation>{step.explanation}</S.DemoSuggestionStepExplanation>
                                  </S.DemoSuggestionStepItem>
                                ))}
                              </S.DemoSuggestionStepsList>
                            )}
                          </>
                        )}
                      </S.DemoSuggestionItem>)
                    }
                  )}
                </S.DemoSuggestionsList>
              )}
            </S.AutoRecordingWrapper>
          </S.Wrapper>
        ) : (autoRecordingDoc && autoRecordingDoc.status !== AutoRecordingStatuses.completed ? (
            <S.Wrapper>
              <S.LoadingWrapper>
                <S.LoadingCarousel
                  autoplay={true}
                  dots={false}
                  autoplaySpeed={4500}
                  speed={800}

                  infinite={true}
                  pauseOnHover={false}
                  lazyLoad={'progressive'}
                  slidesToShow={1}
                  slidesToScroll={1}
                >
                  {LOADING_TEXT_ARRAY.map((text, index) => {

                    return <S.LoadingText key={index}>{text}</S.LoadingText>
                  })}
                </S.LoadingCarousel>
                <Spinner/>
              </S.LoadingWrapper>
            </S.Wrapper>
          ) : (autoRecordingDoc && autoRecordingDoc.status === AutoRecordingStatuses.FAILED ? (
            <S.Wrapper>
              <S.LoadingWrapper>
                <S.LoadingText>Demo failed to be processed, please record again</S.LoadingText>
              </S.LoadingWrapper>
            </S.Wrapper>
          ) : '')

        )
        }

      </S.Content>
    </React.Fragment>
  )
}

const S = {
  Icon: styled(Icon)`
    width: 15px;
    height: 15px;

    && svg {
      width: 100% !important;
      height: 100% !important;
    }
  `,

  Content: styled(Content)`
    && {
      background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
      overflow: scroll;
      width: 100%;
      height: 100%;
      padding: 60px 80px;

      @media screen and (max-width: 700px) {
        padding: 30px 20px;
      }
    }
  `,
  Wrapper: styled.div`
    width: 100%;
    max-width: 1400px;
    height: ${({wrapperHeight}) => (wrapperHeight ? wrapperHeight : '100%')};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    margin: 0 auto;

    @media screen and (max-width: 450px) {
      width: 100%;
    }

    //iphone 13
    @media only screen
    and (device-width: 390px)
    and (device-height: 844px)
    and (-webkit-device-pixel-ratio: 3) {
      height: 70%;
    }
  `,
  LoadingWrapper: styled.div`
    width: 100%;
    height: 100%;
    position: relative;

    //&& .spinner {
    //  width: 70px;
    //  height: 70px;
    //}
  `,
  LoadingCarousel: styled(Carousel)`
    && {
      z-index: 5;
    }

    && .slick-slide {
      text-align: center;
      height: 160px;
      line-height: 160px;
      overflow: hidden;
    }

    && .slick-slide h3 {
      color: #fff;
    }
  `,
  LoadingText: styled.h2`
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 100%;
    font-size: 1.7em;
    font-weight: 500;
    color: #111;
    font-family: ${mainColors.fontFamily};
    padding-bottom: 30px;
    text-align: center;

  `,
  Spinner: styled(Spinner)`
    &&.spinner {
      width: 100px;
      height: 100px;
    }
  `,
  AutoRecordingWrapper: styled.div`
    width: 100%;
    position: relative;
  `,
  DemoSuggestionsList: styled.div`
    display: flex;
    flex-direction: row;
    gap: 24px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 20px 10px 30px 10px;
    width: 100%;
    justify-content: center;

    &::-webkit-scrollbar {
      height: 10px;
    }

    &::-webkit-scrollbar-track {
      background: #f0f0f0;
      border-radius: 5px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 5px;

      &:hover {
        background: #a1a1a1;
      }
    }

    @media screen and (max-width: 700px) {
      gap: 16px;
      padding: 10px 5px 20px 5px;
    }
  `,
  DemoSuggestionItem: styled.div`
    height: fit-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 0 0 auto;
    min-width: 320px;
    max-width: 380px;
    width: 100%;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 20px;
    border-radius: 12px;
    background: ${props => props.isSelected ? mainColors.primaryColor : '#ffffff'};
    border: 2px solid ${props => props.isSelected ? mainColors.primaryColor : '#e8e8e8'};
    box-shadow: ${props => props.isSelected ? '0 8px 24px rgba(24, 144, 255, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.08)'};

    &:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 12px 32px rgba(24, 144, 255, 0.2);
      background: ${props => props.isSelected ? mainColors.primaryColor : '#ffffff'};
      border-color: #1890ff;
    }

    @media screen and (max-width: 700px) {
      min-width: 280px;
      max-width: 320px;
      padding: 16px;
    }
  `,
  DemoSuggestionThumbnailWrapper: styled.div`
    width: 100%;
    aspect-ratio: 16 / 9;
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
    transition: all 0.3s ease;
    background: #f5f5f5;

    &:hover {
      box-shadow: 0 6px 20px rgba(24, 144, 255, 0.25);
    }
  `,
  DemoSuggestionThumbnail: styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  `,
  DemoSuggestionName: styled.h3`
    font-size: 1.1em;
    font-weight: 600;
    color: ${props => props.isSelected ? '#ffffff' : '#1a1a1a'};
    font-family: ${mainColors.fontFamily};
    text-align: center;
    margin: 0 0 16px 0;
    padding: 0 4px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 4.5em;
    transition: color 0.3s ease;

    @media screen and (max-width: 700px) {
      font-size: 1em;
      min-height: 4em;
    }
  `,
  DemoSuggestionStepsList: styled.ol`
    list-style: none;
    counter-reset: step-counter;
    margin: 16px 0 0 0;
    padding: 16px;
    width: 100%;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e8e8e8;

    @media screen and (max-width: 700px) {
      margin: 12px 0 0 0;
      padding: 12px;
    }
  `,
  DemoSuggestionStepItem: styled.li`
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
    font-size: 0.9em;
    line-height: 1.6;
    color: #333;
    font-family: ${mainColors.fontFamily};

    &:last-child {
      margin-bottom: 0;
    }

    @media screen and (max-width: 700px) {
      font-size: 0.85em;
      margin-bottom: 10px;
    }
  `,
  DemoSuggestionStepNumber: styled.span`
    margin-right: 10px;
    font-weight: 700;
    flex-shrink: 0;
    font-size: 1.05em;
    line-height: 2em;
  `,
  DemoSuggestionStepExplanation: styled.span`
    font-family: Roboto;
    flex: 1;
    color: #1a1a1a;
    font-size: 1.3em;
  `,
  IFrameWrapper: styled.div`
    width: 100%;
    height: 100%;
    position: relative;

    //padding-bottom: 56.25%;
    padding-bottom: ${({scalePercentage}) => scalePercentage}%;
    //max-width: 956px;
    border-radius: 6px;


  `,
  IFrame: styled.iframe`
    position: absolute;
    top: 0;
    left: 0;
    //transform: scale(0.6555) translateZ(0) perspective(1px);
    backface-visibility: hidden;
    -webkit-font-smoothing: subpixel-antialiased;


    //margin-top: 25px;

    //aspect-ratio: 16 / 9;
    height: 100%;
    width: 100%;
    outline: none;
    border: none;
    border-radius: 6px;
  `,
  AutoRecordingDescriptionWrapper: styled.div`
    width: 100%;
    margin-bottom: 40px;
    text-align: center;

    @media screen and (max-width: 700px) {
      margin-bottom: 30px;
    }
  `,
  AutoRecordingTitle: styled.h2`
    font-size: 1.6em;
    font-weight: 600;
    color: #1a1a1a;
    font-family: ${mainColors.fontFamily};
    text-align: center;
    margin: 0 0 24px 0;
    line-height: 1.3;
    letter-spacing: -0.02em;

    @media screen and (max-width: 700px) {
      font-size: 1.5em;
      margin-bottom: 20px;
    }
  `,
  GenerateLiveDemoButtonWrapper: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 8px;
  `,
  LiveDemoIcon: styled.svg`
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  `
}


function mapStateToProps(state) {
  return {
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace,
    authData: state.authReducer.authData,
    secureStorage: state.secureStorageReducer
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({updateCurrentSelectedWorkspace, getWorkspaceEncryptionKey, refreshToken}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoRecordingPreviewPage)
