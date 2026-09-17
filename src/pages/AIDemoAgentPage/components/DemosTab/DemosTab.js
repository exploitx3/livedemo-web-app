import React from 'react'
import styled from 'styled-components'
import Checkbox from 'antd/es/checkbox'
import Tag from 'antd/es/tag'
import 'antd/es/checkbox/style'
import 'antd/es/tag/style'
import { Link } from 'react-router-dom'
import mainColors from '../../../../constants/mainColors'

// Demos tab (§5.4): import workspace Stories by reference. No cloning, no
// Story edits — selection saves allowedDemoIds; the backend derives one
// read-only knowledge source per selected story.
function DemosTab({
  stories,
  allowedDemoIds,
  defaultDemoId,
  workspaceId,
  onChange,
  onDefaultChange,
}) {
  const selected = (allowedDemoIds || []).map(String)
  const defaultId = defaultDemoId ? String(defaultDemoId) : ''

  function toggle(storyId, checked) {
    const idStr = String(storyId)
    const next = checked
      ? [...selected, idStr]
      : selected.filter(id => id !== idStr)
    onChange(next)
  }

  return (
    <S.Wrapper>
      <S.Hint>
        Selected demos are what the agent can open. Empty selection = all published demos in this workspace.
        Click <strong>Set default</strong> on any demo to load it automatically when a session starts.
      </S.Hint>

      {(stories || []).map((story) => {
        const idStr = String(story._id)
        const isSelected = selected.includes(idStr)
        const isDefault = defaultId === idStr
        const thumb = story.thumbnailImageUrl
          || (story.screens && story.screens[0] && story.screens[0].imageUrl)
          || ''

        return (
          <S.Row key={story._id} $isDefault={isDefault}>
            <Checkbox
              checked={isSelected}
              onChange={(e) => toggle(story._id, e.target.checked)}
            />
            {thumb ? <S.Thumb src={thumb} alt="" /> : <S.ThumbPlaceholder />}
            <S.Name>{story.name || 'Untitled demo'}</S.Name>
            {!story.isPublished && <Tag>draft</Tag>}
            <S.DefaultButton
              type="button"
              $active={isDefault}
              onClick={() => onDefaultChange(isDefault ? null : story._id)}
            >
              {isDefault ? 'Default' : 'Set default'}
            </S.DefaultButton>
            <S.EditLink to={`/workspace/${workspaceId}/storydemo/${story._id}`}>
              Open in editor
            </S.EditLink>
          </S.Row>
        )
      })}

      {(!stories || stories.length === 0) && (
        <S.Hint>No demos in this workspace yet. Record one first.</S.Hint>
      )}
    </S.Wrapper>
  )
}

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 4px;
  `,
  Hint: styled.p`
    color: #6b7280;
    font-size: 12.5px;
    line-height: 1.5;
    margin: 0 0 6px 0;
  `,
  Row: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid ${p => (p.$isDefault ? mainColors.primaryColor : '#e5e7eb')};
    border-radius: 10px;
    padding: 8px 10px;
    background: ${p => (p.$isDefault ? '#f5f3ff' : '#ffffff')};
  `,
  Thumb: styled.img`
    width: 48px;
    height: 30px;
    object-fit: cover;
    border-radius: 4px;
    background: #f3f4f6;
  `,
  ThumbPlaceholder: styled.div`
    width: 48px;
    height: 30px;
    border-radius: 4px;
    background: #f3f4f6;
  `,
  Name: styled.div`
    flex: 1;
    font-size: 13px;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  DefaultButton: styled.button`
    border: 1px solid ${p => (p.$active ? mainColors.primaryColor : '#d1d5db')};
    background: ${p => (p.$active ? mainColors.primaryColor : '#ffffff')};
    color: ${p => (p.$active ? '#ffffff' : '#374151')};
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  `,
  EditLink: styled(Link)`
    font-size: 12px;
    white-space: nowrap;
  `,
}

export default DemosTab
