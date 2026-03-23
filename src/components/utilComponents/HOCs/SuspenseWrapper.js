import React, { Fragment, Suspense } from 'react'
import Spinner from '../../Spinner/Spinner'
// Import ErrorBoundary statically (not lazy) since it's used in SuspenseWrapper
// This ensures ErrorBoundary is always available when lazy components load
import ErrorBoundary from './ErrorBoundary'

const SuspenseWrapper = (props) => {

  let fallbackComponent = props.fallback ? props.fallback : (
    <Spinner/>
  )

  return (
    <Fragment>
      <ErrorBoundary>
        <Suspense fallback={fallbackComponent}>
          {props.children}
        </Suspense>
      </ErrorBoundary>
    </Fragment>
  )
}

export default SuspenseWrapper
