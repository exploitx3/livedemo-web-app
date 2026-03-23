import React, { Fragment, useState } from 'react'
import CardTypes from '../../constants/CardTypes'
//import { Button, Select } from 'antd'

import Button from 'antd/es/button'
import Select from 'antd/es/select'
import styled from 'styled-components'
import Colors from '../../constants/mainColors'
import { mapCardToIcon } from '../../utils/CardToIconMap'
import SubscriptionPrices from '../../constants/SubscriptionPrices'

import Checkbox from 'antd/es/checkbox'
import 'antd/es/checkbox/style'

import ErrorBoundary from '../utilComponents/HOCs/ErrorBoundary'

const { Option } = Select

const CheckoutSelectCard = ({ selectedSubscription, setAutoPay, onPayWithUsedCard, defaultCardId, cards, onCardSelected }) => {
  let defaultCard = cards.find(card => card._id === defaultCardId)
  let [isLoading, setIsLoading] = useState(false)


  function handleChange(value, onCardSelected) {
    onCardSelected(value)
  }

  function checkboxOnChange(event) {


      setAutoPay(event.target.checked)
  }

  return (
    <ErrorBoundary>
    <S.Wrapper>
      <span>
        <S.FormTitleTop>Use Saved Card</S.FormTitleTop>
        <S.FormTitle>{selectedSubscription} - {SubscriptionPrices[selectedSubscription.toUpperCase()]}$</S.FormTitle>
      </span>

      <S.Select defaultValue={defaultCardId} size="large"
                onChange={(value) => handleChange(value, onCardSelected)}>
        {cards.map(card => {

          return (<S.Option key={card._id}
                            value={card._id}>
            <S.CardText>
              <S.CardIcon src={mapCardToIcon(card.brand.toLocaleLowerCase())} alt=""/>
              <span>
                {CardTypes[card.brand] ? CardTypes[card.brand] : 'Unknown'}
              </span>
              <span>
                {card.last4}
              </span>
            </S.CardText>
          </S.Option>)
        })}
      </S.Select>
      <S.Checkbox onChange={checkboxOnChange}>Enable Autopay</S.Checkbox>
      <S.Button onClick={() => {


        setIsLoading(true)
        onPayWithUsedCard()
          .then(() => {
            setIsLoading(false)
          })

      }} htmlType={'submit'} type="primary" loading={isLoading} block={true}>
        Pay Now
      </S.Button>
    </S.Wrapper>
    </ErrorBoundary>
  )
}

const S = {
  Wrapper: styled.div`
    width: 225px;
    height: 250px;
    margin-left: 25px;
    padding: 25px;
    border-radius: 20px;
    border: 2px solid ${Colors.primaryColor};
    color: white;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`,
  Button: styled(Button)`
    && {
      margin-top: 10px;
      background-color: ${Colors.primaryColor};      
    }
    `,
  Select: styled(Select)`
    && {
      width: 100%;
      margin: 15px auto;
      font-size: 1em;
    }
    
    && .ant-select-content-value {
      background: none;
      color: ${Colors.primaryColor};
      border: none !important;
      box-shadow: none;
    }
    
    && .ant-select-selection__rendered {
      display: flex;
      padding-left:10px;
      justify-content: space-between;
      width: 85%;
      margin: 0;
    }
    
    && .ant-select-selection-selected-value {
      display: block;
      opacity: 1;
      flex-grow: 1;
      width: 85%;
    }
`,
  Option: styled(Option)`
    display: flex;
    justify-content: space-between;
    margin: 0;
    width: 100%;
`,
  CardText: styled.span`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8em;
`,
  CardIcon: styled.img`
    width: 25px;
    height: 25px;
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
  Checkbox: styled(Checkbox)`
    && {
      display: block;
      margin: 5px 0;
      color: ${Colors.primaryText}
    }
`
}

export default CheckoutSelectCard
