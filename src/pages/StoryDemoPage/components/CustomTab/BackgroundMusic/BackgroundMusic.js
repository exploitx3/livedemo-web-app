import React, { useState } from 'react'
import Slider from 'antd/es/slider'
import Colors from '../../../../../constants/mainColors'
import styled from 'styled-components'
import Button from 'antd/es/button'
import Icon from '../../../../../components/Icon/Icon'
import Switch from 'antd/es/switch'
import Upload from 'antd/es/upload'
import ENV from '../../../../../config'
import axios from 'axios'
import message from 'antd/es/message'
import StaticUploadIcon from '../../../../../static/images/uploadIcon.svg'
import AudioTrimModal from './AudioTrimModal'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

const S3_BASE = 'https://livedemo-cdn.s3.us-east-1.amazonaws.com/story-background-audios'

const PRESET_TRACKS = [
  { name: 'Acid',               url: `${S3_BASE}/a81f7212-6e7e-4bfd-b9e1-b4b1e2ccae60.mp3` },
  { name: 'Cruise',             url: `${S3_BASE}/1af1bd99-5238-4f44-9556-49a2c7e3571a.mp3` },
  { name: 'Pulse',              url: `${S3_BASE}/dc62bccd-277b-4d00-938a-5781e4cf335e.wav` },
  { name: 'Upbeat-rock',        url: `${S3_BASE}/upbeat-rock.mp3` },
  { name: 'Escape',         url: `${S3_BASE}/the-escape.mp3` },
  { name: 'Future',        url: `${S3_BASE}/future-trip.mp3` },
  { name: 'Diskettes',          url: `${S3_BASE}/Diskettes.mp3` },
  { name: 'Pop-Rocks',          url: `${S3_BASE}/pop-rocks.mp3` },
  { name: 'Famous', url: `${S3_BASE}/I-will-make-you-famous.mp3` },
]

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4.5 7.113c0-2.677 2.932-4.321 5.216-2.925l7.997 4.886c2.187 1.337 2.187 4.515 0 5.851l-7.997 4.887C7.432 21.208 4.5 19.564 4.5 16.887z" />
  </svg>
)

const BackgroundMusic = ({ workspaceId, storyDemo, authData, reloadStoryDemo }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isChecked, setIsChecked] = useState(
    (storyDemo.custom && storyDemo.custom.backgroundMusic && storyDemo.custom.backgroundMusic.isActive) || false
  )
  const [backgroundMusicUrl, setBackgroundMusicUrl] = useState(
    (storyDemo.custom && storyDemo.custom.backgroundMusic && storyDemo.custom.backgroundMusic.backgroundMusicUrl) || ''
  )
  const [volume, setVolume] = useState(
    (storyDemo.custom && storyDemo.custom.backgroundMusic && storyDemo.custom.backgroundMusic.backgroundMusicVolume != null)
      ? storyDemo.custom.backgroundMusic.backgroundMusicVolume
      : 100
  )
  const [previewingUrl, setPreviewingUrl] = useState(null)
  const [trimFile, setTrimFile] = useState(null)

  async function uploadAudioFile(file) {
    setIsSaving(true)
    const formData = new FormData()
    formData.append('backgroundMusic', file)
    try {
      const res = await axios.post(
        `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemo._id}/custom/backgroundMusic/uploadBackgroundMusic`,
        formData,
        { headers: { Authorization: `Bearer ${authData.token}`, 'Content-Type': 'multipart/form-data' } }
      )
      setBackgroundMusicUrl(res.data.audioUrl)
      message.success(`${file.name} uploaded successfully`)
    } catch (err) {
      message.error(`${file.name} upload failed.`)
    } finally {
      setIsSaving(false)
    }
  }

  const uploadProps = {
    name: 'backgroundMusic',
    accept: 'audio/mpeg,audio/wav,audio/wave,audio/x-wav',
    beforeUpload(file) {
      if (file.size > MAX_UPLOAD_BYTES) {
        setTrimFile(file)
        return false
      }
      return true
    },
    action: `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemo._id}/custom/backgroundMusic/uploadBackgroundMusic`,
    headers: {
      authorization: `Bearer ${authData.token}`,
    },
    onChange(info) {
      if (info.file.status === 'uploading') setIsSaving(true)
      if (info.file.status === 'done') {
        setIsSaving(false)
        message.success(`${info.file.name} uploaded successfully`)
        setBackgroundMusicUrl(info.file.response.audioUrl)
      } else if (info.file.status === 'error') {
        setIsSaving(false)
        message.error(`${info.file.name} upload failed.`)
      }
    },
  }

  function onSave(isActive, backgroundMusicVolume = volume, backgroundMusicUrlOverride) {

    const body = { isActive, backgroundMusicVolume }
    if (backgroundMusicUrlOverride !== undefined) {
      body.backgroundMusicUrl = backgroundMusicUrlOverride
    }
    return axios.post(
      `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemo._id}/custom/backgroundMusic`,
      body,
      { headers: { Authorization: `Bearer ${authData.token}` } }
    )
      .then((res) => {
        return res.data
      })
      .then(() => reloadStoryDemo())
  }

  return (<>
    <BM.ScreenHeader>
      <BM.HeaderMain>
        <BM.HeaderLeftSide onClick={() => setIsOpen(!isOpen)}>
          <BM.OpenIcon type={isOpen ? 'down' : 'right'} />
          <BM.HeaderTitle>Music</BM.HeaderTitle>
        </BM.HeaderLeftSide>
        <BM.HeaderRightSide>
          <BM.CheckBox
            checked={isChecked}
            onChange={(checked) => {
              if (checked) setIsOpen(true)
              setIsChecked(checked)
              onSave(checked)
            }}
          />
        </BM.HeaderRightSide>
      </BM.HeaderMain>

      {!isOpen ? '' : (
        <BM.MainWrapper>
          {!isChecked ? <BM.Overlay /> : ''}

          <BM.Main>
            <BM.TextWrapper>
              <BM.TextTitle>Presets:</BM.TextTitle>
              <BM.PresetList>
                {PRESET_TRACKS.map((track) => {
                  const isSelected = backgroundMusicUrl === track.url
                  return (
                    <BM.PresetPill key={track.url} $isSelected={isSelected}>
                      <BM.PresetPlayBtn
                        type="button"
                        $isSelected={isSelected}
                        onClick={() => {
                          if (previewingUrl === track.url) {
                            setPreviewingUrl(null)
                          } else {
                            setPreviewingUrl(track.url)
                          }
                        }}
                      >
                        <PlayIcon />
                      </BM.PresetPlayBtn>
                      <BM.PresetName
                        onClick={() => {
                          setBackgroundMusicUrl(track.url)
                          setPreviewingUrl(null)
                          onSave(isChecked, volume, track.url)
                        }}
                      >
                        {track.name}
                      </BM.PresetName>
                    </BM.PresetPill>
                  )
                })}
              </BM.PresetList>
              {(previewingUrl || backgroundMusicUrl) ? (
                <audio
                  key={previewingUrl || backgroundMusicUrl}
                  src={previewingUrl || backgroundMusicUrl}
                  autoPlay={!!previewingUrl}
                  controls
                  style={{ width: '100%', marginTop: 6 }}
                />
              ) : (
                <BM.PlaceholderIcon src={StaticUploadIcon} />
              )}
              <BM.Upload {...uploadProps}>
                <Button loading={isSaving}>
                  <Icon type="upload" /> Upload Audio
                </Button>
              </BM.Upload>
            </BM.TextWrapper>

            <BM.TextWrapper>
              <BM.TextTitle>Volume: {volume}%</BM.TextTitle>
              <Slider
                min={0}
                max={100}
                value={volume}
                onChange={(val) => setVolume(val)}
                onAfterChange={(val) => onSave(isChecked, val)}
              />
            </BM.TextWrapper>
          </BM.Main>
        </BM.MainWrapper>
      )}
    </BM.ScreenHeader>

    {trimFile && (
      <AudioTrimModal
        key={`${trimFile.name}-${trimFile.size}-${trimFile.lastModified}`}
        file={trimFile}
        onConfirm={async (trimmedFile) => {
          await uploadAudioFile(trimmedFile)
          setTrimFile(null)
        }}
        onCancel={() => setTrimFile(null)}
      />
    )}
  </>
  )
}

