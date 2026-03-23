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
import {useNavigate, useLocation, useParams} from 'react-router-dom'
import styled from 'styled-components'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {updateCurrentSelectedWorkspace} from '../../actions/workspacesActions'
import {refreshToken} from '../../actions/authActions'
import {getWorkspaceEncryptionKey} from '../../actions/secureStorageActions'
import mainColors from '../.././constants/mainColors'
import StoryStatuses from '../.././constants/StoryStatuses'
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
  'Preparing your demo...',
]
const RANDOM_LOADING_TEXT = [
  'Optimizing demo for space travel',
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
  'Subliminally adding the word ‘obey’ throughout your demo',
  'Disguising demo as washerwoman to get it out of jail',
  'Primping, preening, and preparing pixels',
  'Herding loose pixels into a corral',
  'Processing stuff for your demo',
  'Getting distracted by squirrel',
  'Swiping right on your demo',
  'Lowering demo into the sheep-dip',
  'Pixelating nudity',
  'Cocking a quizzical eyebrow at your demo',
  'Caching text',
  'Syncing audio',
  'Measuring font',
  'Coloring icons',
  'Installing background',
  'Processing demo',
  'Pumping up volume',
  'Going to lunch',
  'Looking busy',
  'Stapling clips together',
  'Squaring the serifs',
  'Adding that certain ‘je ne sais quoi’',
  'Giving demo a ‘noogie’',
  'Popping the bubble wrap your demo will be swaddled in',
  'Introducing demo to important industry figures',
  'Integrating kitchen sink',
  'Cocking a quizzical eyebrow at your demo',
  'Setting course for 373 mark 8',
  'Checking for spoilers',
  'Looking for plot holes',
  'Exploiting rip in space-time continuum',
  'Measuring gravitational time dilation',
  'Checking for trans-dimensional attunement',
  'Removing cat paw prints from your demo',
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
  'Compressing life out of your demo',
  'Reticulating splines',
  'Hanging finished scenes on the the line to dry',
  'Hammering square pixels into the round holes',
  'High-fiving server',
  'Glueing scenes together',
  'Baking demo in the oven',
  'Capturing escaped pixels',
  'Spreading marmalade on your demo',
  'Herding loose pixels into a corral',
  'Forging your demo in the heavenly fire of a million suns',
  'Inserting Rick-Roll at the end of your demo',
  'Sweeping extra pixels under the rug',
  'Preparing pixels for next scene, talk amongst yourselves for a second',
  'Flushing cat gifs from server memory to make room for your demo',
  'Noticing lack of cat gifs in your demo',
  'Giving it that ‘wow factor’',
  'Cleaning up spilled pixels',
  'Making your demo ‘shmick’',
  'Spooling your demo onto an ancient tape reel',
  'Adding chocolate sprinkles',
  'Creating each frame of the demo',
  'Ordering pixels into neat piles',
  'Sifting pixels to get rid of clumps',
  'Chomping pixels like a brandy snap',
  'Admiring your taste in music',
  'Analyzing your color choices (Freudian-style)',
  'Pushing files and things around',
  'Noticing lack of LOLcats in your demo',
  'Kneading demo with a rolling pin',
  'Sorting out where pixels fit',
  'Processing stuff for your demo',
  'Running demo up flagpole and saluting',
  'Throwing demo into the fiery maw of Mount Doom',
  'Launching Improbability Drive',
  'Turning demo over and shaking it to see if any change falls out',
  'Building demo like it’s going out of fashion',
  'Ordering pixels to get me a cup of coffee',
  'Checking use of ‘your’ and ‘you’re’',
  'Creating more pixels and stuff',
  'Overlaying text n’ stuff',
  'Nudging pixels gently into place',
  'Penalizing pixels for being offside',
  'Calibrating color profile with a hammer',
  'Optimizing demo for space travel',
  'Color matching demo to your socks',
  'Trying to focus on demo after a big night out',
  'Stitching demo together with yarn',
  'Calculating demo likeability',
  'Assembling pixel matrix',
  'Synergising impactful cut-through',
  'Reversing polarity of shield harmonics',
  'Adding bits and bobs',
  'Attaching bells and whistles',
  'Checking audio’s ‘got that swing’',
  'Lowering demo into the sheep-dip',
  'Going through demo with a fine-tooth comb',
  'Froofing up demo',
  'Giving demo a nice bouffant',
  'Giving demo an extreme makeover',
  'Lovingly handcrafting demo',
  'Challenging demo to a dance-off',
  'Disguising demo as washerwoman to get it out of jail',
  'What was I doing again? Oh yeah, your demo',
  'I like what you’ve done with your hair today',
  'Human saliva has a boiling point three times that of regular water. Fact!',
  'Getting distracted by squirrel',
  'Punishing bad pixels',
  'Stealing pixels from someone else’s demo',
  'Sweating small stuff',
  'Admiring cut of your jib',
  'Showing demo to my mom',
  'Buying pixels from the pixel shop',
  'Subliminally adding the word ‘obey’ throughout your demo',
  'Rolling demo into the shop and putting it up on the hoist',
  'Squandering Earth’s resources',
  'Swiping right on your demo'
]

