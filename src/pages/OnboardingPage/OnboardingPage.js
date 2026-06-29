import React, { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { FaChrome } from 'react-icons/fa'
import {
  MdArrowBack,
  MdArrowForward,
  MdCheck,
  MdFiberManualRecord,
  MdIosShare,
} from 'react-icons/md'
import mainColors from '../../constants/mainColors'
import ENV from '../../config'
import { Modal } from 'antd'
import axios from '../../utils/axiosInstance'
import pinLivedemoImage from '../../static/images/pin-livedemo.png'
import OnboardingGoalsTypes from '../../constants/OnboardingGoalsTypes'
import UrlToDemo from '../../components/UrlToDemo/UrlToDemo'


const STEPS = [
  {
    key: 1,
    title: 'Interactive demo 101',
    subtitle: '3 min video walkthrough',
  },
  {
    key: 2,
    title: 'Explore gallery',
    subtitle: 'demo examples',
  },
  {
    key: 3,
    title: 'Create a Live Demo',
    subtitle: 'Start building now',
  },
]

/** Deep-link onboarding via `?step=…` on `/onboarding` */
const ONBOARDING_STEP_QUERY_KEY = 'step'

const ONBOARDING_STEP_SLUGS = [
  'goals',
  'menu',
  'get-started',
  'live-demo',
  'explore-1',
  'explore-2',
  'explore-3',
]

function parseOnboardingStepParam(raw) {
  if (raw == null || raw === '') return null
  const s = String(raw).trim()
  return ONBOARDING_STEP_SLUGS.includes(s) ? s : null
}

function stepParamToState(slug) {
  switch (slug) {
    case 'goals':
      return { phase: 'goals', activeStep: 1 }
    case 'menu':
      return { phase: 'menu', activeStep: 1 }
    case 'get-started':
      return { phase: 'getStarted', activeStep: 1 }
    case 'live-demo':
      return { phase: 'requestLiveDemo', activeStep: 1 }
    case 'explore-1':
      return { phase: 'explore', activeStep: 1 }
    case 'explore-2':
      return { phase: 'explore', activeStep: 2 }
    case 'explore-3':
      return { phase: 'getStarted', activeStep: 1 }
    default:
      return null
  }
}

function stateToStepParam(phase, activeStep) {
  if (phase === 'goals') return 'goals'
  if (phase === 'menu') return 'menu'
  if (phase === 'getStarted') return 'get-started'
  if (phase === 'requestLiveDemo') return 'live-demo'
  if (phase === 'explore') {
    if (activeStep === 1) return 'explore-1'
    if (activeStep === 2) return 'explore-2'
  }
  return 'goals'
}

function readOnboardingStateFromLocation() {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get(ONBOARDING_STEP_QUERY_KEY)
  const slug = parseOnboardingStepParam(raw)
  return slug ? stepParamToState(slug) : null
}

/** Same demos as livedemo-landing Showcase */
const SHOWCASE_PRODUCTS = [
  {
    title: 'Putler',
    demoLink:
      'https://story-api.livedemo.ai/workspaces/62d774dbe0ef18000987c428/stories/677cb176df6935002547741a/preview?step=1&embed',
    image:
      'https://livedemo-cdn.s3.amazonaws.com/flix-images/677cb176df6935002547741a/fqbeRfeVPt3siqXjvaZnCE.png',
    gif: 'https://d1tmqwkaq9ygb3.cloudfront.net/story-gifs/677cb176df6935002547741a-oETNiJq5ui4NWMfoyvegaz.gif',
  },
  {
    title: 'Bolt.New',
    demoLink:
      'https://story-api.livedemo.ai/workspaces/62d774dbe0ef18000987c428/stories/6722a310037561001dab55e8/preview?step=1&embed',
    image:
      'https://livedemo-cdn.s3.amazonaws.com/flix-images/6722a310037561001dab55e8/2BUDc6ZviCMuZqMFDaTMaD.png',
    gif: 'https://d1tmqwkaq9ygb3.cloudfront.net/story-gifs/6722a310037561001dab55e8-4cb9m2jyi2EEmK6wBebjHx.gif',
  },
  {
    title: 'ClearML',
    demoLink:
      'https://story-api.livedemo.ai/workspaces/62d774dbe0ef18000987c428/stories/67aa6cbf825e8b001bf697ce/preview?step=1&embed',
    image:
      'https://livedemo-cdn.s3.amazonaws.com/flix-images/67aa6cbf825e8b001bf697ce/4sTkdfRVTz4U4FNoar4ubj.png',
    gif: 'https://d1tmqwkaq9ygb3.cloudfront.net/story-gifs/67aa6cbf825e8b001bf697ce-uHdNzXLdtkd791Ks1J9AaK.gif',
  },
  {
    title: 'Virallyst',
    demoLink:
      'https://story-api.livedemo.ai/workspaces/62d774dbe0ef18000987c428/stories/683e51b51bf079001ae4aa17/preview?embed',
    image:
      'https://livedemo-cdn.s3.amazonaws.com/flix-images/683e51b51bf079001ae4aa17/uTYRksmbYBfNf3gcPQmPy7.png',
    gif: 'https://d1tmqwkaq9ygb3.cloudfront.net/story-gifs/683e51b51bf079001ae4aa17-ttnHcg78R317nzY9YPNPC2.gif',
  },
  {
    title: 'Retable',
    demoLink:
      'https://story-api.livedemo.ai/workspaces/62d774dbe0ef18000987c428/stories/636ab50c64e078001afd8639/preview?embed',
    image:
      'https://livedemo-cdn.s3.amazonaws.com/flix-images/636ab50c64e078001afd8639/9fxxy39yLGDst8iBcv8NHD.png',
    gif: 'https://d1tmqwkaq9ygb3.cloudfront.net/story-gifs/636ab50c64e078001afd8639-fdy9V5Lzp66S7Ver2ymgJd.gif',
  },
  {
    title: 'GitDiagram',
    demoLink:
      'https://story-api.livedemo.ai/workspaces/62d774dbe0ef18000987c428/stories/677aca345394cb002511abba/preview?step=1&embed',
    image:
      'https://livedemo-cdn.s3.amazonaws.com/flix-images/677aca345394cb002511abba/t2YHMawHmarVCjzMP3mXBS.png',
    gif: 'https://d1tmqwkaq9ygb3.cloudfront.net/story-gifs/677aca345394cb002511abba-ucJ1NgDbHSUm22uKGWTQEt.gif',
  },
  {
    title: 'Chadform',
    demoLink:
      'https://story-api.livedemo.ai/workspaces/62d774dbe0ef18000987c428/stories/6840abdb47ab4e001aa87300/preview?embed',
    image:
      'https://livedemo-cdn.s3.amazonaws.com/flix-images/6840abdb47ab4e001aa87300/hWomk66jJHReNGAajd6ck5.png',
    gif: 'https://d1tmqwkaq9ygb3.cloudfront.net/story-gifs/6840abdb47ab4e001aa87300-aUTQW253F2j72tLtL1DU6n.gif',
  },
  {
    title: 'Layouts.Dev',
    demoLink:
      'https://story-api.livedemo.ai/workspaces/62d774dbe0ef18000987c428/stories/670733902b1b85001a6b86ef/preview?step=1&embed',
    image:
      'https://livedemo-cdn.s3.amazonaws.com/flix-images/670733902b1b85001a6b86ef/u5mq3QP22r2druJfKtE9zK.png',
    gif: 'https://d1tmqwkaq9ygb3.cloudfront.net/story-gifs/670733902b1b85001a6b86ef-v5nMkassY781A28xURTsg2.gif',
  },
  {
    title: 'ProductHunt',
    demoLink:
      'https://story-api.livedemo.ai/workspaces/62d774dbe0ef18000987c428/stories/646d875139a66d001a957dff/preview?embed',
    image:
      'https://livedemo-cdn.s3.amazonaws.com/flix-images/646d875139a66d001a957dff/6MQsHt11pRmGXQUzrFqZzq.png',
    gif: 'https://d1tmqwkaq9ygb3.cloudfront.net/story-gifs/646d875139a66d001a957dff-qvi27wchGgcLE6Rj1yESd2.gif',
  },
  {
    title: 'Fibr',
    demoLink:
      'https://story-api.livedemo.ai/workspaces/62d774dbe0ef18000987c428/stories/66e8d77e9289fb001a66578f/preview?step=1&embed',
    image:
      'https://livedemo-cdn.s3.amazonaws.com/flix-images/66e8d77e9289fb001a66578f/tXFRfhywz6jZRJkC4nGYaq.png',
  },
]

function SeeDemoIcon({ clipId }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <g clipPath={`url(#${clipId})`}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.5 15.5C1.5 12.5 1.5 7.5 4.5 4.5C7.5 1.5 12.5 1.5 15.5 4.5C18.5 7.5 18.5 12.5 15.5 15.5C12.5 18.5 7.5 18.5 4.5 15.5ZM8.5 7.5C8.39 7.5 8.28 7.52 8.18 7.56C8.08 7.6 7.99 7.66 7.91 7.74C7.83 7.82 7.77 7.91 7.73 8.01C7.69 8.11 7.67 8.22 7.67 8.33C7.67 8.44 7.69 8.55 7.73 8.65C7.77 8.75 7.83 8.84 7.91 8.92C7.99 9 8.08 9.06 8.18 9.1C8.28 9.14 8.39 9.16 8.5 9.16H10L8 11.16C7.85 11.31 7.76 11.51 7.76 11.72C7.76 11.93 7.85 12.13 8 12.28C8.15 12.43 8.35 12.52 8.56 12.52C8.77 12.52 8.97 12.43 9.12 12.28L11.16 10.28V11.72C11.16 11.94 11.25 12.15 11.41 12.31C11.57 12.47 11.78 12.56 12 12.56C12.22 12.56 12.43 12.47 12.59 12.31C12.75 12.15 12.84 11.94 12.84 11.72V8.33C12.84 8.11 12.75 7.9 12.59 7.74C12.43 7.58 12.22 7.49 12 7.49H8.5Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="16" height="16" fill="white" transform="translate(2 2)" />
        </clipPath>
      </defs>
    </svg>
  )
}

