import moment from 'moment'

export default {
  pro_monthly: moment().add(30, 'days').toDate(),
  pro_annually: moment().add(1, 'years').toDate(),
  growth_monthly: moment().add(30, 'days').toDate(),
  growth_annually: moment().add(1, 'years').toDate(),
}
