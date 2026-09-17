import React, { useEffect, useRef, useState } from 'react'
import elementPicker from '../../storyElementPicker.js'
import mainColors from '../../../constants/mainColors.js'
import 'tippy.js/dist/tippy.css'
import styled from 'styled-components'
import TippyModule from '@tippyjs/react'
import { getDemoDocument } from '../../helpers.js'

const Tippy = TippyModule?.default || TippyModule

const SKIP_TAGS = { script: 1, style: 1, link: 1, meta: 1, head: 1, html: 1, noscript: 1 }
const TEXT_TAGS = {
  p: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, span: 1, a: 1, label: 1,
  button: 1, li: 1, td: 1, th: 1, em: 1, strong: 1, small: 1, title: 1, figcaption: 1,
}

function mirrorIdOf(node) {
  const replayer = typeof window !== 'undefined' ? window.__livedemoActiveReplayer : null
  if (!replayer || !replayer.getMirror || !node) {
    return null
  }
  try {
    const id = replayer.getMirror().getId(node)
    if (id != null && id !== -1 && id !== -2) {
      return id
    }
  } catch (e) {
    // ignore
  }
  return null
}

function resolveRrwebTextNodeId(element) {
  if (!element) {
    return null
  }
  if (element.nodeType === 3) {
    return mirrorIdOf(element)
  }
  const childNodes = element.childNodes
  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i]
    if (child.nodeType === 3) {
      const id = mirrorIdOf(child)
      if (id != null) {
        return id
      }
    }
  }
  try {
    const doc = element.ownerDocument
    if (doc && typeof doc.createTreeWalker === 'function') {
      const walker = doc.createTreeWalker(element, NodeFilter.SHOW_TEXT)
      let node = walker.nextNode()
      while (node) {
        const id = mirrorIdOf(node)
        if (id != null) {
          return id
        }
        node = walker.nextNode()
      }
    }
  } catch (e) {
    // ignore
  }
  return null
}

function getEditTargetDocument(iframeRef) {
  try {
    const demoDoc = getDemoDocument()
    if (demoDoc) {
      return demoDoc
    }
  } catch (e) {
    // ignore
  }
  if (iframeRef && iframeRef.current && iframeRef.current.contentDocument) {
    return iframeRef.current.contentDocument
  }
  return null
}

function getViewportRect(el) {
  const empty = { width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0 }
  if (!el || typeof el.getBoundingClientRect !== 'function') {
    return empty
  }
  const rect = el.getBoundingClientRect()
  const view = el.ownerDocument && el.ownerDocument.defaultView
  const frameEl = view && view.frameElement
  if (!frameEl) {
    return { width: rect.width, height: rect.height, top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right }
  }
  const frameRect = frameEl.getBoundingClientRect()
  const scaleX = frameRect.width / (view.innerWidth || frameEl.clientWidth || 1)
  const scaleY = frameRect.height / (view.innerHeight || frameEl.clientHeight || 1)
  const width = rect.width * scaleX
  const height = rect.height * scaleY
  const top = frameRect.top + rect.top * scaleY
  const left = frameRect.left + rect.left * scaleX
  return { width, height, top, left, bottom: top + height, right: left + width }
}

function isTransparentColor(cssColor) {
  if (!cssColor || cssColor === 'transparent' || cssColor === 'rgba(0, 0, 0, 0)') {
    return true
  }
  const m = String(cssColor).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/i)
  if (m && m[4] != null && Number(m[4]) === 0) {
    return true
  }
  return false
}

function toHexColor(cssColor, fallback = '#000000', doc) {
  if (isTransparentColor(cssColor)) {
    return fallback
  }
  if (cssColor[0] === '#') {
    if (cssColor.length === 4) {
      return '#' + cssColor[1] + cssColor[1] + cssColor[2] + cssColor[2] + cssColor[3] + cssColor[3]
    }
    return cssColor.slice(0, 7)
  }
  const m = String(cssColor).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i)
  if (m) {
    return '#' + [m[1], m[2], m[3]].map((n) => ('0' + Number(n).toString(16)).slice(-2)).join('')
  }
  try {
    const owner = doc || (typeof document !== 'undefined' ? document : null)
    if (!owner || !owner.createElement) {
      return fallback
    }
    const canvas = owner.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return fallback
    }
    ctx.fillStyle = '#000000'
    ctx.fillStyle = cssColor
    if (typeof ctx.fillStyle === 'string' && ctx.fillStyle[0] === '#') {
      return ctx.fillStyle.slice(0, 7)
    }
    ctx.fillRect(0, 0, 1, 1)
    const px = ctx.getImageData(0, 0, 1, 1).data
    if (!px[3]) {
      return fallback
    }
    return '#' + [px[0], px[1], px[2]].map((n) => ('0' + n.toString(16)).slice(-2)).join('')
  } catch (e) {
    return fallback
  }
}

