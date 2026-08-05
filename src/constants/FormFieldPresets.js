import FormFieldTypes from './FormFieldTypes'

// Predefined field names — locked, cannot rename, at most one each
export const LOCKED_FIELD_NAMES = {
  NAME: 'name',
  EMAIL: 'email',
  COMPANY: 'company',
  WEBSITE: 'website',
}

export const ADD_FIELD_PRESETS = [
  {
    id: 'name',
    menuLabel: 'Name',
    label: 'Name',
    name: LOCKED_FIELD_NAMES.NAME,
    type: FormFieldTypes.SHORT_TEXT,
    locked: true,
    typeData: {},
  },
  {
    id: 'email',
    menuLabel: 'Email',
    label: 'Email',
    name: LOCKED_FIELD_NAMES.EMAIL,
    type: FormFieldTypes.SHORT_TEXT,
    locked: true,
    typeData: {},
  },
  {
    id: 'company',
    menuLabel: 'Company',
    label: 'Company',
    name: LOCKED_FIELD_NAMES.COMPANY,
    type: FormFieldTypes.SHORT_TEXT,
    locked: true,
    typeData: {},
  },
  {
    id: 'website',
    menuLabel: 'Website',
    label: 'Website',
    name: LOCKED_FIELD_NAMES.WEBSITE,
    type: FormFieldTypes.SHORT_TEXT,
    locked: true,
    typeData: {},
  },
  {
    id: 'selector',
    menuLabel: 'Selector',
    label: 'Selector',
    namePrefix: 'selector',
    type: FormFieldTypes.SELECTOR,
    locked: false,
    typeData: { options: [] },
  },
  {
    id: 'checkbox',
    menuLabel: 'Checkbox',
    label: 'Checkbox',
    namePrefix: 'checkbox',
    type: FormFieldTypes.CHECKBOX,
    locked: false,
    typeData: { checked: false },
  },
  {
    id: 'custom',
    menuLabel: 'Custom string',
    label: 'Custom',
    namePrefix: 'custom',
    type: FormFieldTypes.SHORT_TEXT,
    locked: false,
    typeData: {},
  },
]

export function isLockedFieldName(name) {
  return Object.values(LOCKED_FIELD_NAMES).includes(name)
}

export function buildFieldPayloadFromPreset(preset, nextIndex) {
  let name = preset.locked
    ? preset.name
    : `${preset.namePrefix}_${Date.now()}`

  return {
    label: preset.label,
    name,
    type: preset.type,
    required: true,
    index: nextIndex,
    typeData: preset.typeData || {},
  }
}
