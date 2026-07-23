import { Replayer } from 'rrweb'
import 'rrweb/dist/style.css'
import axios from 'axios'
import ENV from './config.json'

const eventsCache = new Map()
const chains = {}

// rrweb IncrementalSource / MouseInteractions
const SOURCE_MOUSE_MOVE = 1
const SOURCE_MOUSE_INTERACTION = 2
const MOUSE_INTERACTION_CLICK = 2

function getPreviewUrl(workspaceId, storyId, screenId) {
  return `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyId}/screens/${screenId}/preview`
}

function withoutMouseMoves(events) {
  if (!Array.isArray(events) || !events.length) {
    return events || []
  }
  return events.filter((ev) => {
    return !(ev && ev.data && ev.data.source === SOURCE_MOUSE_MOVE)
  })
}

/** First MouseInteraction Click with afterTs < timestamp <= untilTs. */
function findFirstClickTimestamp(events, afterTs, untilTs) {
  if (!Array.isArray(events) || !events.length) {
    return null
  }
  for (let i = 0; i < events.length; i++) {
    const ev = events[i]
    if (!ev || !ev.data) {
      continue
    }
    if (afterTs != null && ev.timestamp <= afterTs) {
      continue
    }
    if (untilTs != null && ev.timestamp > untilTs) {
      break
    }
    if (
      ev.data.source === SOURCE_MOUSE_INTERACTION
      && ev.data.type === MOUSE_INTERACTION_CLICK
    ) {
      return ev.timestamp
    }
  }
  return null
}

async function fetchEvents(workspaceId, storyId, screenId) {
  const key = String(screenId)
  if (eventsCache.has(key)) {
    return eventsCache.get(key)
  }

  const res = await axios.get(getPreviewUrl(workspaceId, storyId, screenId))
  const events = withoutMouseMoves(
    Array.isArray(res.data && res.data.events) ? res.data.events : []
  )
  eventsCache.set(key, events)
  return events
}

function getRootEl() {
  return document.getElementById('story_rrweb_root')
}

function destroyReplayer(chain) {
  if (chain && chain.playTimer != null) {
    clearTimeout(chain.playTimer)
    chain.playTimer = null
  }
  if (chain && chain.replayer) {
    try {
      chain.replayer.destroy()
    } catch (e) {
      // ignore
    }
    chain.replayer = null
  }
}

function isEditTextActive() {
  try {
    if (typeof window !== 'undefined' && window.__livedemoEditTextActive) {
      return true
    }
    if (typeof window !== 'undefined' && window.parent && window.parent.__livedemoEditTextActive) {
      return true
    }
  } catch (e) {
    // cross-origin parent — ignore
  }
  return false
}

function blockReplayActivation(event) {
  // Allow element picker / contenteditable while EditText is open.
  if (isEditTextActive()) {
    return
  }
  // stopImmediatePropagation: other capture listeners must not run / re-enable default.
  event.preventDefault()
  event.stopPropagation()
  if (typeof event.stopImmediatePropagation === 'function') {
    event.stopImmediatePropagation()
  }
  return false
}

/**
 * Anchors in the snapshot keep real hrefs (e.g. https://stage01...). With
 * pointer-events:auto, a click navigates the sandboxed iframe to the live site
 * — looks like "clicks work". Strip navigations while keeping :hover.
 */
function neutralizeReplayNavigation(doc) {
  if (!doc) {
    return
  }
  const anchors = doc.querySelectorAll('a[href], area[href]')
  for (let i = 0; i < anchors.length; i++) {
    const el = anchors[i]
    const href = el.getAttribute('href')
    if (href == null) {
      continue
    }
    if (!el.hasAttribute('data-ld-href')) {
      el.setAttribute('data-ld-href', href)
    }
    // Remove href entirely — '#' still navigates/scrolls without preventDefault.
    el.removeAttribute('href')
    if (!el.getAttribute('role')) {
      el.setAttribute('role', 'link')
    }
  }
  const forms = doc.querySelectorAll('form')
  for (let i = 0; i < forms.length; i++) {
    const form = forms[i]
    if (form.hasAttribute('action') && !form.hasAttribute('data-ld-action')) {
      form.setAttribute('data-ld-action', form.getAttribute('action') || '')
    }
    form.removeAttribute('action')
    form.setAttribute('method', 'dialog')
  }
  const formActions = doc.querySelectorAll('[formaction]')
  for (let i = 0; i < formActions.length; i++) {
    const el = formActions[i]
    if (!el.hasAttribute('data-ld-formaction')) {
      el.setAttribute('data-ld-formaction', el.getAttribute('formaction') || '')
    }
    el.removeAttribute('formaction')
  }
}

