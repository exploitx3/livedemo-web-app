import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Switch from 'antd/es/switch'
import 'antd/es/switch/style'

import Icon from '../Icon/Icon'
import IconTextButton from '../../components/IconTextButton/IconTextButton'
import {
  MdGif,
  MdKeyboard,
  MdOutlineGifBox,
  MdOutlineLink,
  MdOutlineVideoLibrary,
  MdSmartDisplay,
  MdWebAsset
} from 'react-icons/md'
import Colors from '../../constants/mainColors'
import { toast } from 'react-hot-toast';
import ENV from '../../config'
import axios from '../../utils/axiosInstance'
import { bindActionCreators } from 'redux'
import { connect } from "react-redux";
import { getStoryDemo, updateStoryDemo } from '../../actions/storyDemoActions'
import { createLink, deleteLink, getLinks, updateLink } from "../../utils/storyHelpers";
import EditLink from './components/EditLink'
import CreateLink from './components/CreateLink'
import TippyPremium from '../TippyPremium/TippyPremium'

// const {TabPane} = Tabs // Removed - deprecated in Ant Design v6, use items prop instead

const TAB_KEYS = {
  embed: 'embed',
  links: 'links'
}

const SECOND_VIEWS = {
  'default': 'default',
  'createLink': 'createLink',
  'editLink': 'editLink',
}


