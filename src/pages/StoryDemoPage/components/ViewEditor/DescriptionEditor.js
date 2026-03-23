

import React, { useState } from 'react'
import styled from 'styled-components'
import DescriptiongEditorInternal from './DescriptiongEditorInternal'



const DescriptionEditor = ({ editorValue, setEditorValue }) => {


  let [editorRef, setEditorRef] = useState(null)
  // let [editorValue ,setEditorValue]= useState(initialValue)
  /*
   {
          "view": {
            "viewType": "Modal",
            "content": "",
            "selector": ""
          },
          "action": {
            "actionType": "NextButton",
            "selector": ""
          },
          "name": "TestStep",
          "_id": "62597f4ca510e232e2610e65",
          "index": 0
        },
   */

  return (
    <VE.ViewContainer>
      <DescriptiongEditorInternal
        editorRef={setEditorRef}
        value={editorValue}
        onChange={(newValue) => {

        setEditorValue(newValue)
      }}/>

    </VE.ViewContainer>
  )
}

const VE = {
  ViewContainer: styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    border: 1px solid black;
    border-radius: 6px;
    padding: 0px 5px;
    justify-content: flex-start;
    background: #ffffff;

    && .slate-editor ol,
    && .slate-editor ul {
      padding: 0px;
    }
  `,
  SaveButton: styled.div`

    position: absolute;
    top: 20px;
    background: #1070ff;
    color: white;
    left: 5px;
    opacity: 0.2;
    text-align: center;
    display: flex;
    height: 35px;
    width: 75px;
    border-radius: 6px;
    justify-content: center;
    align-items: center;

    &:hover {
      opacity: 1;
      cursor: pointer;
    };
  `,
  SaveButton__Text: styled.p`
    height: 50px;
    text-align: center;
    line-height: 50px;
    margin: 0px 5px;
    font-size: 1.1em;

`
}

export default DescriptionEditor

