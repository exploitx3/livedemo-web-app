import React from 'react'
import { CardCvcElement, CardExpiryElement, CardNumberElement, useStripe, useElements } from '@stripe/react-stripe-js'
//import { Button, Checkbox, Icon } from 'antd'

import Button from 'antd/es/button'
import Checkbox from 'antd/es/checkbox'
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

class CheckoutForm extends React.Component {
  constructor(props) {
    super(props)


    this.state = {
      selectedSubscription: props.selectedSubscription,
      isLoading: false,
      name: '',
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
    
    this.props.stripe.createPaymentMethod({ 
      type: 'card', 
      card: cardElement,
      billing_details: { name: thiz.state.name } 
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
                <S.ActivateFreeButton loading={this.state.isLoadingFree} onClick={this.submitActivateFree}>Activate for Free</S.ActivateFreeButton>              </S.ActivateFreeColumn>):null}

              <S.CheckoutTitleColumn>
                {this.props.freeActivate ? (null) : (<S.FormTitleTop>Secure Checkout</S.FormTitleTop>)}
                <S.FormTitle>{this.state.selectedSubscription} - {SubscriptionPrices[this.state.selectedSubscription.toUpperCase()]}$</S.FormTitle>
              </S.CheckoutTitleColumn>
            </S.CheckoutHeadline>
            <S.Label>
              <S.Icon type={'user'}/>
              <input
                className={'ant-input stripe-element'}
                id={'full-name'}
                name={'full-name'}
                placeholder="Name"
                value={this.state.name}
                onChange={(event) => {
                  let name = event.target.value

                  this.setState(() => {
                    return { name }
                  })
                }}/>

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
    flex-grow: 1;
    flex-direction: column;
    display: flex;
    justify-content: center;
    align-items: center;
`,
    ActivateFreeButton: styled(Button)`
    width: 100%;
    height: 100%;
    border-radius: 14px;
    border: 2px solid white;
    color: white;
    background: ${Colors.primaryColor};
    cursor: pointer;
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


`,
    CheckoutTitleColumn: styled.span`
    display: flex;
    flex-direction: column;
    width: 100%;
`,
  Wrapper: styled.div`
    width: 650px;
    height: 300px;
    padding: 15px;
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
    font-size: 1em;
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
      width: 3%;
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
    height: 38px;
    display: block;
    position: relative;
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
