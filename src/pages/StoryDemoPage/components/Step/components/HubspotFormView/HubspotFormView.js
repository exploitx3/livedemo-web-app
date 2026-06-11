import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Select from 'antd/es/select'
import axios from '../../../../../../utils/axiosInstance'
import * as ENV from '../../../../../../config'
import Colors from '../../../../../../constants/mainColors'
import Spinner from '../../../../../../components/Spinner/Spinner'
import FormTypes from '../../../../../../constants/FormTypes'
import OverlayConfig from '../OverlayConfig/OverlayConfig'

const { Option } = Select

const HubspotFormView = ({
  formHasChanged,
  setFormHasChanged,
  formData,
  setFormData,
  workspaceId,
  authData,
  internalStep,
  setInternalStep
}) => {
  const [hubspotForms, setHubspotForms] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedFormId, setSelectedFormId] = useState(
    formData?.hubspot?.formId || null
  )

  function updateViewField(fieldName, value) {
    if (!internalStep || !setInternalStep) return
    let newStep = JSON.parse(JSON.stringify(internalStep))
    if (newStep.view.popup[fieldName] !== value) {
      newStep.view.popup[fieldName] = value
      setInternalStep(newStep)
    }
  }

  useEffect(() => {
    if (workspaceId && authData?.token) {
      fetchHubspotForms()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, authData?.token])

  useEffect(() => {
    // Update formData when selectedFormId changes
    if (selectedFormId && hubspotForms.length > 0) {
    //   if (!formHasChanged) {
    //   }

      setFormData({
        ...formData,
        type: FormTypes.HUBSPOT,
        hubspot: {
          formId: selectedFormId,
          portalId: hubspotForms.find(f => f.guid === selectedFormId)?.portalId?.toString() || '',
          embedVersion: hubspotForms.find(f => f.guid === selectedFormId)?.embedVersion?.toString() || ''
        }
      })

      setFormHasChanged(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFormId, hubspotForms])

  function fetchHubspotForms() {
    setLoading(true)
    axios.get(`${ENV.STORIES_API}/workspaces/${workspaceId}/hubspot/forms`, {
      headers: {
        Authorization: `Bearer ${authData.token}`
      }
    })
      .then((res) => {
        setHubspotForms(res.data || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching HubSpot forms:', error)
        setLoading(false)
      })
  }

  function handleFormChange(value) {
    setSelectedFormId(value)
  }

  return (
    <ST.ViewSelectorWrapper className={'hubspot-form-body'}>
      <ST.ActionSelectorLine>
        <ST.Text>Select form:</ST.Text>
        {loading ? (
          <Spinner />
        ) : (
          <ST.Select
            value={selectedFormId}
            onChange={handleFormChange}
            placeholder="Select a HubSpot form"
          >
            {hubspotForms.map((form) => (
              <Option key={form.guid} value={form.guid}>
                {form.name}
              </Option>
            ))}
          </ST.Select>
        )}
      </ST.ActionSelectorLine>
      {selectedFormId && (
        <ST.InfoText>
          Form selected: {hubspotForms.find(f => f.guid === selectedFormId)?.name}
        </ST.InfoText>
      )}
      {internalStep && setInternalStep && (
        <OverlayConfig
          internalStep={internalStep}
          updateViewField={updateViewField}
        />
      )}
    </ST.ViewSelectorWrapper>
  )
}

const ST = {
  ActionSelectorLine: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 15px;
    min-width: 0;
  `,
  Text: styled.p`
    margin: 0px;
    margin-right: 10px;
    min-width: 100px;
    flex-shrink: 0;
  `,
  ViewSelectorWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    background: #fff;
    min-height: 200px;


  `,
  Select: styled(Select)`
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;

    && .ant-select-content-value {
      background: none;
      color: ${Colors.primaryColor};
      border: none !important;
      box-shadow: none;
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
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

  `,
  InfoText: styled.p`
    margin: 10px 0 0 0;
    font-size: 0.9em;
    color: #666;
    align-self: flex-start;
  `
}

export default HubspotFormView

