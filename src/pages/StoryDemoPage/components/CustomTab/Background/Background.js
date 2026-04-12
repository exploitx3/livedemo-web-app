import React, { useMemo, useState } from 'react'
import Colors from '../../../../../constants/mainColors'
import styled from 'styled-components'
import Button from 'antd/es/button'
import Icon from '../../../../../components/Icon/Icon'
import Switch from 'antd/es/switch'
import Slider from 'antd/es/slider'
import Radio from 'antd/es/radio'
import Tabs from 'antd/es/tabs'
import 'antd/es/tabs/style'
import ENV from '../../../../../config'
import axios from 'axios'
import { ColorPicker } from 'antd'
import { AggregationColor } from 'antd/es/color-picker/color'
import { WALLPAPER_CATEGORIES } from './wallpaperCatalog'

function cssStringToAggregationColor(cssString) {
  if (!cssString) {
    return new AggregationColor('')
  }
  if (cssString.startsWith('linear-gradient')) {
    const colorStops = cssString.match(/rgba?\([^)]+\)\s+\d+%|#[0-9a-fA-F]+\s+\d+%/g) || []
    const colors = colorStops
      .map((stop) => {
        const match = stop.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]+)\s*(\d+)%/)
        if (match) {
          return {
            color: match[1],
            percent: parseInt(match[2], 10)
          }
        }
        return null
      })
      .filter(Boolean)
    if (colors.length > 0) {
      return new AggregationColor(colors)
    }
  }
  return new AggregationColor(cssString)
}

function backgroundColorToCssString(color) {
  if (color && typeof color.toCssString === 'function') {
    try {
      return color.toCssString()
    } catch {
      return '#FFFFFF'
    }
  }
  return '#FFFFFF'
}

function getInitialBackgroundState(storyDemo) {
  const c = storyDemo.custom
  if (c && c.background) {
    return {
      isActive: !!c.background.isActive,
      backgroundColor: cssStringToAggregationColor(c.background.backgroundColor || '#FFFFFF'),
      backgroundBlur: c.background.backgroundBlur ?? 0,
      backgroundType: c.background.backgroundType || 'color',
      wallpaperImage: c.background.wallpaperImage || '',
      padding: c.background.padding ?? 24
    }
  }
  const legacy = (c && c.theme && c.theme.backgroundColor) || '#FFFFFF'
  const isGrad = typeof legacy === 'string' && legacy.trim().startsWith('linear-gradient')
  return {
    isActive: false,
    backgroundColor: cssStringToAggregationColor(legacy),
    backgroundBlur: 0,
    backgroundType: isGrad ? 'gradient' : 'color',
    wallpaperImage: '',
    padding: 24
  }
}

