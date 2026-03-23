// Compatibility wrapper for antd Icon component
// In antd v5+, Icon was moved to @ant-design/icons
// This wrapper provides backward compatibility for <Icon type="xxx"/> usage
import React from 'react'
import * as icons from '@ant-design/icons'

const IconMap = {
  'left': icons.LeftOutlined,
  'right': icons.RightOutlined,
  'share-alt': icons.ShareAltOutlined,
  'save': icons.SaveOutlined,
  'delete': icons.DeleteOutlined,
  'user': icons.UserOutlined,
  'filter': icons.FilterFilled,
  'slack': icons.SlackOutlined,
  'fund': icons.FundOutlined,
  'deployment-unit': icons.DeploymentUnitOutlined,
  'fire': icons.FireOutlined,
  'setting': icons.SettingOutlined,
  'credit-card': icons.CreditCardOutlined,
  'logout': icons.LogoutOutlined,
  'edit': icons.EditOutlined,
  'down': icons.DownOutlined,
  'picture': icons.PictureOutlined,
  'video-camera': icons.VideoCameraOutlined,
  'ellipsis': icons.EllipsisOutlined,
  'arrow-right': icons.ArrowRightOutlined,
  'audio': icons.AudioOutlined,
  'thunderbolt': icons.ThunderboltOutlined,
  'upload': icons.UploadOutlined,
  'sync': icons.SyncOutlined,
  'check': icons.CheckOutlined,
  'question-circle': icons.QuestionCircleOutlined,
  'lock': icons.LockOutlined,
  'calendar': icons.CalendarOutlined,
  'download': icons.DownloadOutlined,
  'check-circle': icons.CheckCircleOutlined,
  'api': icons.ApiOutlined,
  'idcard': icons.IdcardOutlined,
  'bg-colors': icons.BgColorsOutlined,
  'plus-square': icons.PlusSquareOutlined,
}

const Icon = ({ type, theme, ...props }) => {
  const IconComponent = IconMap[type]
  
  if (!IconComponent) {
    console.warn(`Icon type "${type}" not found in IconMap. Please add it to the map.`)
    // Return a placeholder icon or null
    return null
  }

  // Handle theme prop - in antd v6+, we use Filled/Outlined/TwoTone variants
  // Convert kebab-case to PascalCase: "plus-square" -> "PlusSquare"
  const toPascalCase = (str) => {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
              .replace(/^[a-z]/, (g) => g.toUpperCase())
  }
  
  if (theme === 'filled') {
    const pascalName = toPascalCase(type)
    const FilledIcon = icons[`${pascalName}Filled`] || IconComponent
    return <FilledIcon {...props} />
  }

  if (theme === 'twoTone') {
    const pascalName = toPascalCase(type)
    const TwoToneIcon = icons[`${pascalName}TwoTone`] || IconComponent
    return <TwoToneIcon {...props} />
  }

  return <IconComponent {...props} />
}

export default Icon

