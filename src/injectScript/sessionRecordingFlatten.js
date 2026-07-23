/**
 * Flatten nested demo iframes in session-recording event streams.
 *
 * Nested Replayer / #story_iframe documents attach via isAttachIframe. Analytics
 * cannot rebuild those nested iframe documents reliably (white surface).
 *
 * Strategy:
 *  1. Host iframes → div[data-livedemo-flat-iframe]
 *  2. Document attaches → div.livedemo-flat-doc
 *  3. Later html/body/head wrapper adds are skipped; their ids remap so children
 *     land directly in the flat-doc (rrweb often attaches an empty Document then
 *     streams html/body/children as incremental adds).
 */

import { EventType, IncrementalSource } from 'rrweb'

const NodeType = {
  Document: 0,
  DocumentType: 1,
  Element: 2,
  Text: 3,
  CDATA: 4,
  Comment: 5,
}

const FLAT_ATTR = 'data-livedemo-flat-iframe'
const FLAT_DOC_CLASS = 'livedemo-flat-doc'
const WRAPPER_TAGS = new Set(['html', 'body', 'head'])

function createFlattenState() {
  return {
    underRrwebRoot: new Set(),
    flatIframeIds: new Set(),
    flatDocIds: new Set(),
    /** host iframe/div id → flat-doc id */
    flatContentByParent: new Map(),
    /** document/html/body ids → flat-doc id */
    parentRemap: new Map(),
  }
}

function getAttrId(node) {
  if (!node || node.type !== NodeType.Element || !node.attributes) {
    return null
  }
  const id = node.attributes.id
  return typeof id === 'string' ? id : null
}

function convertIframeNodeToDiv(node) {
  if (!node || node.type !== NodeType.Element || node.tagName !== 'iframe') {
    return false
  }
  const prevId = getAttrId(node) || 'nested'
  const prevStyle = typeof node.attributes?.style === 'string' ? node.attributes.style : ''
  node.tagName = 'div'
  node.attributes = {
    ...(node.attributes || {}),
    [FLAT_ATTR]: prevId,
    style: [prevStyle, 'width:100%;height:100%;border:0;overflow:hidden;display:block;box-sizing:border-box']
      .filter(Boolean)
      .join(';'),
  }
  delete node.attributes.src
  delete node.attributes.sandbox
  delete node.attributes.allow
  delete node.attributes.allowfullscreen
  return true
}

function trackUnderRoot(node, state) {
  if (!node || node.id == null) {
    return
  }
  state.underRrwebRoot.add(node.id)
  if (node.childNodes && node.childNodes.length) {
    for (let i = 0; i < node.childNodes.length; i++) {
      trackUnderRoot(node.childNodes[i], state)
    }
  }
}

function markFlatHost(node, state) {
  state.flatIframeIds.add(node.id)
  state.underRrwebRoot.add(node.id)
}

function walkFullSnapshot(node, state, underRrwebRoot) {
  if (!node) {
    return
  }

  if (node.type === NodeType.Element) {
    const domId = getAttrId(node)
    let nextUnder = underRrwebRoot
    if (domId === 'story_rrweb_root') {
      nextUnder = true
      state.underRrwebRoot.add(node.id)
    }

    if (node.tagName === 'iframe' && (domId === 'story_iframe' || nextUnder || underRrwebRoot)) {
      convertIframeNodeToDiv(node)
      markFlatHost(node, state)
    } else if (node.attributes && node.attributes[FLAT_ATTR]) {
      markFlatHost(node, state)
    } else if (
      node.attributes &&
      typeof node.attributes.class === 'string' &&
      node.attributes.class.split(/\s+/).includes(FLAT_DOC_CLASS)
    ) {
      state.flatDocIds.add(node.id)
      state.parentRemap.set(node.id, node.id)
      trackUnderRoot(node, state)
    } else if (nextUnder || underRrwebRoot) {
      state.underRrwebRoot.add(node.id)
    }

    if (node.childNodes) {
      for (let i = 0; i < node.childNodes.length; i++) {
        walkFullSnapshot(node.childNodes[i], state, nextUnder || underRrwebRoot)
      }
    }
    return
  }

  if (node.childNodes) {
    for (let i = 0; i < node.childNodes.length; i++) {
      walkFullSnapshot(node.childNodes[i], state, underRrwebRoot)
    }
  }
}

function isStyleOrLink(node) {
  return (
    node &&
    node.type === NodeType.Element &&
    (node.tagName === 'style' ||
      (node.tagName === 'link' &&
        node.attributes &&
        (node.attributes.rel === 'stylesheet' || node.attributes.rel === 'Stylesheet')))
  )
}

