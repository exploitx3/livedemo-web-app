import React from 'react'
import { CardCvcElement, CardExpiryElement, CardNumberElement, AddressElement, useStripe, useElements } from '@stripe/react-stripe-js'
//import { Button, Checkbox, Icon } from 'antd'

import Button from 'antd/es/button'
import 'antd/es/button/style'
import Checkbox from 'antd/es/checkbox'
import 'antd/es/checkbox/style'
import Icon from '../Icon/Icon'
import styled from 'styled-components'
import Colors from '../../constants/mainColors'
import './CheckoutForm.css'
import SubscriptionPrices from '../../constants/SubscriptionPrices'
import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'

const createOptions = () => {
  return {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'Open Sans, sans-serif',
        letterSpacing: '0.025em',
        '::placeholder': {
          color: '#aab7c4'
        },
      },
      border: '1px solid black',
      invalid: {
        color: '#c23d4b',
      },
    }
  }
}

const createAddressOptions = () => {
  return {
    mode: 'billing',
    fields: {
      phone: 'never'
    },
    display: {
      name: 'full'
    },
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: Colors.primaryColor || '#1070ff',
        colorBackground: '#ffffff',
        colorText: '#424770',
        colorDanger: '#c23d4b',
        fontFamily: 'Open Sans, sans-serif',
        fontSizeBase: '16px',
        borderRadius: '2px',
        spacingUnit: '4px',
        spacingGridRow: '12.5px'
      },
      rules: {
        '.Input': {
          border: 'none',
          borderBottom: '1px solid #3a3a3a',
          borderRadius: '2px',
          padding: '12.5px 0',
          fontSize: '16px',
          color: '#424770',
          fontFamily: 'Open Sans, sans-serif',
          '&:focus': {
            boxShadow: 'unset',
            borderBottomColor: Colors.primaryColor || '#1070ff'
          }
        },
        '.Label': {
          fontSize: '14px',
          fontWeight: '500',
          color: '#424770',
          marginBottom: '4px'
        },
        '.Error': {
          color: '#c23d4b',
          fontSize: '14px',
          marginTop: '4px'
        }
      }
    }
  }
}

class CheckoutForm extends React.Component {
  constructor(props) {
    super(props)


    this.state = {
      selectedSubscription: props.selectedSubscription,
      isLoading: false,
      isLoadingFree: false,
      cardNumberLoaded: false,
      cardCVCLoaded: false,
      cardDateLoaded: false,
      userCards: props.userCards,
      userDefaultCard: props.userDefaultCard
    }

    this.checkIfAllLoaded = this.checkIfAllLoaded.bind(this)
    this.setCardDateElement = this.setCardDateElement.bind(this)
    this.setCardNumberElement = this.setCardNumberElement.bind(this)
    this.setCVCElement = this.setCVCElement.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.checkboxOnChange = this.checkboxOnChange.bind(this)
    this.submitActivateFree = this.submitActivateFree.bind(this)
  }

  handleSubmit(ev) {
    ev.preventDefault()


    this.setState(() => {
      return {
        isLoading: true
      }
    })

    // You can also use createToken to create tokens.
    // See our tokens documentation for more:
    // https://stripe.com/docs/stripe-js/reference#stripe-create-token
    let thiz = this
    if (!this.props.stripe || !this.props.elements) {
      console.error('Stripe or Elements has not loaded')
      thiz.setState(() => {
        return {
          isLoading: false
        }
      })
      return
    }
    
    const cardElement = this.props.elements.getElement('cardNumber')
    if (!cardElement) {
      console.error('Card element not found')
      thiz.setState(() => {
        return {
          isLoading: false
        }
      })
      return
    }
    
    // Get billing details from AddressElement if it exists
    const addressElement = thiz.props.elements.getElement('billingDetails')
    let billingDetails = {}
    
    if (addressElement) {
      const addressValue = addressElement.getValue()
      if (addressValue) {
        billingDetails = {
          name: addressValue.name || '',
          address: addressValue.address || {}
        }
      }
    }
    // Note: If AddressElement is not available, billing_details will be empty object
    // which is acceptable as Stripe can still process payment without it
    
    this.props.stripe.createPaymentMethod({ 
      type: 'card', 
      card: cardElement,
      billing_details: billingDetails
    })
      .then(result => {
        if (result.error) {
          console.error(result.error)
          thiz.setState(() => {
            return {
              isLoading: false
            }
          })
          return
        }

        console.log(result.paymentMethod)

        return thiz.props.onPaymentMethodCreated(result.paymentMethod)
          .then(() => {

            thiz.setState(() => {
              return {
                isLoading: false
              }
            })
          })
      })
      .catch(err => {
        console.log(err)
        thiz.setState(() => {
          return {
            isLoading: false
          }
        })
      })
    // token type can optionally be inferred if there is only one Element
    // with which to create tokens
    // this.props.stripe.createToken({name: 'Jenny Rosen'});


  }

  submitActivateFree(ev) {
    ev.preventDefault()


    this.setState(() => {
      return {
        isLoadingFree: true
      }
    })

    return this.props.onFreeActivate()
    .then(() => {

      this.setState(() => {
        return {
          isLoadingFree: false
        }
      })
    })
    .catch(err => {
      console.log(err)
    })


  }

  setCardNumberElement(value) {
    this.setState(() => {
      return {
        cardNumberLoaded: value
      }
    })
    this.checkIfAllLoaded()
  }

  setCVCElement(value) {
    this.setState(() => {
      return {
        cardCVCLoaded: value
      }
    })
    this.checkIfAllLoaded()
  }

  setCardDateElement(value) {
    this.setState(() => {
      return {
        cardDateLoaded: value
      }
    })
    this.checkIfAllLoaded()
  }

