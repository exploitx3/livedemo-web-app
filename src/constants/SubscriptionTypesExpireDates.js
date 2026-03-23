import moment from 'moment'

export default {
  startup_monthly: moment().add(30, 'days').toDate(),
  startup_annually: moment().add(1, 'years').toDate(),
  pro_monthly: moment().add(30, 'days').toDate(),
  pro_annually: moment().add(1, 'years').toDate(),
  business_monthly: moment().add(30, 'days').toDate(),
  business_annually: moment().add(1, 'years').toDate(),
}
