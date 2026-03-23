import React from 'react'
import moment from 'moment'
//import { Icon, List, Pagination } from 'antd'

import Icon from '../../../../components/Icon/Icon'
import List from 'antd/es/list'
import Pagination from 'antd/es/pagination'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import NeutralIcon from '../../../../static/images/normal.svg'
import FearIcon from '../../../../static/images/fear.svg'
import JoyIcon from '../../../../static/images/smile.svg'
import SadIcon from '../../../../static/images/sad-blue.svg'
import AngerIcon from '../../../../static/images/sad.svg'
import { capitalize } from '../../../../utils/helperFunctions'


const EmotionIcons = {
  Neutral: NeutralIcon,
  Fear: FearIcon,
  Joy: JoyIcon,
  Anger: AngerIcon,
  Sadness: SadIcon
}

const ReportsView = ({ reports, page, pages, total, onPageChange, limit }) => {
  const navigate = useNavigate()

  function renderPagination(totalItems, currentPage, pageSize, onChange) {


    function itemRender(current, type, originalElement) {
      if (type === 'prev') {
        return <a>Previous</a>
      }
      if (type === 'next') {
        return <a>Next</a>
      }
      return originalElement
    }

    return (
      <Pagination current={currentPage} onChange={onChange} total={totalItems} pageSize={pageSize}
                  itemRender={itemRender}/>
    )
  }


  // const workspaceMembersBySlackId = workspace.members.reduce((accum, member) => {
  //   accum[member.slackId] = member
  //   return accum
  // }, {})

  return (

    <S.ReportsWrapper>
      <S.ReportsList
        itemLayout="horizontal"
        dataSource={reports}
        renderItem={report => {


          // let conversationMembersImages = report.userSlackIds.map(memberDoc => {
          //   if (memberDoc.profile) {
          //
          //     return memberDoc.profile.image72
          //   } else {
          //
          //     return getAnonImageFromAvatarNumber(memberDoc.avatarNumber)
          //   }
          // })

          // let conversationMembersString = conversation.userSlackIds.map(memberDoc => {
          //   if (memberDoc.profile) {
          //     return capitalize(
          //       ((memberDoc.profile &&
          //         (memberDoc.profile.displayName || memberDoc.profile.realName)) || memberDoc.name)
          //     )
          //   } else {
          //     return memberDoc.name
          //   }
          // }).join(', ')

          let endDate = moment(report.endTimestamp)
          let startDate = moment(report.startTimestamp)
          let convLengthDuration = moment.duration(endDate.diff(startDate))
          let convLength = Math.ceil(convLengthDuration.as('minutes'))
          let lengthLabel = `${convLength} minutes long`
          if (convLength > 60) {
            let hours = Math.floor(convLength / 60)
            let minutsLeft = convLength % 60
            lengthLabel = `${hours} hours and ${minutsLeft} minutes long`
          }

          let conversationEmotion = capitalize(report.analysis.emotion)
          let EmotionIcon = EmotionIcons[conversationEmotion]

          let sentimentScore = Math.ceil(report.analysis.sentiment.score)

          return (
            <S.Report onClick={() => {
              navigate(`/conversations/${report.workspaceId}`, {
                state: {
                  isAdminView: true,
                  startTimestamp: report.startTimestamp,
                  endTimestamp: report.endTimestamp
                }
              })

            }}>
              <S.Report_Header>
                <S.Report_Header_ChannelName
                  className={'ReportHeader__ChannelName'}>{report.workspaceName}</S.Report_Header_ChannelName>
                <S.Report_Header_Seperator
                  className={'ReportHeader__Seperator'}>–</S.Report_Header_Seperator>
                <S.Report_Header_Date
                  className={'ReportHeader__Date'}>Weekly report</S.Report_Header_Date>
                <S.Report_Header_ViewInChannel
                  className={'ReportHeader__ViewInChannel'}>from {moment(report.startTimestamp).format('MMM Do')} until {moment(report.endTimestamp).format('MMM Do')}</S.Report_Header_ViewInChannel>
              </S.Report_Header>
              <S.Report_Body>
                <S.Report_Content>


                  <S.ReportLine.RepliesCount>
                    <span>{report.conversations.length} conversations</span>
                  </S.ReportLine.RepliesCount>
                  <S.ReportLine.TextContainer>
                    <p className="last-reply"> - {moment(Number(report.endTimestamp)).fromNow()}</p>
                    <p className="view-report">View Reports</p>
                  </S.ReportLine.TextContainer>
                </S.Report_Content>
                <S.ReportSentiment className={'report-sentiment'}>
                  <S.ReportSentiment__Text className={'report-sentiment__desc'}>
                    sentiment:
                  </S.ReportSentiment__Text>
                  <S.ReportSentiment__Estimate className={'report-sentiment__estimate'}
                                               score={sentimentScore}>{sentimentScore}%</S.ReportSentiment__Estimate>
                </S.ReportSentiment>
                <S.ReportLine.Arrow className={'arrow'} type="right" style={{ color: '#999999' }}/>
              </S.Report_Body>
            </S.Report>
          )

        }}
      />
      {renderPagination(total, page, limit, onPageChange)}
    </S.ReportsWrapper>
  )
}

