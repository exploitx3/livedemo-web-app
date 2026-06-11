import React, { useRef, useState } from 'react'
import axios from '../../../../../../utils/axiosInstance'
import * as ENV from '../../../../../../config'
import ScreenTypes from '../../../../../../constants/ScreenTypes'

const PreviewImageSection = ({
  internalStep,
  setInternalStep,
  storyDemo,
  workspaceId,
  storyDemoId,
  screenId,
  authData,
}) => {
  const fileInputRef = useRef(null)
  const [isSelectingStep, setIsSelectingStep] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const showPreviewImage = internalStep?.view?.popup?.showPreviewImage || false
  const previewImageUrl = internalStep?.view?.popup?.previewImageUrl || ''

  const screenshotScreens = storyDemo && storyDemo.screens
    ? storyDemo.screens.filter(s => s.type === ScreenTypes.SCREEN_SCREENSHOT && s.imageUrl)
    : []

  function updateShowPreviewImage(value) {
    let newStep = JSON.parse(JSON.stringify(internalStep))
    newStep.view.popup.showPreviewImage = value
    setInternalStep(newStep)
  }

  function updatePreviewImageUrl(url) {
    let newStep = JSON.parse(JSON.stringify(internalStep))
    newStep.view.popup.previewImageUrl = url
    setInternalStep(newStep)
  }

  async function uploadPreviewImage(file) {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('previewImage', file)

      const res = await axios.post(
        `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${internalStep._id}/previewImage`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      updatePreviewImageUrl(res.data.previewImageUrl)
    } catch (err) {
      console.error('Failed to upload preview image', err)
    } finally {
      setIsUploading(false)
    }
  }

  async function selectScreenAsPreviewImage(sourceScreenId) {
    setIsUploading(true)
    try {
      const res = await axios.post(
        `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemoId}/screens/${screenId}/steps/${internalStep._id}/previewImage`,
        { sourceScreenId },
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        }
      )
      updatePreviewImageUrl(res.data.previewImageUrl)
      setIsSelectingStep(false)
    } catch (err) {
      console.error('Failed to select screen as preview image', err)
    } finally {
      setIsUploading(false)
    }
  }

  function handleReset() {
    updatePreviewImageUrl('')
    setIsSelectingStep(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>Preview Image</span>
        <label htmlFor="toggle-showPreviewImage" style={styles.toggleLabel}>
          <div style={styles.toggleWrapper}>
            <input
              id="toggle-showPreviewImage"
              type="checkbox"
              checked={showPreviewImage}
              onChange={(e) => {
                updateShowPreviewImage(e.target.checked)
                if (!e.target.checked) {
                  setIsSelectingStep(false)
                }
              }}
              style={styles.srOnly}
            />
            <div style={{
              ...styles.toggleTrack,
              backgroundColor: showPreviewImage ? '#2142e7' : '#d1d5db',
            }} />
            <div style={{
              ...styles.toggleThumb,
              transform: showPreviewImage ? 'translateX(14px)' : 'translateX(0px)',
            }} />
          </div>
        </label>
      </div>

      {showPreviewImage && (
        <div>
          <div style={styles.imagePreview}>
            {previewImageUrl ? (
              <img
                src={previewImageUrl}
                alt="Preview"
                style={styles.previewImg}
              />
            ) : (
              <div style={styles.imagePlaceholder}>
                <span style={styles.placeholderText}>No image selected</span>
              </div>
            )}
          </div>

          {isSelectingStep ? (
            <div style={styles.screenGrid}>
              {screenshotScreens.length === 0 ? (
                <div style={styles.noScreensMsg}>No screenshot screens available</div>
              ) : (
                screenshotScreens.map((screen) => (
                  <div
                    key={screen._id}
                    style={styles.screenThumb}
                    onClick={() => selectScreenAsPreviewImage(screen._id)}
                  >
                    <img
                      src={screen.imageUrl}
                      alt="Screen"
                      style={styles.screenThumbImg}
                    />
                    <div style={styles.screenThumbOverlay} />
                  </div>
                ))
              )}
            </div>
          ) : null}

          <div style={styles.actionRow}>
            {!isSelectingStep ? (
              <>
                <button
                  style={styles.button}
                  disabled={isUploading}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.gif,.webp,image/svg+xml,.svg"
                  tabIndex={-1}
                  style={styles.hiddenInput}
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0]
                    if (file) uploadPreviewImage(file)
                    e.target.value = ''
                  }}
                />
                <span style={styles.orText}>or</span>
                <button
                  style={styles.button}
                  disabled={isUploading}
                  onClick={() => setIsSelectingStep(true)}
                >
                  Select step
                </button>
              </>
            ) : (
              <button
                style={styles.button}
                onClick={() => setIsSelectingStep(false)}
              >
                Close
              </button>
            )}
          </div>

          {/* <button style={styles.resetButton} onClick={handleReset}>
            Reset
          </button> */}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    paddingTop: '16px',
    width: '100%',
    marginBottom: '15px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  toggleWrapper: {
    position: 'relative',
    width: '32px',
    height: '18px',
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    border: 0,
  },
  toggleTrack: {
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    transition: 'background-color 0.2s',
  },
  toggleThumb: {
    position: 'absolute',
    top: '3px',
    left: '3px',
    width: '12px',
    height: '12px',
    borderRadius: '9999px',
    backgroundColor: '#ffffff',
    transition: 'transform 0.2s',
    pointerEvents: 'none',
  },
  imagePreview: {
    marginTop: '12px',
    position: 'relative',
    aspectRatio: '3/2',
    overflow: 'hidden',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  previewImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  imagePlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    minHeight: '80px',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: '12px',
  },
  screenGrid: {
    marginTop: '8px',
    padding: '8px',
    borderRadius: '12px',
    backgroundColor: '#f3f4f6',
    maxHeight: '200px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    overflowY: 'auto',
    gap: '8px',
  },
  noScreensMsg: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '12px',
    padding: '16px 0',
  },
  screenThumb: {
    position: 'relative',
    aspectRatio: '3/2',
    cursor: 'pointer',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  screenThumbImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  screenThumbOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: '8px',
    border: '1px solid rgba(17,24,39,0.12)',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '8px',
  },
  button: {
    flex: 1,
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    color: '#111827',
    height: '32px',
    padding: '0 8px',
    fontSize: '12px',
    transition: 'background-color 0.15s',
  },
  orText: {
    color: '#6b7280',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  hiddenInput: {
    border: 0,
    clip: 'rect(0px, 0px, 0px, 0px)',
    height: '1px',
    margin: '0px -1px -1px 0px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px',
    whiteSpace: 'nowrap',
  },
  resetButton: {
    marginTop: '8px',
    width: '100%',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px',
    border: '1px solid #f3f4f6',
    backgroundColor: '#f3f4f6',
    color: '#111827',
    height: '32px',
    padding: '0 8px',
    fontSize: '12px',
    transition: 'background-color 0.15s',
  },
}

export default PreviewImageSection
