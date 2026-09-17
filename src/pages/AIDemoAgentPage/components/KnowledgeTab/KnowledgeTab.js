import React, { useState } from 'react'
import styled from 'styled-components'
import Button from 'antd/es/button'
import Dropdown from 'antd/es/dropdown'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import Switch from 'antd/es/switch'
import Tag from 'antd/es/tag'
import Upload from 'antd/es/upload'
import 'antd/es/button/style'
import 'antd/es/dropdown/style'
import 'antd/es/input/style'
import 'antd/es/modal/style'
import 'antd/es/switch/style'
import 'antd/es/tag/style'
import 'antd/es/upload/style'
import { PlusOutlined, DeleteOutlined, ReloadOutlined, InboxOutlined } from '@ant-design/icons'

const { TextArea } = Input
const { Dragger } = Upload

const STATUS_COLORS = {
  pending: 'default',
  indexing: 'processing',
  ready: 'success',
  error: 'error',
}

// Knowledge tab — the whole reason the editor exists (§5.3). Sources are
// CRUD'd here; chunks are backend-only and appear as count + status.
function KnowledgeTab({ sources, onCreate, onPatch, onDelete, onReindex, onReindexAll }) {
  const [addType, setAddType] = useState(null) // 'text' | 'faq' | 'url' | 'file'
  const [title, setTitle] = useState('')
  const [rawText, setRawText] = useState('')
  const [url, setUrl] = useState('')
  const [faqPairs, setFaqPairs] = useState([{ q: '', a: '' }])
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  function resetForm() {
    setAddType(null)
    setTitle('')
    setRawText('')
    setUrl('')
    setFaqPairs([{ q: '', a: '' }])
    setFile(null)
    setSaving(false)
  }

  function handleSave() {
    setSaving(true)
    let payload
    if (addType === 'text') payload = { type: 'text', title, rawText }
    else if (addType === 'url') payload = { type: 'url', title, url }
    else if (addType === 'faq') payload = { type: 'faq', title, faq: faqPairs.filter(p => p.q || p.a) }
    else if (addType === 'file') {
      payload = new FormData()
      payload.append('type', 'file')
      payload.append('title', title)
      payload.append('file', file)
    }

    onCreate(payload)
      .then(resetForm)
      .catch(() => setSaving(false))
  }

  const canSave = addType === 'text' ? !!rawText.trim()
    : addType === 'url' ? !!url.trim()
    : addType === 'faq' ? faqPairs.some(p => p.q.trim() && p.a.trim())
    : addType === 'file' ? !!file
    : false

  const addMenuItems = [
    { key: 'text', label: 'Paste text' },
    { key: 'faq', label: 'FAQ' },
    { key: 'file', label: 'Upload file (pdf, md, txt, html)' },
    { key: 'url', label: 'URL' },
  ]

  return (
    <S.Wrapper>
      <S.Toolbar>
        <Dropdown
          menu={{ items: addMenuItems, onClick: ({ key }) => setAddType(key) }}
          trigger={['click']}
        >
          <Button type="primary" icon={<PlusOutlined />}>Add source</Button>
        </Dropdown>
        <Button icon={<ReloadOutlined />} onClick={onReindexAll} disabled={!sources || !sources.length}>
          Reindex all
        </Button>
      </S.Toolbar>

      {(!sources || sources.length === 0) && (
        <S.Empty>No knowledge yet. Paste text, upload a file, or add an FAQ — the agent answers only from what you add here.</S.Empty>
      )}

      {(sources || []).map((source) => (
        <S.SourceRow key={source._id}>
          <S.SourceMain>
            <S.SourceTitle>{source.title || '(untitled)'}</S.SourceTitle>
            <S.SourceMeta>
              <Tag>{source.type}</Tag>
              <Tag color={STATUS_COLORS[source.status] || 'default'}>{source.status}</Tag>
              {source.status === 'ready' && <S.ChunkCount>{source.chunkCount} chunks</S.ChunkCount>}
              {source.status === 'error' && <S.ErrorMsg title={source.errorMessage}>{source.errorMessage}</S.ErrorMsg>}
            </S.SourceMeta>
          </S.SourceMain>
          <S.SourceActions>
            <Switch
              size="small"
              checked={source.enabled !== false}
              onChange={(checked) => onPatch(source._id, { enabled: checked })}
            />
            {source.type !== 'demo' && (
              <Button size="small" type="text" icon={<ReloadOutlined />} onClick={() => onReindex(source._id)} />
            )}
            {source.type !== 'demo' && (
              <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(source._id)} />
            )}
          </S.SourceActions>
        </S.SourceRow>
      ))}

      <Modal
        open={!!addType}
        title={addMenuItems.find(i => i.key === addType)?.label}
        onCancel={resetForm}
        onOk={handleSave}
        okText="Save"
        okButtonProps={{ disabled: !canSave, loading: saving }}
      >
        <S.FormCol>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

          {addType === 'text' && (
            <TextArea rows={8} placeholder="Paste your content..." value={rawText} onChange={(e) => setRawText(e.target.value)} />
          )}

          {addType === 'url' && (
            <Input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
          )}

          {addType === 'faq' && (
            <React.Fragment>
              {faqPairs.map((pair, i) => (
                <S.FaqPair key={i}>
                  <Input
                    placeholder="Question"
                    value={pair.q}
                    onChange={(e) => setFaqPairs(prev => prev.map((p, j) => j === i ? { ...p, q: e.target.value } : p))}
                  />
                  <TextArea
                    rows={2}
                    placeholder="Answer"
                    value={pair.a}
                    onChange={(e) => setFaqPairs(prev => prev.map((p, j) => j === i ? { ...p, a: e.target.value } : p))}
                  />
                </S.FaqPair>
              ))}
              <Button size="small" onClick={() => setFaqPairs(prev => [...prev, { q: '', a: '' }])}>
                <PlusOutlined /> Add pair
              </Button>
            </React.Fragment>
          )}

          {addType === 'file' && (
            <Dragger
              beforeUpload={(f) => {
                setFile(f)
                return false // don't auto-upload; we send it on Save
              }}
              maxCount={1}
              onRemove={() => setFile(null)}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Click or drag a pdf / md / txt / html file</p>
            </Dragger>
          )}
        </S.FormCol>
      </Modal>
    </S.Wrapper>
  )
}

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px;
  `,
  Toolbar: styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
  `,
  Empty: styled.p`
    color: #6b7280;
    font-size: 13px;
    line-height: 1.5;
  `,
  SourceRow: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px 12px;
  `,
  SourceMain: styled.div`
    min-width: 0;
  `,
  SourceTitle: styled.div`
    font-size: 13px;
    font-weight: 600;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  SourceMeta: styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
    flex-wrap: wrap;
  `,
  ChunkCount: styled.span`
    font-size: 12px;
    color: #6b7280;
  `,
  ErrorMsg: styled.span`
    font-size: 12px;
    color: #ef4444;
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  SourceActions: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
  `,
  FormCol: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 12px;
  `,
  FaqPair: styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    border: 1px solid #f3f4f6;
    border-radius: 8px;
    padding: 8px;
  `,
}

export default KnowledgeTab
