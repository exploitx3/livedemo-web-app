import DEV_CONFIG from './configs/dev.js'
import STAGING_CONFIG from './configs/staging.js'
import PROD_CONFIG from './configs/prod.js'
import fs from 'fs'

const CONFIGS = {
  dev: DEV_CONFIG,
  staging: STAGING_CONFIG,
  prod: PROD_CONFIG
}
// let ENV = 'prod'
let ENV = process.env.ENV || 'dev'
console.log("Environment built for " + ENV)

fs.writeFileSync('./src/config.json', JSON.stringify(CONFIGS[ENV]))
fs.writeFileSync('./src/injectScript/config.json', JSON.stringify(CONFIGS[ENV]))