/** YouTube embed for explore step 1 — https://www.youtube.com/watch?v=q0_MnMOtKlg */
const INTERACTIVE_DEMO_101_YOUTUBE_EMBED =
  'https://www.youtube.com/embed/q0_MnMOtKlg?rel=0'

const INTERACTIVE_DEMO_FIRST_DEMO_YOUTUBE_EMBED =
  'https://www.youtube.com/embed/TGjKssBcd4E?rel=0'

const GET_STARTED_IMAGES = {
  extension: `${ENV.LANDING_URL}/images/posts/introducing-livedemo.svg`,
  record: `${ENV.LANDING_URL}/images/posts/capture-and-edit.svg`,
  share: `${ENV.LANDING_URL}/images/posts/embed-demos-website.svg`,
}

const CAL_BOOKING_EMBED_URL = 'https://cal.com/george-apostolov/30min'

const LIVE_DEMO_TEAM_AVATARS = [
  {
    alt: 'Alex',
    src:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=72&h=72&fit=crop&crop=faces&auto=format&q=80',
  },
  {
    alt: 'Jordan',
    src:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=72&h=72&fit=crop&crop=faces&auto=format&q=80',
  },
  {
    alt: 'Morgan',
    src:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=72&h=72&fit=crop&crop=faces&auto=format&q=80',
  },
  {
    alt: 'Riley',
    src:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=72&h=72&fit=crop&crop=faces&auto=format&q=80',
  },
]

const LIVE_DEMO_EXPECTATIONS = [
  'Onboard & train customers effortlessly at scale',
  'Close more deals with trackable, interactive demos',
  'Qualify & convert more high-intent leads',
  'Achieve measurable ROI in under 30 days, guaranteed',
]

const CLIPBOARD_ICON_PATH =
  'M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,48H48V48H72v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24Z'

function pingLiveDemoExtension(extensionId) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }
    const id = String(extensionId || '').trim()
    if (!id) {
      resolve(false)
      return
    }
    const cr = window.chrome
    if (!cr?.runtime?.sendMessage) {
      resolve(false)
      return
    }
    try {
      cr.runtime.sendMessage(id, { type: 'livedemo_extension_ping' }, () => {
        if (cr.runtime.lastError) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    } catch {
      resolve(false)
    }
  })
}

/** Resolves `true` if the extension icon is pinned to the toolbar, `false` if in the puzzle menu only, `null` if unknown. */
function getLiveDemoExtensionToolbarPinned(extensionId) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null)
      return
    }
    const id = String(extensionId || '').trim()
    if (!id) {
      resolve(null)
      return
    }
    const cr = window.chrome
    if (!cr?.runtime?.sendMessage) {
      resolve(null)
      return
    }
    try {
      cr.runtime.sendMessage(
        id,
        { type: 'livedemo_extension_action_settings' },
        (response) => {
          if (cr.runtime.lastError) {
            resolve(null)
            return
          }
          if (response && typeof response.isOnToolbar === 'boolean') {
            resolve(response.isOnToolbar)
            return
          }
          resolve(null)
        }
      )
    } catch {
      resolve(null)
    }
  })
}

const PIN_PROMPT_SESSION_KEY = 'livedemo_onboarding_pin_prompt_dismissed'

function readPinPromptDismissedFromSession() {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(PIN_PROMPT_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function persistPinPromptDismissed() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(PIN_PROMPT_SESSION_KEY, '1')
  } catch {
    /* ignore */
  }
}

const GOAL_ICON_PATHS = {
  onboarding:
    'M216,40H136V24a8,8,0,0,0-16,0V40H40A16,16,0,0,0,24,56V176a16,16,0,0,0,16,16H79.36L57.75,219a8,8,0,0,0,12.5,10l29.59-37h56.32l29.59,37a8,8,0,1,0,12.5-10l-21.61-27H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,136H40V56H216V176Z',
  website:
    'M88,24V16a8,8,0,0,1,16,0v8a8,8,0,0,1-16,0ZM16,104h8a8,8,0,0,0,0-16H16a8,8,0,0,0,0,16ZM124.42,39.16a8,8,0,0,0,10.74-3.58l8-16a8,8,0,0,0-14.31-7.16l-8,16A8,8,0,0,0,124.42,39.16Zm-96,81.69-16,8a8,8,0,0,0,7.16,14.31l16-8a8,8,0,1,0-7.16-14.31ZM219.31,184a16,16,0,0,1,0,22.63l-12.68,12.68a16,16,0,0,1-22.63,0L132.7,168,115,214.09c0,.1-.08.21-.13.32a15.83,15.83,0,0,1-14.6,9.59l-.79,0a15.83,15.83,0,0,1-14.41-11L32.8,52.92A16,16,0,0,1,52.92,32.8L213,85.07a16,16,0,0,1,1.41,29.8l-.32.13L168,132.69ZM208,195.31,156.69,144h0a16,16,0,0,1,4.93-26l.32-.14,45.95-17.64L48,48l52.2,159.86,17.65-46c0-.11.08-.22.13-.33a16,16,0,0,1,11.69-9.34,16.72,16.72,0,0,1,3-.28,16,16,0,0,1,11.3,4.69L195.31,208Z',
  sales:
    'M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l50.34-50.35a8,8,0,0,1,11.32,0L128,132.69,180.69,80H160a8,8,0,0,1,0-16h40a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V91.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31l-56,56V200H224A8,8,0,0,1,232,208Z',
  live_sales:
    'M251.77,73a8,8,0,0,0-8.21.39L208,97.05V72a16,16,0,0,0-16-16H32A16,16,0,0,0,16,72V184a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V159l35.56,23.71A8,8,0,0,0,248,184a8,8,0,0,0,8-8V80A8,8,0,0,0,251.77,73ZM192,184H32V72H192V184Zm48-22.95-32-21.33V116.28L240,95Z',
  support_docs:
    'M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z',
  training:
    'M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216a130,130,0,0,0,48-8.76V240a8,8,0,0,0,16,0V199.51a115.63,115.63,0,0,0,27.94-22.57A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12ZM128,200c-43.27,0-68.72-21.14-80-33.71V126.4l76.24,40.66a8,8,0,0,0,7.52,0L176,143.47v46.34C163.4,195.69,147.52,200,128,200Zm80-33.75a97.83,97.83,0,0,1-16,14.25V134.93l16-8.53ZM188,118.94l-.22-.13-56-29.87a8,8,0,0,0-7.52,14.12L171,128l-43,22.93L25,96,128,41.07,231,96Z',
}

const GOAL_OPTIONS = [
  { id: OnboardingGoalsTypes.ONBOARDING_GOALS.ONBOARDING, label: 'Build demos for onboarding' },
  { id: OnboardingGoalsTypes.ONBOARDING_GOALS.WEBSITE, label: 'Clickable demo for website' },
  { id: OnboardingGoalsTypes.ONBOARDING_GOALS.SALES, label: 'Trackable sales collateral' },
  { id: OnboardingGoalsTypes.ONBOARDING_GOALS.LIVE_SALES, label: 'For live sales demos' },
  { id: OnboardingGoalsTypes.ONBOARDING_GOALS.SUPPORT_DOCS, label: 'Demos in support docs' },
  { id: OnboardingGoalsTypes.ONBOARDING_GOALS.TRAINING, label: 'Training demos' },
]

function GoalPhosphorIcon({ goalId }) {
  const d = GOAL_ICON_PATHS[goalId]
  if (!d) return null
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
      <path d={d} />
    </svg>
  )
}

const URGENCY_ICON_PATHS = {
  urgent:
    'M152,224a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,224ZM128,112a12,12,0,1,0-12-12A12,12,0,0,0,128,112Zm95.62,43.83-12.36,55.63a16,16,0,0,1-25.51,9.11L158.51,200h-61L70.25,220.57a16,16,0,0,1-25.51-9.11L32.38,155.83a16.09,16.09,0,0,1,3.32-13.71l28.56-34.26a123.07,123.07,0,0,1,8.57-36.67c12.9-32.34,36-52.63,45.37-59.85a16,16,0,0,1,19.6,0c9.34,7.22,32.47,27.51,45.37,59.85a123.07,123.07,0,0,1,8.57,36.67l28.56,34.26A16.09,16.09,0,0,1,223.62,155.83ZM99.43,184h57.14c21.12-37.54,25.07-73.48,11.74-106.88C156.55,47.64,134.49,29,128,24c-6.51,5-28.57,23.64-40.33,53.12C74.36,110.52,78.31,146.46,99.43,184Zm-15,5.85Q68.28,160.5,64.83,132.16L48,152.36,60.36,208l.18-.13ZM208,152.36l-16.83-20.2q-3.42,28.28-19.56,57.69l23.85,18,.18.13Z',
  book: GOAL_ICON_PATHS.support_docs,
  video: GOAL_ICON_PATHS.live_sales,
}

