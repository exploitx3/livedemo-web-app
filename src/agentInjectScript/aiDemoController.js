import ENV from '../config.json'

// The agent never mounts WalkthroughComponent. It iframes the same preview URL
// ShareDropdown already generates, and steps inside one demo via the
// `changeStep` postMessage the player already listens for.
export function storyEmbedSrc(workspaceId, storyId, stepNumber = 1) {
  const ws = String(workspaceId?._id || workspaceId || '')
  const story = String(storyId?._id || storyId || '')
  return `${ENV.STORIES_API}/workspaces/${ws}/stories/${story}/preview?step=${stepNumber}&embed&disableAudio=true`
}

export function createAiDemoController(iframeRef) {
  return {
    openDemo(workspaceId, storyId, stepNumber = 1) {
      if (iframeRef.current) {
        iframeRef.current.src = storyEmbedSrc(workspaceId, storyId, stepNumber)
      }
    },
    navigateToStep(_workspaceId, _storyId, stepNumber) {
      const win = iframeRef.current && iframeRef.current.contentWindow
      if (!win) return
      win.postMessage({ type: 'changeStep', stepNumber }, '*')
    },
  }
}
