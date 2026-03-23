import React from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Header from './components/Header/Header'
import IconTextButton from '../../components/IconTextButton/IconTextButton'
import mainColors from '../../constants/mainColors'

const HubspotIntegrationSuccessPage = ({ currentSelectedWorkspace, authData }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  return (
    <React.Fragment>
      <Header
        workspaceName={currentSelectedWorkspace && currentSelectedWorkspace.name}
        authData={authData}
        style={{ boxShadow: 'none' }}
      />
      <S.Content>
        <S.Wrapper>
          <S.SuccessDescriptionWrapper>
            <S.SuccessIcon>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="32" fill="#10B981" fillOpacity="0.1"/>
                <path d="M32 16C23.1634 16 16 23.1634 16 32C16 40.8366 23.1634 48 32 48C40.8366 48 48 40.8366 48 32C48 23.1634 40.8366 16 32 16ZM28 38L20 30L22.82 27.18L28 32.34L41.18 19.16L44 22L28 38Z" fill="#10B981"/>
              </svg>
            </S.SuccessIcon>
            <S.SuccessTitle>HubSpot Integration Successful!</S.SuccessTitle>
            <S.SuccessMessage>
              Your HubSpot account has been successfully connected to LiveDemo. 
              You can now sync your demo engagement data, form submissions, and demo events to HubSpot.
            </S.SuccessMessage>
            <S.ButtonWrapper>
              <IconTextButton
                onClick={() => {
                  navigate('/')
                }}
                text="Go to Dashboard"
                buttonStyles={{
                  backgroundColor: `${mainColors.primaryColor} !important`,
                  color: '#fff !important',
                  border: `2px solid ${mainColors.primaryColor} !important`,
                  cursor: 'pointer',
                  padding: '12px 24px',
                  fontSize: '1em',
                }}
                textStyles={{
                  color: '#fff !important',
                  fontSize: '1em',
                }}
                isImgOnLeftSide={false}
              />
              <IconTextButton
                onClick={() => {
                  navigate('/settings')
                }}
                text="Go to Settings"
                buttonStyles={{
                  backgroundColor: 'white !important',
                  color: '#111 !important',
                  border: `2px solid ${mainColors.primaryColor} !important`,
                  cursor: 'pointer',
                  padding: '12px 24px',
                  fontSize: '1em',
                  marginLeft: '0px',
                }}
                textStyles={{
                  color: '#111 !important',
                  fontSize: '1em',
                }}
                isImgOnLeftSide={false}
              />
            </S.ButtonWrapper>
          </S.SuccessDescriptionWrapper>
        </S.Wrapper>
      </S.Content>
    </React.Fragment>
  )
}

const S = {
  Content: styled.div`
    && {
      background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
      overflow: scroll;
      width: 100%;
      height: 100%;
      padding: 60px 80px;

      @media screen and (max-width: 700px) {
        padding: 30px 20px;
      }
    }
  `,
  Wrapper: styled.div`
    width: 100%;
    max-width: 1400px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    margin: 0 auto;

    @media screen and (max-width: 450px) {
      width: 100%;
    }
  `,
  SuccessDescriptionWrapper: styled.div`
    width: 100%;
    max-width: 600px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;

    @media screen and (max-width: 700px) {
      max-width: 100%;
    }
  `,
  SuccessIcon: styled.div`
    margin-bottom: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  SuccessTitle: styled.h2`
    font-size: 2em;
    font-weight: 600;
    color: #1a1a1a;
    font-family: ${mainColors.fontFamily};
    text-align: center;
    margin: 0 0 16px 0;
    line-height: 1.3;
    letter-spacing: -0.02em;

    @media screen and (max-width: 700px) {
      font-size: 1.75em;
      margin-bottom: 12px;
    }
  `,
  SuccessMessage: styled.p`
    font-size: 1.1em;
    color: #666;
    font-family: ${mainColors.fontFamily};
    text-align: center;
    margin: 0 0 32px 0;
    line-height: 1.6;

    @media screen and (max-width: 700px) {
      font-size: 1em;
      margin-bottom: 24px;
    }
  `,
  ButtonWrapper: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;

    @media screen and (max-width: 700px) {
      flex-direction: column;
      width: 100%;
      
      button {
        width: 100%;
        margin-left: 0 !important;
      }
    }
  `,
}

function mapStateToProps(state) {
  return {
    currentSelectedWorkspace: state.workspacesReducer.currentSelectedWorkspace,
    authData: state.authReducer.authData,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HubspotIntegrationSuccessPage)