function isLeafText(el) {
  const kids = el.childNodes
  for (let i = 0; i < kids.length; i++) {
    if (kids[i].nodeType === 1) {
      return false
    }
  }
  return true
}

function classifyElement(el) {
  const tag = (el.tagName || '').toLowerCase()
  if (SKIP_TAGS[tag]) {
    return 'skip'
  }
  if (tag === 'img' || tag === 'image') {
    return 'image'
  }
  try {
    const view = el.ownerDocument && el.ownerDocument.defaultView
    const bg = view && view.getComputedStyle(el).backgroundImage
    if (bg && bg !== 'none' && /url\(/i.test(bg)) {
      return 'image'
    }
  } catch (e) {
    // ignore
  }
  if (isLeafText(el) || TEXT_TAGS[tag]) {
    return 'text'
  }
  return 'box'
}

function resolveImageElement(el) {
  const tag = (el.tagName || '').toLowerCase()
  if (tag === 'img' || tag === 'image') {
    return el
  }
  try {
    const img = el.querySelector && el.querySelector('img, image')
    if (img) {
      return img
    }
  } catch (e) {
    // ignore
  }
  return el
}

function imageKindFor(el, kind) {
  const tag = (el.tagName || '').toLowerCase()
  if (tag === 'image') {
    return 'href'
  }
  if (tag === 'img') {
    return 'src'
  }
  if (kind === 'image') {
    return 'background'
  }
  return 'src'
}

function readComputed(el) {
  try {
    const view = el.ownerDocument && el.ownerDocument.defaultView
    return view ? view.getComputedStyle(el) : null
  } catch (e) {
    return null
  }
}

function colorSourceElement(el, kind) {
  if (kind !== 'text' || isLeafText(el)) {
    return el
  }
  const child = el.querySelector('h1,h2,h3,h4,h5,h6,p,span,a,label,button,li,td,th')
  return child || el
}

const BLUR_FILTER = 'blur(8px)'

function isBlurredFilter(filter) {
  return /blur\s*\(\s*[1-9]/.test(String(filter || ''))
}

function snapshotElement(el, kind) {
  const computed = readComputed(el)
  const colorEl = colorSourceElement(el, kind)
  const colorComputed = colorEl === el ? computed : readComputed(colorEl)
  const doc = el.ownerDocument
  const inlineColor = el.style && el.style.color
  const inlineBg = el.style && el.style.backgroundColor
  const rawColor = (inlineColor && !isTransparentColor(inlineColor) ? inlineColor : null)
    || (colorComputed && colorComputed.color)
    || (computed && computed.color)
  const rawBg = (inlineBg && !isTransparentColor(inlineBg) ? inlineBg : null)
    || (computed && computed.backgroundColor)
  const bgWasTransparent = isTransparentColor(rawBg)
  const rawFilter = (el.style && el.style.filter) || (computed && computed.filter) || ''
  return {
    text: (isLeafText(el) ? el.textContent : (colorEl.textContent || el.textContent)) || '',
    color: toHexColor(rawColor, '#000000', doc),
    backgroundColor: bgWasTransparent ? '' : toHexColor(rawBg, '#ffffff', doc),
    bgWasTransparent,
    hidden: !!(computed && computed.visibility === 'hidden'),
    blurred: isBlurredFilter(rawFilter),
    filter: el.style.filter || '',
    src: el.getAttribute('src') || el.getAttribute('href') || '',
    kind,
    imageKind: imageKindFor(el, kind),
    outline: el.style.outline,
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function EditText({ iframeRef, screenId, isEditor = false }) {
  const [isVisible, setIsVisible] = useState(false)
  const [targetElement, setTargetElement] = useState(null)
  const [kind, setKind] = useState('box')
  const [draft, setDraft] = useState({
    text: '',
    color: '#000000',
    backgroundColor: '#ffffff',
    hidden: false,
    blurred: false,
    file: null,
    objectUrl: '',
    imageKind: 'src',
  })
  const [saving, setSaving] = useState(false)

  const finishRef = useRef(null)
  const activeRef = useRef(false)
  const originalRef = useRef(null)
  const targetRef = useRef(null)
  const objectUrlRef = useRef('')
  const startPickerRef = useRef(null)

  function startPicker() {
    const targetDoc = getEditTargetDocument(iframeRef)
    if (!targetDoc) {
      console.error('EditText: no demo document')
      return
    }
    elementPicker.init({
      document: targetDoc,
      onClick: onPick,
      backgroundColor: mainColors.primaryColor,
    })
  }

  function revertLive(el, original) {
    if (!el || !original) {
      return
    }
    if (original.kind === 'text' || (original.kind === 'box' && isLeafText(el))) {
      el.textContent = original.text
    }
    el.style.color = ''
    el.style.backgroundColor = ''
    el.style.visibility = original.hidden ? 'hidden' : ''
    el.style.filter = original.filter || ''
    el.style.outline = original.outline || ''
    if (original.kind === 'image') {
      if (original.imageKind === 'background') {
        el.style.backgroundImage = ''
      } else if (original.imageKind === 'href') {
        if (original.src) {
          el.setAttribute('href', original.src)
        }
      } else if (original.src) {
        el.setAttribute('src', original.src)
      }
    }
  }

  function closeTooltip({ revert }) {
    const el = targetRef.current
    const original = originalRef.current
    if (revert) {
      revertLive(el, original)
    } else if (el) {
      el.style.outline = (original && original.outline) || ''
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = ''
    }
    targetRef.current = null
    originalRef.current = null
    setTargetElement(null)
    setIsVisible(false)
  }

  function onPick(element) {
    if (!element || !activeRef.current) {
      return
    }
    const nextKind = classifyElement(element)
    if (nextKind === 'skip') {
      if (startPickerRef.current) {
        startPickerRef.current()
      }
      return
    }
    if (targetRef.current && targetRef.current !== element) {
      revertLive(targetRef.current, originalRef.current)
    }
    if (nextKind === 'image') {
      element = resolveImageElement(element)
    }
    const original = snapshotElement(element, nextKind)
    originalRef.current = original
    targetRef.current = element
    element.style.outline = '2px solid ' + mainColors.primaryColor
    setKind(nextKind)
    setDraft({
      text: original.text,
      color: original.color,
      backgroundColor: original.backgroundColor || '#ffffff',
      hidden: original.hidden,
      blurred: original.blurred,
      file: null,
      objectUrl: '',
      imageKind: original.imageKind,
      bgWasTransparent: original.bgWasTransparent,
    })
    setTargetElement(element)
    setIsVisible(true)
  }

  startPickerRef.current = startPicker

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.editTextData = { screenId }

    window.editText = function (onFinishFunc) {
      if (!isEditor) {
        return
      }
      finishRef.current = onFinishFunc || null
      activeRef.current = true
      window.__livedemoEditTextActive = true
      if (startPickerRef.current) {
        startPickerRef.current()
      }
    }

    window.resetEditText = function () {
      activeRef.current = false
      window.__livedemoEditTextActive = false
      elementPicker.reset()
      closeTooltip({ revert: true })
      finishRef.current = null
    }
  }, [screenId, iframeRef, isEditor])

  function applyLive(next) {
    const el = targetRef.current
    if (!el) {
      return
    }
    if (kind === 'text' || (kind === 'box' && isLeafText(el))) {
      el.textContent = next.text
    }
    el.style.color = next.color
    if (kind !== 'image' || next.imageKind === 'background') {
      el.style.backgroundColor = next.bgWasTransparent ? '' : next.backgroundColor
    }
    el.style.visibility = next.hidden ? 'hidden' : ''
    el.style.filter = next.blurred ? BLUR_FILTER : ''
    if (next.objectUrl) {
      if (next.imageKind === 'background') {
        el.style.backgroundImage = `url("${next.objectUrl}")`
      } else if (next.imageKind === 'href') {
        el.setAttribute('href', next.objectUrl)
      } else {
        el.setAttribute('src', next.objectUrl)
      }
    }
  }

  function patchDraft(partial) {
    setDraft((prev) => {
      const next = { ...prev, ...partial }
      applyLive(next)
      return next
    })
  }

  async function onApply() {
    const el = targetRef.current
    const original = originalRef.current
    if (!el || !original) {
      return
    }
    const payload = {
      action: 'save',
      screenId: typeof window !== 'undefined' && window.editTextData
        ? window.editTextData.screenId
        : screenId,
      elementNodeId: mirrorIdOf(el),
      rrwebNodeId: resolveRrwebTextNodeId(el),
      textNodeId: resolveRrwebTextNodeId(el),
    }
    if (kind === 'text' || (kind === 'box' && isLeafText(el))) {
      payload.text = draft.text
      payload.oldText = original.text
    }
    if (kind !== 'image' && draft.color !== original.color) {
      payload.color = draft.color
    }
    if (kind !== 'image' && !original.bgWasTransparent && draft.backgroundColor !== original.backgroundColor) {
      payload.backgroundColor = draft.backgroundColor
    }
    if (kind !== 'image' && original.bgWasTransparent && draft.backgroundColor && draft.backgroundColor !== '#ffffff') {
      payload.backgroundColor = draft.backgroundColor
    }
    if (draft.hidden !== original.hidden) {
      payload.hidden = draft.hidden
    }
    if (draft.blurred !== original.blurred) {
      payload.blurred = draft.blurred
    }
    if (draft.file) {
      if (draft.file.size > 5 * 1024 * 1024) {
        console.error('EditText: image larger than 5MB')
        return
      }
      payload.imageData = await fileToDataUrl(draft.file)
      payload.imageKind = draft.imageKind
    }

    const hasWork = payload.text != null
      || payload.color != null
      || payload.backgroundColor != null
      || payload.hidden != null
      || payload.blurred != null
      || payload.imageData
    if (!hasWork) {
      closeTooltip({ revert: false })
      if (activeRef.current && startPickerRef.current) {
        startPickerRef.current()
      }
      return
    }
    if (payload.elementNodeId == null && payload.rrwebNodeId == null) {
      console.error('EditText: missing rrweb node id')
      return
    }

    setSaving(true)
    try {
      if (finishRef.current) {
        await finishRef.current(payload)
      }
      closeTooltip({ revert: false })
      if (activeRef.current && startPickerRef.current) {
        startPickerRef.current()
      }
    } catch (err) {
      console.error('EditText save failed', err)
      revertLive(el, original)
    } finally {
      setSaving(false)
    }
  }

  function onCancel() {
    closeTooltip({ revert: true })
    if (activeRef.current && startPickerRef.current) {
      startPickerRef.current()
    }
  }

  function onUploadChange(event) {
    const file = event.target.files && event.target.files[0]
    event.target.value = ''
    if (!file) {
      return
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }
    const objectUrl = URL.createObjectURL(file)
    objectUrlRef.current = objectUrl
    patchDraft({ file, objectUrl })
  }

  const showText = kind === 'text' || (kind === 'box' && targetElement && isLeafText(targetElement))
  const showColors = kind !== 'image' || draft.imageKind === 'background'
  const showImage = kind === 'image'

  return (
    <S.Tippy
      visible={isVisible}
      getReferenceClientRect={() => getViewportRect(targetElement)}
      placement="right-start"
      interactive={true}
      appendTo={() => document.body}
      zIndex={100000}
      maxWidth={260}
      onClickOutside={saving ? () => {} : onCancel}
      content={
        isVisible && targetElement ? (
          <S.Panel onMouseDown={(e) => e.stopPropagation()}>
            <S.Title>{showImage ? 'Edit image' : showText ? 'Edit text' : 'Edit element'}</S.Title>
            {showText ? (
              <S.Field>
                <S.Label>Text</S.Label>
                <S.TextArea
                  value={draft.text}
                  onChange={(e) => patchDraft({ text: e.target.value })}
                  rows={3}
                />
              </S.Field>
            ) : null}
            {showColors ? (
              <S.Stack>
                <S.Field>
                  <S.Label>Color</S.Label>
                  <S.ColorRow>
                    <S.ColorInput
                      type="color"
                      value={draft.color || '#000000'}
                      onChange={(e) => patchDraft({ color: e.target.value })}
                    />
                    <S.Hex value={draft.color || ''} readOnly />
                  </S.ColorRow>
                </S.Field>
                <S.Field>
                  <S.Label>Background</S.Label>
                  <S.ColorRow>
                    <S.ColorInput
                      type="color"
                      value={draft.backgroundColor || '#ffffff'}
                      onChange={(e) => patchDraft({ backgroundColor: e.target.value, bgWasTransparent: false })}
                    />
                    <S.Hex value={draft.bgWasTransparent ? 'transparent' : (draft.backgroundColor || '')} readOnly />
                  </S.ColorRow>
                </S.Field>
              </S.Stack>
            ) : null}
            {showImage ? (
              <S.Field>
                <S.Label>Replace image</S.Label>
                <S.UploadLabel>
                  Upload
                  <input type="file" accept="image/*" onChange={onUploadChange} hidden />
                </S.UploadLabel>
                {draft.file ? <S.Hint>{draft.file.name}</S.Hint> : (
                  originalRef.current && originalRef.current.src
                    ? <S.Hint>{String(originalRef.current.src).split('/').pop()}</S.Hint>
                    : null
                )}
              </S.Field>
            ) : null}
            <S.CheckRow>
              <input
                type="checkbox"
                checked={draft.blurred}
                onChange={(e) => patchDraft({ blurred: e.target.checked })}
              />
              Blur element
            </S.CheckRow>
            <S.CheckRow>
              <input
                type="checkbox"
                checked={draft.hidden}
                onChange={(e) => patchDraft({ hidden: e.target.checked })}
              />
              Hide element
            </S.CheckRow>
            <S.Actions>
              <S.Ghost type="button" onClick={onCancel} disabled={saving}>Cancel</S.Ghost>
              <S.Primary type="button" onClick={onApply} disabled={saving}>
                {saving ? 'Saving…' : 'Apply'}
              </S.Primary>
            </S.Actions>
          </S.Panel>
        ) : null
      }
    >
      <span style={{ display: 'none' }} />
    </S.Tippy>
  )
}

const S = {
  Tippy: styled(Tippy)`
    && {
      background: #1a1a1a !important;
      color: #e8e8e8;
      border: 1px solid #333;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      max-width: 260px !important;
    }
    && .tippy-content {
      padding: 0;
      overflow: hidden;
    }
    && .tippy-arrow {
      color: #1a1a1a;
    }
  `,
  Panel: styled.div`
    box-sizing: border-box;
    width: 232px;
    max-width: 100%;
    padding: 10px 12px 12px;
    overflow: hidden;
    color: #e8e8e8;
    font-family: Inter, system-ui, sans-serif;
    font-size: 12px;
  `,
  Title: styled.div`
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
  `,
  Field: styled.label`
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    width: 100%;
    margin-bottom: 8px;
  `,
  Label: styled.span`
    color: #b8b8b8;
    font-size: 11px;
  `,
  TextArea: styled.textarea`
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    resize: vertical;
    min-height: 54px;
    border-radius: 6px;
    border: 1px solid #3a3a3a;
    background: #1f1f1f;
    color: #f2f2f2;
    padding: 6px 8px;
    font: inherit;
  `,
  Stack: styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
    width: 100%;
  `,
  ColorRow: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    width: 100%;
  `,
  ColorInput: styled.input`
    box-sizing: border-box;
    width: 28px;
    min-width: 28px;
    max-width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    flex: 0 0 28px;
  `,
  Hex: styled.input`
    box-sizing: border-box;
    flex: 1 1 0;
    min-width: 0;
    width: 100%;
    border-radius: 6px;
    border: 1px solid #3a3a3a;
    background: #1f1f1f;
    color: #f2f2f2;
    padding: 4px 6px;
    font: inherit;
  `,
  UploadLabel: styled.label`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    padding: 0 10px;
    border-radius: 6px;
    background: #2f6bff;
    color: #fff;
    cursor: pointer;
    font-weight: 600;
    width: fit-content;
  `,
  Hint: styled.div`
    color: #9a9a9a;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  CheckRow: styled.label`
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 2px 0 10px;
    cursor: pointer;
  `,
  Actions: styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  `,
  Ghost: styled.button`
    height: 28px;
    padding: 0 10px;
    border-radius: 6px;
    border: 1px solid #4a4a4a;
    background: transparent;
    color: #ddd;
    cursor: pointer;
  `,
  Primary: styled.button`
    height: 28px;
    padding: 0 12px;
    border-radius: 6px;
    border: 0;
    background: #2f6bff;
    color: #fff;
    cursor: pointer;
    font-weight: 600;
  `,
}

export default EditText
