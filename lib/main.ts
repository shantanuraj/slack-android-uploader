/**
 * Script to upload app updates to Slack
 */

'use strict'

import * as path from 'path'
import { reduce } from 'bluebird'
import { Slack, Shell } from './utils'
import { ANDROID_SRC, OUTPUT_APKS } from './config'

/**
 * Returns path to copy folder for build type
 * @param {string} type Type of build to copy
 */
const copyTo = (type: string) => path.join(OUTPUT_APKS, type)

/**
 * Returns the glob pattern for getting apk files for a particular build type
 * @param {string} type Type of build can be
 */
const apkFiles = (type: string) => path.join(OUTPUT_APKS, `*${type}.apk`)

/**
 * Returns command to checkout a particular tag
 * @param {string} tag Git tag to checkout
 */
const checkout = (tag: string) => `cd ${ANDROID_SRC} && git checkout ${tag}`

/**
 * Returns command to build particular app type
 * @param {string} type Type of build to produce
 */
const build = (type: string) => `cd ${ANDROID_SRC} && ./gradlew assemble${type[0].toUpperCase()}${type.substr(1)}`

/**
 * Copy built files to build folder
 * @param {string} type Type of build to copy
 */
const copy = (type: string) => `mkdir -p ${copyTo(type)} && cp ${apkFiles(type)} ${copyTo(type)}`

/**
 * Zip release folder
 * @param {string} type Type of build to zip
 */
const zip = (type: string) => `zip -r ${copyTo(type)}.zip ${copyTo(type)}`

/**
 * Posts the zip to slack
 * @param {string} type Type of build to post
 * @param {string} tag  Optional tag to build by default will build current branch
 */
const post = (type: string, tag?: string) => {
  return () => Slack(`${copyTo(type)}.zip`, type, tag)
}

/**
 * Clean zip and copied folder
 * @param {string} type Type of variant to clean
 */
const clean = (type: string) => `rm -r ${copyTo(type)} ${copyTo(type)}.zip`

/**
 * Executor function, posts a compiled package to Slack, for a particular tag
 * @param {string} type Build variant to ship by default `release`
 * @param {string} tag  Optional tag to build by default will build current branch
 */
const postToSlack = (type: string = 'release', tag?: string) => {

  const commonTasks = [
    build(type),
    copy(type),
    zip(type),
    post(type, tag),
    clean(type),
  ]

  const tasks = tag ? [checkout(tag), ...commonTasks] : commonTasks

  return reduce(tasks, (acc, task) => {
    return typeof task === 'string' ?
      Shell(task)
        .then(() => Object.assign(acc, { [task as string]: true })) :
      task()
        .then(() => Object.assign(acc, { slack: true }))
  }, {})
}

export default postToSlack