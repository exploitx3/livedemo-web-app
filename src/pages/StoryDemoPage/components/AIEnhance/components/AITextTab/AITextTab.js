

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Colors from '../../../../../../constants/mainColors'
import Input from 'antd/es/input'
import Select from 'antd/es/select'
import Icon from '../../../../../../components/Icon/Icon'
import IconTextButton from "../../../../../../components/IconTextButton/IconTextButton";
import Spinner from "../../../../../../components/Spinner/Spinner";

const AI_TEXT_TYPES = {
  guide:'guide',
  // MARKETING:'marketing'
}

const AITextTab = ({enhanceTextWithAI, setShowConfetti, reloadStoryDemo, onCancel}) => {
  let [selectedAITextType, setSelectedAITextType] = useState(AI_TEXT_TYPES.guide)
  let [isLoading, setIsLoading] = useState(false)

  return (

      <T.Wrapper>
            <div style={{visibility: isLoading ? 'hidden' : 'visible'}}>
              <T.Header>
                <T.HeaderIcon type={'thunderbolt'} theme={'twoTone'}/>
                <T.HeaderTitle>
                  Generative Text AI
                </T.HeaderTitle>
                <T.HeaderDescription>
                  Upgrade your text annotations with contextual AI enhancements.
                </T.HeaderDescription>
              </T.Header>
              <T.Main>
                <T.ActionSelectorLine>
                  <T.ActionSelectorText>Select Demo Type:</T.ActionSelectorText>

                  <T.Select
                    dropdownStyle={{
                      background: Colors.App.sidebarColor,
                      border: `1px solid ${Colors.primaryColor}`,
                      textTransform: 'capitalize',

                      // boxShadow: `0 0 0 2px ${Colors.primaryColor}`
                    }}
                    value={selectedAITextType}
                    style={{
                      width: '100%'
                    }}
                    onChange={(type) => {

                      setSelectedAITextType(AI_TEXT_TYPES[type])
                    }}>
                    {Object.entries(AI_TEXT_TYPES).map(([key, value], index, array) => {
                      let isLast = index === array.length - 1
                      return <Option style={{
                        background: 'none',
                        color: Colors.primaryColor,
                        borderBottom: isLast ? 'none' : '1px solid #d9d9d9',
                        textTransform: 'capitalize',
                      }} key={key} value={key}>{value}</Option>
                    })
                    }
                  </T.Select>
                </T.ActionSelectorLine>
              </T.Main>
              <T.Footer>
                <T.FooterRightSide>
                  <T.ToolbarButtonCLose
                  onClick={() => {
                    // onAIEnhanceClick()
                  }}
                >
                  <T.ToolbarText onClick={() => {
                      onCancel()
                  }}>Cancel</T.ToolbarText>
                </T.ToolbarButtonCLose>

                  <T.ToolbarButton
                    onClick={() => {
                      // onAIEnhanceClick()
                    }}
                  >
                    <T.ToolbarText
                    onClick={() => {

                      setIsLoading(true)

                      enhanceTextWithAI()
                          .then(() => {
                            return reloadStoryDemo()
                          })
                        .then(() => {
                          setShowConfetti(true)
                          onCancel()


                          setTimeout(() => {
                              setIsLoading(false)
                              setShowConfetti(false)
                          }, 6000)
                        })
                        .catch((err) => {
                          setIsLoading(false)
                        })

                    }}>Enhance with AI</T.ToolbarText>
                  </T.ToolbarButton>
                </T.FooterRightSide>
              </T.Footer>
            </div>
        {isLoading ? (<Spinner/>) : ('')}
      </T.Wrapper>
  )
}

const T = {
  ActionSelectorText: styled.p`
    margin: 0px;
  `,
  SelectorInput: styled(Input)`
    && {
      width: 100%;
    }

  `,
  Select: styled(Select)`
    flex-grow: 1;

    && .ant-select-content-value {
      background: none;
      color: ${Colors.primaryColor};
      border: none !important;
      box-shadow: none;
    }

    && .ant-select-selection {
      background: none;
      color: ${Colors.primaryColor};
      border: 1px solid #d9d9d9;
      box-shadow: none;
    }

    && .ant-select-selection:hover {
      border: 1px solid ${Colors.primaryColor};
    }

    && .ant-select-arrow {
      color: ${Colors.primaryColor};
    }

    && .ant-select-selection-selected-value {
      width: 90%;
      text-transform: capitalize;
    }
`,
  ActionSelectorLine: styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    width: 100%;


  `,
  ToolbarText: styled.div`
    font-family: ${Colors.fontFamily};
  `,
  ToolbarButtonCLose: styled.div`
    height: 36px;
    padding: 0px 10px;
    text-align: center;
    line-height: 50px;
    margin: 0px 5px;
    font-size: 1.1em;
    color: #111;
    border: 1px solid #111;

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: 4px;

    cursor: pointer;

    background: #fff;

  `,
  ToolbarButton: styled.div`
    height: 36px;
    padding: 0px 10px;
    text-align: center;
    line-height: 50px;
    margin: 0px 5px;
    font-size: 1.1em;


    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: 4px;

    cursor: pointer;


    color: #f9f9f9;
    background: ${Colors.primaryColor};
`,
  FooterRightSide: styled.span`
    display: flex;
    flex-direction: row;
    align-items: center;
  `,
  Main: styled.div`
    width: 100%;
    flex-grow: 1;
    padding: 25px;
  `,
  FooterIcon: styled(Icon)`
    height: 15px;
    width: 15px;

    && svg {
      width: 100%;
      height: 100%;
      fill: ${Colors.primaryColor};
    }
  `,
  Footer: styled.div`
    //background: #f9f9f9;
    //border-top: 1px solid #d9d9d9;
    justify-self: end;
    height: 72px;
    width: 100%;

    display: flex;
    justify-content: end;
    align-items: end;
    padding: 0px 10px;
  `,
  Header: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    gap: 20px;
    padding: 25px;

  `,
  HeaderIcon: styled(Icon)`
    height: 65px;
    width: 65px;

    && svg {
      width: 100%;
      height: 100%;
      fill: ${Colors.primaryColor};
    }
  `,
  HeaderTitle: styled.p`
    margin: 0px;
    font-size: 20px;
    font-weight: 550;
    font-family: ${Colors.fontFamily};
    color: #111;
  `,
  HeaderDescription: styled.p`
    margin: 0px;
    font-size: 15px;
    font-family: ${Colors.fontFamily};
    color: #999;
    text-align: center;
  `,
  Wrapper: styled.main`
    display: flex;
    align-items: center;
    flex-direction: column;
    height: 100%;
  `,
  ImageWrapper: styled.figure`
    border: 7px solid #fff;
    border-radius: 16px;
    box-sizing: border-box;
    width: 100%;
    height: 150px;
    margin: 0;

    &&:hover {
        border-color: #e5e7eb;
        cursor: pointer;
    }
  `,
  Image: styled.img`
    width: 100%;
    height: 100%;
    border-radius: 8px;

  `
}

export default AITextTab
