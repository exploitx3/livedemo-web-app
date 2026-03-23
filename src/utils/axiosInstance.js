import axiosLib from 'axios'
import config from '../config.json'

const axios = axiosLib.create({
  baseURL: config.API_URL,
  timeout: 1000000,
  headers: {
    ClientId: 'publicClient',
    'Content-Type': 'application/json'
  }
})

// Add a request interceptor
axios.interceptors.request.use(function (config) {

  // config.headers.ClientId = 'privateClient'

  return config
})

export default axios
