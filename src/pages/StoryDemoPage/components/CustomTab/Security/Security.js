import React, { useState } from 'react'
import Colors from '../../../../../constants/mainColors'
import styled from 'styled-components'
import Button from 'antd/es/button'
import Input from 'antd/es/input'
import Icon from '../../../../../components/Icon/Icon'
import ENV from '../../../../../config'
import axios from 'axios'
import 'antd/es/button/style'
import 'antd/es/input/style'

const { TextArea } = Input

const Security = ({ workspaceId, storyDemo, authData, reloadStoryDemo }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [cspValue, setCspValue] = useState(
    (storyDemo.custom && storyDemo.custom.security && storyDemo.custom.security.additionalContentSecurityPolicy) || ''
  )

  function onSaveSecurity() {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    return axios.post(
      `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemo._id}/custom/security`,
      { additionalContentSecurityPolicy: cspValue },
      { headers: { Authorization: `Bearer ${authData.token}` } }
    )
      .then((res) => {
        setIsSaving(false)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
        return reloadStoryDemo()
      })
      .catch((err) => {
        setIsSaving(false)
        const errData = err.response && err.response.data
        if (errData && errData.errors) {
          setSaveError(errData.errors.join('\n'))
        } else {
          setSaveError('Failed to save. Check CSP syntax.')
        }
      })
  }

  return (
    <TH.ScreenHeader>
      <TH.HeaderMain>
        <TH.HeaderLeftSide onClick={() => setIsOpen(!isOpen)}>
          <TH.OpenIcon type={isOpen ? 'down' : 'right'} />
          <TH.HeaderTitle>Security (CSP)</TH.HeaderTitle>
        </TH.HeaderLeftSide>
      </TH.HeaderMain>

      {isOpen && (
        <TH.MainWrapper>
          <TH.TextWrapper>
            <TH.TextTitle>Additional Content Security Policy</TH.TextTitle>
            <TH.Description>
              Add extra CSP directives for third-party embeds (e.g. Cal.com, Typeform).
              Example: <TH.Code>frame-src https://app.cal.com; script-src https://app.cal.com</TH.Code>
            </TH.Description>
            <TH.StyledTextArea
              rows={5}
              placeholder={`frame-src https://app.cal.com;\nscript-src https://app.cal.com;\nconnect-src https://api.typeform.com;`}
              value={cspValue}
              onChange={(e) => {
                setCspValue(e.target.value)
                setSaveError(null)
                setSaveSuccess(false)
              }}
            />
            {saveError && (
              <TH.ErrorText>{saveError}</TH.ErrorText>
            )}
            {saveSuccess && (
              <TH.SuccessText>Saved successfully</TH.SuccessText>
            )}
            <TH.SaveButton loading={isSaving} onClick={onSaveSecurity}>
              Save
            </TH.SaveButton>
          </TH.TextWrapper>
        </TH.MainWrapper>
      )}
    </TH.ScreenHeader>
  )
}

const TH = {
  MainWrapper: styled.div`
    padding: 10px;
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    position: relative;
    margin-left: 15px;
  `,
  TextWrapper: styled.span`
    display: flex;
    flex-direction: column;
    gap: 10px;
  `,
  TextTitle: styled.label`
    margin: 0px;
    font-size: 1.2em;
  `,
  Description: styled.p`
    margin: 0;
    font-size: 0.85em;
    color: #666;
    line-height: 1.5;
  `,
  Code: styled.code`
    background: #f0f0f0;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 0.9em;
    font-family: monospace;
  `,
  StyledTextArea: styled(TextArea)`
    && {
      font-family: monospace;
      font-size: 0.85em;
      resize: vertical;
    }
  `,
  ErrorText: styled.p`
    margin: 0;
    color: #ff4d4f;
    font-size: 0.85em;
    white-space: pre-wrap;
  `,
  SuccessText: styled.p`
    margin: 0;
    color: #52c41a;
    font-size: 0.85em;
  `,
  SaveButton: styled(Button)`
    width: 105px;
  `,
  OpenIcon: styled(Icon)`
    cursor: pointer;
  `,
  HeaderLeftSide: styled.span`
    flex-grow: 1;
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;
  `,
  HeaderTitle: styled.span`
    max-width: 160px;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
    overflow: hidden;
    font-size: 1.2em;
    color: ${Colors.primaryText};
  `,
  HeaderMain: styled.main`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1;
    gap: 15px;
    margin: 10px 5px;
    padding: 15px;
    background-color: #f3f3f3;
    height: 65px;
    border-radius: 6px;
    border: 1px solid ${Colors.primaryColor};

    &&:hover {
      cursor: pointer;
    }
  `,
  ScreenHeader: styled.header`
    position: relative;
    width: 100%;
    min-height: 65px;
    height: auto;
    margin-bottom: 15px;
    padding: 0px;
    border-radius: 6px;
  `,
}

export default Security