const ShareDropdown = ({ storyId, workspaceId, liveDemo, isPublished, onSetIsPublished, authData, actions, isOpen }) => {

  let featureFlags = authData.featureFlags

  let [isLoading, setIsLoading] = useState(false)
  let [demoHasLoaded, setDemoHasLoaded] = useState(liveDemo && liveDemo.content)

  let [isGeneratingStoryContent, setIsGeneratingStoryContent] = useState(false)
  let [showContentGeneratingNotification, setShowContentGeneratingNotification] = useState(false)

  let contentObjectExists = liveDemo && liveDemo.content && liveDemo.content.contentId && liveDemo.content.contentId._id
  let [storyContent, setStoryContent] = useState(contentObjectExists ? liveDemo.content.contentId : null)

  let [activeTab, setActiveTab] = useState(TAB_KEYS.embed)
  let [links, setLinks] = useState([])
  let [isLinksReady, setIsLinksReady] = useState(false)

  let [selectedSecondView, setSelectedSecondView] = useState(SECOND_VIEWS.default)
  let [selectedLinkEditting, setSelectedLinkEditting] = useState(null)
  let [selectedLinkCreating, setSelectedLinkCreating] = useState(null)

  useEffect(() => {
    if (!demoHasLoaded) {
      // if (!storyContent || storyContent && storyContent.contentStatus && storyContent.contentStatus !== ContentStatuses.READY) {
      actions.getStoryDemo(workspaceId, storyId, authData.token)
        .then(() => {
          setDemoHasLoaded(true)
        })
    }

    refreshLinks()


  }, [])

  function refreshLinks() {
    getLinks(workspaceId, storyId, authData.token)
      .then((linkDocs) => {

        setLinks(linkDocs)
      })
  }

  useEffect(() => {
    if (activeTab === TAB_KEYS.links) {

      if (links.length === 0) {
        refreshLinks()
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (!demoHasLoaded) {
      // if (!storyContent || storyContent && storyContent.contentStatus && storyContent.contentStatus !== ContentStatuses.READY) {
      actions.getStoryDemo(workspaceId, storyId, authData.token)
        .then(() => {
          setDemoHasLoaded(true)
        })
    } else {
      setShowContentGeneratingNotification(false)
    }
  }, [isOpen])

  useEffect(() => {
    let contentObjectExists = liveDemo && liveDemo.content && liveDemo.content.contentId && liveDemo.content.contentId._id
    if (contentObjectExists) {
      setStoryContent(liveDemo.content.contentId)
    }
  }, [liveDemo])

  function onGenerateVideoAndGif(authToken) {

    return axios.post(`${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyId}/generateStoryContent`, {},
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    )
      .then(res => res.data)
  }

  function copyToClipboard(textToCopy) {
    // navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
      // navigator clipboard api method'
      return navigator.clipboard.writeText(textToCopy);
    } else {
      // text area method
      let textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      // make the textarea out of viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise((res, rej) => {
        // here the magic happens
        document.execCommand('copy') ? res() : rej();
        textArea.remove();
      });
    }
  }

  function showCopiedNotification() {
    toast(
      <SD.CopiedWrapper>
        <SD.CopiedImg />
        <SD.CopiedText>Copied to clipboard</SD.CopiedText>
      </SD.CopiedWrapper>, {
      duration: 2500,
      position: 'top-center',
      // Styling
      style: {
        borderRadius: '25px',
        background: '#111',
      },
      className: '',

      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
    })
  }

  function onCopyLink(value) {

    copyToClipboard(value)
    showCopiedNotification()
  }

  function onCopyCode() {


    let embedCode = `<div style="position: relative; padding-bottom: calc(${(liveDemo.tabInfo.height / liveDemo.tabInfo.width) * 100}% + 41px); height: 0;">\n` +
      `                <iframe src="${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyId}/preview?step=1&embed" frameBorder="0" loading="lazy"\n` +
      '                        webkitallowfullscreen mozallowfullscreen allowFullScreen\n' +
      '                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 6px;"></iframe>\n' +
      '              </div>'

    copyToClipboard(embedCode)
    showCopiedNotification()
  }

  function onCopyTwitterLink() {

    let embedCode = `${ENV.SERVER_URL}/livedemos/${storyId}`

    copyToClipboard(embedCode)
    showCopiedNotification()
  }

  function onCopyMediumLink() {

    let embedCode = `${ENV.LIVE_DOMAIN_STORIES_API}/workspaces/${workspaceId}/stories/${storyId}/preview?step=1&embed`

    copyToClipboard(embedCode)
    showCopiedNotification()
  }


  function openLinkInNewTab(URL) {
    window.open(URL, '_blank')
  }

  const tabItems = [
    {
      key: TAB_KEYS.embed,
      label: 'Embed',
      children: (
        <React.Fragment>
          <SD.CopyWebsiteWrapper>
            <SD.ImgAndText>
              <SD.WebsiteImage />
              <SD.WebsiteText>Website</SD.WebsiteText>
            </SD.ImgAndText>
            <IconTextButton
              loading={false}
              onClick={onCopyCode}
              img={null}
              text={'Copy code'}

              textStyles={{
                fontSize: '0.9em',
                color: '#111',
              }}
              buttonStyles={{
                boxShadow: 'none',
                justifyContent: 'space-between',
                width: 'auto',
                height: '30px',
                borderRadius: '6px'
              }}
            />
          </SD.CopyWebsiteWrapper>
          <SD.CopyWebsiteWrapper>
            <SD.ImgAndText>
              <SD.TwitterImage type={'twitter'} />
              <SD.WebsiteText>Twitter</SD.WebsiteText>
            </SD.ImgAndText>
            <IconTextButton
              loading={false}
              onClick={onCopyTwitterLink}
              img={null}
              text={'Copy link'}

              textStyles={{
                fontSize: '0.9em',
                color: '#111',
              }}
              buttonStyles={{
                boxShadow: 'none',
                justifyContent: 'space-between',
                width: 'auto',
                height: '30px',
                borderRadius: '6px'
              }}
            />
          </SD.CopyWebsiteWrapper>
          <SD.CopyWebsiteWrapper>
            <SD.ImgAndText>
              <SD.TwitterImage type={'medium'} />
              <SD.WebsiteText>Medium</SD.WebsiteText>
            </SD.ImgAndText>
            <IconTextButton
              loading={false}
              onClick={onCopyMediumLink}
              img={null}
              text={'Copy link'}

              textStyles={{
                fontSize: '0.9em',
                color: '#111',
              }}
              buttonStyles={{
                boxShadow: 'none',
                justifyContent: 'space-between',
                width: 'auto',
                height: '30px',
                borderRadius: '6px'
              }}
            />
          </SD.CopyWebsiteWrapper>
        </React.Fragment>
      )
    },
    {
      key: TAB_KEYS.links,
      label: 'Links',
      children: (
        <React.Fragment>
          <SD.Row style={{
            padding: 16,
            display: "flex",
            justifyContent: "space-between",
            borderBottom: `1px solid #bebebe`
          }}>
            <SD.LeftSide>
              <SD.TitleText>Custom links</SD.TitleText>
              <SD.DescText>Custom links allow you to personalize your LiveDemo with variables</SD.DescText>
            </SD.LeftSide>
            <TippyPremium
              title="Unlock Custom Links"
              description="Upgrade your plan to create custom links for your LiveDemos."
              placement="top"
              arrow={true}
              disabled={featureFlags.allowPersonalization === true }
            >
              <SD.RightSide>
                <IconTextButton
                  loading={false}
                  disabled={featureFlags.allowPersonalization === false}
                  onClick={() => {

                    createLink("New link",
                      workspaceId,
                      storyId,
                      authData.token
                    )
                      .then(newLinkDoc => {
                        setSelectedLinkCreating(newLinkDoc)
                        setSelectedSecondView(SECOND_VIEWS.createLink)
                        refreshLinks()
                      })
                  }}
                  img={(<SD.LinkImg />)}
                  text={'Create'}

                  textStyles={{
                    fontSize: '0.9em',
                    color: '#111',
                    marginLeft: '5px !important'
                  }}
                  buttonStyles={{

                    padding: '0 5px',
                    boxShadow: 'none',
                    justifyContent: 'space-between',
                    width: 'auto',
                    height: '30px',
                    borderRadius: '6px'
                  }}
                />
              </SD.RightSide>
            </TippyPremium>
          </SD.Row>
          <SD.Links__Col>
            {links.length === 0 ? (
              <SD.DescText>No custom links yet</SD.DescText>
            ) : (
              links.map(link => {
                return (
                  <SD.Links__Row key={link._id}>
                    <SD.Links__LeftSide>
                      <SD.TitleText style={{ fontSize: '1em' }}>{link.name}</SD.TitleText>
                    </SD.Links__LeftSide>
                    <SD.Links__RightSide>
                      <IconTextButton
                        loading={false}
                        onClick={() => {
                          let linkString = `${ENV.SERVER_URL}/livedemos/${storyId}/links/${link._id}`
                          onCopyLink(linkString)
                        }}
                        img={null}
                        text={'Copy link'}

                        textStyles={{
                          fontSize: '0.9em',
                          color: '#111',
                        }}
                        buttonStyles={{
                          boxShadow: 'none',
                          justifyContent: 'space-between',
                          width: 'auto',
                          height: '30px',
                          borderRadius: '6px'
                        }}
                      />
                      <IconTextButton
                        loading={false}
                        onClick={() => {
                          setSelectedLinkEditting(link)
                          setSelectedSecondView(SECOND_VIEWS.editLink)
                        }}
                        img={null}
                        text={'Edit'}

                        textStyles={{
                          fontSize: '0.9em',
                          color: '#111',
                        }}
                        buttonStyles={{
                          boxShadow: 'none',
                          justifyContent: 'space-between',
                          width: 'auto',
                          height: '30px',
                          borderRadius: '6px'
                        }}
                      />
                      <IconTextButton
                        loading={false}
                        onClick={() => {
                          deleteLink(
                            link._id,
                            workspaceId,
                            storyId,
                            authData.token
                          )
                            .then(() => {

                              refreshLinks()
                            })
                        }}
                        img={null}
                        text={'Delete'}

                        textStyles={{
                          fontSize: '0.9em',
                          color: '#FFF',
                        }}
                        buttonStyles={{
                          background: '#bb1919 !important',
                          boxShadow: 'none',
                          justifyContent: 'space-between',
                          width: 'auto',
                          height: '30px',
                          borderRadius: '6px',
                          border: 'none !important'
                        }}
                      />
                    </SD.Links__RightSide>

                  </SD.Links__Row>
                )
              })
            )}

          </SD.Links__Col>
        </React.Fragment>
      )
    }
  ]

  function renderDefaultSecondView() {

    return (

      <SD.Row>
        <SD.CustomTabs>
          <SD.TabsNav>
            <SD.TabsNavList>
              {tabItems.map(item => (
                <SD.Tab
                  key={item.key}
                  $active={activeTab === item.key}
                  onClick={() => setActiveTab(item.key)}
                >
                  {item.label}
                </SD.Tab>
              ))}
            </SD.TabsNavList>
            <SD.TabsBar />
          </SD.TabsNav>
          <SD.TabsContent>
            {tabItems.find(item => item.key === activeTab)?.children}
          </SD.TabsContent>
        </SD.CustomTabs>
      </SD.Row>

    )
  }


  function renderSecondView(selectedSecondView) {
    debugger

    switch (selectedSecondView) {
      case SECOND_VIEWS.default:
        return renderDefaultSecondView()
      case SECOND_VIEWS.editLink:
        return (<EditLink link={selectedLinkEditting}
          onCancel={() => {
            setSelectedSecondView(SECOND_VIEWS.default)
          }}
          onSave={(link) => {

            updateLink(link._id, {
              name: link.name,
              variables: link.variables
            },
              workspaceId,
              storyId,
              authData.token
            )
              .then(updateLink => {
                refreshLinks()
                setSelectedSecondView(SECOND_VIEWS.default)

              })
          }}
          storyId={storyId}
          workspaceId={workspaceId}
          liveDemo={liveDemo}
          authData={authData}
        />)
      case SECOND_VIEWS.createLink:
        return (<CreateLink
          link={selectedLinkCreating}
          defaultVariables={liveDemo.custom.variables}
          onCancel={() => {
            setSelectedSecondView(SECOND_VIEWS.default)
          }}
          onSave={(link) => {
            updateLink(link._id, {
              name: link.name,
              variables: link.variables
            },
              workspaceId,
              storyId,
              authData.token
            )
              .then(updateLink => {
                refreshLinks()
                setSelectedSecondView(SECOND_VIEWS.default)

              })

          }}
          storyId={storyId}
          workspaceId={workspaceId}
          liveDemo={liveDemo}
          authData={authData}
        />)
      default:
        return renderDefaultSecondView()
    }
  }

  return (
    <SD.Wrapper>
      <SD.FirstLine>
        <SD.Row>
          <SD.LeftSide>
            <SD.TitleText>Public access</SD.TitleText>
            <SD.DescText>{isPublished ? 'Anyone with the link can view' : 'Only you can view this demo'}</SD.DescText>
          </SD.LeftSide>
          <SD.RightSide>
            <Switch loading={isLoading} checked={isPublished} onChange={(checked, event) => {
              setIsLoading(true)
              onSetIsPublished(checked)
                .then(() => {
                  setIsLoading(false)
                })
                .catch(() => {
                  setIsLoading(false)
                })
            }} />

          </SD.RightSide>
        </SD.Row>
        <SD.LinkWrapper>
          <SD.Link
            onClick={(e) => {
              e.preventDefault()
              onCopyLink(e.target.value)
            }}
            disabled={true}
            readonly
            value={`${ENV.SERVER_URL}/livedemos/${storyId}`} />
          <SD.CopyButtonWrapper>

            <IconTextButton
              loading={false}
              onClick={() => {
                onCopyLink(`${ENV.SERVER_URL}/livedemos/${storyId}`)
              }}
              img={null}
              text={'Copy link'}

              textStyles={{
                fontSize: '0.9em',
                color: '#111',
              }}
              buttonStyles={{
                boxShadow: 'none',
                justifyContent: 'space-between',
                width: 'auto',
                height: '30px',
                borderRadius: '6px'
              }}
            />
          </SD.CopyButtonWrapper>
        </SD.LinkWrapper>
      </SD.FirstLine>
      <SD.SecondLine>
        {renderSecondView(selectedSecondView)}
      </SD.SecondLine>
      {activeTab === TAB_KEYS.links ? '' : (
        <SD.ThirdLine>
          <TippyPremium
            title="Unlock Video & GIF Generation"
            description="Upgrade your plan to generate videos and GIFs for your LiveDemos."
            placement="left"
            arrow={true}
            disabled={featureFlags.showMp4GifsExport === true}
          >
            <SD.Row>

              <SD.LeftSide>
                <SD.TitleText>Video & GIF</SD.TitleText>
                <SD.DescText>Embed a LiveDemo in Email or Video platforms</SD.DescText>
              </SD.LeftSide>
              <SD.RightSide>

                <IconTextButton
                  disabled={showContentGeneratingNotification || featureFlags.showMp4GifsExport === false}
                  loading={isGeneratingStoryContent}
                  onClick={() => {
                    setIsGeneratingStoryContent(true)

                    return onGenerateVideoAndGif(authData.token)
                      .then(() => {
                        setIsGeneratingStoryContent(false)
                        setShowContentGeneratingNotification(true)
                        setStoryContent(null)
                      })
                  }}
                  img={(<SD.VideoImg />)}
                  text={storyContent && storyContent._id ? 'Re-Generate' : (featureFlags.showMp4GifsExport === true ? 'Generate' : 'Upgrade to generate')}

                  textStyles={{
                    fontSize: '0.9em',
                    color: '#111',
                    marginLeft: '5px !important'
                  }}
                  buttonStyles={{

                    padding: '0 5px',
                    boxShadow: 'none',
                    justifyContent: 'space-between',
                    width: 'auto',
                    height: '30px',
                    borderRadius: '6px'
                  }}

                />
              </SD.RightSide>
            </SD.Row>
          </TippyPremium>

          {showContentGeneratingNotification ? (
            <SD.CopyWebsiteWrapper>
              <SD.ContentNotifyBox>
                <SD.ContentNotifyText>Your content is being created.</SD.ContentNotifyText>
                <SD.ContentNotifyText>
                  We'll email you a download link once it's ready, which may take up to 5 minutes.
                </SD.ContentNotifyText>
              </SD.ContentNotifyBox>
            </SD.CopyWebsiteWrapper>) :
            (!storyContent ? '' : (

              <React.Fragment>
                <SD.CopyWebsiteWrapper>
                  <SD.LeftSide>
                    <SD.ImgAndText>
                      <SD.VideoImage />
                      <SD.WebsiteText>Video</SD.WebsiteText>
                    </SD.ImgAndText>
                  </SD.LeftSide>
                  <SD.RightSide>
                    <IconTextButton
                      loading={false}
                      onClick={() => {
                        openLinkInNewTab(storyContent.videoUrl)
                      }}
                      img={null}
                      text={'Open'}

                      textStyles={{
                        fontSize: '0.9em',
                        color: '#111',
                      }}
                      buttonStyles={{
                        boxShadow: 'none',
                        justifyContent: 'space-between',
                        width: 'auto',
                        height: '30px',
                        borderRadius: '6px'
                      }}
                    />
                    <IconTextButton
                      loading={false}
                      onClick={() => {
                        copyToClipboard(storyContent.videoUrl)
                        showCopiedNotification()
                      }}
                      img={null}
                      text={'Copy link'}

                      textStyles={{
                        fontSize: '0.9em',
                        color: '#111',
                      }}
                      buttonStyles={{
                        boxShadow: 'none',
                        justifyContent: 'space-between',
                        width: 'auto',
                        height: '30px',
                        borderRadius: '6px'
                      }}
                    />
                  </SD.RightSide>
                </SD.CopyWebsiteWrapper>
                <SD.CopyWebsiteWrapper>
                  <SD.LeftSide>
                    <SD.ImgAndText>
                      <SD.GifBoxImage />
                      <SD.WebsiteText>GIF</SD.WebsiteText>
                    </SD.ImgAndText>
                  </SD.LeftSide>
                  <SD.RightSide>
                    <IconTextButton
                      loading={false}
                      onClick={() => {
                        openLinkInNewTab(storyContent.gifUrl)
                      }}
                      img={null}
                      text={'Open'}

                      textStyles={{
                        fontSize: '0.9em',
                        color: '#111',
                      }}
                      buttonStyles={{
                        boxShadow: 'none',
                        justifyContent: 'space-between',
                        width: 'auto',
                        height: '30px',
                        borderRadius: '6px'
                      }}
                    />
                    <IconTextButton
                      loading={false}
                      onClick={() => {
                        copyToClipboard(storyContent.gifUrl)
                        showCopiedNotification()
                      }}
                      img={null}
                      text={'Copy link'}

                      textStyles={{
                        fontSize: '0.9em',
                        color: '#111',
                      }}
                      buttonStyles={{
                        boxShadow: 'none',
                        justifyContent: 'space-between',
                        width: 'auto',
                        height: '30px',
                        borderRadius: '6px'
                      }}
                    />
                  </SD.RightSide>
                </SD.CopyWebsiteWrapper>
              </React.Fragment>
            ))
          }

        </SD.ThirdLine>
      )}

    </SD.Wrapper>
  )
}

