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
            <S.Body>
              <S.Name title={story.name}>{story.name || 'Untitled demo'}</S.Name>
              <S.Meta>
                {!story.isPublished && <Tag style={{ margin: 0 }}>draft</Tag>}
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
              </S.Meta>
            </S.Body>
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
    gap: 12px;
    border: 1px solid ${p => (p.$isDefault ? mainColors.primaryColor : '#e5e7eb')};
    border-radius: 10px;
    padding: 12px 14px;
    background: ${p => (p.$isDefault ? '#f5f3ff' : '#ffffff')};
    transition: border-color 0.15s;

    &:hover {
      border-color: ${p => (p.$isDefault ? mainColors.primaryColor : '#d1d5db')};
    }
  `,
  Thumb: styled.img`
    flex-shrink: 0;
    width: 72px;
    height: 45px;
    object-fit: cover;
    border-radius: 6px;
    background: #f3f4f6;
  `,
  ThumbPlaceholder: styled.div`
    flex-shrink: 0;
    width: 72px;
    height: 45px;
    border-radius: 6px;
    background: #f3f4f6;
  `,
  Body: styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  Meta: styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  `,
  Name: styled.div`
    font-size: 13.5px;
    font-weight: 500;
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