const S = {
  ReportsWrapper: styled.div`
    width: 80%;
    margin: 0 auto;
    
    
    @media (max-width:567px) {
      & {
        width: 100%;
      
      }
    }
`,
  ReportsList: styled(List)`

`,
  Report: styled.div`

    margin: 20px 0 20px 0;
    background-color: white;
    border: 0.5px solid #DDD;
    border-radius: 8px;
    padding: 5px 5px 15px 5px;
    cursor: pointer;
    
    &:hover {
        box-shadow: 0 1px 5px rgba(0,0,0,0.09);
    }
    
    &:hover .ReportHeader__ChannelName,
    &:hover .ReportHeader__Seperator,
    &:hover .ReportHeader__Date {
      color: rgba(18,100,163);
    }
    
    &:hover .ReportHeader__ViewInChannel {
      display: inline-block;
    }
    
    &:hover .ReportHeader__Date {
   
      display: none;
    }
    
    &:hover .report-sentiment .report-sentiment__desc{
      opacity: 1;
      
    }
    
     
      &&:hover {
        background: white;
      
        .last-reply {
          opacity: 0;        
        }
        
        .view-report {
          opacity: 1;
        }
        
        .arrow {
          opacity: 1;
        }
        
        .emotion-icon {
          opacity: 0;
        }
        
        
      }
      
    
`,
  Report_Header: styled.div`
    display: flex;
    align-items: baseline;
    margin-left: 5px;
    margin-bottom: 5px;
    font-size: 13px;
`,
  Report_Header_ChannelName: styled.p`
    font-weight: bold;
    font-size: 1.1em;
    text-transform: capitalize;
    margin: 0 5px 0 5px;
   
`,
  Report_Header_Seperator: styled.p`
    margin: 0;
`,
  Report_Header_Date: styled.p`
    font-size: 0.9em;
    margin: 0 5px 0 5px;

`,
  Report_Header_ViewInChannel: styled.p`
    display: none;
    margin: 0 5px 0 5px;
    
    @media (max-width:567px) {
      & {
        display: none;
      
      }
    }
    

`,
  /*
   <S.Report_Header_ChannelName># {channelName}</S.Report_Header_ChannelName>
                  <p>–</p>
                  <S.Report_Header_Date>{moment(Report.created).format('MMM Do')}</S.Report_Header_Date>
                  <S.Report_Herder_ViewInChannel>View in channel</S.Report_Herder_ViewInChannel>
   */
  Report_Body: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`,
  Report_UserIcon: styled.img`
  && {
        width: 45px;
        height: 45px;
        vertical-align: middle;
        padding: 5px;
        border-radius: 8px;
        margin: 0 5px 0 5px;
      }
`,
  Report_Content: styled.span`
      position: relative;
      display: flex; 
      align-items: center;
      flex-grow: 1;
      //width: 600px;
      cursor: pointer;
      //max-width: 600px;
      padding: 4px;
      height: 34px;
      line-height: 34px;
      border-radius: 6px;
      
      
      .view-report {
        opacity: 0;
        position: absolute;
        top: 0;
        transition: all 0.2s;
        margin: 0;
      }
      .last-reply {
       transition: all 0.2s;
       margin: 0;
      }
     
`,
  Report_ContentInfo: styled.span`
    
`,
  Report_Text: styled.p`
    margin: 3px 0 0 5px;
    color: #1D1C1D;

`,
  Report_UserName: styled.p`
    display: inline-block;
    margin: 0 5px 0 5px;
    font-weight: bold;
    color: #1D1C1D;
`,
  Report_ContentInfo_Date: styled.p`
    display: inline-block;
    margin: 0 5px 0 5px;
    font-size: 0.9em;
`,
  ReportSentiment: styled.span`
    display: flex;
    justify-content: space-evenly;
    width: 30%;
    align-items: center;
`,
  ReportSentiment__Text: styled.p`
    transition: all 0.4s;
    opacity: 0;
    margin: 0;
    
    
    @media (max-width:567px) {
      & {
        display: none;
      
      }
    }
`,
  ReportSentiment__Estimate: styled.p`
    transition: all 0.2s;

    margin: -20px 0 0 0;
    font-size: 2.2em;
    color: ${(props) => {
    if (props.score < 40) {
      return 'red'
    } else if (props.score >= 65) {
      return 'green'
    } else {
      return 'gray'
    }
  }};
    
    @media (max-width:567px) {
      & {
        display: none;
        font-size: 1.5em;
        margin: 0;
      }
    }
`,
  ReportLine: {
    Container: styled.span`
      position: relative;
      display: flex; 
      align-items: center;
      width: 600px;
      cursor: pointer;
      max-width: 600px;
      padding: 4px;
      height: 34px;
      line-height: 34px;
      border-radius: 6px;
      
      
      .view-report {
        opacity: 0;
        position: absolute;
        top: 0;
        transition: all 0.2s;
        margin: 0;
      }
      .last-reply {
       transition: all 0.2s;
       margin: 0;
      }
      
      &&:hover {
        background: white;
        border: 1px solid #dddddd;
      
        .last-reply {
          opacity: 0        
        }
        
        .view-report {
          opacity: 1
        }
        
        .arrow {
          opacity: 1
        }
        
        
      }
    `,
    MemberImages: styled.span`
      display: flex;
      justify-content: center;
      
    `,
    Image: styled.img`
      width: 20px;
      height: 20px;
      margin-right: 3px;
      border-radius: 4px;

    `,
    RepliesCount: styled.span`
      margin: 0 3px;
      color: #1264a3;
      
      &&:hover {
        text-decoration: underline;
        color: #0b4c8c;
      }
      
    `,
    TextContainer: styled.span`
      margin-left: 3px;
      
       @media (max-width:567px) {
        & {
          display: none;
        
        }
      }
    `,
    Arrow: styled(Icon)`
      //width: 29px;
      //height: 20px;
      //flex: 1;
      text-align: right;
      line-height: 34px;
      opacity: 0;
      transition: all 0.2s;
      
      svg {
        width: 14px;
        height: 14px;
      }
      
`,
  },
  EmotionIcon: styled.span`
    opacity: 1;
    transition: 0.2s all;
    position: absolute;
    right: 10px;
    width: 30px;
    height: 30px;
    display: block;
    background: ${(props) => {
    return `url(${props.icon})`
  }};
    background-size: 30px;
  `,
  EmotionIcons: {
    Neutral: styled.span`
    opacity: 1;
    transition: 0.2s all;
    position: absolute;
    right: 10px;
    width: 30px;
    height: 30px;
    display: block;
    background: url(NeutralIcon);
    background-size: 30px;
  `
  }
}

export default ReportsView