const LiveDemoPreviewPage = ({collapsed, currentSelectedWorkspace, authData}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  
  let [liveDemo, setLiveDemo] = useState(null)
  let checkUploadedTimer = useRef(null)

  const liveDemoIdFromUrl = params.livedemoId
  const linkIdFromUrl = params.linkId ?? ""


  let innerHeight = window.innerHeight
  let innerWidth = window.innerWidth

  console.log('authData ')
  console.log(JSON.stringify(authData, null, 2))

  console.log('currentSelectedWorkspace')
  console.log(JSON.stringify(currentSelectedWorkspace, null, 2))


  function getLiveDemoPreview(workspaceId, storyDemoId, authToken) {

    let url = `${ENV.STORIES_API}/preview/${storyDemoId}`
    if(linkIdFromUrl) {
      url += `?link=${linkIdFromUrl}`
    }

    return axios.get(url, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {
        return res.data
      })
  }

  function intervalCheckIfReady() {
    let retryCount = 0

    checkUploadedTimer.current = setInterval(function () {
      getLiveDemoPreview(currentSelectedWorkspace._id, liveDemoIdFromUrl, authData.token)
        .then((liveDemoDoc) => {

          if (liveDemoDoc.status !== StoryStatuses.UPLOADING || retryCount >= 30) {

            clearInterval(checkUploadedTimer.current)
            checkUploadedTimer.current = null

            setLiveDemo(liveDemoDoc)
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


    getLiveDemoPreview(currentSelectedWorkspace._id, liveDemoIdFromUrl, authData.token)
      .then((liveDemoDoc) => {
        if (liveDemoDoc.status === StoryStatuses.UPLOADING) {
          intervalCheckIfReady()
        }
        setLiveDemo(liveDemoDoc)
      })
      .catch(() => {
        navigate('/')
      })

  }, [navigate])

  // function getLiveDemo(workspaceId, liveDemoId, authToken) {
  //
  //   return axios.get(`/workspaces/${workspaceId}/livedemos/${liveDemoId}?populateRequests=true`, {
  //       headers: {
  //         Authorization: `Bearer ${authToken}`
  //       }
  //     })
  //     .then((res) => {
  //       return res.data
  //     })
  // }


  function onSetIsPublished(liveDemo, isPublished, authToken) {
    return axios.post(`${ENV.STORIES_API}/workspaces/${liveDemo.workspaceId._id}/stories/${liveDemo._id}/publish`, {
      isPublished: isPublished
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {
        return res.data
      })
      .then(() => {

        let newStoryDemo = {...liveDemo}
        newStoryDemo.isPublished = isPublished
        setLiveDemo(newStoryDemo)
      })
  }
  let wrapperHeight = '100%'

  let demoScalePercentage = liveDemo && liveDemo.windowMeasures && (liveDemo.windowMeasures.innerHeight / liveDemo.windowMeasures.innerWidth) * 100

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


  return (
    <React.Fragment>
      <Header
        workspaceName={liveDemo && liveDemo.workspaceId.name}
        liveDemoName={liveDemo && liveDemo.name}
        authData={authData}
        liveDemo={liveDemo}
        style={{boxShadow: 'none'}}
        onSetIsPublished={(isPublished) => {
          return onSetIsPublished(liveDemo, isPublished, authData.token)
        }}
      />
      <S.Content>
        {liveDemo && liveDemo.status === StoryStatuses.READY ? (
          <S.Wrapper
            $wrapperHeight={wrapperHeight}
          >
            <S.LiveDemoWrapper>
              <S.IFrameWrapper
                $scalePercentage={scalePercentage}
              >
                <S.IFrame
                  src={liveDemo ? `${ENV.STORIES_API}/workspaces/${liveDemo && liveDemo.workspaceId._id}/stories/${liveDemoIdFromUrl}/preview?link=${linkIdFromUrl}&embed` : ''}
                  frameBorder={'0'}
                  scrolling={'no'}
                  webkitallowfullscreen={true}
                  mozallowfullscreen={true}
                  allowFullScreen={true}
                  allow={'fullscreen'}
                  title={'Embedded LiveDemo'}
                />
              </S.IFrameWrapper>
            </S.LiveDemoWrapper>
            <S.Desc_Wrapper>

              <S.Desc_Title>{liveDemo && liveDemo.name}</S.Desc_Title>
            </S.Desc_Wrapper>
          </S.Wrapper>
        ) : (liveDemo && liveDemo.status === StoryStatuses.UPLOADING ? (
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
          ) : (liveDemo && liveDemo.status === StoryStatuses.FAILED ? (
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

  Content: styled(Content)`
    && {
      background: white;

      overflow: hidden;
      //overflow-x: hidden;
      width: 100%;
      height: 100%;
      padding: 40px 80px;

      @media screen and (max-width: 700px) {
        padding: 10px 10px;
      }
    }
  `,
  Wrapper: styled.div`
    width: 70%;

    height: ${({wrapperHeight}) => (wrapperHeight ? wrapperHeight : '100%')};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    margin: 0 auto;

    @media screen and (max-width: 450px) {
      width: 98%;
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
  LiveDemoWrapper: styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    //border-radius: 8px;
    //box-shadow: 0 0 0 1px rgb(17 24 39 / 16%);
  `,
  IFrameWrapper: styled.div`
    width: 100%;
    height: 100%;
    position: relative;

    //padding-bottom: 56.25%;
    padding-bottom: ${({$scalePercentage}) => $scalePercentage}%;
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
    overflow: hidden;
    scrolling: no;
  `,
  Desc_Wrapper: styled.div`
    margin-top: 50px;
    height: 300px;
    width: 100%;

  `,
  Desc_Title: styled.h2`
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-transform: capitalize;
    max-width: 100%;
    font-size: 1.7em;
    font-weight: 500;
    color: #111;
    font-family: ${mainColors.fontFamily};
    padding-bottom: 30px;
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

export default connect(mapStateToProps, mapDispatchToProps)(LiveDemoPreviewPage)