function registerDocWrappers(docNode, flatDocId, state) {
  state.parentRemap.set(docNode.id, flatDocId)
  state.flatDocIds.add(flatDocId)
  state.parentRemap.set(flatDocId, flatDocId)

  const childNodes = Array.isArray(docNode.childNodes) ? docNode.childNodes : []
  const htmlNode = childNodes.find(
    (c) => c && c.type === NodeType.Element && c.tagName === 'html',
  )
  if (!htmlNode) {
    return
  }
  state.parentRemap.set(htmlNode.id, flatDocId)
  for (const child of htmlNode.childNodes || []) {
    if (child && child.type === NodeType.Element && WRAPPER_TAGS.has(child.tagName)) {
      state.parentRemap.set(child.id, flatDocId)
    }
  }
}

export function documentNodeToFlatElement(docNode) {
  if (!docNode || docNode.type !== NodeType.Document) {
    return docNode
  }

  const childNodes = Array.isArray(docNode.childNodes) ? docNode.childNodes : []
  const htmlNode = childNodes.find(
    (c) => c && c.type === NodeType.Element && c.tagName === 'html',
  )

  let contentChildren = []
  if (htmlNode && Array.isArray(htmlNode.childNodes)) {
    const head = htmlNode.childNodes.find(
      (c) => c && c.type === NodeType.Element && c.tagName === 'head',
    )
    const body = htmlNode.childNodes.find(
      (c) => c && c.type === NodeType.Element && c.tagName === 'body',
    )

    for (const n of head && Array.isArray(head.childNodes) ? head.childNodes : []) {
      if (isStyleOrLink(n)) {
        contentChildren.push(n)
      }
    }
    if (body && Array.isArray(body.childNodes)) {
      contentChildren = contentChildren.concat(body.childNodes)
    }
  } else {
    contentChildren = childNodes.filter((c) => c && c.type !== NodeType.DocumentType)
  }

  const bodyStyle =
    htmlNode &&
    htmlNode.childNodes &&
    htmlNode.childNodes.find((c) => c && c.tagName === 'body')?.attributes?.style

  return {
    type: NodeType.Element,
    tagName: 'div',
    id: docNode.id,
    attributes: {
      class: FLAT_DOC_CLASS,
      style: [
        'width:100%',
        'height:100%',
        'border:0',
        'overflow:auto',
        'position:relative',
        'box-sizing:border-box',
        'background:#fff',
        bodyStyle || '',
      ]
        .filter(Boolean)
        .join(';'),
    },
    childNodes: contentChildren,
  }
}

/**
 * Nodes serialized inside an iframe Document carry rootId=<documentId>.
 * After flatten, that id is a DIV, and rebuild does
 *   doc = mirror.getNode(rootId); doc.createElement(...)
 * which throws "createElement is not a function". Strip rootId so rebuild
 * uses the Analytics player contentDocument instead.
 */
function stripRootId(node) {
  if (!node || typeof node !== 'object') {
    return node
  }
  const next = { ...node }
  if ('rootId' in next) {
    delete next.rootId
  }
  if (Array.isArray(next.childNodes)) {
    next.childNodes = next.childNodes.map((c) => stripRootId(c))
  }
  return next
}

/**
 * rrweb mutation applies use skipChild:true — nested childNodes on an added
 * node are ignored. Explode a tree into parent/child add records.
 */
function explodeTreeToAdds(node, parentId) {
  if (!node) {
    return []
  }
  const cleaned = stripRootId(node)
  const childNodes = Array.isArray(cleaned.childNodes) ? cleaned.childNodes : []
  const shell = { ...cleaned, childNodes: [] }
  const adds = [
    {
      parentId,
      nextId: null,
      node: shell,
    },
  ]
  for (let i = 0; i < childNodes.length; i++) {
    adds.push(...explodeTreeToAdds(childNodes[i], cleaned.id))
  }
  return adds
}

function flattenAddedSubtree(node, parentId, state, forceUnderRoot) {
  if (!node) {
    return
  }

  const under =
    forceUnderRoot ||
    state.underRrwebRoot.has(parentId) ||
    state.flatIframeIds.has(parentId) ||
    getAttrId(node) === 'story_rrweb_root'

  if (node.type === NodeType.Element) {
    if (getAttrId(node) === 'story_rrweb_root') {
      state.underRrwebRoot.add(node.id)
    }

    if (
      node.tagName === 'iframe' &&
      (getAttrId(node) === 'story_iframe' || under)
    ) {
      convertIframeNodeToDiv(node)
      markFlatHost(node, state)
    } else if (under) {
      state.underRrwebRoot.add(node.id)
    }
  } else if (under && node.id != null) {
    state.underRrwebRoot.add(node.id)
  }

  if (node.childNodes && node.childNodes.length) {
    const childUnder =
      under || state.underRrwebRoot.has(node.id) || state.flatIframeIds.has(node.id)
    for (let i = 0; i < node.childNodes.length; i++) {
      flattenAddedSubtree(node.childNodes[i], node.id, state, childUnder)
    }
  }
}

function resolveParentId(parentId, state) {
  if (parentId == null) {
    return parentId
  }
  let cur = parentId
  const seen = new Set()
  while (state.parentRemap.has(cur) && !seen.has(cur)) {
    seen.add(cur)
    const next = state.parentRemap.get(cur)
    if (next === cur) {
      break
    }
    cur = next
  }
  return cur
}

