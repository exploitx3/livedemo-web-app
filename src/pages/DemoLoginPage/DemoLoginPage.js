import React from 'react'
import { demoAuthenticate } from '../../actions/authActions'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Spinner from '../../components/Spinner/Spinner'
import mainColors from '../../constants/mainColors'

const DemoLoginPage = (props) => {
  const navigate = useNavigate()

  props.actions.demoAuthenticate()
    .then(() => {
      navigate('/')
    })
    .catch(err => {
      navigate('/')
    })

  return (
    <React.Fragment>
      <Spinner/>
    </React.Fragment>
  )

}

function mapDispatchToProps(dispatch) {
  return {

    actions: bindActionCreators({ demoAuthenticate: demoAuthenticate }, dispatch)

  }
}

export default connect(null, mapDispatchToProps)(DemoLoginPage)