const SD = {
  Links__Col: styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px 0px;

    max-height: 200px;
    overflow-y: auto;
  `,
  CustomTabs: styled.div`
    width: 100%;
    overflow: initial;

    *,
    *::before,
    *::after {
      transition: none !important;
      animation: none !important;
      -webkit-transition: none !important;
      -webkit-animation: none !important;
      -moz-transition: none !important;
      -moz-animation: none !important;
      -o-transition: none !important;
      -o-animation: none !important;
    }
  `,
  TabsNav: styled.div`
    width: 100%;
  `,
  TabsNavList: styled.div`
    width: 100%;
    display: flex;
    justify-content: space-evenly;
  `,
  Tab: styled.button`
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
    --antd-wave-shadow-color: #1890ff;
    visibility: visible;
    color: ${props => props.$active ? '#1890ff' : 'rgba(0,0,0,.65)'};
    border-bottom: ${props => props.$active ? '2px solid #1890ff' : 'none'};
    border-top: none;
    border-left: none;
    border-right: none;
    font-variant: tabular-nums;
    list-style: none;
    font-feature-settings: "tnum";
    line-height: 1.5;
    white-space: nowrap;
    font-family: monospace,cursive;
    font-size: 1.1em;
    margin-bottom: -1px;
    overflow: hidden;
    box-sizing: border-box;
    justify-content: center;
    text-align: center;
    padding: 12px 0;
    width: 50%;
    margin: 0;
    flex: 1;
    background: none;
    cursor: pointer;
    outline: none;
    position: relative;

    &:hover {
      color: #1890ff;
    }

    &:focus {
      outline: none;
    }
  `,
  TabsBar: styled.div`
    margin: 0 0px 0 0;
    border-bottom: 1px solid #bebebe;
  `,
  TabsContent: styled.div`
    width: 100%;
  `,
  ContentNotifyBox: styled.span`
    margin: 0px;
    font-size: 1em;
    background: #f9f9f9;
    padding: 5px;
    border: 2px solid #ccc;
    border-radius: 8px;
  `,
  ContentNotifyText: styled.p`
    margin: 0px;
    word-break: break-word;
    text-align: left;
    color: #111;
  `,
  Wrapper: styled.div`
    width: 385px;
    height: auto;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    background: #fefefe;
    box-shadow: 0 0 #0000, 0 0 #0000, 0px 0px 0px 1px rgba(17, 24, 39, .12), 0px 2px 2px -2px rgba(17, 24, 39, .03), 0px 4px 4px rgba(17, 24, 39, .03), 0px 8px 8px rgba(17, 24, 39, .03), 0px 16px 16px rgba(17, 24, 39, .03);
    transform: translate(-100px, 0px);
  `,
  Row: styled.div`
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px 0px 16px;
  `,
  Links__Row: styled.div`
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px;
  `,

  Links__LeftSide: styled.span`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 15px;
    width: 30%;
  `,

  Links__RightSide: styled.span`
    width: 49%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 5px;
  `,
  LeftSide: styled.span`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 15px;
  `,
  TitleText: styled.h1`
    color: #111;
    font-size: 1.2em;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  `,
  DescText: styled.p`
    color: #555;
    margin: 0px;
    font-size: 1em;
  `,
  LinkWrapper: styled.div`
    width: 100%;
    padding: 16px;
    position: relative;
  `,
  Link: styled.input`
    width: 100%;
    height: 36px;
    cursor: default;

    background: #f3f4f6;
    color: rgba(37, 36, 36, 0.81);
    border-radius: 6px;
    outline: none;
    border: 1px solid #ccc;
    padding: 5px 7px;
  `,
  CopyButtonWrapper: styled.span`
    position: absolute;
    top: 19px;
    right: 19px;
  `,
  RightSide: styled.span`
    display: flex;
    justify-content: center;
    align-items: start;
    gap: 10px;
    position: absolute;
    top: 15px;
    right: 15px;
  `,
  CopyWebsiteWrapper: styled.div`
    position: relative;
    padding: 16px 0px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  FirstLine: styled.div`
    border-bottom: 1px solid #ccc;
  `,
  SecondLine: styled.div`
    padding-bottom: 16px;
    width: 100%;
    display: block;
    position: relative;
    //border-bottom: 1px solid #ccc;
  `,
  ThirdLine: styled.div`
    padding-bottom: 16px;
  `,
  ImgAndText: styled.span`
    display: flex;
    gap: 5px;
    align-items: center;

  `,
  WebsiteText: styled.p`
    line-height: 35px;
    color: #555;
    margin: 0px;
    font-size: 1em;
  `,
  WebsiteImage: styled(MdWebAsset)`
    width: 35px;
    height: 35px;
    fill: ${Colors.primaryColor};
  `,
  TwitterImage: styled(Icon)`
    width: 35px;
    height: 35px;

    && svg {
      width: 100%;
      height: 100%;
      fill: ${Colors.primaryColor};
    }
  `,
  VideoImage: styled(MdSmartDisplay)`
    width: 35px;
    height: 35px;
    fill: ${Colors.primaryColor};
  `,
  GifImage: styled(MdGif)`
    width: 35px;
    height: 35px;
    fill: ${Colors.primaryColor};
  `,
  GifBoxImage: styled(MdOutlineGifBox)`
    width: 35px;
    height: 35px;
    fill: ${Colors.primaryColor};
  `,
  CopiedWrapper: styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    border-radius: 25px;
  `,
  CopiedText: styled.p`
    margin: 0px;
    color: #f9f9f9;
  `,
  CopiedImg: styled(MdKeyboard)`
    width: 25px;
    height: 25px;
  `,
  VideoImg: styled(MdOutlineVideoLibrary)`
    width: 25px;
    height: 25px;
  `,
  LinkImg: styled(MdOutlineLink)`
    width: 25px;
    height: 25px;
  `
}

function mapStateToProps(state) {

  return {
    authData: state.authReducer.authData,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      updateStoryDemo,
      getStoryDemo,
    }, dispatch)
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(ShareDropdown)
