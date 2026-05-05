import React, { useEffect, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  MdClose,
  MdSearch,
  MdNotificationsNone,
  MdGridView,
  MdLanguage,
  MdDarkMode,
  MdMenu,
  MdChevronRight,
  MdMoreVert,
} from 'react-icons/md'
import ENV from '../../config'

/** Hosted on landing site; falls back gracefully if missing */
const FINISH_RECORDING_VIDEO_URL = `${ENV.LANDING_URL}/finish-recording.mp4`

const VUEXY_PRIMARY = '#7367f0'
const VUEXY_BG = '#25293c'
const VUEXY_PAPER = '#2f3349'

const ping = keyframes`
  75%, 100% { transform: scale(2); opacity: 0; }
`

const S = {
  Page: styled.div`
    --bs-primary: ${VUEXY_PRIMARY};
    --bs-success: #28c76f;
    --bs-info: #00bad1;
    --bs-danger: #ff4c51;
    --bs-warning: #ff9f43;
    --bs-body-bg: ${VUEXY_BG};
    --bs-paper-bg: ${VUEXY_PAPER};
    --bs-heading-color: #cfcde4;
    --bs-body-color: #acabc1;
    --bs-secondary-color: #76778e;
    --bs-border-color: #44485e;
    --bs-menu-bg: ${VUEXY_PAPER};
    --bs-menu-color: #cfcde4;
    --bs-navbar-bg: ${VUEXY_PAPER};
    box-sizing: border-box;
    min-height: 100vh;
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 15px;
    line-height: 1.375;
    color: var(--bs-body-color);
    background: var(--bs-body-bg);
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
  `,

  ModalRoot: styled.div`
    position: fixed;
    inset: 0;
    z-index: 1000;
    overflow-y: auto;
  `,
  ModalBackdrop: styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
  `,
  ModalCenter: styled.div`
    position: relative;
    display: flex;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    padding: 16px;
  `,
  ModalCard: styled.div`
    position: relative;
    width: 100%;
    max-width: 768px;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    background: #fff;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  `,
  ModalClose: styled.button`
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    background: transparent;
    color: #9ca3af;
    cursor: pointer;
    transition: color 0.15s;
    &:hover {
      color: #4b5563;
    }
  `,
  ModalBody: styled.div`
    padding: 32px;
  `,
  ModalTitle: styled.h2`
    margin: 0 0 16px;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    text-align: center;
  `,
  StepRow: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  `,
  StepBadge: styled.div`
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: linear-gradient(to bottom right, #fff, #eef2ff);
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
  `,
  StepText: styled.p`
    margin: 0;
    font-size: 14px;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  `,
  PingWrap: styled.span`
    position: relative;
    display: inline-flex;
    height: 16px;
    width: 16px;
  `,
  PingRing: styled.span`
    position: absolute;
    display: inline-flex;
    height: 100%;
    width: 100%;
    border-radius: 9999px;
    background: #ea580c;
    opacity: 0.75;
    animation: ${ping} 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  `,
  PingDot: styled.span`
    position: relative;
    display: inline-flex;
    border-radius: 9999px;
    height: 16px;
    width: 16px;
    background: #ea580c;
  `,
  VideoWrap: styled.div`
    margin: 24px 0;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    background: #f3f4f6;
  `,
  Video: styled.video`
    display: block;
    width: 100%;
    vertical-align: middle;
  `,
  ModalActions: styled.div`
    display: flex;
    justify-content: flex-end;
  `,
  CtaWrap: styled.div`
    position: relative;
    display: inline-block;
  `,
  CtaButton: styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    background: #4338ca;
    border: 2px solid #ea580c;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.15s;
    &:hover {
      background: #3730a3;
    }
  `,
  CtaPing: styled.span`
    position: absolute;
    top: -4px;
    right: -4px;
    display: flex;
    height: 16px;
    width: 16px;
  `,

  Layout: styled.div`
    display: flex;
    min-height: 100vh;
  `,
  Sidebar: styled.aside`
    width: 260px;
    flex-shrink: 0;
    background: var(--bs-menu-bg);
    border-right: 1px solid var(--bs-border-color);
    display: flex;
    flex-direction: column;
    @media (max-width: 1199px) {
      display: none;
    }
  `,
  Brand: styled.div`
    display: flex;
    align-items: center;
    padding: 16px 20px;
    gap: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  `,
  BrandText: styled.span`
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--bs-heading-color);
  `,
  MenuScroll: styled.nav`
    flex: 1;
    overflow-y: auto;
    padding: 12px 0;
  `,
  MenuItem: styled.div`
    padding: 0 12px;
  `,
  MenuLink: styled.button`
    display: flex;
    align-items: center;
    width: 100%;
    gap: 10px;
    padding: 10px 12px;
    margin-bottom: 4px;
    border: none;
    border-radius: 6px;
    background: ${(p) => (p.$active ? VUEXY_PRIMARY : 'transparent')};
    color: ${(p) => (p.$active ? '#fff' : 'var(--bs-menu-color)')};
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    &:hover {
      background: ${(p) => (p.$active ? VUEXY_PRIMARY : 'rgba(225, 222, 245, 0.06)')};
    }
  `,
  MenuSub: styled.div`
    padding-left: 8px;
    margin-top: 4px;
  `,
  Badge: styled.span`
    margin-left: auto;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 999px;
    background: ${(p) => p.$tone || '#ff4c51'};
    color: #fff;
  `,
  MenuHeader: styled.div`
    padding: 16px 20px 8px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--bs-secondary-color);
  `,

  Main: styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: var(--bs-body-bg);
  `,
  Topbar: styled.header`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 24px;
    background: var(--bs-navbar-bg);
    border-bottom: 1px solid var(--bs-border-color);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  `,
  SearchPill: styled.div`
    margin-right: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    color: var(--bs-secondary-color);
    font-size: 14px;
    cursor: pointer;
    border: 1px solid transparent;
    &:hover {
      border-color: var(--bs-border-color);
    }
  `,
  IconBtn: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--bs-heading-color);
    cursor: pointer;
    &:hover {
      background: rgba(255, 255, 255, 0.06);
    }
  `,
  Avatar: styled.div`
    width: 38px;
    height: 38px;
    border-radius: 999px;
    background: linear-gradient(135deg, #7367f0, #9f8cff);
    border: 2px solid rgba(255, 255, 255, 0.2);
  `,

  Content: styled.div`
    flex: 1;
    padding: 24px;
    max-width: 1440px;
    width: 100%;
    margin: 0 auto;
  `,
  Grid: styled.div`
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
  `,

  Card: styled.div`
    background: var(--bs-paper-bg);
    border-radius: 10px;
    border: 1px solid var(--bs-border-color);
    box-shadow: 0 0.1875rem 0.75rem 0 rgba(19, 17, 32, 0.2);
    overflow: hidden;
  `,
  CardHead: styled.div`
    padding: 20px 20px 0;
  `,
  CardTitle: styled.h5`
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 600;
    color: var(--bs-heading-color);
  `,
  CardSub: styled.p`
    margin: 0;
    font-size: 13px;
    color: var(--bs-secondary-color);
  `,
  CardBody: styled.div`
    padding: 16px 20px 20px;
  `,

  AnalyticsHero: styled.div`
    grid-column: span 12;
    @media (min-width: 1200px) {
      grid-column: span 6;
    }
    min-height: 280px;
    padding: 24px;
    border-radius: 10px;
    background: linear-gradient(135deg, #5e50c8 0%, #7367f0 45%, #9e95f5 100%);
    border: none;
    color: #fff;
    position: relative;
    overflow: hidden;
  `,
  Dots: styled.div`
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
  `,
  Dot: styled.button`
    width: 8px;
    height: 8px;
    border-radius: 999px;
    border: none;
    padding: 0;
    background: ${(p) => (p.$on ? '#fff' : 'rgba(255,255,255,0.35)')};
    cursor: pointer;
  `,
  StatGrid: styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 16px;
  `,
  StatPair: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  `,
  StatVal: styled.span`
    padding: 4px 8px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.15);
    font-weight: 600;
    font-size: 14px;
  `,

  ProgressRow: styled.div`
    display: flex;
    height: 10px;
    border-radius: 4px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.08);
    margin-top: 16px;
  `,
  ProgressSeg: styled.div`
    height: 100%;
    width: ${(p) => p.$w};
    background: ${(p) => p.$bg};
  `,

  FlexBetween: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  `,
  Muted: styled.span`
    color: var(--bs-secondary-color);
    font-size: 13px;
  `,
  Grow: styled.div`
    grid-column: span 12;
    @media (min-width: 576px) {
      grid-column: span 6;
    }
    @media (min-width: 1200px) {
      grid-column: span 3;
    }
  `,
  GrowMd6: styled.div`
    grid-column: span 12;
    @media (min-width: 768px) {
      grid-column: span 6;
    }
  `,
  GrowLg4: styled.div`
    grid-column: span 12;
    @media (min-width: 1400px) {
      grid-column: span 4;
    }
    @media (min-width: 768px) and (max-width: 1399px) {
      grid-column: span 6;
    }
  `,
  GrowLg8: styled.div`
    grid-column: span 12;
    @media (min-width: 1200px) {
      grid-column: span 8;
    }
  `,

  Table: styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  `,
  Th: styled.th`
    text-align: left;
    padding: 12px 16px;
    border-top: 1px solid var(--bs-border-color);
    color: var(--bs-secondary-color);
    font-weight: 500;
  `,
  Td: styled.td`
    padding: 12px 16px;
    border-top: 1px solid var(--bs-border-color);
    vertical-align: middle;
  `,
  MiniProgress: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  MiniBar: styled.div`
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
  `,
  MiniFill: styled.div`
    height: 100%;
    width: ${(p) => p.$w};
    background: ${VUEXY_PRIMARY};
    border-radius: 3px;
  `,

  Footer: styled.footer`
    padding: 20px 24px;
    border-top: 1px solid var(--bs-border-color);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: var(--bs-secondary-color);
    a {
      color: ${VUEXY_PRIMARY};
      text-decoration: none;
      margin-right: 16px;
      &:hover {
        text-decoration: underline;
      }
    }
  `,

  RadialBox: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 0;
  `,
  SvgRadial: styled.svg`
    display: block;
  `,
}

const areaData = [
  { x: 0, y: 40 },
  { x: 1, y: 65 },
  { x: 2, y: 50 },
  { x: 3, y: 45 },
  { x: 4, y: 90 },
  { x: 5, y: 55 },
  { x: 6, y: 70 },
]

const barWeek = [
  { d: 'Mo', v: 40 },
  { d: 'Tu', v: 65 },
  { d: 'We', v: 50 },
  { d: 'Th', v: 45 },
  { d: 'Fr', v: 90 },
  { d: 'Sa', v: 55 },
  { d: 'Su', v: 70 },
]

const totalEarnBars = [
  { m: 'Jan', e: 300, x: -180 },
  { m: 'Feb', e: 200, x: -225 },
  { m: 'Mar', e: 350, x: -180 },
  { m: 'Apr', e: 150, x: -280 },
  { m: 'May', e: 250, x: -125 },
  { m: 'Jun', e: 325, x: -200 },
  { m: 'Jul', e: 250, x: -125 },
  { m: 'Aug', e: 270, x: -150 },
]

const countryRows = [
  { flag: '🇺🇸', name: 'United states', amt: '$8,567k', delta: '+25.8%', up: true },
  { flag: '🇧🇷', name: 'Brazil', amt: '$2,415k', delta: '-6.2%', up: false },
  { flag: '🇮🇳', name: 'India', amt: '$865k', delta: '+12.4%', up: true },
  { flag: '🇦🇺', name: 'Australia', amt: '$745k', delta: '-11.9%', up: false },
  { flag: '🇫🇷', name: 'France', amt: '$45', delta: '+16.2%', up: true },
  { flag: '🇨🇳', name: 'China', amt: '$12k', delta: '+14.8%', up: true },
]

const projects = [
  { initials: 'WS', title: 'Website SEO', date: '10 May 2021', lead: 'Eileen', prog: 38 },
  { img: true, title: 'Social Banners', date: '03 Jan 2021', lead: 'Owen', prog: 45 },
  { initials: 'LD', title: 'Logo Designs', date: '12 Aug 2021', lead: 'Keith', prog: 92 },
  { initials: 'IO', title: 'IOS App Design', date: '19 Apr 2021', lead: 'Merline', prog: 56 },
  { initials: 'FD', title: 'Figma Dashboards', date: '08 Apr 2021', lead: 'Harmonia', prog: 25 },
]

function Radial85() {
  const r = 52
  const c = 2 * Math.PI * r
  const dash = c * 0.85
  return (
    <S.RadialBox>
      <S.SvgRadial width={180} height={180} viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="url(#gradRadial)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 90 90)"
        />
        <defs>
          <linearGradient id="gradRadial" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={VUEXY_PRIMARY} />
            <stop offset="100%" stopColor="#9f8cff" />
          </linearGradient>
        </defs>
        <text x="90" y="78" textAnchor="middle" fill="#76778e" fontSize="12">
          Completed Task
        </text>
        <text x="90" y="110" textAnchor="middle" fill="#cfcde4" fontSize="28" fontWeight="500">
          85%
        </text>
      </S.SvgRadial>
    </S.RadialBox>
  )
}

function IntroModal({ open, onClose }) {
  const [videoErr, setVideoErr] = useState(false)

  if (!open) return null

  return (
    <S.ModalRoot role="dialog" aria-modal="true" aria-labelledby="demo-dashboard-intro-title">
      <S.ModalBackdrop onClick={onClose} />
      <S.ModalCenter>
        <S.ModalCard onClick={(e) => e.stopPropagation()}>
          <S.ModalClose type="button" onClick={onClose} aria-label="Close">
            <MdClose size={24} />
          </S.ModalClose>
          <S.ModalBody>
            <S.ModalTitle id="demo-dashboard-intro-title">
              Create an example Live Demo in under 60 seconds
            </S.ModalTitle>
            <div>
              <S.StepRow>
                <S.StepBadge>1</S.StepBadge>
                <S.StepText>
                  Click the highlighted elements
                  <S.PingWrap>
                    <S.PingRing />
                    <S.PingDot />
                  </S.PingWrap>
                  to follow along
                </S.StepText>
              </S.StepRow>
              <S.StepRow>
                <S.StepBadge>2</S.StepBadge>
                <S.StepText>We&apos;ll guide you on how to end the recording</S.StepText>
              </S.StepRow>
              <S.StepRow>
                <S.StepBadge>3</S.StepBadge>
                <S.StepText>
                  Live Demo turns your steps into a clickable demo (yes, you can delete the example
                  after)
                </S.StepText>
              </S.StepRow>
            </div>
            <S.VideoWrap>
              {!videoErr ? (
                <S.Video
                  autoPlay
                  loop
                  playsInline
                  muted
                  src={FINISH_RECORDING_VIDEO_URL}
                  onError={() => setVideoErr(true)}
                />
              ) : (
                <div
                  style={{
                    padding: 48,
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: 14,
                  }}
                >
                  Video unavailable. Add <code>finish-recording.mp4</code> to your site or update the
                  URL in DemoDashboardPage.
                </div>
              )}
            </S.VideoWrap>
            <S.ModalActions>
              <S.CtaWrap>
                <S.CtaButton type="button" onClick={onClose}>
                  Let&apos;s start <span aria-hidden="true">→</span>
                </S.CtaButton>
                <S.CtaPing>
                  <S.PingRing />
                  <S.PingDot />
                </S.CtaPing>
              </S.CtaWrap>
            </S.ModalActions>
          </S.ModalBody>
        </S.ModalCard>
      </S.ModalCenter>
    </S.ModalRoot>
  )
}

const LogoSvg = () => (
  <svg width="32" height="22" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.00172773 0V6.85398C0.00172773 6.85398 -0.133178 9.01207 1.98092 10.8388L13.6912 21.9964L19.7809 21.9181L18.8042 9.88248L16.4951 7.17289L9.23799 0H0.00172773Z"
      fill="currentColor"
    />
    <path
      opacity="0.06"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.69824 16.4364L12.5199 3.23696L16.5541 7.25596L7.69824 16.4364Z"
      fill="#161616"
    />
    <path
      opacity="0.06"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.07751 15.9175L13.9419 4.63989L16.5849 7.28475L8.07751 15.9175Z"
      fill="#161616"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.77295 16.3566L23.6563 0H32V6.88383C32 6.88383 31.8262 9.17836 30.6591 10.4057L19.7824 22H13.6938L7.77295 16.3566Z"
      fill="currentColor"
    />
  </svg>
)

export default function DemoDashboardPage() {
  const [introOpen, setIntroOpen] = useState(true)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (introOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [introOpen])

  const heroSlides = useMemo(
    () => [
      {
        title: 'Traffic',
        rows: [
          ['28%', 'Sessions'],
          ['1.2k', 'Leads'],
          ['3.1k', 'Page Views'],
          ['12%', 'Conversions'],
        ],
      },
      {
        title: 'Spending',
        rows: [
          ['12h', 'Spend'],
          ['127', 'Order'],
          ['18', 'Order Size'],
          ['2.3k', 'Items'],
        ],
      },
      {
        title: 'Revenue Sources',
        rows: [
          ['268', 'Direct'],
          ['62', 'Referral'],
          ['890', 'Organic'],
          ['1.2k', 'Campaign'],
        ],
      },
    ],
    []
  )

  const cur = heroSlides[slide]

  return (
    <S.Page>
      <IntroModal open={introOpen} onClose={() => setIntroOpen(false)} />

      <S.Layout>
        <S.Sidebar>
          <S.Brand>
            <span style={{ color: VUEXY_PRIMARY }}>
              <LogoSvg />
            </span>
            <S.BrandText>Live Demo</S.BrandText>
          </S.Brand>
          <S.MenuScroll>
            <S.MenuItem>
              <S.MenuLink $active>
                <MdGridView size={20} />
                Dashboards
                <S.Badge>5</S.Badge>
              </S.MenuLink>
              <S.MenuSub>
                <S.MenuLink $active style={{ fontSize: 13 }}>
                  Analytics
                </S.MenuLink>
                <S.MenuLink style={{ fontSize: 13 }} $active={false}>
                  CRM
                </S.MenuLink>
                <S.MenuLink $active={false} style={{ fontSize: 13 }}>
                  eCommerce
                </S.MenuLink>
              </S.MenuSub>
            </S.MenuItem>
            <S.MenuItem>
              <S.MenuLink $active={false}>
                <MdMenu size={20} />
                Layouts
              </S.MenuLink>
            </S.MenuItem>
            <S.MenuHeader>Apps &amp; Pages</S.MenuHeader>
            <S.MenuItem>
              <S.MenuLink $active={false}>
                <span style={{ width: 20 }} />
                Email
              </S.MenuLink>
            </S.MenuItem>
            <S.MenuItem>
              <S.MenuLink $active={false}>
                <span style={{ width: 20 }} />
                Chat
              </S.MenuLink>
            </S.MenuItem>
          </S.MenuScroll>
        </S.Sidebar>

        <S.Main>
          <S.Topbar>
            <S.SearchPill>
              <MdSearch size={20} />
              Search [CTRL + K]
            </S.SearchPill>
            <S.IconBtn type="button" aria-label="Language">
              <MdLanguage size={22} />
            </S.IconBtn>
            <S.IconBtn type="button" aria-label="Theme">
              <MdDarkMode size={22} />
            </S.IconBtn>
            <S.IconBtn type="button" aria-label="Shortcuts">
              <MdGridView size={22} />
            </S.IconBtn>
            <S.IconBtn type="button" aria-label="Notifications">
              <MdNotificationsNone size={22} />
            </S.IconBtn>
            <S.Avatar />
          </S.Topbar>

          <S.Content>
            <S.Grid>
              <S.AnalyticsHero>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h5 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Website Analytics</h5>
                    <small style={{ opacity: 0.85 }}>Total 28.5% Conversion Rate</small>
                  </div>
                </div>
                <h6 style={{ margin: '20px 0 12px', fontSize: 14, fontWeight: 600 }}>{cur.title}</h6>
                <S.StatGrid>
                  <div>
                    {cur.rows.slice(0, 2).map(([a, b]) => (
                      <S.StatPair key={b}>
                        <S.StatVal>{a}</S.StatVal>
                        <span>{b}</span>
                      </S.StatPair>
                    ))}
                  </div>
                  <div>
                    {cur.rows.slice(2, 4).map(([a, b]) => (
                      <S.StatPair key={b}>
                        <S.StatVal>{a}</S.StatVal>
                        <span>{b}</span>
                      </S.StatPair>
                    ))}
                  </div>
                </S.StatGrid>
                <S.Dots>
                  {heroSlides.map((_, i) => (
                    <S.Dot key={i} type="button" $on={i === slide} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} />
                  ))}
                </S.Dots>
              </S.AnalyticsHero>

              <S.Grow>
                <S.Card style={{ height: '100%' }}>
                  <S.CardHead>
                    <S.CardTitle>Average Daily Sales</S.CardTitle>
                    <S.CardSub>Total Sales This Month</S.CardSub>
                    <p style={{ margin: '12px 0 0', fontSize: 22, fontWeight: 600, color: '#cfcde4' }}>
                      $28,450
                    </p>
                  </S.CardHead>
                  <S.CardBody style={{ paddingTop: 0 }}>
                    <div style={{ height: 105 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={areaData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#28c76f" stopOpacity={0.5} />
                              <stop offset="100%" stopColor="#2f3349" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="y" stroke="#28c76f" fill="url(#areaG)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </S.CardBody>
                </S.Card>
              </S.Grow>

              <S.Grow>
                <S.Card style={{ height: '100%' }}>
                  <S.CardHead>
                    <S.FlexBetween>
                      <S.CardSub style={{ margin: 0 }}>Sales Overview</S.CardSub>
                      <span style={{ color: '#28c76f', fontWeight: 600 }}>+18.2%</span>
                    </S.FlexBetween>
                    <p style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 600, color: '#cfcde4' }}>
                      $42.5k
                    </p>
                  </S.CardHead>
                  <S.CardBody>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span
                            style={{
                              padding: 4,
                              borderRadius: 6,
                              background: 'rgba(0, 186, 209, 0.15)',
                              color: '#00bad1',
                            }}
                          >
                            <MdChevronRight />
                          </span>
                          <span>Order</span>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>62.2%</div>
                        <S.Muted>6,440</S.Muted>
                      </div>
                      <div
                        style={{
                          width: 1,
                          alignSelf: 'stretch',
                          background: 'var(--bs-border-color)',
                          position: 'relative',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: 11,
                            padding: '2px 6px',
                            borderRadius: 6,
                            background: '#3c4054',
                            color: '#acabc1',
                          }}
                        >
                          VS
                        </span>
                      </div>
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 8,
                            justifyContent: 'flex-end',
                          }}
                        >
                          <span>Visits</span>
                          <span
                            style={{
                              padding: 4,
                              borderRadius: 6,
                              background: 'rgba(115, 103, 240, 0.2)',
                              color: VUEXY_PRIMARY,
                            }}
                          >
                            <MdChevronRight style={{ transform: 'rotate(-90deg)' }} />
                          </span>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>25.5%</div>
                        <S.Muted>12,749</S.Muted>
                      </div>
                    </div>
                    <S.ProgressRow>
                      <S.ProgressSeg $w="70%" $bg="#00bad1" />
                      <S.ProgressSeg $w="30%" $bg={VUEXY_PRIMARY} />
                    </S.ProgressRow>
                  </S.CardBody>
                </S.Card>
              </S.Grow>

              <S.GrowMd6>
                <S.Card>
                  <S.CardHead>
                    <S.FlexBetween>
                      <div>
                        <S.CardTitle>Earning Reports</S.CardTitle>
                        <S.CardSub>Weekly Earnings Overview</S.CardSub>
                      </div>
                      <S.IconBtn type="button" style={{ width: 36, height: 36 }}>
                        <MdMoreVert />
                      </S.IconBtn>
                    </S.FlexBetween>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                      <span style={{ fontSize: 28, fontWeight: 600, color: '#cfcde4' }}>$468</span>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: 'rgba(40, 199, 111, 0.15)',
                          color: '#28c76f',
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        +4.2%
                      </span>
                    </div>
                    <S.Muted style={{ display: 'block', marginTop: 8 }}>
                      You informed of this week compared to last week
                    </S.Muted>
                  </S.CardHead>
                  <S.CardBody>
                    <div style={{ height: 160 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barWeek} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#44485e" vertical={false} />
                          <XAxis dataKey="d" tick={{ fill: '#76778e', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip
                            contentStyle={{ background: '#2f3349', border: '1px solid #44485e' }}
                            labelStyle={{ color: '#cfcde4' }}
                          />
                          <Bar dataKey="v" radius={[4, 4, 4, 4]}>
                            {barWeek.map((_, i) => (
                              <Cell key={i} fill={i === 4 ? VUEXY_PRIMARY : 'rgba(115, 103, 240, 0.25)'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div
                      style={{
                        marginTop: 20,
                        padding: 20,
                        borderRadius: 8,
                        border: '1px solid var(--bs-border-color)',
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        <div>
                          <S.Muted>Earnings</S.Muted>
                          <div style={{ fontWeight: 600, margin: '8px 0' }}>$545.69</div>
                          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                            <div style={{ width: '65%', height: '100%', borderRadius: 2, background: VUEXY_PRIMARY }} />
                          </div>
                        </div>
                        <div>
                          <S.Muted>Profit</S.Muted>
                          <div style={{ fontWeight: 600, margin: '8px 0' }}>$256.34</div>
                          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                            <div style={{ width: '50%', height: '100%', borderRadius: 2, background: '#00bad1' }} />
                          </div>
                        </div>
                        <div>
                          <S.Muted>Expense</S.Muted>
                          <div style={{ fontWeight: 600, margin: '8px 0' }}>$74.19</div>
                          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                            <div style={{ width: '65%', height: '100%', borderRadius: 2, background: '#ff4c51' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </S.CardBody>
                </S.Card>
              </S.GrowMd6>

              <S.GrowMd6>
                <S.Card>
                  <S.CardHead>
                    <S.FlexBetween>
                      <div>
                        <S.CardTitle>Support Tracker</S.CardTitle>
                        <S.CardSub>Last 7 Days</S.CardSub>
                      </div>
                      <S.IconBtn type="button" style={{ width: 36, height: 36 }}>
                        <MdMoreVert />
                      </S.IconBtn>
                    </S.FlexBetween>
                  </S.CardHead>
                  <S.CardBody style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                    <div style={{ flex: '1 1 140px' }}>
                      <div style={{ fontSize: 28, fontWeight: 600, color: '#cfcde4' }}>164</div>
                      <S.Muted>Total Tickets</S.Muted>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0' }}>
                        <li style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                          <span style={{ padding: 8, borderRadius: 8, background: 'rgba(115,103,240,0.2)' }}>🎫</span>
                          <div>
                            <div style={{ fontWeight: 500, color: '#cfcde4' }}>New Tickets</div>
                            <S.Muted>142</S.Muted>
                          </div>
                        </li>
                        <li style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                          <span style={{ padding: 8, borderRadius: 8, background: 'rgba(0,186,209,0.15)' }}>✓</span>
                          <div>
                            <div style={{ fontWeight: 500, color: '#cfcde4' }}>Open Tickets</div>
                            <S.Muted>28</S.Muted>
                          </div>
                        </li>
                        <li style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <span style={{ padding: 8, borderRadius: 8, background: 'rgba(255,159,67,0.15)' }}>⏱</span>
                          <div>
                            <div style={{ fontWeight: 500, color: '#cfcde4' }}>Response Time</div>
                            <S.Muted>1 Day</S.Muted>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                      <Radial85 />
                    </div>
                  </S.CardBody>
                </S.Card>
              </S.GrowMd6>

              <S.GrowLg4>
                <S.Card>
                  <S.CardHead>
                    <S.FlexBetween>
                      <div>
                        <S.CardTitle>Sales by Countries</S.CardTitle>
                        <S.CardSub>Monthly Sales Overview</S.CardSub>
                      </div>
                      <S.IconBtn type="button" style={{ width: 36, height: 36 }}>
                        <MdMoreVert />
                      </S.IconBtn>
                    </S.FlexBetween>
                  </S.CardHead>
                  <S.CardBody>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {countryRows.map((c) => (
                        <li
                          key={c.name}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 16,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 22 }}>{c.flag}</span>
                            <div>
                              <div style={{ fontWeight: 600, color: '#cfcde4' }}>{c.amt}</div>
                              <S.Muted>{c.name}</S.Muted>
                            </div>
                          </div>
                          <span style={{ color: c.up ? '#28c76f' : '#ff4c51', fontWeight: 600, fontSize: 13 }}>
                            {c.delta}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </S.CardBody>
                </S.Card>
              </S.GrowLg4>

              <S.GrowLg4>
                <S.Card>
                  <S.CardHead>
                    <S.FlexBetween>
                      <S.CardTitle>Total Earning</S.CardTitle>
                      <S.IconBtn type="button" style={{ width: 36, height: 36 }}>
                        <MdMoreVert />
                      </S.IconBtn>
                    </S.FlexBetween>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <span style={{ fontSize: 26, fontWeight: 600 }}>87%</span>
                      <span style={{ color: '#28c76f' }}>▲</span>
                      <span style={{ color: '#28c76f', fontWeight: 600 }}>25.8%</span>
                    </div>
                  </S.CardHead>
                  <S.CardBody>
                    <div style={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={totalEarnBars} barGap={2}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#44485e" vertical={false} />
                          <XAxis hide />
                          <YAxis hide />
                          <Bar dataKey="e" fill={VUEXY_PRIMARY} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="x" fill="#808390" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <span style={{ padding: 8, borderRadius: 8, background: 'rgba(115,103,240,0.2)' }}>💳</span>
                          <div>
                            <div style={{ fontWeight: 500 }}>Total Revenue</div>
                            <S.Muted>Client Payment</S.Muted>
                          </div>
                        </div>
                        <span style={{ color: '#28c76f', fontWeight: 600 }}>+$126</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <span style={{ padding: 8, borderRadius: 8, background: 'rgba(128,131,144,0.2)' }}>$</span>
                          <div>
                            <div style={{ fontWeight: 500 }}>Total Sales</div>
                            <S.Muted>Refund</S.Muted>
                          </div>
                        </div>
                        <span style={{ color: '#28c76f', fontWeight: 600 }}>+$98</span>
                      </div>
                    </div>
                  </S.CardBody>
                </S.Card>
              </S.GrowLg4>

              <S.GrowLg4>
                <S.Card>
                  <S.CardHead>
                    <S.FlexBetween>
                      <div>
                        <S.CardTitle>Monthly Campaign State</S.CardTitle>
                        <S.CardSub>8.52k Social Visitors</S.CardSub>
                      </div>
                      <S.IconBtn type="button" style={{ width: 36, height: 36 }}>
                        <MdMoreVert />
                      </S.IconBtn>
                    </S.FlexBetween>
                  </S.CardHead>
                  <S.CardBody>
                    {[
                      ['Emails', '12,346', '+0.3%', true],
                      ['Opened', '8,734', '+2.1%', true],
                      ['Clicked', '967', '-1.4%', false],
                      ['Subscribe', '345', '+8.5%', true],
                      ['Complaints', '10', '-1.5%', false],
                      ['Unsubscribe', '86', '+0.8%', true],
                    ].map(([a, b, d, up]) => (
                      <div
                        key={a}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 20,
                        }}
                      >
                        <span style={{ fontWeight: 500, color: '#cfcde4' }}>{a}</span>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <span>{b}</span>
                          <span style={{ color: up ? '#28c76f' : '#ff4c51', minWidth: 48, textAlign: 'right' }}>
                            {d}
                          </span>
                        </div>
                      </div>
                    ))}
                  </S.CardBody>
                </S.Card>
              </S.GrowLg4>

              <S.GrowLg4>
                <S.Card>
                  <S.CardHead>
                    <S.FlexBetween>
                      <div>
                        <S.CardTitle>Source Visits</S.CardTitle>
                        <S.CardSub>38.4k Visitors</S.CardSub>
                      </div>
                      <S.IconBtn type="button" style={{ width: 36, height: 36 }}>
                        <MdMoreVert />
                      </S.IconBtn>
                    </S.FlexBetween>
                  </S.CardHead>
                  <S.CardBody>
                    {[
                      ['Direct Source', 'Direct link click', '1.2k', '+4.2%'],
                      ['Social Network', 'Social Channels', '31.5k', '+8.2%'],
                      ['Email Newsletter', 'Mail Campaigns', '893', '+2.4%'],
                      ['Referrals', 'Impact Radius Visits', '342', '-0.4%'],
                    ].map(([t, s, n, d]) => (
                      <div key={t} style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 500, color: '#cfcde4' }}>{t}</div>
                          <S.Muted>{s}</S.Muted>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div>{n}</div>
                          <span
                            style={{
                              display: 'inline-block',
                              marginTop: 4,
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontSize: 12,
                              background: d.startsWith('-') ? 'rgba(255,76,81,0.15)' : 'rgba(40,199,111,0.15)',
                              color: d.startsWith('-') ? '#ff4c51' : '#28c76f',
                            }}
                          >
                            {d}
                          </span>
                        </div>
                      </div>
                    ))}
                  </S.CardBody>
                </S.Card>
              </S.GrowLg4>

              <S.GrowLg8>
                <S.Card>
                  <S.CardHead>
                    <S.FlexBetween>
                      <S.CardTitle style={{ margin: 0 }}>Project List</S.CardTitle>
                      <input
                        type="search"
                        placeholder="Search Project"
                        style={{
                          padding: '8px 12px',
                          borderRadius: 6,
                          border: '1px solid var(--bs-border-color)',
                          background: 'rgba(255,255,255,0.04)',
                          color: '#cfcde4',
                          maxWidth: 200,
                        }}
                      />
                    </S.FlexBetween>
                  </S.CardHead>
                  <div style={{ overflowX: 'auto' }}>
                    <S.Table>
                      <thead>
                        <tr>
                          <S.Th>
                            <input type="checkbox" aria-label="Select all" />
                          </S.Th>
                          <S.Th>Project</S.Th>
                          <S.Th>Leader</S.Th>
                          <S.Th>Team</S.Th>
                          <S.Th>Progress</S.Th>
                          <S.Th>Action</S.Th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((p) => (
                          <tr key={p.title}>
                            <S.Td>
                              <input type="checkbox" aria-label={`Select ${p.title}`} />
                            </S.Td>
                            <S.Td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: p.img
                                      ? 'linear-gradient(135deg,#6366f1,#a78bfa)'
                                      : 'rgba(0,186,209,0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: '#fff',
                                  }}
                                >
                                  {p.initials || '·'}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 500, color: '#cfcde4' }}>{p.title}</div>
                                  <S.Muted>{p.date}</S.Muted>
                                </div>
                              </div>
                            </S.Td>
                            <S.Td>{p.lead}</S.Td>
                            <S.Td>
                              <div style={{ display: 'flex' }}>
                                {[0, 1, 2].map((i) => (
                                  <div
                                    key={i}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: '50%',
                                      background: '#6366f1',
                                      marginLeft: i ? -8 : 0,
                                      border: '2px solid #2f3349',
                                    }}
                                  />
                                ))}
                              </div>
                            </S.Td>
                            <S.Td>
                              <S.MiniProgress>
                                <S.MiniBar>
                                  <S.MiniFill $w={`${p.prog}%`} />
                                </S.MiniBar>
                                <span>{p.prog}%</span>
                              </S.MiniProgress>
                            </S.Td>
                            <S.Td>
                              <S.IconBtn type="button" style={{ width: 32, height: 32 }}>
                                <MdMoreVert />
                              </S.IconBtn>
                            </S.Td>
                          </tr>
                        ))}
                      </tbody>
                    </S.Table>
                  </div>
                  <div
                    style={{
                      padding: '12px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--bs-border-color)',
                      fontSize: 13,
                      color: 'var(--bs-secondary-color)',
                    }}
                  >
                    <span>Showing 1 to 5 of 10 entries</span>
                    <span style={{ display: 'flex', gap: 8 }}>
                      <button type="button" style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--bs-border-color)', background: 'transparent', color: 'inherit', cursor: 'pointer' }}>1</button>
                      <button type="button" style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--bs-border-color)', background: 'transparent', color: 'inherit', cursor: 'pointer' }}>2</button>
                    </span>
                  </div>
                </S.Card>
              </S.GrowLg8>
            </S.Grid>
          </S.Content>

          <S.Footer>
            <div>© {new Date().getFullYear()} Live Demo — demo dashboard preview</div>
            <div>
              <a href="https://livedemo.ai" target="_blank" rel="noreferrer">
                Website
              </a>
              <a href="https://livedemo.ai" target="_blank" rel="noreferrer">
                Documentation
              </a>
            </div>
          </S.Footer>
        </S.Main>
      </S.Layout>
    </S.Page>
  )
}