const URGENCY_CHECK_PATH =
  'M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z'

const URGENCY_OPTIONS = [
  {
    id: 'urgent',
    badge: 'Urgent',
    badgeVariant: 'solid',
    title: 'Create interactive demos now!',
    iconKey: 'urgent',
  },
  {
    id: 'not_urgent',
    badge: 'Not urgent',
    badgeVariant: 'soft',
    title: 'Learn more about Live Demo and see relevant examples.',
    iconKey: 'book',
  },
  {
    id: 'live_1on1',
    badge: 'Live 1-on-1',
    badgeVariant: 'soft',
    title: 'I would like a live walkthrough.',
    iconKey: 'video',
  },
]

function UrgencyPhosphorIcon({ iconKey, ...rest }) {
  const d = URGENCY_ICON_PATHS[iconKey]
  if (!d) return null
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden {...rest}>
      <path d={d} />
    </svg>
  )
}

function OnboardingPage({ authData }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const stepParam = searchParams.get(ONBOARDING_STEP_QUERY_KEY) ?? ''

  const [phase, setPhase] = useState(() => readOnboardingStateFromLocation()?.phase ?? 'goals')
  const [goals, setGoals] = useState(() =>
    GOAL_OPTIONS.reduce((acc, g) => ({ ...acc, [g.id]: false }), {})
  )
  const [urgency, setUrgency] = useState('urgent')
  const [activeStep, setActiveStep] = useState(
    () => readOnboardingStateFromLocation()?.activeStep ?? 1
  )
  const [extensionInstalled, setExtensionInstalled] = useState(null)
  const [extensionToolbarPinned, setExtensionToolbarPinned] = useState(null)
  const [pinPromptDismissed, setPinPromptDismissed] = useState(false)
  // const [pinPromptDismissed, setPinPromptDismissed] = useState(readPinPromptDismissedFromSession)
  const [showcaseModalOpen, setShowcaseModalOpen] = useState(false)
  const [showcaseProduct, setShowcaseProduct] = useState(null)
  const [recordDemoModalOpen, setRecordDemoModalOpen] = useState(false)

  useEffect(() => {
    const slug = parseOnboardingStepParam(stepParam)
    if (!slug) return
    const s = stepParamToState(slug)
    if (!s) return
    setPhase(s.phase)
    setActiveStep(s.activeStep)
  }, [stepParam])

  useEffect(() => {
    const next = stateToStepParam(phase, activeStep)
    if (stepParam === next) return
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        p.set(ONBOARDING_STEP_QUERY_KEY, next)
        return p
      },
      { replace: true }
    )
  }, [phase, activeStep, stepParam, setSearchParams])

  useEffect(() => {
    if (phase !== 'getStarted') return undefined
    let cancelled = false
    setExtensionInstalled(true)
    setExtensionToolbarPinned(null)
    pingLiveDemoExtension(ENV.CHROME_APP_ID).then((installed) => {
      if (cancelled) return
      setExtensionInstalled(true)
      if (installed) {
        getLiveDemoExtensionToolbarPinned(ENV.CHROME_APP_ID).then((pinned) => {
          if (!cancelled) setExtensionToolbarPinned(pinned)
        })
      } else {
        setExtensionToolbarPinned(null)
      }
    })
    return () => {
      cancelled = true
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'getStarted') return undefined
    if (!extensionInstalled || extensionToolbarPinned !== false || pinPromptDismissed) return undefined
    const tick = () => {
      getLiveDemoExtensionToolbarPinned(ENV.CHROME_APP_ID).then((pinned) => {
        if (pinned === true) setExtensionToolbarPinned(true)
      })
    }
    const id = window.setInterval(tick, 4000)
    return () => window.clearInterval(id)
  }, [phase, extensionInstalled, extensionToolbarPinned, pinPromptDismissed])

  useEffect(() => {
    if (phase !== 'getStarted') return undefined
    if (!extensionInstalled || extensionToolbarPinned !== false || pinPromptDismissed) return undefined
    const onFocus = () => {
      getLiveDemoExtensionToolbarPinned(ENV.CHROME_APP_ID).then((pinned) => {
        if (pinned === true) setExtensionToolbarPinned(true)
      })
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [phase, extensionInstalled, extensionToolbarPinned, pinPromptDismissed])

  useEffect(() => {
    if (phase !== 'explore' || activeStep !== 2) {
      setShowcaseModalOpen(false)
      setShowcaseProduct(null)
    }
  }, [phase, activeStep])

  useEffect(() => {
    if (phase !== 'getStarted') {
      setRecordDemoModalOpen(false)
    }
  }, [phase])

  const goDashboard = () => navigate('/')

  const closeRecordDemoModal = () => {
    setRecordDemoModalOpen(false)
  }

  const hasAnyGoal = useMemo(() => Object.values(goals).some(Boolean), [goals])

  const toggleGoal = (id) => {
    setGoals((prev) => {
      const nextSelected = !prev[id]
      return { ...prev, [id]: nextSelected }
    })
  }

  const getSelectedGoals = () => {
    return GOAL_OPTIONS
      .filter((goal) => goals[goal.id])
      .map((goal) => goal.id)
  }

  const persistOnboardingGoals = (goalsToPersist) => {
    const token = authData?.token
    if (!token || !Array.isArray(goalsToPersist)) {
      return Promise.resolve()
    }

    return axios.patch(
      '/users',
      {
        onboarding: {
          goals: goalsToPersist,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  }

  const onBack = () => {
    if (phase === 'goals') {
      goDashboard()
      return
    }
    if (phase === 'menu') {
      setPhase('goals')
      return
    }
    if (phase === 'getStarted') {
      setPhase('menu')
      return
    }
    if (phase === 'requestLiveDemo') {
      setPhase('menu')
      return
    }
    if (phase === 'explore' && activeStep <= 1) {
      setPhase('menu')
      return
    }
    if (phase === 'explore') {
      setActiveStep((s) => s - 1)
    }
  }

  const openHelp = () => {
    if (typeof window !== 'undefined' && window.$crisp) {
      window.$crisp.push(['do', 'chat:open'])
    } else {
      window.open('mailto:support@livedemo.ai', '_blank')
    }
  }

  const chromeStoreUrl = `https://chromewebstore.google.com/detail/livedemo-app/${ENV.CHROME_APP_ID}`

  const showPinExtensionPrompt =
    phase === 'getStarted' &&
    extensionInstalled === true &&
    extensionToolbarPinned === false &&
    !pinPromptDismissed

  const onDismissPinPrompt = () => {
    // persistPinPromptDismissed()
    setPinPromptDismissed(true)
  }

  const isGoals = phase === 'goals'
  const isIntroWhite =
    phase === 'goals' ||
    phase === 'menu' ||
    phase === 'getStarted' ||
    phase === 'requestLiveDemo' ||
    phase === 'explore'

  return (
    <S.Page $whiteIntro={isIntroWhite}>
      {isIntroWhite ? (
        <S.GoalsBlobLayer aria-hidden>
          <S.GoalsBlob $tl />
          <S.GoalsBlob $br />
        </S.GoalsBlobLayer>
      ) : (
        <React.Fragment>
          <S.Glow $corner="tl" />
          <S.Glow $corner="br" />
        </React.Fragment>
      )}

      <S.TopBar $whiteIntro={isIntroWhite}>
        <S.TextButton type="button" onClick={onBack}>
          <MdArrowBack size={18} aria-hidden />
          Back
        </S.TextButton>
        <S.TextButton type="button" $emphasis $introPrimary={isIntroWhite} onClick={goDashboard}>
          Skip to dashboard
          <MdArrowForward size={18} aria-hidden />
        </S.TextButton>
      </S.TopBar>

      <S.Main $whiteIntro={isIntroWhite} $explore={phase === 'explore'}>
        {isGoals ? (
          <S.GoalsShell>
            <S.GoalsInner>
              <S.GoalsHeader>
                <S.GoalsTitle>What do you plan to do with Live Demo?</S.GoalsTitle>
                <S.GoalsSub>Select all that apply</S.GoalsSub>
              </S.GoalsHeader>
              <S.GoalsGrid>
                {GOAL_OPTIONS.map(({ id, label }) => {
                  const selected = goals[id]
                  return (
                    <S.GoalCard
                      key={id}
                      type="button"
                      $selected={selected}
                      onClick={() => toggleGoal(id)}
                      aria-pressed={selected}
                    >
                      <S.GoalIconWrap>
                        <GoalPhosphorIcon goalId={id} />
                      </S.GoalIconWrap>
                      <S.GoalLabel>{label}</S.GoalLabel>
                      <S.GoalIndicator $selected={selected} aria-hidden>
                        {selected ? <MdCheck size={14} /> : null}
                      </S.GoalIndicator>
                    </S.GoalCard>
                  )
                })}
              </S.GoalsGrid>
              <S.GoalsActionRow>
                <span />
                <S.GoalsContinue
                  type="button"
                  disabled={!hasAnyGoal}
                  onClick={() => {
                    const selectedGoals = getSelectedGoals()
                    persistOnboardingGoals(selectedGoals)
                      .catch((e) => {
                        console.log('Failed to persist onboarding goals', e)
                      })
                      .finally(() => {
                        setPhase('menu')
                      })
                  }}
                >
                  Continue
                </S.GoalsContinue>
              </S.GoalsActionRow>
            </S.GoalsInner>
          </S.GoalsShell>
        ) : null}

        {phase === 'menu' ? (
          <S.UrgencyShell>
            <S.UrgencyInner>
              <S.UrgencyHeader>
                <S.UrgencyHeading>How urgently do you need to create interactive demos?</S.UrgencyHeading>
                <S.UrgencyLead>This will help us tailor your onboarding experience.</S.UrgencyLead>
              </S.UrgencyHeader>
              <S.UrgencyStack>
                {URGENCY_OPTIONS.map((opt) => {
                  const selected = urgency === opt.id
                  return (
                    <S.UrgencyOptionWrap key={opt.id}>
                      <S.UrgencyPill $variant={opt.badgeVariant}>{opt.badge}</S.UrgencyPill>
                      <S.UrgencyOptionBtn
                        type="button"
                        $selected={selected}
                        onClick={() => setUrgency(opt.id)}
                        aria-pressed={selected}
                      >
                        <S.UrgencyIconBox $selected={selected}>
                          <UrgencyPhosphorIcon iconKey={opt.iconKey} />
                        </S.UrgencyIconBox>
                        <S.UrgencyLabel $selected={selected}>{opt.title}</S.UrgencyLabel>
                        <S.UrgencyTick $selected={selected} aria-hidden>
                          {selected ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
                              <path d={URGENCY_CHECK_PATH} />
                            </svg>
                          ) : null}
                        </S.UrgencyTick>
                      </S.UrgencyOptionBtn>
                    </S.UrgencyOptionWrap>
                  )
                })}
              </S.UrgencyStack>
              <S.UrgencyNav>
                <S.UrgencyBackBtn type="button" onClick={() => setPhase('goals')}>
                  Back
                </S.UrgencyBackBtn>
                <S.GoalsContinue
                  type="button"
                  onClick={() => {
                    if (urgency === 'urgent') setPhase('getStarted')
                    else if (urgency === 'live_1on1') setPhase('requestLiveDemo')
                    else setPhase('explore')
                  }}
                >
                  Continue
                </S.GoalsContinue>
              </S.UrgencyNav>
            </S.UrgencyInner>
          </S.UrgencyShell>
        ) : null}

        {phase === 'getStarted' ? (
          <>
            {showPinExtensionPrompt ? (
              <S.PinExtensionModalRoot>
                <S.PinExtensionModalOverlay
                  aria-hidden
                  onClick={onDismissPinPrompt}
                />
                <S.PinExtensionModalPanel
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="pin-extension-dialog-title"
                >
                  <S.PinExtensionToastInner>
                    <S.PinExtensionIconRow>
                      <S.PinExtensionIconCircle>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={20}
                          height={20}
                          fill="currentColor"
                          viewBox="0 0 256 256"
                          aria-hidden
                        >
                          <path d="M235.33,104l-53.47,53.65c4.56,12.67,6.45,33.89-13.19,60A15.93,15.93,0,0,1,157,224c-.38,0-.75,0-1.13,0a16,16,0,0,1-11.32-4.69L96.29,171,53.66,213.66a8,8,0,0,1-11.32-11.32L85,159.71l-48.3-48.3A16,16,0,0,1,38,87.63c25.42-20.51,49.75-16.48,60.4-13.14L152,20.7a16,16,0,0,1,22.63,0l60.69,60.68A16,16,0,0,1,235.33,104Z" />
                        </svg>
                      </S.PinExtensionIconCircle>
                    </S.PinExtensionIconRow>
                    <S.PinExtensionTitle id="pin-extension-dialog-title">
                      Pin Live Demo for easy access
                    </S.PinExtensionTitle>
                    <S.PinExtensionLead>
                      Record any walkthrough directly from your browser toolbar.
                    </S.PinExtensionLead>
                    <S.PinExtensionVideoWrap>
                      <S.PinExtensionImage src={pinLivedemoImage} alt="How to pin Live Demo extension" />
                    </S.PinExtensionVideoWrap>
                    <S.PinExtensionLaterBtn type="button" onClick={onDismissPinPrompt}>
                      Pin Extension Later
                    </S.PinExtensionLaterBtn>
                  </S.PinExtensionToastInner>
                </S.PinExtensionModalPanel>
              </S.PinExtensionModalRoot>
            ) : null}
            <S.GetStartedShell>
              <S.GetStartedInner>
              <S.GoalsHeader>
                <S.GoalsTitle>Get started with Live Demo</S.GoalsTitle>
                <S.GoalsSub>Create your first interactive demo in minutes</S.GoalsSub>
              </S.GoalsHeader>
              <S.GetStartedGrid>
                <S.GetStartedCard
                  $borderAccent={!extensionInstalled}
                  $fade={!!extensionInstalled}
                >
                  <S.GetStartedStepBadge
                    $active={!extensionInstalled}
                    $inactive={!!extensionInstalled}
                  >
                    1
                  </S.GetStartedStepBadge>
                  <S.GetStartedImgWrap>
                    <S.GetStartedImg
                      src={GET_STARTED_IMAGES.extension}
                      alt="Get extension"
                    />
                  </S.GetStartedImgWrap>
                  <S.GetStartedCardBody>
                    {extensionInstalled ? (
                      <S.InstalledBanner>
                        <MdCheck size={18} aria-hidden />
                        Installed
                      </S.InstalledBanner>
                    ) : (
                      <S.GetStartedPrimaryBtn
                        type="button"
                        onClick={() =>
                          window.open(chromeStoreUrl, '_blank', 'noopener,noreferrer')
                        }
                      >
                        <FaChrome size={18} aria-hidden />
                        Get extension
                      </S.GetStartedPrimaryBtn>
                    )}
                    <S.GetStartedHelp>
                      We recommend the Chrome extension. Not web-based? Upload content or use the{' '}
                      <S.GetStartedLink
                        href={ENV.LANDING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        desktop recorder
                      </S.GetStartedLink>
                      .
                    </S.GetStartedHelp>
                  </S.GetStartedCardBody>
                </S.GetStartedCard>

                <S.GetStartedCard
                  $borderAccent={!!extensionInstalled}
                  $fade={!extensionInstalled}
                >
                  <S.GetStartedStepBadge
                    $active={!!extensionInstalled}
                    $inactive={!extensionInstalled}
                  >
                    2
                  </S.GetStartedStepBadge>
                  <S.GetStartedImgWrap>
                    <S.GetStartedImg
                      src={GET_STARTED_IMAGES.record}
                      alt="Create your first Live Demo"
                    />
                  </S.GetStartedImgWrap>
                  <S.GetStartedCardBody>
                    <S.GetStartedPrimaryBtn
                      type="button"
                      disabled={!extensionInstalled}
                      onClick={() => setRecordDemoModalOpen(true)}
                    >
                      <MdFiberManualRecord size={18} aria-hidden />
                      Create your first Live Demo
                    </S.GetStartedPrimaryBtn>
                    <S.GetStartedHelp>
                      Complete your flow once — Live Demo turns it into an interactive demo
                      automatically.
                    </S.GetStartedHelp>
                  </S.GetStartedCardBody>
                </S.GetStartedCard>

                <S.GetStartedCard $fade>
                  <S.GetStartedStepBadge $inactive>3</S.GetStartedStepBadge>
                  <S.GetStartedImgWrap>
                    <S.GetStartedImg
                      src={GET_STARTED_IMAGES.share}
                      alt="Share your Live Demo"
                    />
                  </S.GetStartedImgWrap>
                  <S.GetStartedCardBody>
                    <S.GetStartedSharePlaceholder>
                      <MdIosShare size={18} aria-hidden />
                      <span>Share your Live Demo</span>
                    </S.GetStartedSharePlaceholder>
                    <S.GetStartedHelp>
                      Share via link or embed anywhere — with built-in tracking and insights.
                    </S.GetStartedHelp>
                  </S.GetStartedCardBody>
                </S.GetStartedCard>
              </S.GetStartedGrid>
            </S.GetStartedInner>
          </S.GetStartedShell>
          </>
        ) : null}

        {phase === 'requestLiveDemo' ? (
          <S.RequestLiveShell>
            <S.RequestLiveInner>
              <S.RequestLiveMobileHeader>
                <S.RequestLiveMobileTitle>Request a Live Demo</S.RequestLiveMobileTitle>
                <S.RequestLiveMobileLead>
                  Get a personalized walkthrough tailored to your goals.
                </S.RequestLiveMobileLead>
              </S.RequestLiveMobileHeader>

              <S.RequestLiveColumns>
                <S.RequestLiveLeft>
                  <S.RequestLiveDesktopHeading>
                    <S.RequestLiveTitleRow>
                      <S.RequestLiveH1>Request a Live Demo</S.RequestLiveH1>
                      <S.RequestLiveAvatarStack>
                        {LIVE_DEMO_TEAM_AVATARS.map((a) => (
                          <S.RequestLiveAvatar
                            key={a.alt}
                            src={a.src}
                            alt={a.alt}
                            loading="lazy"
                            width={36}
                            height={36}
                          />
                        ))}
                      </S.RequestLiveAvatarStack>
                    </S.RequestLiveTitleRow>
                    <S.RequestLiveLead>
                      Get a personalized walkthrough tailored to your goals.
                    </S.RequestLiveLead>
                  </S.RequestLiveDesktopHeading>

                  <S.ExpectCard>
                    <S.ExpectCardHead>
                      <S.ExpectIcon aria-hidden>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
                          <path d={CLIPBOARD_ICON_PATH} />
                        </svg>
                      </S.ExpectIcon>
                      <S.ExpectCardTitle>What to expect</S.ExpectCardTitle>
                    </S.ExpectCardHead>
                    <S.ExpectList>
                      {LIVE_DEMO_EXPECTATIONS.map((line) => (
                        <S.ExpectRow key={line}>
                          <S.ExpectCheck aria-hidden>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
                              <path d={URGENCY_CHECK_PATH} />
                            </svg>
                          </S.ExpectCheck>
                          <S.ExpectText>{line}</S.ExpectText>
                        </S.ExpectRow>
                      ))}
                    </S.ExpectList>
                  </S.ExpectCard>

                  <S.RequestLiveCtaBlock>
                    <S.RequestLiveCtaHint>
                      Or explore tutorials, examples, and resources at your own pace.
                    </S.RequestLiveCtaHint>
                    <S.RequestLiveExploreBtn
                      type="button"
                      onClick={() => {
                        setActiveStep(1)
                        setPhase('explore')
                      }}
                    >
                      Explore on your own
                    </S.RequestLiveExploreBtn>
                  </S.RequestLiveCtaBlock>
                </S.RequestLiveLeft>

                <S.RequestLiveRight>
                  <S.RequestLiveIframeWrap>
                    <S.RequestLiveIframe
                      title="Schedule a live walkthrough"
                      src={CAL_BOOKING_EMBED_URL}
                    />
                  </S.RequestLiveIframeWrap>
                </S.RequestLiveRight>
              </S.RequestLiveColumns>
            </S.RequestLiveInner>
          </S.RequestLiveShell>
        ) : null}

        {phase === 'explore' ? (
          <React.Fragment>
        <S.ExploreOuter>
          <S.ExploreTitleBlock>
            <S.ExplorePageTitle>Explore what Live Demo can do</S.ExplorePageTitle>
          </S.ExploreTitleBlock>

          <S.ExploreStepsRow role="navigation" aria-label="Onboarding steps">
            {STEPS.map((step, index) => (
              <S.ExploreStepUnit key={step.key}>
                <S.ExploreStepPill
                  type="button"
                  $active={activeStep === step.key}
                  onClick={() => {
                    if (step.key === 3) setPhase('getStarted')
                    else setActiveStep(step.key)
                  }}
                  aria-current={activeStep === step.key ? 'step' : undefined}
                >
                  <S.ExplorePillBadge $active={activeStep === step.key}>{step.key}</S.ExplorePillBadge>
                  <S.ExplorePillText>
                    <S.ExplorePillTitle $active={activeStep === step.key}>{step.title}</S.ExplorePillTitle>
                    <S.ExplorePillSub $active={activeStep === step.key}>{step.subtitle}</S.ExplorePillSub>
                  </S.ExplorePillText>
                </S.ExploreStepPill>
                {index < STEPS.length - 1 ? <S.ExploreStepConnector aria-hidden /> : null}
              </S.ExploreStepUnit>
            ))}
          </S.ExploreStepsRow>

        {activeStep === 1 ? (
          <S.ExploreVideoBlock>
            <S.ExploreAspectVideo>
              <S.ExploreYoutubeIframe
                title="Interactive demo 101"
                src={INTERACTIVE_DEMO_101_YOUTUBE_EMBED}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </S.ExploreAspectVideo>
          </S.ExploreVideoBlock>
        ) : null}

        {activeStep === 2 ? (
          <S.ShowcaseBlock>
            <S.ShowcaseIntro>
              <S.ShowcaseIntroTitle>Gallery</S.ShowcaseIntroTitle>
              <S.ShowcaseIntroDesc>
                See example product demos that are built with Live Demo
              </S.ShowcaseIntroDesc>
            </S.ShowcaseIntro>
            <S.ShowcaseGrid>
              {SHOWCASE_PRODUCTS.map((product, index) => {
                const hasGif = !!product.gif
                const clipId = `onb-see-demo-${index}`
                return (
                  <S.ShowcaseProduct
                    key={product.title}
                    type="button"
                    onClick={() => {
                      setShowcaseModalOpen(true)
                      setShowcaseProduct(product)
                    }}
                  >
                    <S.ShowcaseProductTop>
                      <S.ShowcaseProductTitle>{product.title}</S.ShowcaseProductTitle>
                      <S.ShowcaseProductSee>
                        See Demo <SeeDemoIcon clipId={clipId} />
                      </S.ShowcaseProductSee>
                    </S.ShowcaseProductTop>
                    <S.ShowcaseProductImage
                      $contentUrl={product.image}
                      $hasGif={hasGif}
                      $gifUrl={product.gif || ''}
                      alt=""
                      role="presentation"
                    />
                  </S.ShowcaseProduct>
                )
              })}
            </S.ShowcaseGrid>
            <S.ShowcaseDisclaimer>
              * Live Demo is not affiliated with any of the products or companies listed above.
            </S.ShowcaseDisclaimer>
          </S.ShowcaseBlock>
        ) : null}

        {activeStep <= 2 ? (
          <S.BottomNav>
            <S.ContinueButton
              type="button"
              onClick={() => {
                if (activeStep === 2) setPhase('getStarted')
                else setActiveStep((s) => s + 1)
              }}
            >
              {activeStep === 2 ? 'Get started' : 'Continue'}
              <MdArrowForward size={18} aria-hidden />
            </S.ContinueButton>
          </S.BottomNav>
        ) : null}
        </S.ExploreOuter>
          </React.Fragment>
        ) : null}
      </S.Main>

      <S.ShowcaseModal
        title={null}
        footer={null}
        open={showcaseModalOpen}
        onCancel={() => {
          setShowcaseModalOpen(false)
          setShowcaseProduct(null)
        }}
        destroyOnClose
      >
        {showcaseProduct ? (
          <S.ShowcaseModalBody>
            <S.ShowcaseModalTitle>{showcaseProduct.title}</S.ShowcaseModalTitle>
            <S.ShowcaseIframeWrap
              style={{
                position: 'relative',
                paddingBottom: 'calc(54.92874109263658% + 41px)',
                height: 0,
              }}
            >
              <iframe
                src={showcaseProduct.demoLink}
                title={showcaseProduct.title}
                frameBorder={0}
                loading="lazy"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '89%',
                  borderRadius: '6px',
                }}
              />
            </S.ShowcaseIframeWrap>
          </S.ShowcaseModalBody>
        ) : null}
      </S.ShowcaseModal>

      <S.RecordDemoModal
        title={null}
        footer={null}
        open={recordDemoModalOpen}
        onCancel={closeRecordDemoModal}
        closable={false}
        centered
        destroyOnClose
        width={896}
        zIndex={10050}
        styles={{
          body: { padding: 0, overflow: 'visible' },
          content: { padding: 0, borderRadius: 24, overflow: 'visible' },
        }}
        maskClosable
      >
        <S.RecordModalInner>
          <S.RecordModalClose type="button" onClick={closeRecordDemoModal} aria-label="Close dialog">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" aria-hidden>
              <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
            </svg>
          </S.RecordModalClose>
          <S.RecordModalVideoSection>
            <S.RecordModalAspect>
              <S.RecordModalVideoIframe
                title="How recording works"
                src={INTERACTIVE_DEMO_FIRST_DEMO_YOUTUBE_EMBED}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </S.RecordModalAspect>
          </S.RecordModalVideoSection>
          <S.RecordModalUrlSection>
            <S.RecordModalHint>
              Enter your website below to automatically create a demo of your website
            </S.RecordModalHint>
            <UrlToDemo inModal onSuccess={closeRecordDemoModal} />
          </S.RecordModalUrlSection>
        </S.RecordModalInner>
      </S.RecordDemoModal>

      <S.HelpFab type="button" onClick={openHelp} aria-label="Help">
        ?
      </S.HelpFab>
    </S.Page>
  )
}

const purple = {
  primary: '#5d5fef',
  soft: '#e8e9fd',
  border: '#c9cafc',
  text: '#3730a3',
}

const S = {
  Page: styled.div`
    position: relative;
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
    background: #fafafa;
    font-family: ${mainColors.fontFamily};
    color: ${mainColors.primaryText};
    padding: 24px 32px 80px;
    box-sizing: border-box;

    ${(p) =>
      p.$whiteIntro &&
      `
      background: #fff;
      padding: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `}
  `,
  GoalsBlobLayer: styled.div`
    pointer-events: none;
    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: 0;
  `,
  GoalsBlob: styled.div`
    position: absolute;
    width: 16rem;
    height: 16rem;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.2;
    ${(p) =>
      p.$tl
        ? `
      top: -4rem;
      left: -4rem;
      background: linear-gradient(to bottom right, #c084fc, #818cf8);
    `
        : `
      bottom: -4rem;
      right: -4rem;
      background: linear-gradient(to bottom right, #f472b6, #c084fc);
    `}
  `,
  Glow: styled.div`
    position: fixed;
    width: min(520px, 70vw);
    height: min(520px, 70vw);
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.35;
    pointer-events: none;
    z-index: 0;
    background: ${(p) =>
      p.$corner === 'tl'
        ? 'radial-gradient(circle, #e9d5ff 0%, #fbcfe8 45%, transparent 70%)'
        : 'radial-gradient(circle, #ddd6fe 0%, #fce7f3 45%, transparent 70%)'};
    ${(p) => (p.$corner === 'tl' ? `top: -120px; left: -120px;` : `bottom: -140px; right: -100px;`)}
  `,
  TopBar: styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1120px;
    margin: 0 auto 8px;

    ${(p) =>
      p.$whiteIntro &&
      `
      max-width: 72rem;
      width: 100%;
      margin-bottom: 0;
      padding: 0 1rem;
      padding-top: 0.5rem;
      @media (min-width: 640px) {
        padding: 0.5rem 3rem 0;
      }
    `}
  `,
  TextButton: styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: ${(p) => {
      if (p.$emphasis && p.$introPrimary) return mainColors.primaryColor
      return p.$emphasis ? purple.primary : '#4b5563'
    }};
    padding: 8px 4px;
    font-family: inherit;

    &:hover {
      color: ${(p) => {
        if (p.$emphasis && p.$introPrimary) return mainColors.primaryColorDarker
        return p.$emphasis ? '#4f46e5' : '#111827'
      }};
    }
  `,
  Main: styled.div`
    position: relative;
    z-index: 1;
    max-width: 1120px;
    margin: 0 auto;

    ${(p) =>
      p.$whiteIntro &&
      `
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: ${p.$explore ? 'flex-start' : 'center'};
      align-items: stretch;
      max-width: none;
      width: 100%;
      margin: 0;
      min-height: 0;
      ${
        p.$explore
          ? `
      padding-top: 1rem;
      @media (min-width: 640px) {
        padding-top: 2.5rem;
      }
      `
          : ''
      }
    `}
  `,
  GoalsShell: styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      'Helvetica Neue', Arial, sans-serif;
  `,
  GoalsInner: styled.div`
    width: 100%;
    max-width: 72rem;
    margin: 0 auto;
    padding: 1.5rem 1rem;

    @media (min-width: 640px) {
      padding: 2.5rem 3rem;
    }
  `,
  GoalsHeader: styled.div`
    text-align: center;
    margin-bottom: 1.5rem;

    @media (min-width: 640px) {
      margin-bottom: 2.5rem;
    }
  `,
  GoalsTitle: styled.h1`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.025em;
    color: #111827;
    line-height: 1.25;

    @media (min-width: 640px) {
      font-size: 1.875rem;
    }
  `,
  GoalsSub: styled.p`
    margin: 0.5rem 0 0;
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;

    @media (min-width: 640px) {
      margin-top: 0.75rem;
      font-size: 1rem;
    }
  `,
  IntroCenter: styled.div`
    max-width: ${(p) => (p.$narrow ? '560px' : '720px')};
    margin: 0 auto;
    padding-top: 8px;
  `,
  IntroTitle: styled.h1`
    text-align: center;
    font-size: clamp(24px, 2.8vw, 32px);
    font-weight: 700;
    margin: 0 auto 10px;
    letter-spacing: -0.02em;
    color: #111827;
    line-height: 1.25;
  `,
  IntroSubtitle: styled.p`
    text-align: center;
    font-size: 15px;
    color: #9ca3af;
    margin: 0 auto 28px;
  `,
  GoalsGrid: styled.div`
    display: grid;
    max-width: 42rem;
    margin: 0 auto;
    grid-template-columns: 1fr;
    gap: 0.5rem;

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
  `,
  GoalCard: styled.button`
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    text-align: left;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    border: 2px solid ${(p) => (p.$selected ? mainColors.primaryColor : '#e5e7eb')};
    background: #fff;
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

    @media (min-width: 640px) {
      gap: 1rem;
      padding: 1rem 1.25rem;
    }

    &:hover {
      border-color: ${(p) => (p.$selected ? mainColors.primaryColor : '#d1d5db')};
      box-shadow: ${(p) => (!p.$selected ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none')};
    }

    ${(p) =>
      p.$selected &&
      `
      background: linear-gradient(180deg, #fafaff 0%, #fff 100%);
      box-shadow: 0 0 0 1px ${mainColors.primaryColor}14;
    `}
  `,
  GoalIconWrap: styled.span`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0.375rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    background: linear-gradient(to bottom right, #ffffff, #eef4ff);
    color: #6b7280;

    @media (min-width: 640px) {
      width: 2.5rem;
      height: 2.5rem;
      padding: 0.5rem;
      border-radius: 0.75rem;
    }

    svg {
      width: 1rem;
      height: 1rem;

      @media (min-width: 640px) {
        width: 22px;
        height: 22px;
      }
    }
  `,
  GoalLabel: styled.span`
    flex: 1;
    padding-right: 2rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #111827;
    line-height: 1.35;

    @media (min-width: 640px) {
      font-size: 0.875rem;
    }
  `,
  GoalIndicator: styled.span`
    position: absolute;
    top: 50%;
    right: 0.75rem;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 2px solid ${(p) => (p.$selected ? mainColors.primaryColor : '#d1d5db')};
    background: ${(p) => (p.$selected ? mainColors.primaryColor : '#fff')};
    color: #fff;

    @media (min-width: 640px) {
      right: 1rem;
      width: 1.25rem;
      height: 1.25rem;
    }
  `,
  GoalsActionRow: styled.div`
    display: flex;
    max-width: 42rem;
    margin: 1.5rem auto 0;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    @media (min-width: 640px) {
      margin-top: 2.5rem;
    }
  `,
  GoalsContinue: styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    min-height: 2.25rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-family: inherit;
    background: ${mainColors.primaryColor};
    color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: background 0.2s ease, opacity 0.2s ease;

    @media (min-width: 640px) {
      padding: 0.5rem 1.5rem;
      font-size: 1rem;
    }

    &:hover:not(:disabled) {
      background: ${mainColors.primaryColorDarker};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
  `,
  UrgencyShell: styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      'Helvetica Neue', Arial, sans-serif;
  `,
  UrgencyInner: styled.div`
    width: 100%;
    max-width: 72rem;
    margin: 0 auto;
    padding: 1.5rem 1rem;

    @media (min-width: 640px) {
      padding: 2.5rem 3rem;
    }
  `,
  UrgencyHeader: styled.div`
    text-align: center;
    margin-bottom: 1.5rem;

    @media (min-width: 640px) {
      margin-bottom: 2.5rem;
    }
  `,
  UrgencyHeading: styled.h1`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.025em;
    color: #111827;
    line-height: 1.25;

    @media (min-width: 640px) {
      font-size: 1.875rem;
    }
  `,
  UrgencyLead: styled.p`
    margin: 0.5rem 0 0;
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;

    @media (min-width: 640px) {
      margin-top: 0.75rem;
      font-size: 1rem;
    }
  `,
  UrgencyStack: styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 36rem;
    margin: 0 auto;

    @media (min-width: 640px) {
      gap: 1.5rem;
    }
  `,
  UrgencyOptionWrap: styled.div`
    position: relative;
  `,
  UrgencyPill: styled.span`
    position: absolute;
    top: -0.625rem;
    left: 0.75rem;
    z-index: 10;
    border-radius: 999px;
    padding: 0.125rem 0.5rem;
    font-size: 10px;
    font-weight: 500;
    line-height: 1.25;

    @media (min-width: 640px) {
      left: 1rem;
      padding: 0.125rem 0.625rem;
      font-size: 0.75rem;
    }

    ${(p) =>
      p.$variant === 'solid'
        ? `
      background: ${mainColors.primaryColor};
      color: #fff;
    `
        : `
      background: #eef2ff;
      color: ${mainColors.primaryColor};
    `}
  `,
  UrgencyOptionBtn: styled.button`
    position: relative;
    display: flex;
    width: 100%;
    align-items: center;
    gap: 0.75rem;
    text-align: left;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    border: 2px solid ${(p) => (p.$selected ? mainColors.primaryColor : '#e5e7eb')};
    background: ${(p) => (p.$selected ? '#eef2ff' : '#fff')};
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

    @media (min-width: 640px) {
      gap: 1rem;
      padding: 1rem 1.25rem;
    }

    &:hover {
      border-color: ${(p) => (p.$selected ? mainColors.primaryColor : '#d1d5db')};
      box-shadow: ${(p) => (!p.$selected ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none')};
    }

    ${(p) =>
      p.$selected &&
      `
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    `}
  `,
  UrgencyIconBox: styled.span`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0.375rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    background: linear-gradient(to bottom right, #ffffff, #eef4ff);
    color: ${(p) => (p.$selected ? '#3730a3' : '#6b7280')};

    @media (min-width: 640px) {
      width: 2.5rem;
      height: 2.5rem;
      padding: 0.5rem;
      border-radius: 0.75rem;
    }

    svg {
      width: 1rem;
      height: 1rem;

      @media (min-width: 640px) {
        width: 22px;
        height: 22px;
      }
    }
  `,
  UrgencyLabel: styled.span`
    flex: 1;
    padding-right: 2rem;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.35;
    color: ${(p) => (p.$selected ? '#312e81' : '#111827')};

    @media (min-width: 640px) {
      font-size: 0.875rem;
    }
  `,
  UrgencyTick: styled.span`
    position: absolute;
    top: 50%;
    right: 0.75rem;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    color: #fff;
    background: ${(p) => (p.$selected ? mainColors.primaryColor : '#fff')};
    border: ${(p) => (p.$selected ? 'none' : '2px solid #d1d5db')};

    @media (min-width: 640px) {
      right: 1rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    svg {
      width: 0.625rem;
      height: 0.625rem;

      @media (min-width: 640px) {
        width: 0.75rem;
        height: 0.75rem;
      }
    }
  `,
  UrgencyNav: styled.div`
    display: flex;
    max-width: 36rem;
    margin: 1.5rem auto 0;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    @media (min-width: 640px) {
      margin-top: 2.5rem;
    }
  `,
  UrgencyBackBtn: styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    background: #fff;
    color: #0f172a;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    min-height: 2.25rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-family: inherit;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: background 0.15s ease, border-color 0.15s ease;

    @media (min-width: 640px) {
      padding: 0.5rem 1.5rem;
      font-size: 1rem;
    }

    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
  `,
  ExploreOuter: styled.div`
    width: 100%;
    max-width: 72rem;
    margin: 0 auto;
    padding: 0 1rem 1.5rem;

    @media (min-width: 640px) {
      padding: 0 0 2.5rem;
    }
  `,
  ExploreTitleBlock: styled.div`
    margin-bottom: 1.5rem;
    text-align: center;

    @media (min-width: 640px) {
      margin-bottom: 2rem;
      padding: 0 3rem;
    }
  `,
  ExplorePageTitle: styled.h1`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.025em;
    color: #111827;

    @media (min-width: 640px) {
      font-size: 1.875rem;
    }
  `,
  ExploreStepsRow: styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 56rem;
    margin: 0 auto 1.5rem;

    @media (min-width: 640px) {
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 2rem;
      padding: 0 3rem;
    }
  `,
  ExploreStepUnit: styled.div`
    display: flex;
    align-items: center;
    width: 100%;

    @media (min-width: 640px) {
      width: auto;
    }
  `,
  ExploreStepPill: styled.button`
    display: flex;
    width: 100%;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.75rem;
    border: 2px solid
      ${(p) => (p.$active ? mainColors.primaryColor : '#e5e7eb')};
    padding: 0.625rem 0.75rem;
    text-align: left;
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
    background: ${(p) =>
      p.$active ? `color-mix(in srgb, ${mainColors.primaryColor} 10%, white)` : '#fff'};
    box-shadow: ${(p) =>
      p.$active
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
        : 'none'};

    @media (min-width: 640px) {
      gap: 0.75rem;
      width: auto;
      padding: 0.75rem 1rem;
    }

    &:hover {
      border-color: ${(p) => (p.$active ? mainColors.primaryColor : '#d1d5db')};
      box-shadow: ${(p) =>
        p.$active
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
          : '0 1px 2px rgba(0, 0, 0, 0.05)'};
    }
  `,
  ExplorePillBadge: styled.span`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    transition: background 0.2s ease, color 0.2s ease;
    background: ${(p) => (p.$active ? mainColors.primaryColor : '#f3f4f6')};
    color: ${(p) => (p.$active ? '#fff' : '#6b7280')};

    @media (min-width: 640px) {
      width: 2rem;
      height: 2rem;
      font-size: 0.875rem;
    }
  `,
  ExplorePillText: styled.div`
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.125rem;
  `,
  ExplorePillTitle: styled.span`
    font-size: 0.75rem;
    font-weight: 500;
    transition: color 0.2s ease;
    color: ${(p) => (p.$active ? '#1e1b4b' : '#111827')};

    @media (min-width: 640px) {
      font-size: 0.875rem;
    }
  `,
  ExplorePillSub: styled.span`
    font-size: 11px;
    transition: color 0.2s ease;
    color: ${(p) => (p.$active ? mainColors.primaryColor : '#6b7280')};

    @media (min-width: 640px) {
      font-size: 0.75rem;
    }
  `,
  ExploreStepConnector: styled.div`
    display: none;
    flex-shrink: 0;
    width: 2rem;
    margin: 0 0.75rem;
    border-top: 2px dashed #d1d5db;

    @media (min-width: 640px) {
      display: block;
    }
  `,
  ExploreVideoBlock: styled.div`
    max-width: 64rem;
    margin: 0 auto;

    @media (min-width: 640px) {
      padding: 0 3rem;
    }
  `,
  ExploreAspectVideo: styled.div`
    position: relative;
    aspect-ratio: 16 / 9;
    width: 100%;
    overflow: hidden;
    border-radius: 0.75rem;
    border: 1px solid #e5e7eb;
    background: #000;
  `,
  ExploreYoutubeIframe: styled.iframe`
    position: absolute;
    inset: 0;
    display: block;
    height: 100%;
    width: 100%;
    border: 0;
  `,
  ShowcaseBlock: styled.div`
    width: 100%;
    max-width: 100%;
  `,
  ShowcaseIntro: styled.div`
    margin-bottom: 1.25rem;
    text-align: center;
  `,
  ShowcaseIntroTitle: styled.h2`
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;

    @media (min-width: 640px) {
      font-size: 2rem;
    }
  `,
  ShowcaseIntroDesc: styled.p`
    margin: 0;
    font-size: 0.9375rem;
    color: #4b5563;

    @media (min-width: 640px) {
      font-size: 1.125rem;
    }
  `,
  ShowcaseGrid: styled.div`
    display: grid;
    width: 100%;
    max-width: 100%;
    margin: 0 auto 1rem;
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 1.5rem;
    grid-row-gap: 1.5rem;

    @media screen and (max-width: 991px) {
      grid-template-columns: 1fr 1fr;
    }

    @media screen and (max-width: 767px) {
      grid-template-columns: 1fr;
    }
  `,
  ShowcaseProduct: styled.button`
    display: block;
    overflow: hidden;
    height: 250px;
    padding: 0.5rem;
    box-sizing: border-box;
    border: 1px solid ${mainColors.primaryColor};
    border-radius: 8px;
    box-shadow: 4px 4px 0 0 ${mainColors.primaryColor};
    background: #fff;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: 4px 4px 0 0 ${mainColors.primaryColorDarker};
    }
  `,
  ShowcaseProductTop: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 0.25rem;
  `,
  ShowcaseProductTitle: styled.span`
    font-weight: 550;
    color: #000;
    font-size: 1rem;
  `,
  ShowcaseProductSee: styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 400;
    color: #000;
    font-size: 0.8rem;
    text-transform: uppercase;
  `,
  ShowcaseProductImage: styled.img`
    display: block;
    width: 100%;
    height: 75%;
    margin: 0 auto;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #111;
    content: url(${(p) => p.$contentUrl});

    ${(p) =>
      p.$hasGif &&
      p.$gifUrl &&
      `
      &:hover {
        content: url(${p.$gifUrl});
      }
    `}
  `,
  ShowcaseDisclaimer: styled.p`
    margin: 0;
    padding-bottom: 0.5rem;
    font-size: 14px;
    font-weight: 400;
    color: #6a6a6a;
    text-align: center;
  `,
  ShowcaseModal: styled(Modal)`
    && {
      animation-duration: 0s !important;
      width: 65% !important;
        max-width: 900px;
    }

    @media screen and (max-width: 767px) {
      && {
        width: 100% !important;
        max-width: 100% !important;
      }

      && .ant-modal-body {
        padding: 0 !important;
      }
    }

    && .ant-modal-close-x svg {
      fill: #fff !important;
    }

    && .ant-modal-content {
      width: 100%;
      height: auto;
      background: #0f2027;
      background: linear-gradient(to right, #2c5364, #203a43, #0f2027);
    }
  `,
  ShowcaseModalBody: styled.div`
    display: block;
    width: 100%;
    height: 100%;
  `,
  ShowcaseModalTitle: styled.h2`
    margin: 0 0 0.75rem;
    font-size: 24px;
    font-weight: 400;
    color: #f9f9f9;
    text-align: center;
  `,
  ShowcaseIframeWrap: styled.div`
    width: 100%;
    height: 100%;
    display: block;
    background: #0f2027;
    background: linear-gradient(to right, #2c5364, #203a43, #0f2027);
  `,
  RecordDemoModal: styled(Modal)`
    /* className is applied to the .ant-modal dialog node; antd’s default overflow:hidden clips the form error */
    && {
      overflow: visible !important;
    }

    && .ant-modal-mask {
      background: rgba(107, 114, 128, 0.75) !important;
    }

    && .ant-modal-content {
      box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 8px 10px -6px rgba(0, 0, 0, 0.1);
    }

    @media screen and (max-width: 767px) {
      && {
        max-width: calc(100vw - 32px) !important;
        margin: 16px !important;
      }
    }
  `,
  RecordModalInner: styled.div`
    position: relative;
    background: #fff;
    border-radius: 24px;
    overflow: hidden;
    font-family:
      ui-sans-serif,
      system-ui,
      -apple-system,
      'Segoe UI',
      Roboto,
      'Helvetica Neue',
      Arial,
      sans-serif;
  `,
  RecordModalClose: styled.button`
    position: absolute;
    right: 12px;
    top: 12px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 6px;
    border: none;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  `,
  RecordModalVideoSection: styled.div`
    position: relative;
    border-bottom: 1px solid #e5e7eb;
    overflow: hidden;
  `,
  RecordModalAspect: styled.div`
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
  `,
  RecordModalVideoIframe: styled.iframe`
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
  `,
  RecordModalUrlSection: styled.div`
    padding: 24px 32px 32px;
    background: #fff;

    @media screen and (max-width: 639px) {
      padding: 20px 16px 24px;
    }
  `,
  RecordModalHint: styled.p`
    margin: 0 0 20px;
    text-align: center;
    font-size: 14px;
    line-height: 1.5;
    color: #374151;
  `,
  BottomNav: styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 32px;
  `,
  ContinueButton: styled.button`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: none;
    border-radius: 10px;
    padding: 12px 22px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    font-family: inherit;
    background: ${purple.primary};
    color: #fff;

    &:hover {
      filter: brightness(0.95);
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      filter: none;
    }
  `,
  PinExtensionModalRoot: styled.div`
    position: fixed;
    inset: 0;
    z-index: 10000;
    pointer-events: none;
  `,
  PinExtensionModalOverlay: styled.div`
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    pointer-events: auto;
    cursor: pointer;
  `,
  PinExtensionModalPanel: styled.div`
    position: absolute;
    top: max(1.5rem, env(safe-area-inset-top, 0px));
    right: max(1.5rem, env(safe-area-inset-right, 0px));
    z-index: 1;
    box-sizing: border-box;
    width: calc(100% - 3rem);
    max-width: 24rem;
    overflow: hidden;
    border-radius: 1rem;
    background: #fff;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
    pointer-events: auto;
  `,
  PinExtensionToastInner: styled.div`
    padding: 1.5rem;
  `,
  PinExtensionIconRow: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  `,
  PinExtensionIconCircle: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    background: rgba(16, 112, 255, 0.12);
    color: ${mainColors.primaryColor};
  `,
  PinExtensionTitle: styled.h2`
    margin: 0 0 0.5rem;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.4;
    color: #111827;
  `,
  PinExtensionLead: styled.p`
    margin: 0 0 1.5rem;
    text-align: center;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #4b5563;
  `,
  PinExtensionVideoWrap: styled.div`
    margin-bottom: 1.5rem;
    overflow: hidden;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
  `,
  PinExtensionImage: styled.img`
    display: block;
    width: 100%;
    height: auto;
  `,
  PinExtensionLaterBtn: styled.button`
    display: inline-flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 2.25rem;
    padding: 0.5rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    color: #0f172a;
    background: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: background 0.15s ease;

    &:hover {
      background: #f1f5f9;
    }
  `,
  GetStartedShell: styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  `,
  GetStartedInner: styled.div`
    width: 100%;
    max-width: 72rem;
    margin: 0 auto;
    padding: 1.5rem 1rem;

    @media (min-width: 640px) {
      padding: 2.5rem 3rem;
    }
  `,
  GetStartedGrid: styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;

    @media (min-width: 960px) {
      grid-template-columns: repeat(3, 1fr);
    }
  `,
  GetStartedCard: styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 0.75rem;
    border: 1px solid
      ${(p) => (p.$borderAccent ? `${mainColors.primaryColor}55` : '#e5e7eb')};
    background: #fff;
    overflow: hidden;
    opacity: ${(p) => (p.$fade ? 0.5 : 1)};
    transition: opacity 0.2s ease, border-color 0.2s ease;
  `,
  GetStartedStepBadge: styled.div`
    position: absolute;
    top: -0.75rem;
    left: 1rem;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    border: 1px solid
      ${(p) => {
        if (p.$active) return mainColors.primaryColor
        return '#e5e7eb'
      }};
    background: ${(p) => {
      if (p.$active) return mainColors.primaryColor
      return 'linear-gradient(to bottom right, #ffffff, #f3f4f6)'
    }};
    color: ${(p) => {
      if (p.$active) return '#fff'
      return '#6b7280'
    }};
  `,
  GetStartedImgWrap: styled.div`
    height: 10rem;
    overflow: hidden;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;

    @media (min-width: 640px) {
      height: 13rem;
    }
  `,
  GetStartedImg: styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    display: block;
  `,
  GetStartedCardBody: styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 1rem 1rem 1.25rem;

    @media (min-width: 640px) {
      padding: 1.25rem 1.25rem 1.5rem;
    }
  `,
  GetStartedPrimaryBtn: styled.button`
    display: inline-flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    min-height: 2.25rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    color: #fff;
    background: ${mainColors.primaryColor};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:hover:not(:disabled) {
      background: ${mainColors.primaryColorDarker};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
  InstalledBanner: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid #bbf7d0;
    background: #f0fdf4;
    color: #16a34a;
    font-size: 0.875rem;
    font-weight: 500;
  `,
  GetStartedHelp: styled.p`
    margin: 0;
    text-align: center;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #374151;
  `,
  GetStartedLink: styled.a`
    color: inherit;
    text-decoration: underline;
    font-weight: 500;

    &:hover {
      color: #111827;
    }
  `,
  GetStartedSharePlaceholder: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.625rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    font-size: 0.875rem;
    font-weight: 500;
    color: #9ca3af;
  `,
  RequestLiveShell: styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  `,
  RequestLiveInner: styled.div`
    width: 100%;
    max-width: 80rem;
    margin: 0 auto;
    padding: 1rem 1rem 1.5rem;

    @media (min-width: 640px) {
      padding: 2.5rem 1.5rem 2.5rem;
      min-height: 700px;
    }
  `,
  RequestLiveMobileHeader: styled.div`
    text-align: center;
    margin-bottom: 1rem;

    @media (min-width: 640px) {
      display: none;
    }
  `,
  RequestLiveMobileTitle: styled.h1`
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: #111827;
  `,
  RequestLiveMobileLead: styled.p`
    margin: 0.5rem 0 0;
    font-size: 0.875rem;
    color: #4b5563;
    line-height: 1.5;
  `,
  RequestLiveColumns: styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    @media (min-width: 640px) {
      flex-direction: row;
      align-items: flex-start;
      gap: 4rem;
    }
  `,
  RequestLiveLeft: styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;

    @media (min-width: 640px) {
      flex: 0 0 40%;
      max-width: 40%;
    }
  `,
  RequestLiveDesktopHeading: styled.div`
    display: none;
    margin-bottom: 1.5rem;

    @media (min-width: 640px) {
      display: block;
    }
  `,
  RequestLiveTitleRow: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  `,
  RequestLiveH1: styled.h1`
    margin: 0;
    font-size: 1.875rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: #111827;
    line-height: 1.2;
  `,
  RequestLiveAvatarStack: styled.div`
    display: flex;
    align-items: center;

    & > * + * {
      margin-left: -0.5rem;
    }
  `,
  RequestLiveAvatar: styled.img`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #e5e7eb;
    object-fit: cover;
    background: #fff;
  `,
  RequestLiveLead: styled.p`
    margin: 0;
    max-width: 28rem;
    font-size: 1rem;
    line-height: 1.625;
    color: #4b5563;
  `,
  ExpectCard: styled.div`
    margin-bottom: 2rem;
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
  `,
  ExpectCardHead: styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  `,
  ExpectIcon: styled.span`
    display: flex;
    color: ${mainColors.primaryColor};

    svg {
      width: 20px;
      height: 20px;
    }
  `,
  ExpectCardTitle: styled.h3`
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: ${mainColors.primaryColor};
  `,
  ExpectList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  `,
  ExpectRow: styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  `,
  ExpectCheck: styled.span`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    background: linear-gradient(to bottom right, #ffffff, #eef4ff);
    color: ${mainColors.primaryColor};

    svg {
      width: 14px;
      height: 14px;
    }
  `,
  ExpectText: styled.span`
    font-size: 0.875rem;
    line-height: 1.5;
    color: #374151;
  `,
  RequestLiveCtaBlock: styled.div`
    margin-top: auto;
    padding-top: 0.5rem;
  `,
  RequestLiveCtaHint: styled.p`
    margin: 0 0 1rem;
    font-size: 0.875rem;
    color: #4b5563;
  `,
  RequestLiveExploreBtn: styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 2.25rem;
    padding: 0.5rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    color: #fff;
    background: ${mainColors.primaryColor};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:hover {
      background: ${mainColors.primaryColorDarker};
    }
  `,
  RequestLiveRight: styled.div`
    width: 100%;
    min-width: 0;

    @media (min-width: 640px) {
      flex: 1;
    }
  `,
  RequestLiveIframeWrap: styled.div`
    height: 100%;
    overflow: hidden;
    border-radius: 0.75rem;
    border: 1px solid #e5e7eb;
    background: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  `,
  RequestLiveIframe: styled.iframe`
    display: block;
    width: 100%;
    min-height: 450px;
    border: 0;

    @media (min-width: 640px) {
      min-height: 600px;
    }
  `,
  HelpFab: styled.button`
    position: fixed;
    right: 24px;
    bottom: 24px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid #e5e7eb;
    background: #fff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    font-size: 18px;
    font-weight: 700;
    color: #374151;
    z-index: 2;

    &:hover {
      background: #f9fafb;
    }
  `,
}

const mapStateToProps = (state) => ({
  authData: state.authReducer.authData,
})

export default connect(mapStateToProps)(OnboardingPage)