const Background = ({ workspaceId, storyDemo, authData, reloadStoryDemo }) => {
  const initial = useMemo(() => getInitialBackgroundState(storyDemo), [storyDemo])

  const [isSaving, setIsSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isChecked, setIsChecked] = useState(initial.isActive)
  const [backgroundColor, setBackgroundColor] = useState(initial.backgroundColor)
  const [backgroundBlur, setBackgroundBlur] = useState(initial.backgroundBlur)
  const [backgroundType, setBackgroundType] = useState(initial.backgroundType)
  const [wallpaperImage, setWallpaperImage] = useState(initial.wallpaperImage)
  const [padding, setPadding] = useState(initial.padding)

  function onSave(nextActive, nextType, nextColor, nextBlur, nextWallpaper, nextPadding) {
    setIsSaving(true)

    return axios
      .post(
        `${ENV.STORIES_API}/workspaces/${workspaceId}/stories/${storyDemo._id}/custom/background`,
        {
          isActive: nextActive,
          backgroundColor: backgroundColorToCssString(nextColor),
          backgroundBlur: nextBlur,
          backgroundType: nextType,
          wallpaperImage: nextWallpaper || '',
          padding: nextPadding
        },
        {
          headers: {
            Authorization: `Bearer ${authData.token}`
          }
        }
      )
      .then((res) => {
        setIsSaving(false)
        return res.data
      })
      .then(() => reloadStoryDemo())
      .catch(() => {
        setIsSaving(false)
      })
  }

  const colorPickerMode = backgroundType === 'gradient' ? ['gradient'] : ['single']

  return (
    <TH.ScreenHeader>
      <TH.HeaderMain>
        <TH.HeaderLeftSide
          onClick={() => {
            setIsOpen(!isOpen)
          }}
        >
          <TH.OpenIcon type={isOpen ? 'down' : 'right'} />
          <TH.HeaderTitle>Background</TH.HeaderTitle>
        </TH.HeaderLeftSide>
        <TH.HeaderRightSide>
          <TH.CheckBox
            checked={isChecked}
            onChange={(checked) => {
              if (checked) {
                setIsOpen(true)
              }
              setIsChecked(checked)
              onSave(checked, backgroundType, backgroundColor, backgroundBlur, wallpaperImage, padding)
            }}
          />
        </TH.HeaderRightSide>
      </TH.HeaderMain>
      {!isOpen ? (
        ''
      ) : (
        <TH.MainWrapper>
          {isChecked ? '' : <TH.Overlay />}
          <TH.MainColumn>
            <TH.TextWrapper>
              <TH.TextTitle>Background type</TH.TextTitle>
              <Radio.Group
                value={backgroundType}
                onChange={(e) => {
                  const v = e.target.value
                  setBackgroundType(v)
                  onSave(isChecked, v, backgroundColor, backgroundBlur, wallpaperImage, padding)
                }}
              >
                <Radio value="color">Solid color</Radio>
                <Radio value="gradient">Gradient</Radio>
                <Radio value="wallpaper">Wallpaper</Radio>
              </Radio.Group>
            </TH.TextWrapper>

            <TH.TextWrapper>
              <TH.TextTitle>Padding (outer demo area)</TH.TextTitle>
              <Slider
                min={0}
                max={120}
                value={padding}
                onChange={(v) => setPadding(v)}
                onChangeComplete={(v) =>
                  onSave(isChecked, backgroundType, backgroundColor, backgroundBlur, wallpaperImage, v)
                }
              />
            </TH.TextWrapper>

            {backgroundType === 'wallpaper' ? (
              <>
                <TH.TextWrapper>
                  <TH.TextTitle>Blur (wallpaper)</TH.TextTitle>
                  <Slider
                    min={0}
                    max={24}
                    value={backgroundBlur}
                    onChange={(v) => setBackgroundBlur(v)}
                    onChangeComplete={(v) =>
                      onSave(isChecked, backgroundType, backgroundColor, v, wallpaperImage, padding)
                    }
                  />
                </TH.TextWrapper>
                <TH.TextWrapper style={{ alignItems: 'flex-start', width: '100%' }}>
                  <TH.TextTitle>Choose wallpaper</TH.TextTitle>
                  <TH.WallpaperTabs
                    tabPlacement="top"
                    size="middle"
                    items={WALLPAPER_CATEGORIES.map((cat) => ({
                      key: cat.id,
                      label: cat.label,
                      children: (
                        <TH.WallpaperGrid>
                          {cat.items.map((item) => {
                            const selected = wallpaperImage === item.fullUrl
                            return (
                              <TH.WallpaperThumb
                                key={item.fullUrl}
                                type="button"
                                $selected={selected}
                                onClick={() => {
                                  setWallpaperImage(item.fullUrl)
                                  onSave(
                                    isChecked,
                                    'wallpaper',
                                    backgroundColor,
                                    backgroundBlur,
                                    item.fullUrl,
                                    padding
                                  )
                                }}
                              >
                                <img src={item.thumbUrl} alt="" />
                              </TH.WallpaperThumb>
                            )
                          })}
                        </TH.WallpaperGrid>
                      )
                    }))}
                  />
                </TH.TextWrapper>
              </>
            ) : (
              <TH.TextWrapper style={{ alignItems: 'flex-start' }}>
                <TH.TextTitle>{backgroundType === 'gradient' ? 'Gradient' : 'Color'}</TH.TextTitle>
                <ColorPicker
                  value={backgroundColor}
                  allowClear
                  mode={colorPickerMode}
                  onChange={(c) => {
                    setBackgroundColor(c)
                  }}
                />
              </TH.TextWrapper>
            )}

            <TH.SaveButton
              loading={isSaving}
              onClick={() =>
                onSave(isChecked, backgroundType, backgroundColor, backgroundBlur, wallpaperImage, padding)
              }
            >
              Save
            </TH.SaveButton>
          </TH.MainColumn>
        </TH.MainWrapper>
      )}
    </TH.ScreenHeader>
  )
}

const TH = {
  WallpaperTabs: styled(Tabs)`
    width: 100%;
    font-family: ${Colors.fontFamily};

   
  `,
  WallpaperGrid: styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
    gap: 8px;
    width: 100%;
    max-height: 280px;
    overflow-y: auto;
    padding: 4px 0;
  `,
  WallpaperThumb: styled.button`
    display: block;
    padding: 0;
    border: 2px solid ${(p) => (p.$selected ? Colors.primaryColor : 'transparent')};
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    background: #eee;
    line-height: 0;
    && img {
      width: 100%;
      height: 72px;
      object-fit: cover;
      display: block;
    }
  `,
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
  MainColumn: styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
    max-width: 520px;
    margin-left: 15px;
  `,
  TextTitle: styled.label`
    margin: 0px;
    font-size: 0.9em;
  `,
  /* div: Tabs and other ant components render block nodes; span breaks layout */
  TextWrapper: styled.div`
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  `,
  SaveButton: styled(Button)`
    width: 105px;
    align-self: flex-start;
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
  `
}

export default Background
