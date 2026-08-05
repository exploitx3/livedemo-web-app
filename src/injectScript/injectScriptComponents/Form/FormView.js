import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Colors from '../../../constants/mainColors.js'
import {validateField} from '../../helpers.js'
import { Input, Select, Checkbox } from 'antd'
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons'
import FormFieldTypes from '../../../constants/FormFieldTypes.js'
import PopupButton from '../PopupComponent/components/PopupButton/PopupButton.js'

// Browser autofill tokens (Chrome/Safari/etc. autocomplete)
const FIELD_AUTOCOMPLETE = {
  name: 'name',
  email: 'email',
  company: 'organization',
  website: 'url',
}

function sortFields(fields) {
  return [...(fields || [])].sort((a, b) => (a.index || 0) - (b.index || 0))
}

function getAutocomplete(fieldName) {
  return FIELD_AUTOCOMPLETE[fieldName] || 'off'
}

function buildInitialFieldsState(fields) {
  return sortFields(fields).reduce((accum, fieldData) => {
    let initialValue = ''
    if (fieldData.type === FormFieldTypes.CHECKBOX) {
      initialValue = !!(fieldData.typeData && fieldData.typeData.checked)
    }

    accum[fieldData.name] = {
      ...fieldData,
      value: initialValue,
      isValid: true,
    }

    return accum
  }, {})
}

function isEmptyHtml(html) {
  if (!html) return true
  let trimmed = String(html).replace(/\s/g, '')
  return !trimmed || trimmed === '<p></p>' || trimmed === '<p><br></p>' || trimmed === '<p><br/></p>'
}

/** Map popup alignment ('start'|'end'|'center') → flex align-items */
function alignItemsFor(alignment) {
  if (alignment === 'end') return 'flex-end'
  if (alignment === 'start') return 'flex-start'
  return 'center'
}

/**
 * Title/description text-align.
 * Side layouts (left/right, with or without preview) keep copy left in the form column.
 */
function textAlignFor(alignment, isSideLayout) {
  if (isSideLayout) return 'left'
  return alignment || 'center'
}

