/**
 * Constants and configuration
 */

'use strict'

const path = require('path')

/**
 * @type {string} Slack private token
 */
const SLACK_TOKEN = process.env.SLACK_TOKEN

if (!SLACK_TOKEN) {
  console.error('Environment variable `SLACK_TOKEN` is not set!')
  process.exit(-1)
}

/**
 * @type {string} Slack channel to post to by default `#general`
 */
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || 'general'

/**
 * @type {string} Path to the android source code
 */
const ANDROID_SRC = process.cwd()

/**
 * @type {string} Path to the output apk folder
 */
const OUTPUT_APKS = path.join(ANDROID_SRC, 'app', 'build', 'outputs', 'apk')

module.exports = {
  ANDROID_SRC,
  OUTPUT_APKS,
  SLACK_TOKEN,
  SLACK_CHANNEL,
}