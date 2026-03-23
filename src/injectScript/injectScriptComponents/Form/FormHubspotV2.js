import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'

function FormHubspotV2({
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


  useEffect(() => {
    const formId = step?.view?.popup?.formId?.hubspot?.formId
    const portalId = step?.view?.popup?.formId?.hubspot?.portalId

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
        const existingScript = document.querySelector('script[src="https://js.hsforms.net/forms/embed/v2.js"]')
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(window.hbspt))
          existingScript.addEventListener('error', () => reject(new Error('Failed to load HubSpot script')))
          return
        }

        const script = document.createElement('script')
        script.src = 'https://js.hsforms.net/forms/embed/v2.js'
        script.async = true
        script.onload = () => resolve(window.hbspt)
        script.onerror = () => reject(new Error('Failed to load HubSpot script'))
        document.body.appendChild(script)
      })
    }

    // Render form
    loadScript()
      .then((hbspt) => {
        if (!containerRef.current) return

        containerRef.current.innerHTML = ''
        setError(null)

        setTimeout(() => {
          if (!containerRef.current) return

          try {
            hbspt.forms.create({
              portalId: parseInt(portalId, 10),
              formId: formId,
              target: `#${containerId}`,
              onFormReady: () => {
                setIsLoading(false)
                setError(null)
              },
              onFormSubmitted: () => {
                if (onNext) onNext()
              }
            })

            // Check if form failed to load after 3 seconds
            setTimeout(() => {
              if (containerRef.current && containerRef.current.children.length === 0) {
                setError('Form failed to load. Make sure the imported form is a legacy form.')
                setIsLoading(false)
              }
            }, 3000)
          } catch (err) {
            console.error('Error creating HubSpot form:', err)
            setError('Failed to create HubSpot form. Make sure the imported form is a legacy form.')
            setIsLoading(false)
          }
        }, 100)
      })
      .catch((err) => {
        console.error('Error loading HubSpot script:', err)
        setError('Failed to load HubSpot forms script')
        setIsLoading(false)
      })
  }, [step?.view?.popup?.formId?.hubspot?.formId, step?.view?.popup?.formId?.hubspot?.portalId, onNext])

  return (
    <F.Container>
      {error && (
        <F.ErrorMessage>
          {error}
        </F.ErrorMessage>
      )}
      {isLoading && !error && (
        <F.LoadingMessage>Loading form...</F.LoadingMessage>
      )}
      <F.FormWrapper
        ref={containerRef}
        className={isLoading ? 'hidden' : 'show-form'}
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

    background: white;
    border-radius: 6px;
    padding: 16px;
   
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

export default FormHubspotV2