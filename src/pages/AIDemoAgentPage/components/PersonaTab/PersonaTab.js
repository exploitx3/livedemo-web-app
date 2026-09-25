import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Button from 'antd/es/button'
import Input from 'antd/es/input'
import Radio from 'antd/es/radio'
import Select from 'antd/es/select'
import Switch from 'antd/es/switch'
import 'antd/es/button/style'
import 'antd/es/input/style'
import 'antd/es/radio/style'
import 'antd/es/select/style'
import 'antd/es/switch/style'
import { PlusOutlined, DeleteOutlined, SoundOutlined, CaretRightFilled } from '@ant-design/icons'

const { TextArea } = Input

const PROVIDER_NAMES = { ELEVENLABS: 'ElevenLabs', CARTESIA: 'Cartesia' }

let sampleAudio = null
function playSample(url) {
  if (sampleAudio) sampleAudio.pause()
  sampleAudio = new Audio(url)
  sampleAudio.play().catch(() => {})
}

function countryFlag(code) {
  if (!/^[A-Za-z]{2}$/.test(code || '')) return ''
  return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0)))
}

// Rich dropdown row: play, flag, name, provider, tags, description.
// `text` is what the closed Select shows, `search` is what typing matches.
function voiceOption({ value, name, country, provider, tags, description, sampleUrl, text }) {
  const providerName = PROVIDER_NAMES[provider] || provider
  return {
    value,
    text: text || [countryFlag(country), [name, ...tags, providerName].filter(Boolean).join(' · ')].filter(Boolean).join(' '),
    search: [name, providerName, ...tags, country, description].filter(Boolean).join(' '),
    label: (
      <S.VoiceRow>
        <S.VoicePlay
          type="button"
          aria-label={`Play ${name} sample`}
          disabled={!sampleUrl}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
          onClick={(e) => { e.stopPropagation(); playSample(sampleUrl) }}
        >
          <CaretRightFilled />
        </S.VoicePlay>
        <S.VoiceText>
          <S.VoiceTitle>
            {countryFlag(country) && <span>{countryFlag(country)}</span>}
            <S.VoiceName>{name}</S.VoiceName>
            {providerName && <S.VoiceProvider>{providerName}</S.VoiceProvider>}
            {tags.map(t => <S.VoiceBadge key={t}>{t}</S.VoiceBadge>)}
          </S.VoiceTitle>
          {description && <S.VoiceDescription>{description}</S.VoiceDescription>}
        </S.VoiceText>
      </S.VoiceRow>
    ),
  }
}

// ElevenLabs names read "Branok - Evil & Villainous": short name up top, the
// tagline joins the description line.
const elevenLabsOption = (v) => {
  const labels = v.labels || {}
  const [shortName, ...rest] = String(v.name || '').split(' - ')
  const tagline = rest.join(' - ')
  const description = v.description || labels.description || labels.use_case || ''
  return voiceOption({
    value: v.voice_id || v.voiceId || v._id,
    name: shortName,
    tags: [labels.accent, labels.gender, labels.age].filter(Boolean),
    description: [tagline, description].filter(Boolean).join(' — '),
    sampleUrl: v.preview_url,
    text: [shortName, labels.accent].filter(Boolean).join(' · '),
  })
}

const anamOption = (v) => voiceOption({
  value: v.id,
  name: v.displayName,
  country: v.country,
  provider: v.provider,
  tags: v.tags || [],
  description: v.description,
  sampleUrl: v.sampleUrl,
})

