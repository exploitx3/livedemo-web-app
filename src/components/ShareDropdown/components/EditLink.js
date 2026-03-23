import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import StyledInput from '../../../components/StyledInput/StyledInput'
import Colors from '../../../constants/mainColors'
import 'antd/es/switch/style'
import IconTextButton from '../../../components/IconTextButton/IconTextButton'
import {connect} from "react-redux";


const EditLink = ({link, onCancel, onSave, storyId, workspaceId, liveDemo, authData}) => {

  let [linkState, setLinkState] = useState(link ?? {
    name: "",
    storyId: "",
    workspaceId: "",
    variables: []
  })
  let [isLoading, setIsLoading] = useState(false)


  useEffect(() => {
    // if (!demoHasLoaded) {
    //   // if (!storyContent || storyContent && storyContent.contentStatus && storyContent.contentStatus !== ContentStatuses.READY) {
    //   actions.getStoryDemo(workspaceId, storyId, authData.token)
    //     .then(() => {
    //       setDemoHasLoaded(true)
    //     })
    // }
    //
    // getLinks(workspaceId, storyId, authData.token)
    //   .then((linkDocs) => {
    //
    //     setLinks(linkDocs)
    //   })


  }, [])

  return (
    <EL.Wrapper>
      <EL.Row>
        <EL.Line>
          <EL.LabelText>Name</EL.LabelText>
          <EL.LabelDesc>This is the link's name</EL.LabelDesc>
          <EL.StyledInput
            size="medium"
            placeholder={linkState.name}
            type={'text'}
            value={linkState.name}
            onChange={(event) => {

              setLinkState({
                ...linkState,
                name: event.target.value
              })
            }}
          />
        </EL.Line>
        {linkState.variables.map((variable, i) => {
          let labelDescriptionString = 'Usage {{ ' + variable.name + ' }}'
          return (
            <EL.Line key={i}>
              <EL.LabelText>{variable.name}</EL.LabelText>
              <EL.LabelDesc>{labelDescriptionString}</EL.LabelDesc>
              <EL.StyledInput
                size="medium"
                placeholder={variable.value}
                type={'text'}
                value={variable.value}
                onChange={(event) => {

                  let newVariables = linkState.variables.map((iterVar) => {
                    if(iterVar._id === variable._id) {
                      return {
                        ...variable,
                        value: event.target.value
                      }
                    } else {

                      return iterVar
                    }
                  })

                  setLinkState({
                    ...linkState,
                    variables: newVariables
                  })
                }}
              />
            </EL.Line>
          )
        })}
      </EL.Row>
      <EL.ButtonFooter>
        <IconTextButton
          loading={false}
          onClick={() => {
            onCancel()
          }}
          img={null}
          text={'Cancel'}

          textStyles={{
            fontSize: '0.9em',
            color: '#111',
          }}
          buttonStyles={{

            padding: '0 5px',
            boxShadow: 'none',
            justifyContent: 'space-between',
            width: 'auto',
            height: '30px',
            borderRadius: '6px',
          }}
        />
        <IconTextButton
          loading={false}
          onClick={() => {
            onSave(linkState)
          }}
          img={null}
          text={'Save'}

          textStyles={{
            fontSize: '0.9em',
            color: '#FFF',
          }}
          buttonStyles={{
            '&:hover': {
              background: `${Colors.primaryColor} !important`
            },
            '&:active': {
              background: `${Colors.primaryColor} !important`
            },
            '&:focus': {
              background: `${Colors.primaryColor} !important`
            },
            padding: '0 5px',
            boxShadow: 'none',
            justifyContent: 'space-between',
            width: 'auto',
            height: '30px',
            borderRadius: '6px',
            background: `${Colors.primaryColor} !important`
          }}
        />
      </EL.ButtonFooter>

    </EL.Wrapper>
  )
}

const EL = {
  ButtonFooter: styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
  `,
  Line: styled.div`
    width: 100%;
    margin-bottom: 15px;
  `,
  LabelText: styled.h1`
    display: inline;
    margin-right: 15px !important;
    color: #111;
    font-size: 1.2em;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  `,
  LabelDesc: styled.p`
    display: inline;
    color: #999;
    font-size: 1.0em;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  `,
  Row: styled.div`
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
  Wrapper: styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    padding: 16px 16px 0px 16px;
  `,
  StyledInput: styled.input`
    margin-top: 5px;
    /* Basic input style */
    &&[type="text"],
    &&[type="email"],
    &&[type="password"],
    &&[type="number"],
    &&[type="tel"],
    &&[type="url"],
    &&[type="search"] {
      width: 100%;
      padding: 10px 12px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #333;
      background-color: #fff;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    /* Focus state */
    &&:focus {
      border-color: #9ca3af;
      box-shadow: 0 0 0 3px rgba(156, 163, 175, 0.1);
    }

    /* Hover state */
    &&:hover:not(:focus) {
      border-color: #9ca3af;
    }

    /* Disabled state */
    &&:disabled {
      background-color: #f3f4f6;
      color: #9ca3af;
      cursor: not-allowed;
    }

    /* Placeholder text */
    &&::placeholder {
      color: #9ca3af;
    }
  `


}

function mapStateToProps(state) {

  return {
    authData: state.authReducer.authData,
  }
}

// function mapDispatchToProps(dispatch) {
//   return {
//     actions: bindActionCreators({
//       updateStoryDemo,
//       getStoryDemo,
//     }, dispatch)
//   }
// }


export default connect(mapStateToProps, null)(EditLink)
