import React, { useEffect, useState, useRef, useCallback } from 'react'
import styled from 'styled-components'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import Colors from '../../../../constants/mainColors'
import PopupAlignments from '../../../../constants/PopupAlignments'
import axios from '../../../../utils/axiosInstance'
//import { Button, Icon, Input, Modal, Select } from 'antd'

import Button from 'antd/es/button'
import Icon from '../../../../components/Icon/Icon'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import Select from 'antd/es/select'
import { MdAdsClick, MdArrowRightAlt } from 'react-icons/md'
import * as ENV from '../../../../config'
import PointerIcon from '../../../../static/images/pointerIcon.svg'
import PostIcon from '../../../../static/images/postIcon.svg'
import Spinner from '../../../../components/Spinner/Spinner'
import TextView from './components/TextView/TextView'
import PopupView from './components/PopupView/PopupView'
import OptionsView from './components/OptionsView/OptionsView'
import HotspotOptionsView from './components/HotspotOptionsView/HotspotOptionsView'
import PointerOptionsView from './components/PointerOptionsView/PointerOptionsView'
import PopupOptionsView from './components/PopupOptionsView/PopupOptionsView'
import FormView from '../../components/FormView/FormView'
import FormTypes from '../../../../constants/FormTypes'
import HubspotFormView from './components/HubspotFormView/HubspotFormView'

import 'antd/es/select/style'
import { deserialize } from '../ViewEditor/EditorInternal'
import { htmlSerialize } from '../../../../utils/helperFunctions'
import { updateCurrentSelectedWorkspace } from '../../../../actions/workspacesActions'
import { getWorkspaceEncryptionKey } from '../../../../actions/secureStorageActions'
import { refreshToken } from '../../../../actions/authActions'
import { updateStep, deleteStep } from '../../../../actions/storyDemoActions'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

const { Option } = Select

const { confirm } = Modal;


const VIEW_TYPE_NAMES = {
  HOTSPOT: 'hotspot',
  POINTER: 'pointer',
  POPUP: 'popup'
}

const ACTION_TYPES = {
  NEXT_BUTTON: 'NextButton',
  ELEMENT_CLICK: 'ElementClick'
}


const VIEW_TYPES = {
  HOTSPOT: 'hotspot',
  POINTER: 'pointer',
  POPUP: 'popup'
}

const POPUP_TYPES = {
  POPUP: 'popup',
  NONE: 'none',
  FORM: 'form',
  START: 'start',
  IFRAME: 'iframe',
}

const OPEN_VIEWS = {
  TEXT_VIEW: 'TEXT_VIEW',
  OPTIONS_VIEW: 'OPTIONS_VIEW',
}

