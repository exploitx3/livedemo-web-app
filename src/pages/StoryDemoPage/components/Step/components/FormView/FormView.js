import Input from 'antd/es/input'
import Button from 'antd/es/button'
import Checkbox from 'antd/es/checkbox'
import Dropdown from 'antd/es/dropdown'
import Select from 'antd/es/select'
import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { DownOutlined, HolderOutlined, PlusOutlined } from '@ant-design/icons'
import axios from '../../../../../../utils/axiosInstance'
import * as ENV from '../../../../../../config'
import Colors from '../../../../../../constants/mainColors'
import Icon from '../../../../../../components/Icon/Icon'
import FormFieldTypes from '../../../../../../constants/FormFieldTypes'
import PopupAlignments from '../../../../../../constants/PopupAlignments'
import {
  ADD_FIELD_PRESETS,
  LOCKED_FIELD_NAMES,
  buildFieldPayloadFromPreset,
  isLockedFieldName,
} from '../../../../../../constants/FormFieldPresets'
import OverlayConfig from '../OverlayConfig/OverlayConfig'
import DescriptionEditor from '../../../ViewEditor/DescriptionEditor'
import PopupButton from '../PopupButton/PopupButton'
import PreviewImageSection from '../PopupOptionsView/PreviewImageSection'
import 'antd/es/select/style'

const { Option } = Select

const FIELD_AUTOSAVE_MS = 800

function sortFields(fields) {
  return [...(fields || [])].sort((a, b) => (a.index || 0) - (b.index || 0))
}