const BM = {
  Overlay: styled.div`
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(3px);
    z-index: 1;
    border-radius: 4px;
  `,
  MainWrapper: styled.div`
    padding: 10px;
    display: flex;
    justify-content: flex-start;
    gap: 15px;
    margin-top: 10px;
    position: relative;
  `,
  Main: styled.span`
    margin: 0px 0px 0px 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
    width: 100%;
  `,
  Upload: styled(Upload)`
    max-width: 160px;
  `,
  PlaceholderIcon: styled.img`
    width: 50px;
    height: 50px;
    opacity: 0.4;
  `,
  AudioPreview: styled.div`
    width: 100%;
  `,
  PresetList: styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
    width: 100%;
  `,
  PresetPill: styled.div`
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 6px 0 3px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid ${({ $isSelected }) => $isSelected ? Colors.primaryColor : '#e5e7eb'};
    background: ${({ $isSelected }) => $isSelected ? '#f0f4ff' : '#fff'};
    transition: all 0.15s ease;
    cursor: pointer;

    &&:hover {
      border-color: #d1d5db;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
  `,
  PresetPlayBtn: styled.button`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ $isSelected }) => $isSelected ? Colors.primaryColor : '#f3f4f6'};
    color: ${({ $isSelected }) => $isSelected ? '#fff' : '#374151'};
    border: none;
    border-radius: 6px;
    cursor: pointer;
    padding: 0;
    transition: background 0.15s ease;
    flex-shrink: 0;

    &&:hover {
      background: ${({ $isSelected }) => $isSelected ? Colors.primaryColor : '#e5e7eb'};
    }

    && svg {
      width: 11px;
      height: 11px;
    }
  `,
  PresetName: styled.button`
    font-size: 0.75em;
    font-weight: 600;
    padding-left: 6px;
    height: 100%;
    background: none;
    border: none;
    cursor: pointer;
    color: #111827;
    white-space: nowrap;
  `,
  AudioUrlText: styled.p`
    font-size: 0.75em;
    color: #888;
    word-break: break-all;
    margin: 0;
  `,
  TextTitle: styled.label`
    margin: 0px;
    font-size: 0.9em;
  `,
  TextWrapper: styled.span`
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  `,
  OpenIcon: styled(Icon)`
    cursor: pointer;
  `,
  HeaderRightSide: styled.span`
    margin-right: 15px;
  `,
  HeaderLeftSide: styled.span`
    flex-grow: 1;
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;
  `,
  CheckBox: styled(Switch)``,
  HeaderTitle: styled.span`
    max-width: 160px;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
    overflow: hidden;
    font-size: 1.2em;
    color: ${Colors.primaryText};
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
}

export default BackgroundMusic
