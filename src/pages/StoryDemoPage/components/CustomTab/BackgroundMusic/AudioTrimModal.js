import React, { useEffect, useRef, useState } from 'react'
import Modal from 'antd/es/modal'
import Slider from 'antd/es/slider'
import Button from 'antd/es/button'
import styled from 'styled-components'
import Colors from '../../../../../constants/mainColors'

const MAX_BYTES = 5 * 1024 * 1024

function encodeWAV(audioBuffer, startSec, endSec) {
  const sampleRate = audioBuffer.sampleRate
  const numChannels = audioBuffer.numberOfChannels
  const startSample = Math.floor(startSec * sampleRate)
  const endSample = Math.floor(endSec * sampleRate)
  const numSamples = endSample - startSample

  const interleaved = new Float32Array(numSamples * numChannels)
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      interleaved[i * numChannels + ch] = audioBuffer.getChannelData(ch)[startSample + i] || 0
    }
  }

  const pcm = new Int16Array(interleaved.length)
  for (let i = 0; i < interleaved.length; i++) {
    const s = Math.max(-1, Math.min(1, interleaved[i]))
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }

  const dataSize = pcm.byteLength
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  const w = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)) }

  w(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); w(8, 'WAVE')
  w(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * 2, true)
  view.setUint16(32, numChannels * 2, true); view.setUint16(34, 16, true)
  w(36, 'data'); view.setUint32(40, dataSize, true)
  new Uint8Array(buffer, 44).set(new Uint8Array(pcm.buffer))

  return new Blob([buffer], { type: 'audio/wav' })
}

function drawWaveform(canvas, buffer) {
  const data = buffer.getChannelData(0)
  const W = canvas.width
  const H = canvas.height
  const ctx = canvas.getContext('2d')
  const step = Math.ceil(data.length / W)

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = Colors.primaryColor || '#1070ff'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let i = 0; i < W; i++) {
    let min = 1, max = -1
    for (let j = 0; j < step; j++) {
      const v = data[i * step + j] || 0
      if (v < min) min = v
      if (v > max) max = v
    }
    ctx.moveTo(i, ((1 + min) / 2) * H)
    ctx.lineTo(i, ((1 + max) / 2) * H)
  }
  ctx.stroke()
}

const fmt = (sec) => {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const AudioTrimModal = ({ file, onConfirm, onCancel }) => {
  const [audioBuffer, setAudioBuffer] = useState(null)
  const [duration, setDuration] = useState(0)
  const [range, setRange] = useState([0, 100])
  const [isDecoding, setIsDecoding] = useState(true)
  const [isTrimming, setIsTrimming] = useState(false)
  const [objectUrl, setObjectUrl] = useState(null)
  const canvasRef = useRef(null)

  const startSec = (range[0] / 100) * duration
  const endSec = (range[1] / 100) * duration
  const trimSec = endSec - startSec
  const estimatedBytes = audioBuffer
    ? Math.floor(trimSec * audioBuffer.sampleRate) * audioBuffer.numberOfChannels * 2 + 44
    : 0
  const estimatedMB = (estimatedBytes / (1024 * 1024)).toFixed(2)
  const isUnderLimit = estimatedBytes > 0 && estimatedBytes <= MAX_BYTES

  useEffect(() => {
    if (!file) {
      return
    }
    debugger
    const url = URL.createObjectURL(file)
    setObjectUrl(url)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const buf = await ctx.decodeAudioData(e.target.result)
        setAudioBuffer(buf)
        setDuration(buf.duration)
        setRange([0, 100])
      } catch (err) {
        console.error('audio decode failed', err)
      } finally {
        setIsDecoding(false)
      }
    }
    reader.readAsArrayBuffer(file)

    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (audioBuffer && canvasRef.current) {
      drawWaveform(canvasRef.current, audioBuffer)
    }
  }, [audioBuffer])

  async function handleConfirm() {
    if (!audioBuffer || !isUnderLimit) return
    setIsTrimming(true)
    try {
      const blob = encodeWAV(audioBuffer, startSec, endSec)
      const trimmedFile = new File(
        [blob],
        file.name.replace(/\.[^.]+$/, '_trimmed.wav'),
        { type: 'audio/wav' }
      )
      await onConfirm(trimmedFile)
    } catch (err) {
      console.error('trim/upload failed', err)
    } finally {
      setIsTrimming(false)
    }
  }

  return (
    <Modal
      open={true}
      title="File exceeds 5MB — Select a time range to trim"
      onCancel={onCancel}
      footer={null}
      width={560}
    >
      {isDecoding ? (
        <TM.Center>Decoding audio…</TM.Center>
      ) : (
        <>
          <TM.WaveformWrap>
            <canvas
              ref={canvasRef}
              width={512}
              height={72}
              style={{ width: '100%', borderRadius: 6, display: 'block' }}
            />
          </TM.WaveformWrap>

          <TM.SliderWrap>
            <Slider
              range
              min={0}
              max={100}
              value={range}
              onChange={setRange}
              tooltip={{ formatter: (v) => fmt((v / 100) * duration) }}
            />
          </TM.SliderWrap>

          <TM.Info>
            <TM.InfoItem>Start <b>{fmt(startSec)}</b></TM.InfoItem>
            <TM.InfoItem>End <b>{fmt(endSec)}</b></TM.InfoItem>
            <TM.InfoItem>Duration <b>{fmt(trimSec)}</b></TM.InfoItem>
            <TM.SizeTag $ok={isUnderLimit}>
              ~{estimatedMB} MB {isUnderLimit ? '✓ under 5MB' : '— too large'}
            </TM.SizeTag>
          </TM.Info>

          {objectUrl && (
            <TM.PreviewRow>
              <audio controls src={objectUrl} style={{ width: '100%' }} />
            </TM.PreviewRow>
          )}

          <TM.Footer>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="primary"
              disabled={!isUnderLimit || trimSec <= 0}
              loading={isTrimming}
              onClick={handleConfirm}
            >
              Trim & Upload
            </Button>
          </TM.Footer>
        </>
      )}
    </Modal>
  )
}

const TM = {
  Center: styled.div`
    text-align: center;
    padding: 32px;
    color: #666;
    font-size: 0.9em;
  `,
  WaveformWrap: styled.div`
    margin-bottom: 8px;
    border-radius: 6px;
    overflow: hidden;
  `,
  SliderWrap: styled.div`
    padding: 0 4px;
    margin-bottom: 4px;
  `,
  Info: styled.div`
    display: flex;
    gap: 12px;
    align-items: center;
    font-size: 0.82em;
    margin-bottom: 12px;
    flex-wrap: wrap;
  `,
  InfoItem: styled.span`
    color: #555;
    && b { color: #111; }
  `,
  SizeTag: styled.span`
    margin-left: auto;
    font-weight: 600;
    font-size: 0.85em;
    color: ${({ $ok }) => $ok ? '#059669' : '#dc2626'};
  `,
  PreviewRow: styled.div`
    margin-bottom: 16px;
  `,
  Footer: styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
  `,
}

export default AudioTrimModal
