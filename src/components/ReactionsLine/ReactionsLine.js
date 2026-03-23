import React from 'react'
import { Emoji } from 'emoji-mart'
import styled from 'styled-components'
//import { Tooltip } from 'antd'

import Tooltip from 'antd/es/tooltip'

const ReactionsLine = ({ channelMembersBySlackId, reactions }) => {

  return (
    <S.Wrapper>
      {reactions.map((reaction) => {

          let emojiComponent = Emoji({
            emoji: reaction.name, set: 'google',
            size: 18
          })

        let title = ''
        if(channelMembersBySlackId) {

          let reactionUserNames = reaction.userSlackIds.map(id => {
            let channelMember = channelMembersBySlackId[id]

            return (
              (channelMember.profile && (channelMember.profile.displayName || channelMember.profile.realName)) ||
              channelMember.name
            )
          })
          title = reactionUserNames.join(', ')
        }


          return (
            <Tooltip placement="bottom" title={title}>

              <S.ReactionWrapper>
                {emojiComponent}
                <S.ReactionCount>{reaction.count}</S.ReactionCount>
              </S.ReactionWrapper>
            </Tooltip>
          )
        }
      )}
    </S.Wrapper>
  )
}

const S = {
  Wrapper: styled.div`
    height: 28px;
    display: flex;
    align-items: center;
    
  `,
  ReactionWrapper: styled.span`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f6f6f6;
    border-radius: 12px;
    margin: 0 4px 4px 0;
    line-height: 16px;
    padding: 4px 6px;
      
    &:hover {
      background: white;
      box-shadow: inset 0 0 0 1px rgba(29,28,29, 0.5);
    }
    
    && .emoji-mart-emoji {
      width: 18px;
      height: 18px;
    }
    
  `,
  ReactionCount: styled.span`
    padding: 0 1px 0 3px;
    font-size: 0.85em;
   
    
   

  `
}

export default ReactionsLine
