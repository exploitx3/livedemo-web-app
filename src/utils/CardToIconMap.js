// payment-icons SVGs are MPL-2.0. See THIRD_PARTY_NOTICES.md.
import visa from 'payment-icons/min/flat/visa.svg'
import amex from 'payment-icons/min/flat/amex.svg'
import dinersclub from 'payment-icons/min/flat/diners.svg'
import jcb from 'payment-icons/min/flat/jcb.svg'
import mastercard from 'payment-icons/min/flat/mastercard.svg'
import unionpay from 'payment-icons/min/flat/unionpay.svg'
import unknown from 'payment-icons/min/flat/default.svg'
import CardTypes from '../constants/CardTypes.js'

export const mapCardToIcon = function (cardType) {


  switch (cardType) {
    case CardTypes.visa.toLocaleLowerCase():
      return visa
    case CardTypes['american express'].toLocaleLowerCase():
      return amex
    case CardTypes['diners club'].toLocaleLowerCase():
      return dinersclub
    case CardTypes.jcb.toLocaleLowerCase():
      return jcb
    case CardTypes.mastercard.toLocaleLowerCase():
      return mastercard
    case CardTypes.unionpay.toLocaleLowerCase():
      return unionpay
    default:
      return unknown
  }
}

