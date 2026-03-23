import React, {memo,useRef, useEffect} from 'react'
//import { Button, Card, Col, Dropdown, Icon, Menu, Skeleton } from 'antd'

import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Col from 'antd/es/col'
import Dropdown from 'antd/es/dropdown'
import Icon from '../../../../components/Icon/Icon'
import Menu from 'antd/es/menu'
import Skeleton from 'antd/es/skeleton'
import styled from 'styled-components'
import Colors from '../../../../constants/mainColors'
import { bindActionCreators } from 'redux'
import { updateCurrentSelectedWorkspace } from '../../../../actions/workspacesActions'
import { refreshToken } from '../../../../actions/authActions'
import { getWorkspaceEncryptionKey } from '../../../../actions/secureStorageActions'
import { connect } from 'react-redux'
import WorkspaceStatuses from '../../../../constants/WorkspaceStatuses'


const IframeView = memo((props) => {

  return (
    <div style={{"position": 'relative', paddingBottom: "calc(48.6090775988287% + 41px)", height: 0}}>
      <iframe src={"https://story-api.livedemo.ai/workspaces/62d774dbe0ef18000987c428/stories/63faca488ee9de001b5a5407/preview?step=1&embed"}
              frameBorder={"0"} loading={"lazy"}
              webkitallowfullscreen={true}
              mozallowfullscreen={true}
              allowFullScreen={true}
              style={{"position": "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 6}}
      ></iframe>
    </div>
  )
})

export default IframeView

const S = {}