// Persona tab (§5.5): plain form, PATCH the agent on Save.
function PersonaTab({ agent, voices, avatars, anamVoices, onSave }) {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      welcomeMessage: agent.welcomeMessage || '',
      starterQuestions: agent.starterQuestions || [],
      systemPrompt: agent.systemPrompt || '',
      voiceEnabled: !!agent.voiceEnabled,
      voiceId: agent.voiceId || '',
      avatarsEnabled: !!agent.avatarsEnabled,
      anamAvatarId: agent.anamAvatarId || '',
      avatarVoice: agent.avatarVoice || 'elevenlabs',
      anamVoiceId: agent.anamVoiceId || '',
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
  const selectedAvatar = (avatars || []).find(a => a.id === form.anamAvatarId)
  const selectedVoice = (voices || []).find(v => (v.voice_id || v.voiceId || v._id) === form.voiceId)
  const selectedAnamVoice = (anamVoices || []).find(v => v.id === form.anamVoiceId)

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
        <S.Label>ElevenLabs Voice</S.Label>
        <Switch checked={form.voiceEnabled} onChange={(v) => set({ voiceEnabled: v })} />
      </S.SwitchRow>
      {form.voiceEnabled && (
        <S.QuestionRow>
          <Select
            style={{ flex: 1 }}
            placeholder="Pick a voice"
            showSearch
            optionFilterProp="search"
            optionLabelProp="text"
            listHeight={400}
            value={form.voiceId || undefined}
            onChange={(v) => set({ voiceId: v })}
            options={(voices || []).map(elevenLabsOption)}
          />
          
        </S.QuestionRow>
      )}

      <S.SwitchRow>
        <S.Label>Avatar</S.Label>
        <Switch checked={form.avatarsEnabled} onChange={(v) => set({ avatarsEnabled: v })} />
      </S.SwitchRow>
      {form.avatarsEnabled && (
        <S.Field>
          <Select
            style={{ width: '100%' }}
            placeholder={avatars === null ? 'Loading avatars…' : 'Pick an avatar'}
            loading={avatars === null}
            allowClear
            showSearch
            optionFilterProp="title"
            value={form.anamAvatarId || undefined}
            onChange={(v) => set({ anamAvatarId: v || '' })}
            options={(avatars || []).map(a => ({
              value: a.id,
              title: [a.displayName, a.variantName].filter(Boolean).join(' '),
              label: (
                <S.AvatarOption>
                  <img src={a.imageUrl} alt="" />
                  {[a.displayName, a.variantName].filter(Boolean).join(' · ')}
                </S.AvatarOption>
              ),
            }))}
          />
          {selectedAvatar && <S.AvatarPreview src={selectedAvatar.imageUrl} alt="" />}

          <S.Label>Avatar voice</S.Label>
          <Radio.Group value={form.avatarVoice} onChange={(e) => set({ avatarVoice: e.target.value })}>
            <Radio value="elevenlabs">ElevenLabs voice (selected above)</Radio>
            <Radio value="anam">Anam voice</Radio>
          </Radio.Group>
          {form.avatarVoice === 'anam' && (
            <S.QuestionRow>
              <Select
                style={{ flex: 1 }}
                placeholder={anamVoices === null ? 'Loading voices…' : 'Pick an Anam voice'}
                loading={anamVoices === null}
                showSearch
                optionFilterProp="search"
                optionLabelProp="text"
                listHeight={400}
                value={form.anamVoiceId || undefined}
                onChange={(v) => set({ anamVoiceId: v })}
                options={(anamVoices || []).map(anamOption)}
              />
            </S.QuestionRow>
          )}

          {!form.voiceEnabled && (
            <S.Hint>Turn on Voice — the avatar only speaks when voice is on.</S.Hint>
          )}
          {form.voiceEnabled && form.avatarVoice === 'anam' && !form.anamVoiceId && (
            <S.Hint>Pick an Anam voice, otherwise the ElevenLabs voice is used.</S.Hint>
          )}
        </S.Field>
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
  AvatarOption: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;

    img {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
    }
  `,
  VoiceRow: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 0;
    min-width: 0;
  `,
  VoicePlay: styled.button`
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: #f3f4f6;
    color: #525252;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: #e5e7eb;
      color: #111827;
    }

    &:disabled {
      opacity: 0.4;
      cursor: default;
    }
  `,
  VoiceText: styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  `,
  VoiceTitle: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    line-height: 16px;
  `,
  VoiceName: styled.span`
    font-size: 13px;
    font-weight: 500;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  VoiceProvider: styled.span`
    flex-shrink: 0;
    font-size: 11px;
    color: #6b7280;
  `,
  VoiceBadge: styled.span`
    flex-shrink: 0;
    padding: 1px 6px;
    border-radius: 4px;
    background: #f0f0f0;
    color: #737373;
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  `,
  VoiceDescription: styled.span`
    font-size: 12px;
    color: #a3a3a3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  AvatarPreview: styled.img`
    width: 100%;
    aspect-ratio: 3 / 2;
    object-fit: cover;
    border-radius: 8px;
  `,
  Hint: styled.span`
    font-size: 12px;
    color: #9ca3af;
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
