import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import Select from 'antd/es/select'
import Colors from '../../../../../../constants/mainColors'
import FormTypes from '../../../../../../constants/FormTypes'
import PopupView from '../PopupView/PopupView'
import FormView from '../FormView/FormView'
import HubspotFormView from '../HubspotFormView/HubspotFormView'
import EmbedView from '../EmbedView/EmbedView'
import axios from '../../../../../../utils/axiosInstance'
import * as ENV from '../../../../../../config'
import { useNavigate } from 'react-router-dom'
import 'antd/es/select/style'

const { Option } = Select

const POPUP_TYPES = {
  POPUP: 'popup',
  NONE: 'none',
  FORM: 'form',
  EMBED: 'embed',
  START: 'start',
  IFRAME: 'iframe',
}

const POPUP_TYPES_LIMITED = {
  POST: 'popup',
  EMBED: 'embed',
  FORM: 'form',
}

const PopupCompleteView = ({
  popupType,
  setPopupType,
  alignment,
  setAlignment,
  popupDescriptionValue,
  setPopupDescriptionValue,
  popupTitle,
  setPopupTitle,
  internalStep,
  setInternalStep,
  storyDemo,
  authData,
  workspaceId,
  storyDemoId,
  screenId,
}) => {

  const internalStepRef = useRef(internalStep)
  useEffect(() => {
    internalStepRef.current = internalStep
  }, [internalStep])

  const [formHasChanged, setFormHasChanged] = useState(false)
  const [formData, setFormData] = useState(() => {
    const initialForm = internalStep?.view?.popup?.formId?._id
      ? internalStep.view.popup.formId
      : {}
    if (initialForm.type === FormTypes.HUBSPOT && !initialForm.hubspot) {
      initialForm.hubspot = { formId: '' }
    }
    return initialForm
  })
  const [formType, setFormType] = useState(
    (formData && formData.type) || FormTypes.STEP
  )
  const [isCreatingForm, setIsCreatingForm] = useState(false)

  useEffect(() => {
    if (popupType === POPUP_TYPES.FORM && !internalStepRef.current?.view?.popup?.formId) {
      createForm()
    }
  }, [popupType])

  useEffect(() => {
    if (internalStep?.view?.popup?.formId) {
      const newFormData = internalStep.view.popup.formId
      setFormData(newFormData)
      setFormHasChanged(false)
    }
  }, [internalStep])

  function setFormDataByUser(newFormData) {
    setFormHasChanged(true)
    setFormData(newFormData)
  }

  function createForm() {
    if (!internalStepRef.current?._id) return
    setIsCreatingForm(true)

    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/forms`,
      {
        type: FormTypes.STEP,
        storyId: storyDemoId,
        screenId: screenId,
        stepId: internalStepRef.current._id,
      },
      { headers: { Authorization: `Bearer ${authData.token}` } }
    ).then((res) => {
      const newForm = res.data
      const newStep = { ...internalStepRef.current }
      newStep.view.popup.formId = newForm
      setFormData(newForm)
      setInternalStep(newStep)
      setIsCreatingForm(false)
    })
  }

  let navigate = useNavigate()
  let featureFlags = authData ? authData.featureFlags : {}

  return (
    <React.Fragment>
      <ST.ViewContainer>
        <ST.ActionSelectorLineMargin>
          <ST.ActionSelectorText>Popup Type:</ST.ActionSelectorText>
          <ST.Select
            dropdownStyle={{
              background: Colors.App.sidebarColor,
              border: `1px solid ${Colors.primaryColor}`
            }}
            value={popupType}
            style={{ width: 120 }}
            onChange={(newPopupType) => {
              setPopupType(POPUP_TYPES_LIMITED[newPopupType])
            }}>
            {Object.entries(POPUP_TYPES_LIMITED).map(([key, value], index, array) => {
              let isLast = index === array.length - 1

              if (featureFlags && featureFlags.allowForms === false && key === "FORM") {
                return (
                  <Option
                    disabled
                    label={value}
                    style={{
                      background: 'none',
                      borderBottom: isLast ? 'none' : '1px solid #d9d9d9',
                      padding: '5px 8px',
                    }}
                    key={key}
                    value={key}
                  >
                    <ST.LockedOptionRow>
                      <ST.LockedOptionLabel>{value}</ST.LockedOptionLabel>
                      <span style={{ display: 'contents' }}>
                        <ST.LockedOptionUpgradeBtn onClick={() => navigate('/billing')}>Upgrade to unlock</ST.LockedOptionUpgradeBtn>
                      </span>
                    </ST.LockedOptionRow>
                  </Option>
                )
              }

              return <Option style={{
                textTransform: 'capitalize',
                background: 'none',
                color: Colors.primaryColor,
                borderBottom: isLast ? 'none' : '1px solid #d9d9d9',
              }} key={key} value={key}>{value}</Option>
            })}
          </ST.Select>
        </ST.ActionSelectorLineMargin>

        {popupType === POPUP_TYPES.POPUP && (
          <PopupView
            popupDescriptionValue={popupDescriptionValue}
            setPopupDescriptionValue={setPopupDescriptionValue}
            popupTitle={popupTitle}
            setPopupTitle={setPopupTitle}
            setInternalStep={setInternalStep}
            internalStep={internalStep}
            storyDemo={storyDemo}
            popupType={popupType}
            setPopupType={setPopupType}
            alignment={alignment}
            setAlignment={setAlignment}
            authData={authData}
            workspaceId={workspaceId}
            storyDemoId={storyDemoId}
            screenId={screenId}
          />
        )}

        {(popupType === POPUP_TYPES.FORM) && (
          <React.Fragment>
            <ST.TypeSelectorWrapper>
              <ST.TypeLabel>Form Type:</ST.TypeLabel>
              <ST.TypeSelect
                value={formType}
                onChange={(value) => {
                  setFormType(value)
                  setFormHasChanged(true)
                  const updatedFormData = { ...formData, type: value }
                  if (value === FormTypes.HUBSPOT && !updatedFormData.hubspot) {
                    updatedFormData.hubspot = { formId: '' }
                  }
                  setFormDataByUser(updatedFormData)
                }}
              >
                <Option value={FormTypes.STEP} style={{ textTransform: 'capitalize' }}>standard</Option>
                <Option value={FormTypes.HUBSPOT} style={{ textTransform: 'capitalize' }}>hubspot</Option>
              </ST.TypeSelect>
            </ST.TypeSelectorWrapper>

            {formType === FormTypes.HUBSPOT ? (
              <HubspotFormView
                formHasChanged={formHasChanged}
                setFormHasChanged={setFormHasChanged}
                formData={formData}
                setFormData={setFormDataByUser}
                workspaceId={workspaceId}
                authData={authData}
              />
            ) : (
              <FormView
                formHasChanged={formHasChanged}
                setFormHasChanged={setFormHasChanged}
                formData={formData}
                setFormData={setFormDataByUser}
                internalStep={internalStep}
                setInternalStep={setInternalStep}
              />
            )}
          </React.Fragment>
        )}
        {(popupType === POPUP_TYPES.EMBED) && (
          <React.Fragment>
            <EmbedView
              internalStep={internalStep}
              setInternalStep={setInternalStep}
            />
          </React.Fragment>
        )}
      </ST.ViewContainer>
    </React.Fragment>
  )
}

const ST = {
  ViewContainer: styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 400px;
  border: 1px solid black;
  border-radius: 6px;
  padding: 0px 5px;
  justify-content: flex-start;
  background: #ffffff;

  display: flex;
  align-items: flex-start;
  justify-content: start;
  padding: 20px;

  overflow-y: scroll;
  overflow-x: hidden;

  && .slate-editor ol,
  && .slate-editor ul {
    padding: 0px;
  }
`,
  ActionSelectorLineMargin: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 15px;
  `,
  ActionSelectorText: styled.p`
    margin: 0px;
  `,
  Select: styled(Select)`
    flex-grow: 1;
    margin-left: 10px;

    max-width: 250px;

    && .ant-select-content-value {
      background: none;
      color: ${Colors.primaryColor};
      border: none !important;
      box-shadow: none;
      text-transform: capitalize;
    }

    && .ant-select-selection {
      background: none;
      color: ${Colors.primaryColor};
      border: 1px solid #d9d9d9;
      box-shadow: none;
    }

    && .ant-select-selection:hover {
      border: 1px solid ${Colors.primaryColor};
    }

    && .ant-select-arrow {
      color: ${Colors.primaryColor};
    }

    && .ant-select-selection-selected-value {
      width: 90%;
    }
  `,
  LockedOptionRow: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
  `,
  LockedOptionLabel: styled.span`
    color: #bfbfbf;
    font-size: 0.875rem;
  `,
  LockedOptionUpgradeBtn: styled.button`
    background: ${Colors.primaryColor};
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 2px 8px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: opacity 0.15s ease;

    &:hover { opacity: 0.88; }
    &:active { opacity: 0.75; }
  `,
  TypeSelectorWrapper: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 10px;
    background: #fff;
  `,
  TypeLabel: styled.p`
    margin: 0px;
    margin-right: 10px;
    font-weight: 500;
  `,
  TypeSelect: styled(Select)`
    flex-grow: 1;
    && .ant-select-content-value {
      background: none;
      color: ${Colors.primaryColor};
      border: none !important;
      box-shadow: none;
      text-transform: capitalize;
    }

    && .ant-select-selection {
      background: none;
      color: ${Colors.primaryColor};
      border: 1px solid #d9d9d9;
      box-shadow: none;
    }

    && .ant-select-selection:hover {
      border: 1px solid ${Colors.primaryColor};
    }

    && .ant-select-arrow {
      color: ${Colors.primaryColor};
    }

    && .ant-select-selection-selected-value {
      width: 90%;
    }
  `,
}

export default PopupCompleteView