const Step = ({
  storyDemoId,
  storyDemo,
  screenId,
  workspaceId,
  stepObj,
  authData,
  changeStep,
  getSelector,
  cancelSelector,
  calculatedStepIndex,
  iframeRef,
  disablePointerPickButton,
  actions,

  screenIsLoading,
  setScreenIsLoading
}) => {

  // console.log('step rerendered ' + stepObj._id + ' ' + stepObj.index)
  // console.log(stepObj)

  let [internalStepState, setInternalStepState] = useState(stepObj)
  let internalStepRef = useRef(stepObj)
  function setInternalStep(step) {
    debugger
    console.log(step.autoPlayConfig)
    internalStepRef.current = step
    setInternalStepState(step)
  }

  const autoSaveTimerRef = useRef(null)
  const isInitialMountRef = useRef(true)
  const onSaveStepRef = useRef(null)
  const [userChangeKey, setUserChangeKey] = useState(0)

  function setInternalStepByUser(step) {
    setUserChangeKey(k => k + 1)
    setInternalStep(step)
  }

  function setFormDataByUser(newFormData) {
    setUserChangeKey(k => k + 1)
    setFormData(newFormData)
  }

  let { index, view, action } = stepObj

  let [isViewOpen, setIsViewOpen] = useState(false)
  let [openView, setOpenView] = useState(OPEN_VIEWS.TEXT_VIEW)

  let [viewType, setViewType] = useState(stepObj.view.viewType)
  let [hotspotViewPlacement, setHotspotViewPlacement] = useState(internalStepRef.current.view.hotspot.placement || 'auto')
  let [pointerViewPlacement, setPointerViewPlacement] = useState(internalStepRef.current.view.pointer.placement || 'auto')

  let [popupType, setPopupType] = useState((stepObj.view.popup && stepObj.view.popup.type) || 'popup')
  let [alignment, setAlignment] = useState((stepObj.view.popup && stepObj.view.popup.alignment) || PopupAlignments.center)

  let [isActionOpen, setIsActionOpen] = useState(false)
  let [actionType, setActionType] = useState(stepObj.action.actionType)

  let [isUpdating, setIsUpdating] = useState(false)
  let [isSaved, setIsSaved] = useState(false)
  let savedTimerRef = useRef(null)

  const parsed = new DOMParser().parseFromString(view.content, 'text/html')
  const initialValue = deserialize(parsed.body)
  let [editorValue, setEditorValue] = useState(initialValue)

  // Popup config
  let initialPopupDescriptionValue = ''
  if (view.popup.description) {
    const descriptionValueParsed = new DOMParser().parseFromString(view.popup.description, 'text/html')
    initialPopupDescriptionValue = deserialize(descriptionValueParsed.body)
  }
  let [popupDescriptionValue, setPopupDescriptionValue] = useState(initialPopupDescriptionValue ? initialPopupDescriptionValue : null)

  let [popupTitle, setPopupTitle] = useState(view.popup.title ? view.popup.title : 'Title')


  let [formHasChanged, setFormHasChanged] = useState(false)
  let [formData, setFormData] = useState(() => {
    const initialForm = stepObj && stepObj.view && stepObj.view.popup && stepObj.view.popup.formId && stepObj.view.popup.formId._id
      ? stepObj.view.popup.formId
      : {}

    // Ensure hubspot object exists if form type is hubspot
    if (initialForm.type === FormTypes.HUBSPOT && !initialForm.hubspot) {
      initialForm.hubspot = { formId: '' }
    }

    return initialForm
  })
  let [formType, setFormType] = useState(
    (formData && formData.type) || FormTypes.STEP
  )


  useEffect(() => {
    if (viewType === VIEW_TYPES.POPUP && popupType === POPUP_TYPES.FORM && !internalStepRef.current.view.popup.formId) {
      createForm(workspaceId, storyDemoId, screenId, internalStepRef.current._id, authData.token)
    } else {
      console.log('No need to create form, using existing form')
    }

  }, [viewType, popupType])


  useEffect(() => {
    setInternalStep(stepObj)

    // Sync formData when stepObj changes to keep it in sync with backend
    if (stepObj?.view?.popup?.formId) {
      const newFormData = stepObj.view.popup.formId
      setFormData(newFormData)
      // Reset formHasChanged when syncing from backend to avoid false positives
      setFormHasChanged(false)
    }
  }, [stepObj])

  function createForm(workspaceId, storyDemoId, screenId, stepId, authToken) {
    setIsUpdating(true)

    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/forms`,
      {
        type: FormTypes.STEP,
        storyId: storyDemoId,
        screenId: screenId,
        stepId: stepId,
      }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((res) => {
      let newForm = res.data

      let newStep = { ...internalStepRef.current }
      newStep.view.popup.formId = newForm


      setFormData(newForm)
      setInternalStep(newStep)
      setIsUpdating(false)
    })

  }



  function showDeleteConfirm() {
    confirm({
      title: 'Are you sure you want to delete this step?',
      content: '',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setIsUpdating(true)
        actions.deleteStep(internalStepRef.current._id, storyDemoId, screenId, workspaceId, authData.token)
          .then(() => {

            window.postMessage({
              type: 'delete_step',
              stepData: internalStepRef.current
              // prevStepData: prevStepData
            }, '*')

            setIsUpdating(false)

          })
      },
      onCancel() {
      },
    });
  }

  function saveStep(stepUpdateObj, storyDemoId, screenId, workspaceId, stepId, authToken) {
    setIsUpdating(true)
    debugger

    return actions.updateStep(stepUpdateObj, storyDemoId, screenId, workspaceId, stepId, authToken)
      .then((newStepData) => {

        window.postMessage({
          type: 'update_step',
          stepData: newStepData
        }, '*')

        debugger

        setInternalStep(newStepData)
        setIsUpdating(false)

        if (savedTimerRef.current) {
          clearTimeout(savedTimerRef.current)
        }
        setIsSaved(true)
        savedTimerRef.current = setTimeout(() => {
          setIsSaved(false)
        }, 1000)
      })
  }

  function updateActionSelector() {
    return getSelector()
      .then(({ selector }) => {

        // console.log(selector)
        let updateObj = {
          action: {
            selector: selector,
            actionType: viewType
          }
        }

        saveStep(updateObj, storyDemoId, screenId, workspaceId, internalStepRef.current._id, authData.token)
      })
      .catch(err => {

        console.log(err)
      })
  }

  function updateSelector() {
    return getSelector()
      .then(({ selector, selectorLocation }) => {

        // setPointerSelector(selector)
        // setPointerSelectorLocation(selectorLocation)

        let newStep = { ...internalStepRef.current }
        newStep.view.pointer.selector = selector
        newStep.view.pointer.selectorLocation = selectorLocation

        // updateStep(newStep)

        // console.log(selector)
        let updateObj = {
          view: {
            viewType: viewType,
            pointer: {
              selector: selector,
              selectorLocation: selectorLocation,
              placement: internalStepRef.current.view.pointer.placement
            }
          }
        }

        saveStep(updateObj, storyDemoId, screenId, workspaceId, internalStepRef.current._id, authData.token)
      })
      .catch(err => {

        console.log(err)
      })
  }

  function updateForm(formUpdateObj, storyDemoId, screenId, workspaceId, stepId, formId, authToken) {
    setIsUpdating(true)

    return axios.patch(`${ENV.STORIES_API}/workspaces/${workspaceId}/forms/${formId}`, {
      ...formUpdateObj
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((newFormRes) => {
      setFormHasChanged(false)
      return newFormRes.data
    }).catch((err) => {
      console.error('Error updating form:', err)
      setIsUpdating(false)
      throw err
    })
  }


  const onSaveStep = useCallback(() => {
    let internalStep = internalStepState

    let contentHtml = htmlSerialize(editorValue)

    let popupDescription = popupDescriptionValue ? htmlSerialize(popupDescriptionValue) : '<p></p>'

    let buttons = internalStep.view.popup && internalStep.view.popup.buttons &&
      internalStep.view.popup.buttons.map((button) => {
        button.gotoScreen = button.gotoScreen && button.gotoScreen._id ? button.gotoScreen._id : button.gotoScreen

        if (button.gotoScreen === '') {
          delete button.gotoScreen
        }

        return button
      })

    let updateObj = {
      view: {
        content: contentHtml,
        hotspot: {
          frameX: (internalStep.view.hotspot && internalStep.view.hotspot.frameX),
          frameY: (internalStep.view.hotspot && internalStep.view.hotspot.frameY),
          placement: hotspotViewPlacement || (internalStep.view.hotspot && internalStep.view.hotspot.placement),
        },
        pointer: {
          selector: (internalStep.view.pointer && internalStep.view.pointer.selector),
          selectorLocation: (internalStep.view.pointer && internalStep.view.pointer.selectorLocation),
          placement: pointerViewPlacement || (internalStep.view.pointer && internalStep.view.pointer.placement),
        },
        popup: {
          type: popupType || (internalStep.view.popup && internalStep.view.popup.type),
          showOverlay: (internalStep.view.popup && internalStep.view.popup.showOverlay),
          title: (internalStep.view.popup && internalStep.view.popup.title),
          description: (internalStep.view.popup && popupDescription),
          buttons: (buttons),
          alignment: alignment
        },
        viewType: (internalStep.view && internalStep.view.viewType),
        showStepNumbers: (internalStep.view.showStepNumbers && internalStep.view.showStepNumbers),
        nextButtonText: (internalStep.view.nextButtonText && internalStep.view.nextButtonText),
        showHeader: (internalStep.view.showHeader && internalStep.view.showHeader),
        showFooter: (internalStep.view.showFooter && internalStep.view.showFooter),
      },
      autoPlayConfig: (internalStep.autoPlayConfig),
    }

    let updatePromise = Promise.resolve()
    if (internalStep.view.popup.formId && formHasChanged) {
      updatePromise = updatePromise.then(() => {
        let formId = internalStep.view.popup.formId._id ? internalStep.view.popup.formId._id : internalStep.view.popup.formId

        // Build form update object based on formData structure
        let formUpdateObj = {
          title: formData.title || 'Get in touch with us'
        }

        // Always include type if it's set in formData
        if (formData.type) {
          formUpdateObj.type = formData.type
        }

        const EMBED_VERSIONS = {
          "v4": 4
        }
        // Handle HUBSPOT type updates
        if (formData.type === FormTypes.HUBSPOT) {
          // Include hubspot data - initialize if it doesn't exist
          formUpdateObj.hubspot = {
            formId: (formData.hubspot && formData.hubspot.formId) ? formData.hubspot.formId : '',
            portalId: (formData.hubspot && formData.hubspot.portalId) ? formData.hubspot.portalId : '',
            embedVersion: (formData.hubspot && formData.hubspot.embedVersion &&
              EMBED_VERSIONS[formData.hubspot.embedVersion]) ? EMBED_VERSIONS[formData.hubspot.embedVersion]
              : 2
          }
        }

        return updateForm(
          formUpdateObj,
          storyDemoId,
          screenId,
          workspaceId,
          internalStep._id,
          formId,
          authData.token
        )

      })
    }

    updatePromise = updatePromise.then(() => {

      return saveStep(updateObj, storyDemoId, screenId, workspaceId, internalStep._id, authData.token)
    })

    return updatePromise


  }, [internalStepState, editorValue, popupDescriptionValue, hotspotViewPlacement, pointerViewPlacement, popupType, alignment, formHasChanged, formData, storyDemoId, screenId, workspaceId, authData.token])

  useEffect(() => {
    onSaveStepRef.current = onSaveStep
  }, [onSaveStep])

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      return
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      onSaveStepRef.current()
    }, 1000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [userChangeKey, editorValue, popupDescriptionValue, hotspotViewPlacement, pointerViewPlacement, popupType, alignment])


  function getView(viewType, openView) {

    if (openView === OPEN_VIEWS.TEXT_VIEW) {

      if (viewType === VIEW_TYPES.HOTSPOT || viewType === VIEW_TYPES.POINTER) {

        return <TextView
          editorValue={editorValue}
          setEditorValue={setEditorValue}
        />
      } else if (viewType === VIEW_TYPES.POPUP && popupType === POPUP_TYPES.POPUP) {

        return <PopupView
          popupDescriptionValue={popupDescriptionValue}
          setPopupDescriptionValue={setPopupDescriptionValue}
          popupTitle={popupTitle}
          setPopupTitle={setPopupTitle}
          setInternalStep={setInternalStepByUser}
          internalStep={internalStepState}
          storyDemo={storyDemo}
        />
      } else if (viewType === VIEW_TYPES.POPUP && popupType === POPUP_TYPES.FORM) {

        return <React.Fragment>
          <ST.TypeSelectorWrapper>
            <ST.TypeLabel>Type:</ST.TypeLabel>
            <ST.TypeSelect
              value={formType}
              onChange={(value) => {
                setFormType(value)
                // if (!formHasChanged) {
                setFormHasChanged(true)
                // }
                // Update formData type
                const updatedFormData = {
                  ...formData,
                  type: value
                }

                // Initialize hubspot object if switching to hubspot type
                if (value === FormTypes.HUBSPOT && !updatedFormData.hubspot) {
                  updatedFormData.hubspot = { formId: '' }
                }

                setFormDataByUser(updatedFormData)
              }}
            >
              <Option value={FormTypes.STEP}>standard</Option>
              <Option value={FormTypes.HUBSPOT}>hubspot</Option>
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
            />
          )}
        </React.Fragment>

      } else {
        return ''
      }
    } else if (openView === OPEN_VIEWS.OPTIONS_VIEW && viewType === VIEW_TYPES.POPUP) {

      return <PopupOptionsView
        setInternalStep={setInternalStepByUser}
        internalStep={internalStepState}
        popupType={popupType}
        setPopupType={setPopupType}
        alignment={alignment}
        setAlignment={setAlignment}
      />
    } else if (viewType === VIEW_TYPES.POINTER) {

      return <PointerOptionsView
        cancelSelector={cancelSelector}
        updateSelector={updateSelector}
        setInternalStep={setInternalStepByUser}
        internalStep={internalStepState}
        setPointerPlacement={setPointerViewPlacement}
        pointerPlacement={pointerViewPlacement}
        iframeRef={iframeRef}
        disablePointerPickButton={disablePointerPickButton}
      />
    } else if (viewType === VIEW_TYPES.HOTSPOT && openView === OPEN_VIEWS.OPTIONS_VIEW) {

      return <HotspotOptionsView
        viewPlacement={hotspotViewPlacement}
        setViewPlacement={setHotspotViewPlacement}
        setInternalStep={setInternalStepByUser}
        internalStep={internalStepState}
      />

    }
  }

  return (
    <ST.StepContainer isViewOpen={isViewOpen}>

      <ST.ViewContainer

        isViewOpen={isViewOpen}
      >
        <ST.ViewHeader>
          <ST.HeaderMain onClick={() => {

            if (isViewOpen) {

              setIsViewOpen(false)
            } else {

              setIsViewOpen(true)
              changeStep(calculatedStepIndex)
            }

          }}>
            {viewType === VIEW_TYPE_NAMES.POINTER ? <img src={PointerIcon} /> : <img src={PostIcon} />}
            <ST.OpenArrow type={isViewOpen ? 'down' : 'right'} />
            <ST.ViewTitleDiv>
              <ST.ViewTitle>{VIEW_TYPE_NAMES[viewType.toUpperCase()]}</ST.ViewTitle>
              <ST.ViewTitle_Updating>{isUpdating ? ' saving...' : isSaved ? ' saved' : ''}
              </ST.ViewTitle_Updating>
            </ST.ViewTitleDiv>
          </ST.HeaderMain>
          <ST.EditTextButton
            type="edit"
            className={'Step__EditTextButton'}
            onClick={function () {
              setOpenView(OPEN_VIEWS.TEXT_VIEW)
            }}>
          </ST.EditTextButton>
          <ST.SettingsButton
            type="setting"
            className={'Step__SettingsButton'}
            onClick={function () {
              setOpenView(OPEN_VIEWS.OPTIONS_VIEW)
            }}
          >
          </ST.SettingsButton>
          <ST.SaveButtonWrapper onClick={() => {
            onSaveStep()
          }} className={'Step__SaveButton'}>
            <ST.SaveButtonWrapperIcon type={'save'} />
          </ST.SaveButtonWrapper>
          <ST.DeleteButton onClick={() => {
            showDeleteConfirm()
          }} className={'Step__DeleteButton'}>

            <ST.DeleteIcon type={'delete'} theme={'filled'} />
          </ST.DeleteButton>
        </ST.ViewHeader>
        {/* {isUpdating ? <ST.SpinnerWrapper><Spinner /></ST.SpinnerWrapper> : (
          
        )} */}
        <React.Fragment>
          {isViewOpen ? getView(viewType, openView)
            : ''}
        </React.Fragment>

      </ST.ViewContainer>
      <ST.StepSeperator></ST.StepSeperator>
      {/*<ST.ActionContainer isActionOpen={isActionOpen}>*/}
      {/*  <ST.ActionHeader>*/}
      {/*    <ST.ActionTypeButton>*/}
      {/*      {viewType !== VIEW_TYPES.POPUP ? (*/}
      {/*        <ST.ClickIcon*/}
      {/*        //   onClick={() => {*/}
      {/*        //*/}
      {/*        //   setIsActionOpen(true)*/}
      {/*        // }}*/}
      {/*        />*/}

      {/*      ) : (*/}
      {/*        <ST.Next__Button type={'Primary'}*/}
      {/*        // onClick={() => {*/}
      {/*        //   setIsActionOpen(true)*/}
      {/*        // }}*/}
      {/*        >*/}
      {/*          <ST.Next__ButtonIcon />*/}
      {/*          /!*<ST.Next__ButtonIcon src={LongArrow}/>*!/*/}
      {/*        </ST.Next__Button>*/}

      {/*      )}*/}
      {/*    </ST.ActionTypeButton>*/}

      {/*    {!isActionOpen ? '' : (*/}
      {/*      <React.Fragment>*/}

      {/*        <ST.Select*/}
      {/*          dropdownStyle={{*/}
      {/*            background: Colors.App.sidebarColor,*/}
      {/*            border: `1px solid ${Colors.primaryColor}`*/}
      {/*            // boxShadow: `0 0 0 2px ${Colors.primaryColor}`*/}
      {/*          }}*/}
      {/*          value={actionType}*/}
      {/*          style={{*/}
      {/*            width: 120*/}
      {/*          }}*/}
      {/*          onChange={(actionTypeKey) => {*/}


      {/*            let updateObj = {*/}
      {/*              action: {*/}
      {/*                actionType: ACTION_TYPES[actionTypeKey],*/}
      {/*              }*/}
      {/*            }*/}

      {/*            setActionType(ACTION_TYPES[actionTypeKey])*/}

      {/*            saveStep(updateObj, storyDemoId, screenId, workspaceId, internalStepRef.current._id, authData.token)*/}
      {/*          }}>*/}
      {/*          {Object.entries(ACTION_TYPES).map(([key, value], index, array) => {*/}
      {/*            let isLast = index === array.length - 1*/}
      {/*            return <Option style={{*/}
      {/*              background: 'none',*/}
      {/*              color: Colors.primaryColor,*/}
      {/*              borderBottom: isLast ? 'none' : '1px solid #d9d9d9',*/}
      {/*            }} key={key} value={key}>{value}</Option>*/}
      {/*          })*/}
      {/*          }*/}
      {/*        </ST.Select>*/}


      {/*        <ST.OpenArrow onClick={() => {*/}
      {/*          setIsActionOpen(false)*/}
      {/*        }} type={isActionOpen ? 'down' : 'right'} />*/}

      {/*      </React.Fragment>*/}
      {/*    )}*/}
      {/*  </ST.ActionHeader>*/}
      {/*  {!isActionOpen ? '' : (*/}
      {/*    <ST.ActionMain>*/}
      {/*      <ST.ActionMain__Text>Choose step transition type</ST.ActionMain__Text>*/}
      {/*      {actionType === ACTION_TYPES.ELEMENT_CLICK ? (*/}
      {/*        <ST.ActionSelectorWrapper>*/}
      {/*          <ST.ActionSelectorLine>*/}
      {/*            <ST.PickSelectorButton onClick={updateActionSelector}>*/}
      {/*              <ST.PickSelectorText>Pick Selector </ST.PickSelectorText>*/}
      {/*              <ST.PickSelectorIcon type={'right'} />*/}
      {/*            </ST.PickSelectorButton>*/}
      {/*            <ST.SaveButton onClick={() => {*/}
      {/*              let updateObj = {*/}
      {/*                action: {*/}
      {/*                  actionType: actionType,*/}
      {/*                  selector: action.selector*/}
      {/*                }*/}
      {/*              }*/}

      {/*              saveStep(updateObj, storyDemoId, screenId, workspaceId, internalStepRef.current._id, authData.token)*/}
      {/*            }}>*/}
      {/*              <ST.SaveButton__Image type="save" />*/}
      {/*              <ST.SaveButton__Text>Save</ST.SaveButton__Text>*/}
      {/*            </ST.SaveButton>*/}
      {/*          </ST.ActionSelectorLine>*/}

      {/*          <ST.ActionSelectorLine>*/}
      {/*            <ST.SelectorInput onChange={(event) => {*/}
      {/*              let newStep = { ...internalStepRef.current }*/}
      {/*              newStep.action.selector = event.target.value*/}
      {/*              setInternalStep(newStep)*/}


      {/*            }} value={action.selector} />*/}
      {/*          </ST.ActionSelectorLine>*/}

      {/*        </ST.ActionSelectorWrapper>*/}
      {/*      ) : ''}*/}
      {/*    </ST.ActionMain>*/}
      {/*  )}*/}



      {/*</ST.ActionContainer>*/}
      {/*<ST.StepSeperator></ST.StepSeperator>*/}


    </ST.StepContainer>
  )
}

const ST = {
  SpinnerWrapper: styled.div`
    width: 80px;
    height: 80px;
    position: relative;
  `,
  ActionSelectorLine: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 15px;
  `,
  TypeSelectorWrapper: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px;
    background: #fff;
    border-left: 1px solid black;
    border-right: 1px solid black;

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
  ViewSelectorWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    min-height: 200px;


    border: 1px solid black;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    border-top: none;
    padding: 10px;
  `,
  ActionSelectorWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 25px;

  `,
  ActionMain: styled.div`
     width: 100%;
  `,
  ActionMain__Text: styled.p`
    font-size: 0.9em;
    margin: 10px 0px;
  `,
  ActionHeader: styled.header`
    display: flex;
    justify-content: center;
    gap: 15px;
    align-items: center;
    width: 100%;
  `,
  OpenArrow: styled(Icon)`
    justify-self: flex-end;
    align-self: center;
    margin-right: 15px;
    cursor: pointer;
  `,
  ViewHeader: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;

    height: 35px;

    width: 100%;
    border: 1px solid black;
    border-radius: 6px;
    padding: 0px 5px;
    &&:hover .Step__DeleteButton,
    &&:hover .Step__SaveButton,
    &&:hover .Step__SettingsButton,
    &&:hover .Step__EditTextButton
     {
     visibility: visible;
    }


  `,
  HeaderMain: styled.span`
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-grow: 1;
    gap: 10px;
    width: 100%;
  `,

  SettingsButton: styled(Icon)`
    display: flex;
    align-content: center;
    margin-right: 15px;
    visibility: hidden;

    &&:hover {
      cursor: pointer;
    }

    && svg {
      fill: black;
      width: 100%;
      height: 100%;
    }

  `,
  EditTextButton: styled(Icon)`
    display: flex;
    align-content: center;
    margin-right: 15px;
    visibility: hidden;

    &&:hover {
      cursor: pointer;
    }

    && svg {
      fill: ${Colors.primaryColor};
      width: 100%;
      height: 100%;
    }
  `,
  SaveButtonWrapperIcon: styled(Icon)`
    width: 18px;
    height: 18px;

    && svg {
      fill: ${Colors.primaryColor};
      width: 100%;
      height: 100%;
    }
  `,
  SaveButtonWrapper: styled.div`
    display: flex;
    align-content: center;
    margin-right: 15px;
    visibility: hidden;

    &&:hover {
      cursor: pointer;
    }
  `,
  DeleteButton: styled.div`
    display: flex;
    align-content: center;
    margin-right: 15px;
    visibility: hidden;

    &&:hover {
      cursor: pointer;
    }



  `,
  DeleteIcon: styled(Icon)`
    width: 18px;
    height: 18px;

    && svg {
      fill: #ff0000c4;
      width: 100%;
      height: 100%;
    }
    `,
  CloseButton: styled.div`
    position: absolute;
    top: -2px;
    right: -2px;

    display: none;

    &&:hover {
      cursor: pointer;
    }



  `,
  CloseIcon: styled(Icon)`
    width: 22px;
    height: 22px;

    && svg {
      fill: #4c94ff;
      width: 100%;
      height: 100%;
    }
  `,
  StepContainer: styled.div`
    margin: 0px;
    padding: 0px 0px 0px 0px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    &&:hover .CloseButton {
      display: block;
    }


    &&:hover .Step__DeleteButton,
    &&:hover .Step__SaveButton,
    &&:hover .Step__SettingsButton,
    &&:hover .Step__EditTextButton {
      ${(props) => {
      if (props.isViewOpen) {
        return 'visibility: visible'
      } else {
        return ''
      }
    }}
    }
  `,
  ViewContainer: styled.div`
    padding: 0px 10px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 100%;
    // width: ${(props) => props.isViewOpen ? '275' : '125'}px;
    // height: ${(props) => props.isViewOpen ? '325' : '125'}px;
    border-radius: 4px;
    //background: #F9F9F9;



  `,
  ViewTitle_Updating: styled.p`
    font-size: 1em;
    text-align: center;
    margin-bottom: 0px;
    margin-right: 10px;
  `,
  ViewTitleDiv: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: felx-start;
    gap: 5px;
    width: 100%;
  `,
  ViewTitle: styled.h2`
    font-size: 1em;
    color: #111;
    text-align: left;
    text-transform: capitalize;
    margin-bottom: 0px;
    flex-grow: 1;
    self-align: flex-start;

  `,
  StepSeperator: styled.span`
    width:2px;
    height:15px;
    border-radius: 12px;
    margin-top: 10px;
    background: ${Colors.primaryColor};
  `,
  ActionContainer: styled.span`
    ${(props) => {
      if (props.isActionOpen) {
        return 'justify-content: flex-start;\n' +
          'align-items: flex-start;\n' +
          `border: 1px solid ${Colors.primaryText};\n` +
          'padding: 10px 5px;\n'
      } else {
        return `border: none;\n` +
          'justify-content: flex-start;\n' +
          'align-items: center;\n' +
          'padding: 0px 5px;\n'
      }
    }}

    box-sizing: content-box;
    overflow: hidden;
    width: 225px;
    //width: ${(props) => props.isActionOpen ? '275' : '60'}px;
    //height: ${(props) => props.isActionOpen ? '200' : '45'}px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;



  `,
  ChangeViewTypeText: styled.p`
    margin: 0px;
  `,
  ChangeViewTypeSection: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    width: 90%;
  `,
  ViewTypeOption: styled.p`
    &:hover {
      cursor: pointer;
      text-decoration: underline;
    }
    margin: 0px;
    text-decoration: ${(props) => props.isSelected ? 'underline' : 'none'};

  `,
  PickSelectorButton: styled(Button)`
    width: 150px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
  `,
  PickSelectorText: styled.p`
    margin: 0px;
  `,
  PickSelectorIcon: styled(Icon)`

  `,
  ActionSelectorText: styled.p`
    margin: 0px;
  `,
  SelectorInput: styled(Input)`
    && {
      margin-top: 10px;
      width: 100%;
    }

  `,
  Select: styled(Select)`
    flex-grow: 1;

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
      width: 90%;
    }
`,

  ClickIcon: styled(MdAdsClick)`
    height: 25px;
    width: 45px;

    fill: ${Colors.primaryColor};

    &:hover {
      cursor: pointer;
      fill: ${Colors.primaryColorDarker};
    }
  `,
  ActionTypeButton: styled.div`

  `,
  Next__Button: styled(Button)`
    && {
      background-color: ${Colors.primaryColor};
      color: #FFF;
      font-size: 0.7em;

      height: 20px;
      width: 30px;
      padding: 2px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-evenly;
    }

    &&:hover {
      background-color: ${Colors.primaryColorDarker};
    }
  `,
  Next__ButtonIcon: styled(MdArrowRightAlt)`
    && {
      //fill: #ffffff;
      width: 22px;
      height: 35px;
      margin: 0px;

    }
  `,
  SaveButton: styled.div`

    position: relative;
    //bottom: 20px;
    //left: 5px;
    //background: #1070ff;
    color: ${Colors.primaryColor};
    text-align: center;
    display: flex;
    height: 25px;
    width: 65px;
    border-radius: 6px;
    justify-content: center;
    align-items: center;

    &:hover {
      cursor: pointer;
    };
  `,
  SaveButton__Image: styled(Icon)`
    height: 15px;
    width: 15px;

    && svg {
      fill: ${Colors.primaryColor};
      height: 15px;
      width: 15px;
    }
  `,
  SaveButton__Text: styled.p`
    height: 30px;
    text-align: center;
    line-height: 30px;
    margin: 0px 5px;
    font-size: 1.1em;
    color: ${Colors.primaryColor};


`

}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      updateStep,
      deleteStep
    }, dispatch)
  }
}

// Wrapper component to provide router hooks to functional component
const StepWithRouter = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  return <Step {...props} navigate={navigate} location={location} params={params} />
}

export default connect(null, mapDispatchToProps)(StepWithRouter)