function reorderArray(list, startIndex, endIndex) {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

const FormView = ({
  formHasChanged,
  setFormHasChanged,
  formData,
  setFormData,
  internalStep,
  setInternalStep,
  popupDescriptionValue,
  setPopupDescriptionValue,
  storyDemo,
  storyDemoId,
  screenId,
  workspaceId,
  authData,
  alignment,
  setAlignment,
}) => {
  let popupTitle = (internalStep && internalStep.view && internalStep.view.popup
    && internalStep.view.popup.title) || 'Title'
  let buttons = (internalStep && internalStep.view && internalStep.view.popup
    && internalStep.view.popup.buttons) || []
  let useCaptcha = !!(formData && formData.useCaptcha)
  let showTopLabels = formData && formData.showTopLabels !== false
  let showBackground = formData && formData.showBackground !== false
  let fields = sortFields(formData && formData.fields)
  let descriptionValue = popupDescriptionValue || []
  descriptionValue = descriptionValue.map((value) => {
    if (value && (!value.children || value.children.length === 0)) {
      return {
        type: 'paragraph',
        children: [{ text: '' }],
      }
    }
    return value
  })
  let [isAdding, setIsAdding] = useState(false)
  let [deletingFieldId, setDeletingFieldId] = useState(null)
  let [savingFieldId, setSavingFieldId] = useState(null)
  let fieldSaveTimersRef = useRef({})
  let pendingFieldPatchesRef = useRef({})
  let lastSavedFieldsRef = useRef({})

  useEffect(() => {
    return () => {
      Object.values(fieldSaveTimersRef.current).forEach((timer) => clearTimeout(timer))
    }
  }, [])

  useEffect(() => {
    ;(formData && formData.fields ? formData.fields : []).forEach((field) => {
      if (!field || !field._id) return
      let fieldId = String(field._id)
      // Seed / refresh baseline only when no pending local edits for this field
      if (pendingFieldPatchesRef.current[fieldId] || fieldSaveTimersRef.current[fieldId]) {
        return
      }
      lastSavedFieldsRef.current[fieldId] = {
        label: field.label || '',
        name: field.name || '',
        required: !!field.required,
        typeData: normalizeTypeData(field.typeData),
        index: field.index,
      }
    })
  }, [formData && formData.fields])

  function normalizeTypeData(typeData) {
    let data = typeData || {}
    return {
      checked: !!data.checked,
      options: (data.options || []).map((option) => ({
        key: (option && option.key) || '',
        value: (option && option.value) || '',
      })),
    }
  }

  /** Strip mongoose subdoc noise so PATCH /fields typeData validates + persists */
  function sanitizeTypeDataForPatch(typeData) {
    let data = typeData || {}
    let out = {}
    if (Object.prototype.hasOwnProperty.call(data, 'checked')) {
      out.checked = !!data.checked
    }
    if (Array.isArray(data.options)) {
      out.options = data.options.map((option) => ({
        key: option && option.key != null ? String(option.key) : '',
        value: option && option.value != null ? String(option.value) : '',
      }))
    }
    return out
  }

  function fieldPatchHasChanges(fieldId, payload) {
    let saved = lastSavedFieldsRef.current[String(fieldId)]
    if (!saved) return true
    if (!payload || !Object.keys(payload).length) return false

    return Object.keys(payload).some((key) => {
      if (key === 'typeData') {
        return JSON.stringify(normalizeTypeData(payload.typeData))
          !== JSON.stringify(normalizeTypeData(saved.typeData))
      }
      return payload[key] !== saved[key]
    })
  }

  function rememberSavedField(fieldId, formDoc) {
    let field = (formDoc.fields || []).find((f) => String(f._id) === String(fieldId))
    if (!field) return
    lastSavedFieldsRef.current[String(fieldId)] = {
      label: field.label || '',
      name: field.name || '',
      required: !!field.required,
      typeData: normalizeTypeData(field.typeData),
      index: field.index,
    }
  }

  function updateFieldRequired(field, checked) {
    if (
      field.name === LOCKED_FIELD_NAMES.NAME
      || field.name === LOCKED_FIELD_NAMES.EMAIL
    ) {
      return
    }
    updateLocalField(field._id, { required: checked })
    flushFieldPatch(field._id, { required: checked })
  }

  function updateViewField(fieldName, value) {
    if (!internalStep || !setInternalStep) return
    let newStep = JSON.parse(JSON.stringify(internalStep))
    if (newStep.view.popup[fieldName] !== value) {
      newStep.view.popup[fieldName] = value
      setInternalStep(newStep)
    }
  }

  function addButton(buttonObj) {
    if (!internalStep || !setInternalStep) return
    let newStep = JSON.parse(JSON.stringify(internalStep))
    newStep.view.popup.buttons = [...(newStep.view.popup.buttons || []), buttonObj]
    setInternalStep(newStep)
  }

  function updateUseCaptcha(checked) {
    if (!formHasChanged) {
      setFormHasChanged(true)
    }
    setFormData({
      ...formData,
      useCaptcha: checked,
    })
  }

  function updateShowTopLabels(checked) {
    if (!formHasChanged) {
      setFormHasChanged(true)
    }
    setFormData({
      ...formData,
      showTopLabels: checked,
    })
  }

  function updateShowBackground(checked) {
    if (!formHasChanged) {
      setFormHasChanged(true)
    }
    setFormData({
      ...formData,
      showBackground: checked,
    })
  }

  function getFormId() {
    return formData && (formData._id || formData.id)
  }

  function createFormField(payload) {
    let formId = getFormId()
    if (!formId || !workspaceId || !authData || !authData.token) {
      return Promise.reject(new Error('Missing form context'))
    }

    return axios.post(
      `${ENV.STORIES_API}/workspaces/${workspaceId}/forms/${formId}/fields`,
      payload,
      {
        headers: { Authorization: `Bearer ${authData.token}` },
      }
    ).then((res) => res.data)
  }

  function patchFormField(fieldId, payload) {
    let formId = getFormId()
    if (!formId || !workspaceId || !authData || !authData.token) {
      return Promise.reject(new Error('Missing form context'))
    }

    return axios.patch(
      `${ENV.STORIES_API}/workspaces/${workspaceId}/forms/${formId}/fields/${fieldId}`,
      payload,
      {
        headers: { Authorization: `Bearer ${authData.token}` },
      }
    ).then((res) => res.data)
  }

  function deleteFormField(fieldId) {
    let formId = getFormId()
    if (!formId || !workspaceId || !authData || !authData.token) {
      return Promise.reject(new Error('Missing form context'))
    }

    return axios.delete(
      `${ENV.STORIES_API}/workspaces/${workspaceId}/forms/${formId}/fields/${fieldId}`,
      {
        headers: { Authorization: `Bearer ${authData.token}` },
      }
    ).then((res) => res.data)
  }

  function applyFormDoc(updatedForm) {
    if (!updatedForm) return
    setFormData(updatedForm)
    // Keep step-embedded form in sync so autosave / stepObj sync can't resurrect fields
    if (setInternalStep && internalStep && internalStep.view && internalStep.view.popup) {
      let prevForm = internalStep.view.popup.formId
      let nextForm = (prevForm && typeof prevForm === 'object')
        ? { ...prevForm, ...updatedForm }
        : updatedForm
      setInternalStep({
        ...internalStep,
        view: {
          ...internalStep.view,
          popup: {
            ...internalStep.view.popup,
            formId: nextForm,
          },
        },
      })
    }
  }

  function handleDeleteField(field) {
    if (!field || !field._id || deletingFieldId) return

    let fieldId = field._id
    setDeletingFieldId(fieldId)
    if (fieldSaveTimersRef.current[fieldId]) {
      clearTimeout(fieldSaveTimersRef.current[fieldId])
      delete fieldSaveTimersRef.current[fieldId]
    }
    delete pendingFieldPatchesRef.current[fieldId]
    delete lastSavedFieldsRef.current[fieldId]

    // Optimistic remove so the list updates immediately
    let remaining = (formData.fields || [])
      .filter((f) => String(f._id) !== String(fieldId))
      .map((f, index) => ({ ...f, index }))
    applyFormDoc({ ...formData, fields: remaining })

    deleteFormField(fieldId)
      .then((updatedForm) => {
        applyFormDoc(updatedForm)
      })
      .catch((err) => {
        console.error('Failed to delete form field', err)
        // Reload from server response failure — restore field by refetching isn't wired;
        // put the field back locally so the editor isn't stuck wrong.
        applyFormDoc(formData)
      })
      .finally(() => {
        setDeletingFieldId(null)
      })
  }

  function handleAddField(preset) {
    if (isAdding) return
    if (preset.locked && fields.some((f) => f.name === preset.name)) return

    setIsAdding(true)
    let payload = buildFieldPayloadFromPreset(preset, fields.length)

    createFormField(payload)
      .then((updatedForm) => {
        applyFormDoc(updatedForm)
      })
      .catch((err) => {
        console.error('Failed to create form field', err)
      })
      .finally(() => {
        setIsAdding(false)
      })
  }

  function updateLocalField(fieldId, patch) {
    let newFields = (formData.fields || []).map((field) => {
      if (String(field._id) !== String(fieldId)) return field
      return { ...field, ...patch }
    })
    setFormData({ ...formData, fields: newFields })
  }

  function prepareFieldPatch(payload) {
    if (!payload || payload.typeData === undefined) return payload
    return {
      ...payload,
      typeData: sanitizeTypeDataForPatch(payload.typeData),
    }
  }

  function saveFieldPatch(fieldId, payload) {
    let cleanPayload = prepareFieldPatch(payload)
    if (!fieldPatchHasChanges(fieldId, cleanPayload)) {
      return Promise.resolve(null)
    }

    setSavingFieldId(fieldId)
    return patchFormField(fieldId, cleanPayload)
      .then((updatedForm) => {
        rememberSavedField(fieldId, updatedForm)
        // Keep local options if server round-trip lags; merge this field's typeData from save
        setFormData((prev) => {
          if (!prev || !updatedForm) return updatedForm || prev
          let serverFields = updatedForm.fields || []
          let prevById = new Map((prev.fields || []).map((f) => [String(f._id), f]))
          return {
            ...updatedForm,
            fields: serverFields.map((serverField) => {
              if (String(serverField._id) !== String(fieldId)) {
                let local = prevById.get(String(serverField._id))
                return local ? { ...serverField, ...local, index: serverField.index } : serverField
              }
              return serverField
            }),
          }
        })
      })
      .catch((err) => {
        console.error('Failed to update form field', err)
      })
      .finally(() => {
        setSavingFieldId(null)
      })
  }

  function scheduleFieldPatch(fieldId, payload) {
    let id = String(fieldId)
    let prevPending = pendingFieldPatchesRef.current[id] || {}
    let nextPending = { ...prevPending, ...payload }
    // Nested typeData must replace, not shallow-merge leftover keys from older drafts
    if (payload && payload.typeData !== undefined) {
      nextPending.typeData = sanitizeTypeDataForPatch(payload.typeData)
    }
    pendingFieldPatchesRef.current[id] = nextPending

    if (fieldSaveTimersRef.current[id]) {
      clearTimeout(fieldSaveTimersRef.current[id])
    }

    fieldSaveTimersRef.current[id] = setTimeout(() => {
      let merged = pendingFieldPatchesRef.current[id] || payload
      delete fieldSaveTimersRef.current[id]
      delete pendingFieldPatchesRef.current[id]
      saveFieldPatch(id, merged)
    }, FIELD_AUTOSAVE_MS)
  }

  function flushFieldPatch(fieldId, payload) {
    let id = String(fieldId)
    if (fieldSaveTimersRef.current[id]) {
      clearTimeout(fieldSaveTimersRef.current[id])
      delete fieldSaveTimersRef.current[id]
    }

    let merged = {
      ...(pendingFieldPatchesRef.current[id] || {}),
      ...(payload || {}),
    }
    if (payload && payload.typeData !== undefined) {
      merged.typeData = sanitizeTypeDataForPatch(payload.typeData)
    } else if (merged.typeData !== undefined) {
      merged.typeData = sanitizeTypeDataForPatch(merged.typeData)
    }
    delete pendingFieldPatchesRef.current[id]

    if (!fieldPatchHasChanges(id, merged)) {
      return Promise.resolve(null)
    }

    return saveFieldPatch(id, merged)
  }

  function onDragEnd(result) {
    if (!result.destination) return
    if (result.source.index === result.destination.index) return

    let reordered = reorderArray(fields, result.source.index, result.destination.index)
      .map((field, index) => ({ ...field, index }))

    setFormData({ ...formData, fields: reordered })

    Promise.all(
      reordered.map((field) => patchFormField(field._id, { index: field.index }))
    )
      .then((results) => {
        let last = results[results.length - 1]
        if (last) setFormData(last)
      })
      .catch((err) => {
        console.error('Failed to reorder form fields', err)
      })
  }

  function setSelectorOptions(field, options, persistMode) {
    let typeData = sanitizeTypeDataForPatch({
      ...(field.typeData || {}),
      options,
    })
    updateLocalField(field._id, { typeData })
    if (persistMode === 'now') {
      flushFieldPatch(field._id, { typeData })
    } else if (persistMode === 'debounce') {
      scheduleFieldPatch(field._id, { typeData })
    }
  }

  function addSelectorOption(field) {
    let options = normalizeTypeData(field.typeData).options.slice()
    options.push({ key: '', value: '' })
    setSelectorOptions(field, options, 'now')
  }

  function updateSelectorOption(field, optionIndex, key, value, persistMode) {
    let options = normalizeTypeData(field.typeData).options.slice()
    let prev = options[optionIndex] || { key: '', value: '' }
    let nextKey = key || ''
    let nextValue = value || ''

    if ((prev.key || '') === nextKey && (prev.value || '') === nextValue) {
      // Focus/blur with no edit — still flush any pending debounced option edits
      if (persistMode === 'now') {
        flushFieldPatch(field._id, {})
      }
      return
    }

    options[optionIndex] = { key: nextKey, value: nextValue }
    setSelectorOptions(field, options, persistMode)
  }

  function removeSelectorOption(field, optionIndex) {
    let options = [...((field.typeData && field.typeData.options) || [])]
    options.splice(optionIndex, 1)
    setSelectorOptions(field, options, 'now')
  }

  const addFieldMenuItems = ADD_FIELD_PRESETS.map((preset) => ({
    key: preset.id,
    label: preset.menuLabel,
    disabled: !!(preset.locked && fields.some((f) => f.name === preset.name)) || isAdding,
    onClick: () => handleAddField(preset),
  }))

  return <ST.ViewSelectorWrapper className={'form-body'}>
    {internalStep && setInternalStep && (
      <React.Fragment>
        <ST.ActionSelectorLine>
          <ST.Text>Title:</ST.Text>
          <ST.SelectorInput
            onChange={(event) => {
              let newStep = JSON.parse(JSON.stringify(internalStep))
              newStep.view.popup.title = event.target.value
              setInternalStep(newStep)
            }}
            value={popupTitle}
          />
        </ST.ActionSelectorLine>
        {setPopupDescriptionValue && (
          <ST.DescriptionBlock>
            <ST.Text>Description:</ST.Text>
            <ST.DescriptionWrapper>
              <DescriptionEditor
                editorValue={descriptionValue}
                setEditorValue={setPopupDescriptionValue}
              />
            </ST.DescriptionWrapper>
          </ST.DescriptionBlock>
        )}
        {setAlignment && (
          <ST.ActionSelectorLine>
            <ST.Text>Alignment:</ST.Text>
            <ST.AlignmentSelect
              dropdownStyle={{
                background: Colors.App.sidebarColor,
                border: `1px solid ${Colors.primaryColor}`,
              }}
              value={alignment}
              style={{ width: 120 }}
              onChange={(newAlignment) => {
                setAlignment(PopupAlignments[newAlignment])
              }}
            >
              {Object.entries(PopupAlignments).map(([key, value], index, array) => {
                let isLast = index === array.length - 1
                return (
                  <Option
                    style={{
                      background: 'none',
                      color: Colors.primaryColor,
                      borderBottom: isLast ? 'none' : '1px solid #d9d9d9',
                      textTransform: 'capitalize',
                    }}
                    key={key}
                    value={key}
                  >
                    {value}
                  </Option>
                )
              })}
            </ST.AlignmentSelect>
          </ST.ActionSelectorLine>
        )}
        <PreviewImageSection
          internalStep={internalStep}
          setInternalStep={setInternalStep}
          storyDemo={storyDemo}
          workspaceId={workspaceId}
          storyDemoId={storyDemoId}
          screenId={screenId}
          authData={authData}
        />
      </React.Fragment>
    )}

    <ST.ActionSelectorLine>
      <ST.Text>Fields:</ST.Text>
      <Dropdown menu={{ items: addFieldMenuItems }} trigger={['click']}>
        <ST.AddFieldButton>
          Add field <DownOutlined />
        </ST.AddFieldButton>
      </Dropdown>
    </ST.ActionSelectorLine>

    <ST.FieldsWrapper>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="form-fields">
          {(provided) => (
            <ST.DropList ref={provided.innerRef} {...provided.droppableProps}>
              {fields.map((field, index) => {
                let locked = isLockedFieldName(field.name)
                let alwaysRequired = field.name === LOCKED_FIELD_NAMES.NAME
                  || field.name === LOCKED_FIELD_NAMES.EMAIL
                let isRequired = alwaysRequired ? true : !!field.required
                let isSelector = field.type === FormFieldTypes.SELECTOR

                return (
                  <Draggable key={field._id} draggableId={String(field._id)} index={index}>
                    {(dragProvided, snapshot) => (
                      <ST.FieldWrapper
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        isDragging={snapshot.isDragging}
                      >
                        <ST.FieldHeader>
                          <ST.DragHandle {...dragProvided.dragHandleProps}>
                            <HolderOutlined />
                          </ST.DragHandle>
                          <ST.FieldMeta>
                            <ST.FieldLabelRow>
                              <ST.FieldLabel>Label</ST.FieldLabel>
                              <ST.TextField
                                disabled={locked}
                                value={field.label || ''}
                                onChange={(event) => {
                                  let label = event.target.value
                                  updateLocalField(field._id, { label })
                                  if (!locked) {
                                    scheduleFieldPatch(field._id, { label })
                                  }
                                }}
                                onBlur={(event) => {
                                  if (locked) return
                                  flushFieldPatch(field._id, { label: event.target.value })
                                }}
                              />
                            </ST.FieldLabelRow>
                            <ST.FieldLabelRow>
                              <ST.FieldLabel>Name</ST.FieldLabel>
                              <ST.TextField
                                disabled={locked}
                                value={field.name || ''}
                                onChange={(event) => {
                                  let name = event.target.value
                                  updateLocalField(field._id, { name })
                                  if (!locked) {
                                    scheduleFieldPatch(field._id, { name })
                                  }
                                }}
                                onBlur={(event) => {
                                  if (locked) return
                                  flushFieldPatch(field._id, { name: event.target.value })
                                }}
                              />
                            </ST.FieldLabelRow>
                            <ST.FieldRequiredRow
                              disabled={alwaysRequired}
                              onClick={(event) => {
                                event.stopPropagation()
                                if (alwaysRequired) return
                                updateFieldRequired(field, !field.required)
                              }}
                            >
                              <ST.Checkbox checked={isRequired} disabled={alwaysRequired} />
                              <ST.CheckboxText>
                                Required{alwaysRequired ? ' (always)' : ''}
                              </ST.CheckboxText>
                            </ST.FieldRequiredRow>
                            <ST.FieldTypeHint>
                              {field.type || FormFieldTypes.SHORT_TEXT}
                              {savingFieldId === field._id ? ' · saving…' : ''}
                              {deletingFieldId === field._id ? ' · deleting…' : ''}
                            </ST.FieldTypeHint>
                          </ST.FieldMeta>
                          <ST.DeleteIcon
                            type={'delete'}
                            theme={'filled'}
                            title={'Delete field'}
                            disabled={deletingFieldId === field._id}
                            onClick={() => handleDeleteField(field)}
                          />
                        </ST.FieldHeader>

                        {isSelector && (
                          <ST.OptionsBlock>
                            <ST.OptionsHeader>
                              <ST.FieldLabel>Options</ST.FieldLabel>
                              <ST.SmallButton
                                type="link"
                                icon={<PlusOutlined />}
                                onClick={() => addSelectorOption(field)}
                              >
                                Add option
                              </ST.SmallButton>
                            </ST.OptionsHeader>
                            {((field.typeData && field.typeData.options) || []).map((option, optionIndex) => (
                              <ST.OptionRow key={optionIndex}>
                                <ST.TextField
                                  placeholder="Key (shown)"
                                  value={option.key || ''}
                                  onChange={(event) => {
                                    updateSelectorOption(
                                      field,
                                      optionIndex,
                                      event.target.value,
                                      option.value || '',
                                      'debounce'
                                    )
                                  }}
                                  onBlur={(event) => {
                                    updateSelectorOption(
                                      field,
                                      optionIndex,
                                      event.target.value,
                                      option.value || '',
                                      'now'
                                    )
                                  }}
                                />
                                <ST.TextField
                                  placeholder="Value (saved)"
                                  value={option.value || ''}
                                  onChange={(event) => {
                                    updateSelectorOption(
                                      field,
                                      optionIndex,
                                      option.key || '',
                                      event.target.value,
                                      'debounce'
                                    )
                                  }}
                                  onBlur={(event) => {
                                    updateSelectorOption(
                                      field,
                                      optionIndex,
                                      option.key || '',
                                      event.target.value,
                                      'now'
                                    )
                                  }}
                                />
                                <ST.DeleteIcon
                                  type={'delete'}
                                  theme={'filled'}
                                  title={'Delete option'}
                                  onClick={() => removeSelectorOption(field, optionIndex)}
                                />
                              </ST.OptionRow>
                            ))}
                          </ST.OptionsBlock>
                        )}
                      </ST.FieldWrapper>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </ST.DropList>
          )}
        </Droppable>
      </DragDropContext>
    </ST.FieldsWrapper>

    <ST.ActionSelectorLine>
      <ST.CheckboxLine
        onClick={() => {
          updateShowTopLabels(!showTopLabels)
        }}
      >
        <ST.Checkbox checked={showTopLabels} />
        <ST.CheckboxText>Show top labels</ST.CheckboxText>
      </ST.CheckboxLine>
    </ST.ActionSelectorLine>

    <ST.ActionSelectorLine>
      <ST.CheckboxLine
        onClick={() => {
          updateShowBackground(!showBackground)
        }}
      >
        <ST.Checkbox checked={showBackground} />
        <ST.CheckboxText>Show background</ST.CheckboxText>
      </ST.CheckboxLine>
    </ST.ActionSelectorLine>

    <ST.ActionSelectorLine>
      <ST.CheckboxLine
        onClick={() => {
          updateUseCaptcha(!useCaptcha)
        }}
      >
        <ST.Checkbox checked={useCaptcha} />
        <ST.CheckboxText>Use captcha</ST.CheckboxText>
      </ST.CheckboxLine>
    </ST.ActionSelectorLine>

    {internalStep && setInternalStep && (
      <React.Fragment>
        <ST.SectionLabel style={{ marginTop: 10 }}>Buttons:</ST.SectionLabel>
        <ST.ButtonsContainer>
          {buttons.map((popupButton) => (
            <PopupButton
              key={popupButton.index}
              popupButton={popupButton}
              deleteButton={(index) => {
                let newStep = JSON.parse(JSON.stringify(internalStep))
                newStep.view.popup.buttons = (newStep.view.popup.buttons || [])
                  .filter((b) => b.index !== index)
                setInternalStep(newStep)
              }}
              setPopupButton={(nextButton) => {
                let newStep = JSON.parse(JSON.stringify(internalStep))
                newStep.view.popup.buttons = (newStep.view.popup.buttons || [])
                  .map((b) => (b.index === nextButton.index ? nextButton : b))
                setInternalStep(newStep)
              }}
              storyDemo={storyDemo}
            />
          ))}
        </ST.ButtonsContainer>
        <ST.AddButtonLine>
          <ST.AddButtonIcon
            className={'AddLine_AddStepIcon'}
            title={'Add button'}
            onClick={() => {
              addButton({
                text: 'Button',
                index: buttons.length,
                gotoType: 'next',
                gotoWebsite: '',
                gotoScreen: '',
              })
            }}
          >
            <ST.AddButtonIconText>+</ST.AddButtonIconText>
          </ST.AddButtonIcon>
        </ST.AddButtonLine>
      </React.Fragment>
    )}

    {internalStep && setInternalStep && (
      <OverlayConfig
        internalStep={internalStep}
        updateViewField={updateViewField}
      />
    )}
  </ST.ViewSelectorWrapper>
}


const ST = {
  ActionSelectorLine: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 15px;
  `,
  Text: styled.p`
    margin: 0px;
  `,
  FieldLabel: styled.p`
    margin: 0px 0px 4px 0px;
    font-size: 0.8em;
  `,
  TextField: styled(Input)`
    && {
      width: 100%;
    }
  `,
  FieldsWrapper: styled.div`
    width: 100%;
    margin-bottom: 10px;
  `,
  DropList: styled.div`
    width: 100%;
  `,
  FieldWrapper: styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'isDragging',
  })`
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
    flex-direction: column;
    width: 100%;
    margin-bottom: 12px;
    padding: 10px;
    background: ${({ isDragging }) => (isDragging ? '#f5f8ff' : '#fafafa')};
    border: 1px solid #e8e8e8;
  `,
  FieldHeader: styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
    gap: 8px;
  `,
  DragHandle: styled.div`
    cursor: grab;
    padding: 6px 4px 0 0;
    color: #8c8c8c;
  `,
  FieldMeta: styled.div`
    flex: 1;
    min-width: 0;
  `,
  FieldLabelRow: styled.div`
    width: 100%;
    margin-bottom: 8px;
  `,
  FieldRequiredRow: styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'disabled',
  })`
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 6px;
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
    user-select: none;
    opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  `,
  FieldTypeHint: styled.p`
    margin: 0;
    font-size: 0.75em;
    color: #8c8c8c;
    text-transform: capitalize;
  `,
  OptionsBlock: styled.div`
    margin-top: 8px;
    padding-left: 24px;
    width: 100%;
  `,
  OptionsHeader: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  `,
  OptionRow: styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
  `,
  SmallButton: styled(Button)`
    && {
      padding: 0;
      height: auto;
    }
  `,
  DeleteIcon: styled(Icon).withConfig({
    shouldForwardProp: (prop) => prop !== 'disabled',
  })`
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-left: 4px;
    cursor: pointer;
    opacity: ${({ disabled }) => (disabled ? 0.45 : 1)};
    pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

    && svg {
      fill: #ff0000c4;
      width: 100%;
      height: 100%;
    }
  `,
  AddFieldButton: styled(Button)`
    && {
      margin-left: 10px;
    }
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
  SelectorInput: styled(Input)`
    && {
      margin-left: 10px;
      width: 100%;
    }
  `,
  AlignmentSelect: styled(Select)`
    && {
      margin-left: 10px;
    }
  `,
  DescriptionBlock: styled.div`
    width: 100%;
    margin-bottom: 15px;
  `,
  DescriptionWrapper: styled.div`
    width: 100%;
    margin-top: 8px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    min-height: 80px;
  `,
  SectionLabel: styled.p`
    margin: 0px 5px 0px 0px;
    width: 100%;
  `,
  ButtonsContainer: styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    gap: 20px;
    width: 100%;
  `,
  AddButtonLine: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 30px;
  `,
  AddButtonIcon: styled.div`
    background: #1070ff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: 0.2s ease-in-out;
  `,
  AddButtonIconText: styled.p`
    margin: 0px;
    font-size: 30px;
    line-height: 40px;
    color: white;
  `,
  Checkbox: styled(Checkbox)`
  `,
  CheckboxText: styled.p`
    margin: 0px 0px 0px 15px;
  `,
  CheckboxLine: styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    margin-top: 15px;
  `,
}

export default FormView