function FormView({
  formData,
  onNextHandler,
  onButtonClick,
  updateFieldsObj,
  themeTextColor,
  themeBackgroundColor,
  showTopLabels = true,
  showBackground = true,
  invalidFieldNames = [],
  title = '',
  description = '',
  buttons = [],
  changeToScreen,
  liveDemo,
  submitError = null,
  showPreviewImage = false,
  previewImageUrl = '',
  alignment = 'center',
  rawAlignment = 'center',
  titleFontSize = '1.45rem',
  textFontSize = '1rem',
  buttonFontSize = '1rem',
  style = {},
}) {
  let [fieldsObjData, setFieldsObjData] = useState(() => buildInitialFieldsState(formData.fields))
  let invalidNameSet = new Set(invalidFieldNames || [])
  let showDescription = !isEmptyHtml(description)
  let hasPreviewImage = !!(showPreviewImage && previewImageUrl)
  let isSideLayout = rawAlignment === 'left' || rawAlignment === 'right'
  // Side form column uses the constrained preview widths even without an image
  let useSideFormWidth = hasPreviewImage || isSideLayout
  let orderedButtons = [...(buttons || [])].sort((a, b) => (a.index || 0) - (b.index || 0))
  let orderedFields = sortFields(formData.fields)

  useEffect(() => {
    updateFieldsObj(fieldsObjData)
    // seed parent once so untouched checkbox defaults still submit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function commitFieldChange(fieldName, value, isValid) {
    let newFieldsObjData = { ...fieldsObjData }
    newFieldsObjData[fieldName] = {
      ...newFieldsObjData[fieldName],
      value,
      isValid,
    }
    setFieldsObjData(newFieldsObjData)
    updateFieldsObj(newFieldsObjData)
  }

  function renderFields() {
    return orderedFields.map((field) => {
      let obj = fieldsObjData[field.name] || field
      let isValid = (obj.isValid === undefined ? true : !!obj.isValid)
        && !invalidNameSet.has(field.name)
      let fieldType = field.type || FormFieldTypes.SHORT_TEXT
      let showValid = fieldType === FormFieldTypes.SHORT_TEXT
        && obj.value
        && String(obj.value).length >= 3
        && (field.name === 'name' || field.name === 'email')

      if (fieldType === FormFieldTypes.SELECTOR) {
        let options = (field.typeData && field.typeData.options) || []

        return <FS.FieldLine className={'FieldLine'} key={field._id || field.name} isValid={isValid}>
          {showTopLabels && (
            <FS.FieldText className={'FieldText__Label'}>{field.label}</FS.FieldText>
          )}
          <FS.FieldInputWrapper>
            <FS.FieldSelect
              className={'FieldLine__Input'}
              status={isValid ? undefined : 'error'}
              placeholder={field.label}
              value={obj.value || undefined}
              onChange={(value) => {
                commitFieldChange(field.name, value, true)
              }}
              placement="bottom"
              builtinPlacements={{
                bottom: {
                  points: ['tl', 'bl'],
                  offset: [0, 4],
                },
              }}
              getPopupContainer={(trigger) => trigger.parentNode}
              options={options.map((option) => ({
                label: option.key,
                value: option.value,
              }))}
            />
          </FS.FieldInputWrapper>
        </FS.FieldLine>
      }

      if (fieldType === FormFieldTypes.CHECKBOX) {
        return <FS.FieldLine
          className={'FieldLine FieldLine--checkbox'}
          key={field._id || field.name}
          isValid={isValid}
          hasError={!isValid}
        >
          <FS.CheckboxRow>
            <FS.FieldCheckbox
              checked={!!obj.value}
              onChange={(event) => {
                commitFieldChange(field.name, event.target.checked, true)
              }}
            >
              <span className={'FieldText__CheckboxLabel'}>{field.label}</span>
            </FS.FieldCheckbox>
          </FS.CheckboxRow>
        </FS.FieldLine>
      }

      let autoComplete = getAutocomplete(field.name)
      let inputType = field.name === 'email'
        ? 'email'
        : field.name === 'website'
          ? 'url'
          : 'text'

      return <FS.FieldLine className={'FieldLine'} key={field._id || field.name} isValid={isValid}>
        {showTopLabels && (
          <FS.FieldText className={'FieldText__Label'}>{field.label}</FS.FieldText>
        )}
        <FS.FieldInputWrapper>
          <FS.FieldLineValidIcon showValid={showValid || !isValid} isValid={isValid}>
            {isValid ? <CheckCircleFilled /> : <CloseCircleFilled />}
          </FS.FieldLineValidIcon>
          <FS.FieldInput
            className={'FieldLine__Input'}
            status={isValid ? undefined : 'error'}
            name={field.name}
            type={inputType}
            autoComplete={autoComplete}
            onPressEnter={() => {
              onNextHandler()
            }}
            onChange={(event) => {
              let inputValue = event.target.value
              commitFieldChange(
                field.name,
                inputValue,
                validateField(field.name, inputValue)
              )
            }}
            placeholder={field.label}
            value={obj.value || ''}
          />
        </FS.FieldInputWrapper>
      </FS.FieldLine>
    })
  }

  const formPanel = (
    <FS.FormPanel
      as="form"
      autoComplete="on"
      onSubmit={(event) => {
        event.preventDefault()
        onNextHandler()
      }}
      alignment={alignment}
      hasPreviewImage={hasPreviewImage}
      useSideFormWidth={useSideFormWidth}
      showBackground={showBackground}
      themeBackgroundColor={themeBackgroundColor}
      style={style}
    >
      {title ? (
        <FS.Title
          className={'Form__Title'}
          themeTextColor={themeTextColor}
          alignment={alignment}
          titleFontSize={titleFontSize}
          hasPreviewImage={hasPreviewImage}
          isSideLayout={isSideLayout}
        >
          {title}
        </FS.Title>
      ) : null}
      {showDescription ? (
        <FS.Description
          className={'Form__Description'}
          themeTextColor={themeTextColor}
          alignment={alignment}
          textFontSize={textFontSize}
          hasPreviewImage={hasPreviewImage}
          isSideLayout={isSideLayout}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : null}

      <FS.FieldsBlock>
        {renderFields()}
      </FS.FieldsBlock>

      {submitError && (
        <FS.SubmitError role="alert">
          {submitError}
        </FS.SubmitError>
      )}

      {orderedButtons.length > 0 && (
        <FS.ButtonsWrapper alignment={alignment} hasPreviewImage={hasPreviewImage}>
          {orderedButtons.map((popupButton) => (
            <PopupButton
              key={popupButton.index}
              popupButton={popupButton}
              storyDemo={liveDemo}
              changeToScreen={changeToScreen}
              onNext={onNextHandler}
              onClick={() => {
                if (onButtonClick) {
                  return onButtonClick(popupButton)
                }
                return onNextHandler()
              }}
              fontSize="0.875rem"
              alignment={alignment}
            />
          ))}
        </FS.ButtonsWrapper>
      )}
    </FS.FormPanel>
  )

  const imageOnRight = rawAlignment === 'left'

  // No preview: left/right still use the side column (empty other half)
  if (!hasPreviewImage) {
    if (isSideLayout) {
      return (
        <FS.SideOnlyWrapper imageOnRight={imageOnRight}>
          <FS.SideTextBlock imageOnRight={imageOnRight}>{formPanel}</FS.SideTextBlock>
        </FS.SideOnlyWrapper>
      )
    }
    return <FS.TextOnly alignment={alignment}>{formPanel}</FS.TextOnly>
  }

  if (rawAlignment === 'center') {
    return (
      <FS.CenterWrapper>
        <FS.CenterTextBlock>{formPanel}</FS.CenterTextBlock>
        <FS.CenterImageWrapper>
          <FS.PreviewImage src={previewImageUrl} alt="" aria-hidden="true" />
        </FS.CenterImageWrapper>
      </FS.CenterWrapper>
    )
  }

  return (
    <FS.SideWrapper imageOnRight={imageOnRight}>
      <FS.SideTextBlock imageOnRight={imageOnRight}>{formPanel}</FS.SideTextBlock>
      <FS.SideImageCol>
        <FS.SideImageFrame imageOnRight={imageOnRight}>
          <FS.PreviewImage src={previewImageUrl} alt="" aria-hidden="true" />
        </FS.SideImageFrame>
      </FS.SideImageCol>
    </FS.SideWrapper>
  )
}

const thinScrollbar = `
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.28) transparent;

  &&::-webkit-scrollbar {
    width: 4px;
    background: transparent;
  }

  &&::-webkit-scrollbar-track {
    background: transparent;
  }

  &&::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.28);
  }

  &&::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.45);
  }
`

const hideScrollbar = `
  scrollbar-width: none;
  -ms-overflow-style: none;

  &&::-webkit-scrollbar {
    display: none;
  }
`

const FS = {
  TextOnly: styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'alignment',
  })`
    display: flex;
    flex-direction: column;
    /* flex-start + child margin-block:auto: center when short, scroll from top when tall */
    justify-content: flex-start;
    align-items: ${({ alignment }) => alignItemsFor(alignment)};
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 16px;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    ${thinScrollbar}
  `,
  /* Left/right without preview image — form column only, other half empty */
  SideOnlyWrapper: styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'imageOnRight',
  })`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: ${({ imageOnRight }) => (imageOnRight ? 'flex-start' : 'flex-end')};
    align-items: stretch;
    overflow: hidden;

    & > * {
      width: 100%;
      max-width: 100%;
    }

    @media (min-width: 640px) {
      & > * {
        width: 50%;
      }
    }
  `,
  /* Matches example: grid grid-cols-2 w-full h-full */
  SideWrapper: styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'imageOnRight',
  })`
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) minmax(140px, 42%);
    overflow: hidden;
    z-index: 10;

    @media (min-width: 640px) {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr;
      ${({ imageOnRight }) => !imageOnRight ? `
        & > :first-child { order: 2; }
        & > :last-child { order: 1; }
      ` : ''}
    }
  `,
  SideTextBlock: styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'imageOnRight',
  })`
    display: flex;
    flex-direction: column;
    /* flex-start + FormPanel margin-block:auto — avoids top clip when form is tall */
    justify-content: flex-start;
    /* Right column: pin form to the outer (right) edge; left column: pin to left */
    align-items: ${({ imageOnRight }) => (imageOnRight === false ? 'flex-end' : 'flex-start')};
    width: 100%;
    height: 100%;
    min-height: 0;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    ${thinScrollbar}
    /* Mirror horizontal padding when form sits on the right */
    ${({ imageOnRight }) => imageOnRight === false ? `
      padding: 16px 24px 16px 16px;
    ` : `
      padding: 16px 16px 16px 24px;
    `}

    @media (min-width: 640px) {
      ${({ imageOnRight }) => imageOnRight === false ? `
        padding: 24px 32px 24px 16px;
      ` : `
        padding: 24px 16px 24px 32px;
      `}
    }

    @media (min-width: 1024px) {
      ${({ imageOnRight }) => imageOnRight === false ? `
        padding: 32px 64px 32px 32px;
      ` : `
        padding: 32px 32px 32px 64px;
      `}
    }
  `,
  SideImageCol: styled.div`
    width: 100%;
    height: 100%;
    min-height: 0;
    padding-top: 12%;
    box-sizing: border-box;

    @media (min-width: 640px) {
      padding-top: 20%;
    }
  `,
  SideImageFrame: styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'imageOnRight',
  })`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-top: 1px solid rgba(229, 231, 235, 0.85);
    background: rgba(0, 0, 0, 0.15);
    ${({ imageOnRight }) => imageOnRight === false ? `
      border-right: 1px solid rgba(229, 231, 235, 0.85);
      border-top-right-radius: 12px;
    ` : `
      border-left: 1px solid rgba(229, 231, 235, 0.85);
      border-top-left-radius: 12px;
    `}
  `,
  /* Form (fit-content) overlays preview image behind it */
  CenterWrapper: styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    overflow-x: hidden;
    overflow-y: auto;
    ${thinScrollbar}
  `,
  CenterTextBlock: styled.div`
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: fit-content;
    max-height: 100%;
    flex: 0 0 auto;
    margin-block: auto;
    padding: 3% 24px;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    ${thinScrollbar}
  `,
  CenterImageWrapper: styled.div`
    position: absolute;
    z-index: 1;
    /* Pushed down — form (fit-content) sits above and overlaps the top edge */
    top: 52%;
    bottom: -6%;
    left: 4%;
    right: 4%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28), 0 2px 8px rgba(0, 0, 0, 0.18);
    pointer-events: none;
  `,
  PreviewImage: styled.img`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top left;
    display: block;
    user-select: none;
    pointer-events: none;
  `,
  FormPanel: styled.div.withConfig({
    shouldForwardProp: (prop) => ![
      'alignment',
      'hasPreviewImage',
      'useSideFormWidth',
      'showBackground',
      'themeBackgroundColor',
    ].includes(prop),
  })`
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: ${({ alignment, useSideFormWidth }) => (
      useSideFormWidth ? 'flex-start' : alignItemsFor(alignment)
    )};
    /* Vertically center in short viewports; collapses when content overflows so top stays reachable */
    margin-block: auto;
    flex-shrink: 0;
    /* Example: max-w-64 sm:max-w-72 md:max-w-76 lg:max-w-96 */
    max-width: ${({ useSideFormWidth }) => (useSideFormWidth ? '16rem' : '400px')};
    /* showBackground: card only around the form, not the full shell */
    background: ${({ showBackground, themeBackgroundColor }) => (
      showBackground ? (themeBackgroundColor || 'rgba(0, 0, 0, 0.55)') : 'transparent'
    )};
    border-radius: ${({ showBackground }) => (showBackground ? '12px' : '0')};
    padding: ${({ showBackground }) => (showBackground ? 'clamp(14px, 2vw, 22px)' : '0')};
    border: 1px solid ${({ showBackground, themeBackgroundColor }) => (
      showBackground ? (themeBackgroundColor || 'transparent') : 'transparent'
    )};
    box-shadow: ${({ showBackground }) => (
      showBackground ? '0 8px 28px rgba(0, 0, 0, 0.28)' : 'none'
    )};

    @media (min-width: 640px) {
      max-width: ${({ useSideFormWidth }) => (useSideFormWidth ? '18rem' : '400px')};
    }

    @media (min-width: 768px) {
      max-width: ${({ useSideFormWidth }) => (useSideFormWidth ? '19rem' : '400px')};
    }

    @media (min-width: 1024px) {
      max-width: ${({ useSideFormWidth }) => (useSideFormWidth ? '24rem' : '400px')};
    }
  `,
  Title: styled.h2.withConfig({
    shouldForwardProp: (prop) => !['themeTextColor', 'alignment', 'titleFontSize', 'hasPreviewImage', 'isSideLayout'].includes(prop),
  })`
    color: ${({ themeTextColor }) => themeTextColor || Colors.primaryText};
    /* Example: text-2xl md:text-[1.7rem] lg:text-3xl */
    font-size: ${({ hasPreviewImage, isSideLayout }) => (
      (hasPreviewImage || isSideLayout) ? '1.5rem' : 'clamp(1.05rem, 2.4vw, 1.45rem)'
    )};
    font-weight: ${({ hasPreviewImage, isSideLayout }) => (
      (hasPreviewImage || isSideLayout) ? 600 : 750
    )};
    text-align: ${({ alignment, isSideLayout }) => textAlignFor(alignment, isSideLayout)};
    margin: 0 0 0.35rem;
    line-height: 1.25;
    padding: 0;
    width: 100%;
    font-family: ${Colors.fontFamilyApple};
    overflow-wrap: break-word;
    flex-shrink: 0;

    @media (min-width: 640px) {
      font-weight: ${({ hasPreviewImage, isSideLayout }) => (
        (hasPreviewImage || isSideLayout) ? 700 : 750
      )};
      margin-bottom: 0.5rem;
    }

    @media (min-width: 768px) {
      font-size: ${({ hasPreviewImage, isSideLayout }) => (
        (hasPreviewImage || isSideLayout) ? '1.7rem' : 'clamp(1.05rem, 2.4vw, 1.45rem)'
      )};
    }

    @media (min-width: 1024px) {
      font-size: ${({ hasPreviewImage, isSideLayout }) => (
        (hasPreviewImage || isSideLayout) ? '1.875rem' : 'clamp(1.05rem, 2.4vw, 1.45rem)'
      )};
    }
  `,
  Description: styled.div.withConfig({
    shouldForwardProp: (prop) => !['themeTextColor', 'alignment', 'textFontSize', 'hasPreviewImage', 'isSideLayout'].includes(prop),
  })`
    color: ${({ themeTextColor }) => themeTextColor || Colors.primaryText};
    font-size: ${({ hasPreviewImage, isSideLayout }) => (
      (hasPreviewImage || isSideLayout) ? '1rem' : 'clamp(0.85rem, 1.6vw, 1rem)'
    )};
    text-align: ${({ alignment, isSideLayout }) => textAlignFor(alignment, isSideLayout)};
    margin: 0 0 0.5rem;
    line-height: 1.5;
    padding: 0;
    width: 100%;
    font-family: ${Colors.fontFamilyApple};
    font-weight: 400;
    /* Example: max-h-20 lg:max-h-80 + hide-scrollbar */
    max-height: ${({ hasPreviewImage, isSideLayout }) => (
      (hasPreviewImage || isSideLayout) ? '5rem' : 'none'
    )};
    overflow-y: ${({ hasPreviewImage, isSideLayout }) => (
      (hasPreviewImage || isSideLayout) ? 'auto' : 'visible'
    )};
    ${({ hasPreviewImage, isSideLayout }) => (
      (hasPreviewImage || isSideLayout) ? hideScrollbar : ''
    )}

    @media (min-width: 1024px) {
      max-height: ${({ hasPreviewImage, isSideLayout }) => (
        (hasPreviewImage || isSideLayout) ? '20rem' : 'none'
      )};
    }

    && p {
      margin: 0 0 0.35em;
    }

    && p:last-child {
      margin-bottom: 0;
    }
  `,
  FieldsBlock: styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    margin-top: 0.5rem;

    @media (min-width: 640px) {
      gap: 0.75rem;
      margin-top: 1rem;
    }
  `,
  FieldLine: styled.div.withConfig({
    shouldForwardProp: (prop) => !['isValid', 'hasError'].includes(prop),
  })`
    width: 100%;
    margin-bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    ${({ hasError }) => hasError ? `
      padding: 6px 8px;
      border-radius: 8px;
      background: rgba(253, 38, 38, 0.12);
      outline: 1px solid rgba(253, 120, 120, 0.55);
    ` : ''}
  `,
  FieldLineValidIcon: styled.div.withConfig({
    shouldForwardProp: (prop) => !['showValid', 'isValid'].includes(prop),
  })`
    visibility: ${props => props.showValid ? 'visible' : 'hidden'};
    && svg {
      fill: ${props => props.isValid ? 'green' : '#fd2626b3'};
      width: 14px;
      height: 14px;
    }
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    z-index: 3;
  `,
  FieldText: styled.p`
    text-transform: capitalize;
    margin: 0 0 4px;
    color: #f9f9f9;
    font-size: 0.75rem;
    line-height: 1.2;

    @media (min-width: 640px) {
      font-size: 0.875rem;
    }
  `,
  FieldInputWrapper: styled.div`
    width: 100%;
    position: relative;
  `,
  /* Shared control size — keep Input + Select identical */
  FieldInput: styled(Input)`
    && {
      width: 100%;
      height: 2.5rem;
      min-height: 2.5rem;
      padding: 0 0.75rem;
      font-size: 0.75rem;
      line-height: 1.25;
      border-radius: 0.375rem;
      border: 1px solid #d1d5db;
      box-sizing: border-box;
    }

    @media (min-width: 640px) {
      && {
        font-size: 0.875rem;
      }
    }

    @media (min-width: 1024px) {
      && {
        border-radius: 0.5rem;
      }
    }
  `,
  FieldSelect: styled(Select)`
    && {
      width: 100%;
      height: 2.5rem;
      font-size: 0.75rem;
    }

    && .ant-select-selector {
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
      height: 2.5rem !important;
      min-height: 2.5rem !important;
      max-height: 2.5rem !important;
      padding: 0 0.75rem !important;
      font-size: inherit;
      line-height: 1.25 !important;
      border-radius: 0.375rem !important;
      border: 1px solid #d1d5db !important;
      box-sizing: border-box !important;
      box-shadow: none !important;
    }

    &&.ant-select-focused .ant-select-selector,
    &&.ant-select-open .ant-select-selector {
      border-color: #1677ff !important;
      box-shadow: none !important;
      outline: none !important;
    }

    && .ant-select-arrow {
      inset-inline-end: 11px !important;
      height: 2.5rem !important;
      margin-top: 0 !important;
      top: 0 !important;
      display: flex !important;
      align-items: center !important;
    }

    && .ant-select-content {
      display: flex !important;
      align-items: center !important;
      height: 100% !important;
    }

    && .ant-select-selection-wrap {
      display: flex !important;
      align-items: center !important;
      height: 100% !important;
      align-self: center !important;
    }

    && .ant-select-selection-search {
      inset-inline-start: 0 !important;
      inset-inline-end: 0 !important;
      display: flex !important;
      align-items: center !important;
    }

    && .ant-select-selection-search-input {
      height: 100% !important;
    }

    && .ant-select-selection-item,
    && .ant-select-selection-placeholder {
      line-height: 1.25 !important;
      display: flex !important;
      align-items: center !important;
      font-size: 0.75rem;
      padding: 0 !important;
      margin: 0 !important;
    }

    @media (min-width: 640px) {
      && {
        font-size: 0.875rem;
      }

      && .ant-select-selection-item,
      && .ant-select-selection-placeholder {
        font-size: 0.875rem;
      }
    }

    @media (min-width: 1024px) {
      && .ant-select-selector {
        border-radius: 0.5rem !important;
      }
    }
  `,
  SubmitError: styled.div`
    margin: 0.5rem 0 0;
    padding: 8px 12px;
    border-radius: 0.5rem;
    background: rgba(253, 38, 38, 0.18);
    border: 1px solid rgba(253, 120, 120, 0.65);
    color: #ffe8e8;
    font-size: 0.8rem;
    text-align: center;
    line-height: 1.35;
    font-family: ${Colors.fontFamilyApple};
    width: 100%;
    box-sizing: border-box;
  `,
  ButtonsWrapper: styled.div.withConfig({
    shouldForwardProp: (prop) => !['alignment', 'hasPreviewImage'].includes(prop),
  })`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    margin-top: 0.5rem;
    gap: 0.5rem;

    @media (min-width: 640px) {
      margin-top: 0.75rem;
    }

    /* Match FieldInput / FieldSelect sizing across breakpoints */
    && .popup-button {
      width: 100%;
      max-width: 100%;
      min-height: 2rem;
      height: auto;
      margin-bottom: 0;
      box-sizing: border-box;
      justify-content: center;
      border-radius: 0.375rem;
    }

    && .popup-button p {
      width: 100%;
      box-sizing: border-box;
      margin: 0;
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      line-height: 1.4;
      text-align: center;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    @media (min-width: 640px) {
      && .popup-button p {
        font-size: 0.875rem;
      }
    }

    @media (min-width: 1024px) {
      && .popup-button {
        border-radius: 0.5rem;
      }

      && .popup-button p {
        padding: 0.5rem 0.75rem;
      }
    }
  `,
  CheckboxRow: styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    min-height: clamp(2rem, 4.2vw, 2.4rem);
  `,
  FieldCheckbox: styled(Checkbox)`
    && {
      display: inline-flex;
      align-items: center;
      margin: 0;
      color: #f9f9f9;
      white-space: normal;
    }

    && .ant-checkbox {
      top: 0;
      align-self: center;
    }

    && .ant-checkbox-inner {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      border-color: rgba(255, 255, 255, 0.85);
      background: #fff;
    }

    && .ant-checkbox-checked .ant-checkbox-inner {
      background: #fff;
      border-color: #fff;
    }

    && .ant-checkbox-checked .ant-checkbox-inner::after {
      border-color: #1677ff;
    }

    && .ant-checkbox + span,
    && .FieldText__CheckboxLabel {
      color: #f9f9f9;
      font-size: clamp(0.85rem, 1.5vw, 1rem);
      line-height: 1.3;
      padding-inline-start: 10px;
      margin: 0;
      text-transform: none;
      user-select: none;
    }
  `,
}

export default FormView