  checkIfAllLoaded() {


    if (this.state.cardDateLoaded && this.state.cardCVCLoaded && this.state.cardNumberLoaded) {
      this.props.onAllElementsLoaded()
      return true
    } else {
      return false
    }
  }


  checkboxOnChange(event){


    this.props.setAutoPay(event.target.checked)
  }

  render() {
    let hasAllElementsLoaded = this.checkIfAllLoaded()

    if (!hasAllElementsLoaded) {
      setTimeout(() => {
        this.setCVCElement(true)
        this.setCardNumberElement(true)
        this.setCardDateElement(true)
      }, 3000)
    }


    return (
      <ErrorBoundary>

        <React.Fragment>
          <S.Wrapper>

            <S.Form onSubmit={this.handleSubmit}>
              {/*<CardElement onReady={() => {*/}
              {/*  */}
              {/*  this.setCardDateElement(true)*/}
              {/*  this.setCardNumberElement(true)*/}
              {/*  this.setCVCElement(true)*/}

              {/*}}/>*/}
              <S.CheckoutHeadline style={{ flexGrow: 1 }}>
                {this.props.freeActivate ? (                <S.ActivateFreeColumn>
                  <S.ActivateFreeButton loading={this.state.isLoadingFree} onClick={this.submitActivateFree}>Activate for Free</S.ActivateFreeButton>
                </S.ActivateFreeColumn>):null}

                <S.CheckoutTitleColumn>
                <S.FormTitleTop>Secure Checkout</S.FormTitleTop>
                <S.FormTitle>{this.state.selectedSubscription} - {SubscriptionPrices[this.state.selectedSubscription.toUpperCase()]}$</S.FormTitle>
              </S.CheckoutTitleColumn>
            </S.CheckoutHeadline>
              <S.Label>
                <S.Icon type={'user'}/>
                <S.AddressElementWrapper>
                  <AddressElement
                    options={createAddressOptions()}
                    id="billingDetails"
                  />
                </S.AddressElementWrapper>
              </S.Label>
              <S.Label>
                <S.Icon type={'credit-card'}/>
                <CardNumberElement options={createOptions()} className={'ant-input stripe-element'}/>
              </S.Label>
              <S.Label>
                <S.Icon type={'calendar'}/>
                <CardExpiryElement className={'ant-input stripe-element'} options={createOptions()}/>
              </S.Label>
              <S.Label>
                <S.Icon type={'lock'}/>
                <CardCvcElement className={'ant-input stripe-element'} options={createOptions()}/>
              </S.Label>

              <span>
              <S.Checkbox onChange={this.checkboxOnChange}>
                Enable Autopay
              </S.Checkbox>

            </span>
              <S.Button htmlType={'submit'} type="primary" loading={this.state.isLoading} block={true}>
                Pay Now
              </S.Button>
            </S.Form>
          </S.Wrapper>
        </React.Fragment>
      </ErrorBoundary>
    )
  }
}

const S = {
  CheckoutHeadline: styled.span`
    position: relative;
`,
  ActivateFreeButton: styled(Button)`
    border-radius: 14px;
    border: 2px solid white;
    color: white;
    background: ${Colors.primaryColor};
    cursor: pointer;
    width: 100%;
    height: 100%;
    padding: 5px 15px;
    font-size: 1.2em;
    &:hover {
      background: white;
      color: ${Colors.primaryColor};
      border-color: ${Colors.primaryColor};
    }
`,
  ActivateFreeColumn: styled.span`
  width: fit-content;
  position: absolute;
  left: 0;
  
`,
  CheckoutTitleColumn: styled.span`
    display: flex;
    flex-direction: column;
    width: 100%;
`,
  Wrapper: styled.div`
    width: 600px;
    height: 600px;
    margin-left: 25px;
    padding: 25px;
    border-radius: 20px;
    border: 2px solid ${Colors.primaryColor};
    color: white;
    background: white;
`,
  FormTitle: styled.h3`
    flex-grow: 1;
    font-size: 1.1em;
    text-align: center;
    text-transform: uppercase;
    color: #333333;
    margin: 0;
`,
  FormTitleTop: styled.h3`
    flex-grow: 1;
    font-size: 1.25em;
    text-align: center;
    text-transform: uppercase;
    color: #333333;
    margin: 0;
`,
  Button: styled(Button)`
    && {
      margin-top: 10px;
      background-color: ${Colors.primaryColor};  
    
    }
`,
  Form: styled.form`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
`,
  Icon: styled(Icon)`
    && {
      display: block;
      position: absolute;
      width: 5%;
      z-index: 2;
      left: 0;
      line-height: 50px;

    }
    
    & svg {
      width: 1.5em;
      height: 1.5em;
      vertical-align: middle;
      fill: ${Colors.primaryColor};
    }
`,
  Label: styled.label`
    display: block;
    position: relative;
    margin-bottom: 0;
  `,
  AddressElementWrapper: styled.div`
    padding-left: 40px;
    margin-top: 12.5px;
    margin-bottom: 12.5px;
    
    /* Style Stripe AddressElement container */
    && > div {
      width: 100% !important;
    }
    
    /* Ensure iframe matches other Stripe elements styling */
    && iframe {
      width: 100% !important;
    }
  `,
  Checkbox: styled(Checkbox)`
    && {
      display: flex;
      margin: 5px 0;
      color: ${Colors.primaryText}
    }
  `
}

// Wrap component to provide stripe and elements via props (Elements will provide it via context)
const CheckoutFormWrapper = (props) => {
  const stripe = useStripe()
  const elements = useElements()
  return <CheckoutForm {...props} stripe={stripe} elements={elements} />
}

export default CheckoutFormWrapper