// Block activation / navigation only. Leave mousedown/mouseup/pointer* alone
// so users can select (and copy) text in the replay iframe.
const REPLAY_BLOCK_TYPES = [
  'click',
  'auxclick',
  'dblclick',
  'submit',
  'change',
  'input',
]

function bindReplayActivationBlockers(doc, win) {
  for (let i = 0; i < REPLAY_BLOCK_TYPES.length; i++) {
    const type = REPLAY_BLOCK_TYPES[i]
    doc.removeEventListener(type, blockReplayActivation, true)
    win.removeEventListener(type, blockReplayActivation, true)
    doc.addEventListener(type, blockReplayActivation, true)
    win.addEventListener(type, blockReplayActivation, true)
  }
  // keydown uses a stable wrapper stored on win so rebinding stays idempotent
  if (win.__livedemoKeyBlock) {
    doc.removeEventListener('keydown', win.__livedemoKeyBlock, true)
    win.removeEventListener('keydown', win.__livedemoKeyBlock, true)
  }
  win.__livedemoKeyBlock = (event) => {
    if (isEditTextActive()) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      blockReplayActivation(event)
      return
    }
    // Arrow keys while focus is in the replay iframe never reach the host
    // document listener — forward them so step nav works before hotspot click.
    const isLeft = event.key === 'ArrowLeft' || event.keyCode === 37
    const isRight = event.key === 'ArrowRight' || event.keyCode === 39
    if (isLeft || isRight) {
      event.preventDefault()
      event.stopPropagation()
      try {
        const host = win.parent || window
        if (typeof host.__livedemoStepArrowKey === 'function') {
          host.__livedemoStepArrowKey(isLeft ? 'back' : 'next')
        }
      } catch (e) {
        // ignore
      }
    }
  }
  doc.addEventListener('keydown', win.__livedemoKeyBlock, true)
  win.addEventListener('keydown', win.__livedemoKeyBlock, true)
}

/**
 * Replayer defaults to pointer-events:none (disableInteract), which makes the
 * mirror look like a static image — real CSS :hover never fires.
 * Re-enable pointer events for hover + text selection; still strip hrefs and
 * block click/submit so nothing navigates away. Hotspots sit above at z-index 3.
 */
function enableHoverOnlyInteract(replayer) {
  if (!replayer || !replayer.iframe) {
    return
  }

  const iframe = replayer.iframe
  iframe.style.pointerEvents = 'auto'
  iframe.setAttribute('scrolling', 'no')

  const installDocGuards = () => {
    let doc
    let win
    try {
      doc = iframe.contentDocument
      win = iframe.contentWindow
    } catch (e) {
      return
    }
    if (!doc || !win) {
      return
    }
    if (doc.documentElement) {
      doc.documentElement.classList.remove('rrweb-paused')
      doc.documentElement.dataset.livedemoHoverOnly = '1'
    }

    neutralizeReplayNavigation(doc)

    // FullSnapshot uses document.open(), which wipes Document listeners but can
    // leave Window/Document expandos. Always re-bind blockers after rebuild.
    bindReplayActivationBlockers(doc, win)

    // Incremental mutations may add new anchors after the initial snapshot.
    if (typeof MutationObserver === 'function' && doc.documentElement) {
      try {
        if (!win.__livedemoHoverOnlyObserverInst) {
          win.__livedemoHoverOnlyObserverInst = new MutationObserver(() => {
            neutralizeReplayNavigation(iframe.contentDocument)
          })
        } else {
          win.__livedemoHoverOnlyObserverInst.disconnect()
        }
        win.__livedemoHoverOnlyObserverInst.observe(doc.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['href', 'action', 'formaction'],
        })
      } catch (e) {
        // ignore
      }
    }
  }

  installDocGuards()

  if (!replayer.__livedemoHoverOnlyBound) {
    replayer.__livedemoHoverOnlyBound = true
    try {
      replayer.on('fullsnapshot-rebuilded', () => {
        iframe.style.pointerEvents = 'auto'
        iframe.setAttribute('scrolling', 'no')
        // document.open() cleared Document listeners — rebind every rebuild.
        installDocGuards()
      })
    } catch (e) {
      // ignore
    }
    iframe.addEventListener('load', () => {
      installDocGuards()
    })
  }
}

