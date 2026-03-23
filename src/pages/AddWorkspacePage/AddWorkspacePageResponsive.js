/*

 */

import AddWorkspaceLarge from './AddWorkspacePage'
import AddWorkspacePageMobile from './Responsive/AddWorkspacePageMobile'

import React, { useState, useEffect, useRef } from 'react'


import Media from 'react-media'
import ErrorBoundary from '../../components/utilComponents/HOCs/ErrorBoundary'

const AddWorkspacePage = (props) => {


  return (
    <ErrorBoundary>
    <React.Fragment>
      <Media query="(min-width: 577px)" render={() => (<AddWorkspaceLarge {...props}/>)}/>
      <Media query="(max-width: 576px)" render={() => (<AddWorkspacePageMobile {...props}/>)}/>
    </React.Fragment>
    </ErrorBoundary>
  )

}

export default AddWorkspacePage
