import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Button from 'antd/es/button'
import Input from 'antd/es/input'
import Select from 'antd/es/select'
import Switch from 'antd/es/switch'
import 'antd/es/button/style'
import 'antd/es/input/style'
import 'antd/es/select/style'
import 'antd/es/switch/style'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

const { TextArea } = Input

// Persona tab (§5.5): plain form, PATCH the agent on Save.
function PersonaTab({ agent, voices, onSave }) {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      welcomeMessage: agent.welcomeMessage || '',
      starterQuestions: agent.starterQuestions || [],
      systemPrompt: agent.systemPrompt || '',
      voiceEnabled: !!agent.voiceEnabled,
      voiceId: agent.voiceId || '',
      visitorCapture: {
        enabled: !!(agent.visitorCapture && agent.visitorCapture.enabled),
        requireName: !!(agent.visitorCapture && agent.visitorCapture.requireName),
        requireEmail: !!(agent.visitorCapture && agent.visitorCapture.requireEmail),
      },
      cta: {
        bookMeetingUrl: (agent.cta && agent.cta.bookMeetingUrl) || '',
        startTrialUrl: (agent.cta && agent.cta.startTrialUrl) || '',
      },
    })
  }, [agent])

  if (!form) return null

  const set = (patch) => setForm(prev => ({ ...prev, ...patch }))

  function handleSave() {
    setSaving(true)
    onSave({
      ...form,
      starterQuestions: form.starterQuestions.map(q => q.trim()).filter(Boolean).slice(0, 4),
    }).then(() => setSaving(false)).catch(() => setSaving(false))
  }

  return (
    <S.Wrapper>
      <S.Field>
        <S.Label>Welcome message</S.Label>
        <TextArea
          rows={2}
          value={form.welcomeMessage}
          onChange={(e) => set({ welcomeMessage: e.target.value })}
        />
      </S.Field>

      <S.Field>
        <S.Label>Starter questions (up to 4)</S.Label>
        {form.starterQuestions.map((q, i) => (
          <S.QuestionRow key={i}>
            <Input
              value={q}
              onChange={(e) => set({
                starterQuestions: form.starterQuestions.map((s, j) => j === i ? e.target.value : s),
              })}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => set({ starterQuestions: form.starterQuestions.filter((s, j) => j !== i) })}
            />
          </S.QuestionRow>
        ))}
        {form.starterQuestions.length < 4 && (
          <Button size="small" onClick={() => set({ starterQuestions: [...form.starterQuestions, ''] })}>
            <PlusOutlined /> Add question
          </Button>
        )}
      </S.Field>

      <S.Field>
        <S.Label>Extra system prompt</S.Label>
        <TextArea
          rows={3}
          placeholder="You are a product specialist for Acme. Be concise."
          value={form.systemPrompt}
          onChange={(e) => set({ systemPrompt: e.target.value })}
        />
      </S.Field>

      <S.SwitchRow>
        <S.Label>Voice</S.Label>
        <Switch checked={form.voiceEnabled} onChange={(v) => set({ voiceEnabled: v })} />
      </S.SwitchRow>
      {form.voiceEnabled && (
        <Select
          style={{ width: '100%' }}
          placeholder="Pick a voice"
          value={form.voiceId || undefined}
          onChange={(v) => set({ voiceId: v })}
          options={(voices || []).map(v => ({ value: v.voice_id || v.voiceId || v._id, label: v.name }))}
        />
      )}

      <S.SwitchRow>
        <S.Label>Ask visitors to connect (name/email modal)</S.Label>
        <Switch
          checked={form.visitorCapture.enabled}
          onChange={(v) => set({ visitorCapture: { ...form.visitorCapture, enabled: v } })}
        />
      </S.SwitchRow>
      {form.visitorCapture.enabled && (
        <S.Indent>
          <S.SwitchRow>
            <S.Label>Require name</S.Label>
            <Switch
              size="small"
              checked={form.visitorCapture.requireName}
              onChange={(v) => set({ visitorCapture: { ...form.visitorCapture, requireName: v } })}
            />
          </S.SwitchRow>
          <S.SwitchRow>
            <S.Label>Require email</S.Label>
            <Switch
              size="small"
              checked={form.visitorCapture.requireEmail}
              onChange={(v) => set({ visitorCapture: { ...form.visitorCapture, requireEmail: v } })}
            />
          </S.SwitchRow>
        </S.Indent>
      )}

      <S.Field>
        <S.Label>Book a meeting URL</S.Label>
        <Input
          placeholder="https://calendly.com/..."
          value={form.cta.bookMeetingUrl}
          onChange={(e) => set({ cta: { ...form.cta, bookMeetingUrl: e.target.value } })}
        />
      </S.Field>

      <S.Field>
        <S.Label>Start trial URL</S.Label>
        <Input
          placeholder="https://app.example.com/signup"
          value={form.cta.startTrialUrl}
          onChange={(e) => set({ cta: { ...form.cta, startTrialUrl: e.target.value } })}
        />
      </S.Field>

      <Button type="primary" loading={saving} onClick={handleSave}>
        Save persona
      </Button>
    </S.Wrapper>
  )
}

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 4px;
  `,
  Field: styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  Label: styled.label`
    font-size: 13px;
    color: #374151;
    font-weight: 500;
  `,
  QuestionRow: styled.div`
    display: flex;
    gap: 6px;
  `,
  SwitchRow: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  Indent: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 12px;
    border-left: 2px solid #f3f4f6;
  `,
}

export default PersonaTab