function isFlatDocParent(parentId, state) {
  return state.flatDocIds.has(parentId) || state.parentRemap.get(parentId) === parentId
}

function processMutationData(data, state) {
  if (!data) {
    return data
  }

  if (data.isAttachIframe && Array.isArray(data.adds) && data.adds.length) {
    const add = data.adds[0]
    if (
      add &&
      add.node &&
      add.node.type === NodeType.Document &&
      state.flatIframeIds.has(add.parentId)
    ) {
      const flatNode = documentNodeToFlatElement(add.node)
      const removes = Array.isArray(data.removes) ? data.removes.slice() : []
      const prevContentId = state.flatContentByParent.get(add.parentId)
      if (prevContentId != null && prevContentId !== flatNode.id) {
        removes.push({ parentId: add.parentId, id: prevContentId })
      }
      state.flatContentByParent.set(add.parentId, flatNode.id)
      registerDocWrappers(add.node, flatNode.id, state)
      trackUnderRoot(flatNode, state)

      return {
        source: IncrementalSource.Mutation,
        texts: data.texts || [],
        attributes: data.attributes || [],
        removes,
        // Explode children: mutation apply drops nested childNodes (skipChild).
        adds: explodeTreeToAdds(flatNode, add.parentId),
      }
    }
  }

  const adds = Array.isArray(data.adds) ? data.adds : []
  const nextAdds = []

  for (let i = 0; i < adds.length; i++) {
    const add = adds[i]
    if (!add || !add.node) {
      continue
    }

    flattenAddedSubtree(add.node, add.parentId, state, false)

    const parentId = resolveParentId(add.parentId, state)
    const node = add.node

    // Record-time flatten already emitted .livedemo-flat-doc nodes — track them
    // so later html/body wrapper adds can be remapped on playback.
    // Also explode nested childNodes (skipChild drops them otherwise).
    if (
      node.type === NodeType.Element &&
      node.attributes &&
      typeof node.attributes.class === 'string' &&
      node.attributes.class.split(/\s+/).includes(FLAT_DOC_CLASS)
    ) {
      state.flatDocIds.add(node.id)
      state.parentRemap.set(node.id, node.id)
      state.flatContentByParent.set(parentId, node.id)
      trackUnderRoot(node, state)
      if (Array.isArray(node.childNodes) && node.childNodes.length) {
        nextAdds.push(...explodeTreeToAdds(node, parentId))
        continue
      }
    }

    // Skip doctype under a flat-doc (invalid in a div tree).
    if (node.type === NodeType.DocumentType && isFlatDocParent(parentId, state)) {
      continue
    }

    // Skip html/body/head wrappers under a flat-doc; remap id so children follow.
    if (
      node.type === NodeType.Element &&
      WRAPPER_TAGS.has(node.tagName) &&
      (isFlatDocParent(parentId, state) || state.flatIframeIds.has(parentId))
    ) {
      const docId = isFlatDocParent(parentId, state)
        ? parentId
        : (state.flatContentByParent.get(parentId) || parentId)
      state.parentRemap.set(node.id, docId)
      state.flatDocIds.add(docId)
      continue
    }

    nextAdds.push({
      parentId,
      nextId: add.nextId != null ? add.nextId : null,
      node,
    })
  }

  const nextRemoves = (Array.isArray(data.removes) ? data.removes : []).map((r) => ({
    ...r,
    parentId: resolveParentId(r.parentId, state),
  }))

  return {
    source: IncrementalSource.Mutation,
    texts: Array.isArray(data.texts) ? data.texts : [],
    attributes: Array.isArray(data.attributes) ? data.attributes : [],
    removes: nextRemoves,
    adds: nextAdds,
  }
}

export function flattenSessionEvent(event, state) {
  if (!event || !state) {
    return event
  }

  if (event.type === EventType.FullSnapshot && event.data && event.data.node) {
    state.underRrwebRoot.clear()
    state.flatIframeIds.clear()
    state.flatDocIds.clear()
    state.flatContentByParent.clear()
    state.parentRemap.clear()
    walkFullSnapshot(event.data.node, state, false)
    return event
  }

  if (
    event.type === EventType.IncrementalSnapshot &&
    event.data &&
    event.data.source === IncrementalSource.Mutation
  ) {
    const nextData = processMutationData(event.data, state)
    if (nextData !== event.data) {
      return { ...event, data: nextData }
    }
  }

  return event
}

export function flattenSessionEvents(events) {
  if (!Array.isArray(events) || !events.length) {
    return events || []
  }
  const state = createFlattenState()
  return events.map((event) => flattenSessionEvent(event, state))
}

export function createSessionRecordingFlattenEmit(emit) {
  const state = createFlattenState()
  return function flattenedEmit(event) {
    return emit(flattenSessionEvent(event, state))
  }
}

export { createFlattenState, FLAT_ATTR, FLAT_DOC_CLASS }
