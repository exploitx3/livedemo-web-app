import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'

function FormHubspotV4({
  step,
  onNext,
  themeTextColor,
  themeButtonBackgroundColor,
  themeButtonTextColor
}) {
  const containerRef = useRef(null)
  const hasLoadedRef = useRef(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const formId = step?.view?.popup?.formId?.hubspot?.formId
  const portalId = step?.view?.popup?.formId?.hubspot?.portalId

  // Listen for HubSpot form submission success event
  useEffect(() => {
    if (!onNext) {
      return
    }

    const handleFormSubmission = (event) => {
      console.log('User successfully submitted the form!')
      if (onNext) {
        onNext()
      }
    }

    window.addEventListener('hs-form-event:on-submission:success', handleFormSubmission)

    return () => {
      window.removeEventListener('hs-form-event:on-submission:success', handleFormSubmission)
    }
  }, [onNext])

  useEffect(() => {

    if (!formId || !portalId) {
      setError('Form ID or Portal ID is missing')
      setIsLoading(false)
      return
    }

    // Reset load flag when form changes
    const formKey = `${formId}-${portalId}`
    if (hasLoadedRef.current === formKey) {
      return
    }
    hasLoadedRef.current = formKey
    setIsLoading(true)
    setError(null)

    const containerId = `hubspot-form-container-${formId}`
    if (containerRef.current) {
      containerRef.current.id = containerId
    }

    // Load script
    const loadScript = () => {
      if (window.hbspt) {
        return Promise.resolve(window.hbspt)
      }

      return new Promise((resolve, reject) => {
        let scriptUrl = `https://js.hsforms.net/forms/embed/${portalId}.js`
        
        const existingScript = document.querySelector(`script[src="${scriptUrl}"]`)
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(window.hbspt))
          existingScript.addEventListener('error', () => reject(new Error('Failed to load HubSpot script')))
          return
        }

        const script = document.createElement('script')
        script.src = scriptUrl
        script.async = true
        script.onload = () => resolve(window.hbspt)
        script.onerror = () => reject(new Error('Failed to load HubSpot script'))
        document.body.appendChild(script)
      })
    }

    if(formId && portalId) {
      loadScript()
      .then((hbspt) => {
        debugger
        console.log('hbspt', hbspt)
      })
    }
     
  }, [step?.view?.popup?.formId?.hubspot?.formId, step?.view?.popup?.formId?.hubspot?.portalId, onNext])

  return (
    <F.Container>
      {error && (
        <F.ErrorMessage>
          {error}
        </F.ErrorMessage>
      )}
      <F.FormWrapper
        ref={containerRef}
        data-form-id={formId}
        data-portal-id={portalId}
        className={'hs-form-frame'}
        themeTextColor={themeTextColor || '#333'}
        themeButtonBackgroundColor={themeButtonBackgroundColor || Colors.primaryColor}
        themeButtonTextColor={themeButtonTextColor || '#fff'}
      />
    </F.Container>
  )
}

const F = {
  Container: styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;

    &.hidden {
      display: none;
    }

    &.show-form {
      display: block;
    }
  `,
  FormWrapper: styled.div`
    width: 100%;
    max-width: 600px;
    max-height: 100%;
    overflow-y: auto;
    overflow-x: auto;

    background: white;
    border-radius: 6px;
    padding: 16px;

    /* Make iframes inside scrollable */
    iframe {
      max-height: 100%;
      overflow-y: auto;
      overflow-x: auto;
    }
   
  `,
  ErrorMessage: styled.div`
    color: #d32f2f;
    padding: 20px;
    margin-bottom: 20px;
    background-color: #ffebee;
    border: 1px solid #ef5350;
    border-radius: 4px;
    text-align: center;
    font-family: ${Colors.fontFamilyApple};
    
  `,
  LoadingMessage: styled.div`
    color: #666;
    padding: 20px;
    font-family: ${Colors.fontFamilyApple};
    text-align: center;
  `
}

export default FormHubspotV4