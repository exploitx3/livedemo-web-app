import React, { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import Card from 'antd/es/card'
import Col from 'antd/es/col'
import Skeleton from 'antd/es/skeleton'

import 'antd/es/card/style'
import 'antd/es/col/style'
import 'antd/es/skeleton/style'

import styled from 'styled-components'
import mainColors from '../../../../constants/mainColors'

const AIRecordingsView = memo((props) => {
  const navigate = useNavigate()

  const cards = useMemo(
    () => generateAutoRecordingCards(props.autoRecordings, navigate),
    [props.autoRecordings, navigate]
  )

  return (
    <S.Wrapper>
      <S.TitleWrapper />
      <React.Fragment>
        {cards}
      </React.Fragment>
    </S.Wrapper>
  )
})

function generateAutoRecordingCards(autoRecordings, navigate) {
  const loading = autoRecordings === null

  if (loading) {
    return [...Array(6).keys()].map((key) => (
      <S.Col key={key} span={4}>
        <Card
          loading={loading}
          style={{ width: 150 }}
          cover={
            <div className={'ant-skeleton ant-skeleton-active'}>
              <span style={{ width: '100%', display: 'block', paddingTop: '20px' }}
                className={'ant-skeleton-header'}>
                <span style={{ display: 'block', margin: '0 auto', width: '55px', height: '35px' }}
                  className={'ant-skeleton-avatar ant-skeleton-avatar-lg ant-skeleton-avatar-square'} />
              </span>
            </div>
          }
        >
          <Card.Meta title="Loading..." />
        </Card>
      </S.Col>
    ))
  }

  if (autoRecordings.length === 0) {
    return (
      <S.EmptyRow>
        <S.EmptyText>No AI Recordings found for this workspace.</S.EmptyText>
      </S.EmptyRow>
    )
  }

  return (
    <S.Container>
      {autoRecordings.map((recording) => {
        const recordingName = (recording.aiName ? recording.aiName : recording.firstDemoSuggestion?.name) || 'Untitled Recording';

        return (
        <S.RecordingCard
          key={recording._id}
          onClick={() => navigate(`/workspace/${recording.workspaceId}/auto-recording/${recording._id}`)}
        >
          {recording.firstDemoSuggestion?.thumbnailImageData && (
            <S.Thumbnail src={recording.firstDemoSuggestion.thumbnailImageData} alt="" />
          )}
          <S.RecordingTitle title={recordingName}>{recordingName}</S.RecordingTitle>
          <S.RecordingMeta>
            {recording.createdAt && (
              <S.MetaText>{new Date(recording.createdAt).toLocaleDateString()}</S.MetaText>
            )}
            {recording.status && (
              <S.StatusBadge status={recording.status}>{recording.status}</S.StatusBadge>
            )}
          </S.RecordingMeta>
        </S.RecordingCard>
        )})}

    </S.Container>
  )
}

export default AIRecordingsView

const S = {}

S.Wrapper = styled.div``

S.TitleWrapper = styled.span`
  display: flex;
  justify-content: end;
`

S.Col = styled(Col)`
  float: unset !important;
  display: inline-block !important;
  margin-top: 20px;

  @media only screen and (max-width: 992px) {
    display: block !important;
  }

  && .ant-card {
    width: 150px;
    margin: 0px auto;
    height: 225px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  && .ant-card-cover {
    flex-grow: 1;
  }

  && .ant-card-body {
    padding: 12px;
  }
`

S.Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  align-items: start;
  text-align: left;
  margin-top: 20px;
`

S.RecordingCard = styled.div`
  background: #f8f9ff;
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 12px rgba(16, 112, 255, 0.15);
    border-color: ${mainColors.primaryColor};
  }
`

S.Thumbnail = styled.img`
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 5px;
  display: block;
  margin-bottom: 8px;
`

S.RecordingTitle = styled.div`
  font-family: ${mainColors.fontFamily};
  font-size: 0.95em;
  color: #111;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

S.RecordingMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

S.MetaText = styled.span`
  font-family: ${mainColors.fontFamily};
  font-size: 0.8em;
  color: #888;
`

S.StatusBadge = styled.span`
  font-family: ${mainColors.fontFamily};
  font-size: 0.75em;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: capitalize;
  background: ${({ status }) =>
    status === 'complete' || status === 'completed' ? '#e6f7ed' :
      status === 'in_progress' ? '#fff7e6' :
        '#f0f0f0'};
  color: ${({ status }) =>
    status === 'complete' || status === 'completed' ? '#389e0d' :
      status === 'in_progress' ? '#d46b08' :
        '#666'};
`

S.EmptyRow = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin-top: 20px;
`

S.EmptyText = styled.p`
  margin: 0;
  font-family: ${mainColors.fontFamily};
  color: #111;
`

S.Skeleton = styled(Skeleton)`
  && {
    width: 90%;
    height: 265px;
  }
`