async function createReplayer(chain, root, events) {
  destroyReplayer(chain)
  root.innerHTML = ''
  chain.events = events
  chain.replayer = new Replayer(events, {
    root,
    mouseTail: false,
    triggerFocus: false,
    // Keep CSS animations running on screen changes (no rrweb-paused freeze).
    pauseAnimation: false,
    // blockClass on record strips position:fixed from .livedemo-recorder-ui and
    // leaves a static rr_height placeholder that pushes <body> down (~44px gap).
    insertStyleRules: [
      '.livedemo-recorder-ui,[data-livedemo-recorder="true"]{display:none!important;visibility:hidden!important;height:0!important;width:0!important;margin:0!important;padding:0!important;overflow:hidden!important;position:fixed!important;pointer-events:none!important}',
      // href stripped for non-navigation; keep link cursor for interactive look
      'a[data-ld-href],area[data-ld-href]{cursor:pointer}',
      // Allow selecting / copying text in the replay mirror
      'html,body{user-select:text!important;-webkit-user-select:text!important}',
    ],
  })
  // Cursor/tail live in the host wrapper (not the iframe). Hide for all screens/deltas.
  try {
    const mouse = chain.replayer.mouse
    if (mouse && mouse.style) {
      mouse.style.display = 'none'
    }
  } catch (e) {
    // ignore
  }
  enableHoverOnlyInteract(chain.replayer)
  // rrweb schedules the initial FullSnapshot rebuild on setTimeout(1); wait for it
  // so the first seek does not race an empty iframe.
  await new Promise((resolve) => {
    let settled = false
    const done = () => {
      if (settled) {
        return
      }
      settled = true
      resolve()
    }
    try {
      chain.replayer.on('fullsnapshot-rebuilded', done)
    } catch (e) {
      // ignore
    }
    setTimeout(done, 50)
  })
  // Rebuild may reset iframe styles; re-assert hover interactivity.
  enableHoverOnlyInteract(chain.replayer)
}

function getChainScreens(storyDemo, baseId) {
  const screens = (storyDemo && Array.isArray(storyDemo.screens)) ? storyDemo.screens : []
  return screens
    .filter((s) => {
      if (!s || !s.recordingRole) {
        return false
      }
      if (s.recordingRole === 'base') {
        return String(s._id) === String(baseId)
      }
      return String(s.baseScreenId) === String(baseId)
    })
    .sort((a, b) => (a.index || 0) - (b.index || 0))
}

/**
 * Full chain event list: base + longest cumulative delta (last delta already
 * includes every earlier post-base event). One list → seek any screen by toTimeMs.
 */
async function eventsForFullChain(baseId, storyDemo, workspaceId, storyId) {
  const baseEvents = await fetchEvents(workspaceId, storyId, baseId)
  const chainScreens = getChainScreens(storyDemo, baseId)
  const deltas = chainScreens.filter((s) => s.recordingRole === 'delta')

  let bestDeltaEvents = []
  for (let i = 0; i < deltas.length; i++) {
    const deltaEvents = await fetchEvents(workspaceId, storyId, deltas[i]._id)
    if (deltaEvents.length >= bestDeltaEvents.length) {
      bestDeltaEvents = deltaEvents
    }
  }

  if (bestDeltaEvents.length) {
    return baseEvents.concat(bestDeltaEvents)
  }
  return baseEvents.slice()
}

function clearRrwebPaused(replayer) {
  try {
    replayer.iframe.contentDocument
      ?.getElementsByTagName('html')[0]
      ?.classList.remove('rrweb-paused')
  } catch (e) {
    // ignore
  }
}

function offsetForTimestamp(events, timestampMs) {
  if (!events || !events.length) {
    return 0
  }
  const firstTs = events[0].timestamp || 0
  return Math.max(0, (timestampMs != null ? timestampMs : firstTs) - firstTs)
}

/**
 * Inclusive seek: rrweb applies events with timestamp < baselineTime, so
 * baseline = targetMs + 1 applies the event at exactly targetMs.
 * pause(offset) internally play()+PAUSE — sync rebuild when seeking backward.
 */
function seekToTimestamp(replayer, events, timestampMs) {
  if (!replayer || !events || !events.length) {
    return
  }
  const targetMs = timestampMs != null ? timestampMs : events[0].timestamp
  const offset = offsetForTimestamp(events, targetMs) + 1
  replayer.pause(offset)
  clearRrwebPaused(replayer)
  enableHoverOnlyInteract(replayer)
}

function seekToScreen(replayer, events, screen) {
  const firstTs = events && events[0] ? events[0].timestamp : 0
  const targetMs = screen && screen.toTimeMs != null ? screen.toTimeMs : firstTs
  seekToTimestamp(replayer, events, targetMs)
}

function findScreenById(screens, screenId) {
  if (!screens || screenId == null) {
    return null
  }
  return screens.find((s) => String(s._id) === String(screenId)) || null
}

