/**
 * Constants and configuration
 */

'use strict'

import * as path from 'path'

/**
 * @type {string} Slack private token
 */
export const SLACK_TOKEN = process.env.SLACK_TOKEN

if (!SLACK_TOKEN) {
  console.error('Environment variable `SLACK_TOKEN` is not set!')
  process.exit(-1)
}

/**
 * @type {string} Slack channel to post to by default `#general`
 */
export const SLACK_CHANNEL = process.env.SLACK_CHANNEL || 'general'

/**
 * @type {string} Path to the android source code
 */
export const ANDROID_SRC = process.cwd()

/**
 * @type {string} Path to the output apk folder
 */
export const OUTPUT_APKS = path.join(ANDROID_SRC, 'app', 'build', 'outputs', 'apk')
