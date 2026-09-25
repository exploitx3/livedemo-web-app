import React from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Modal from 'antd/es/modal'
import Switch from 'antd/es/switch'
import 'antd/es/button/style'
import 'antd/es/card/style'
import 'antd/es/modal/style'
import 'antd/es/switch/style'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import mainColors from '../../../../constants/mainColors'
import Spinner from '../../../../components/Spinner/Spinner'

const { confirm } = Modal

// Card grid for the AI Agents tab (§5.1). Click opens the agent editor.
function AIAgentsView({ agents, workspaceId, onCreate, onDelete, onSetPublished }) {
  const navigate = useNavigate()

  if (agents === null) {
    return <S.SpinnerWrapper><Spinner /></S.SpinnerWrapper>
  }

  return (
    <S.Grid>
      <S.CreateCard onClick={onCreate}>
        <PlusOutlined style={{ fontSize: 22 }} />
        <span>New AI Demo Agent</span>
      </S.CreateCard>

      {agents.map((agent) => (
        <S.AgentCard
          key={agent._id}
          hoverable
          onClick={() => navigate(`/workspace/${workspaceId}/aidemoagent/${agent._id}`)}
          cover={
            agent.avatarUrl
              ? <S.Avatar src={agent.avatarUrl} alt="" />
              : <S.AvatarPlaceholder>{(agent.name || 'A')[0].toUpperCase()}</S.AvatarPlaceholder>
          }
        >
          <S.CardName>{agent.name || 'Untitled agent'}</S.CardName>
          <S.CardFooter onClick={(e) => e.stopPropagation()}>
            <S.PublishWrap>
              <Switch
                size="small"
                checked={agent.isPublished}
                onChange={(checked) => onSetPublished(agent, checked)}
              />
              <S.PublishLabel>{agent.isPublished ? 'Published' : 'Draft'}</S.PublishLabel>
            </S.PublishWrap>
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => {
                confirm({
                  title: `Are you sure you want to delete "${agent.name}"?`,
                  okText: 'Confirm',
                  okButtonProps: { danger: true },
                  cancelText: 'Cancel',
                  onOk: () => onDelete(agent),
                })
              }}
            />
          </S.CardFooter>
        </S.AgentCard>
      ))}
    </S.Grid>
  )
}

const S = {
  Grid: styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    padding: 20px 30px;
  `,
  CreateCard: styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 210px;
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    background: transparent;
    color: ${mainColors.primaryColor};
    font-size: 14px;
    cursor: pointer;

    &:hover {
      border-color: ${mainColors.primaryColor};
    }
  `,
  AgentCard: styled(Card)`
    && {
      border-radius: 12px;
      overflow: hidden;

    }

    && .ant-card-body {
      padding: 12px 14px;
    }
  `,
  Avatar: styled.img`
    height: 120px;
    object-fit: cover;
  `,
  AvatarPlaceholder: styled.div`
    height: 120px;
    display: flex !important;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, ${mainColors.primaryColor} 0%, ${mainColors.primaryColorDarker} 100%);
    color: white;
    font-size: 2.5rem;
    font-weight: 600;
    text-transform: uppercase;
  `,
  CardName: styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  CardFooter: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
  `,
  PublishWrap: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
  `,
  PublishLabel: styled.span`
    font-size: 12px;
    color: #6b7280;
  `,
  SpinnerWrapper: styled.div`
    display: flex;
    justify-content: center;
    padding: 60px;
  `,
}

export default AIAgentsView