function isNextChainNeighbor(prevScreen, nextScreen, chainScreens) {
  if (!prevScreen || !nextScreen || !chainScreens || !chainScreens.length) {
    return false
  }
  const prevIdx = chainScreens.findIndex((s) => String(s._id) === String(prevScreen._id))
  const nextIdx = chainScreens.findIndex((s) => String(s._id) === String(nextScreen._id))
  return prevIdx >= 0 && nextIdx === prevIdx + 1
}

/**
 * Persistent Replayer per rrweb chain with the FULL event list loaded once.
 *
 * Navigation is timestamp seek (same idea as rrweb-player scrubbing):
 * - events before target time applied synchronously (incl. FullSnapshot rebuild
 *   when going backward)
 * - forward neighbor: jump to transition MouseInteraction Click, then lock end
 * - jump / first load / backward: pause at target toTimeMs
 *
 * No truncate/recreate on back — full list stays mounted.
 */
export async function showScreen(screen, storyDemo, workspaceId, storyId) {
  if (!screen || !screen.recordingRole) {
    clearActiveReplayer()
    return null
  }

  const baseId = screen.recordingRole === 'base' ? String(screen._id) : String(screen.baseScreenId)
  const root = getRootEl()
  if (!root) {
    console.error('story_rrweb_root missing')
    return null
  }

  let chain = chains[baseId]
  if (!chain) {
    chain = chains[baseId] = {
      replayer: null,
      events: [],
      activeScreenId: null,
      playTimer: null,
    }
  }

  // Destroy other chains' replayers so only one iframe lives in the root
  Object.keys(chains).forEach((id) => {
    if (id === baseId) {
      return
    }
    destroyReplayer(chains[id])
  })

  const fullEvents = await eventsForFullChain(baseId, storyDemo, workspaceId, storyId)
  if (fullEvents.length < 2) {
    console.error('rrweb screen needs at least Meta+FullSnapshot')
    return null
  }

  if (!chain.replayer) {
    await createReplayer(chain, root, fullEvents.slice())
  } else if (fullEvents.length > chain.events.length) {
    // Chain grew (e.g. first open was base-only before deltas cached) — rebuild once.
    await createReplayer(chain, root, fullEvents.slice())
  } else {
    chain.events = fullEvents
  }

  const chainScreens = getChainScreens(storyDemo, baseId)
  const prevScreen = findScreenById(chainScreens, chain.activeScreenId)
  const stepForward = isNextChainNeighbor(prevScreen, screen, chainScreens)
    && prevScreen.toTimeMs != null
    && screen.toTimeMs != null
    && screen.toTimeMs > prevScreen.toTimeMs

  chain.activeScreenId = String(screen._id)

  if (chain.playTimer != null) {
    clearTimeout(chain.playTimer)
    chain.playTimer = null
  }

  if (stepForward) {
    // Every forward step: jump to transition Click, then lock screen end state.
    const clickTs = findFirstClickTimestamp(
      fullEvents,
      prevScreen.toTimeMs,
      screen.toTimeMs,
    )
    if (clickTs != null) {
      seekToTimestamp(chain.replayer, fullEvents, clickTs)
    }
    seekToScreen(chain.replayer, fullEvents, screen)
  } else {
    seekToScreen(chain.replayer, fullEvents, screen)
  }

  window.__livedemoActiveReplayer = chain.replayer
  return chain.replayer
}

export function clearActiveReplayer() {
  window.__livedemoActiveReplayer = null
}

export function invalidateEventsCache() {
  eventsCache.clear()
}

/**
 * After EditText persists JSON on the server, drop cached events and recreate
 * the active chain so the Replayer shows the new text.
 */
export async function reloadAfterTextEdit(screen, storyDemo, workspaceId, storyId) {
  if (!screen || !screen.recordingRole) {
    return null
  }
  const chainId = screen.recordingRole === 'base'
    ? String(screen._id)
    : String(screen.baseScreenId)
  if (chains[chainId]) {
    destroyReplayer(chains[chainId])
    delete chains[chainId]
  }
  eventsCache.clear()
  return showScreen(screen, storyDemo, workspaceId, storyId)
}

export function destroyAllChains() {
  Object.keys(chains).forEach((id) => {
    destroyReplayer(chains[id])
    delete chains[id]
  })
  eventsCache.clear()
  clearActiveReplayer()
  const root = getRootEl()
  if (root) {
    root.innerHTML = ''
  }
}

export default {
  showScreen,
  destroyAllChains,
  clearActiveReplayer,
  invalidateEventsCache,
  reloadAfterTextEdit,
}
