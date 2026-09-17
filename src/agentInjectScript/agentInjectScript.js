import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import { Toaster } from 'react-hot-toast'
import AgentSessionLayout from './AgentSessionLayout.js'
import ENV from '../config.json'
import '@fontsource/lexend/latin.css'

// Standalone bootstrap for the agent player HTML shell (getAgentPlayer.js).
// Same two-consumer pattern as injectScript.js/WalkthroughComponent: the SPA
// imports AgentSessionLayout directly; this bundle mounts it from window.config.
try {
    document.domain = ENV.URL_COMMON_DOMAIN
} catch (e) {
    // cross-origin dev setups only
}

// Handler ships no session (keeps the HTML cacheable + no session per crawler
// hit). Mint one here via the existing public route, same as the SPA page does.
function AgentPlayerApp({ agent, mode, sessionId: initialSessionId, authToken, speakWelcome }) {
    const [sessionId, setSessionId] = useState(initialSessionId || null)
    const [ended, setEnded] = useState(false)

    useEffect(() => {
        if (sessionId) return
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}
        axios.post(`${ENV.STORIES_API}/agents/${agent._id}/session`, {}, { headers })
            .then(res => setSessionId(res.data._id))
            .catch(err => console.log('session failed', err))
    }, [])

    // When framed by the SPA (AIDemoAgentPreviewPage) let the parent render its
    // ended card; standalone we show our own.
    function handleHangUp() {
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'ldAgentHangUp' }, '*')
        }
        setEnded(true)
    }

    if (ended) {
        return (
            <div style={{
                width: '100%', height: '100%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: '#111318', color: '#ffffff',
                fontFamily: 'Lexend, sans-serif', fontSize: 16,
            }}>
                Session ended. Thanks for stopping by!
            </div>
        )
    }

    return (
        <React.Fragment>
            {/* SPA mounts Toaster in App.js; standalone shell has to bring its own */}
            <Toaster position="top-center" />
            <AgentSessionLayout
                agent={agent}
                mode={mode || 'published'}
                sessionId={sessionId}
                authToken={authToken || null}
                onHangUp={handleHangUp}
                speakWelcome={speakWelcome !== false}
            />
        </React.Fragment>
    )
}

function setupReact() {
    const cfg = window.config
    if (!cfg || !cfg.agent) return

    const container = document.getElementById('reactAgentApp')
    if (!container) return

    createRoot(container).render(
        <AgentPlayerApp
            agent={cfg.agent}
            mode={cfg.mode}
            sessionId={cfg.sessionId}
            authToken={cfg.authToken}
            speakWelcome={cfg.speakWelcome}
        />
    )
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', setupReact)
} else {
    setupReact()
}
