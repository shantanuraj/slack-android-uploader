/**
 * Script to upload app updates to Slack
 */

'use strict'

const path                          = require('path')
const Bluebird                      = require('bluebird')
const { Slack, Shell }              = require('./utils')
const { ANDROID_SRC, OUTPUT_APKS }  = require('./config')

/**
 * Returns path to copy folder for build type
 * @param {string} type - Type of build to copy
 * @returns {string}
 */
const copyTo = (type) => path.join(OUTPUT_APKS, type)

/**
 * Returns the glob pattern for getting apk files for a particular build type
 * @param {string} type - Type of build can be
 */
const apkFiles = (type) => path.join(OUTPUT_APKS, `*${type}.apk`)

/**
 * Returns command to checkout a particular tag
 * @param {string} tag - Git tag to checkout
 */
const checkout = (tag) => `cd ${ANDROID_SRC} && git checkout ${tag}`

/**
 * Returns command to build particular app type
 * @param {string} type - Type of build to produce
 */
const build = (type) => `cd ${ANDROID_SRC} && ./gradlew assemble${type[0].toUpperCase()}${type.substr(1)}`

/**
 * Copy built files to build folder
 * @param {string} type - Type of build to copy
 */
const copy = (type) => `mkdir -p ${copyTo(type)} && cp ${apkFiles(type)} ${copyTo(type)}`

/**
 * Zip release folder
 * @param {string} type - Type of build to zip
 */
const zip = (type) => `zip -r ${copyTo(type)}.zip ${copyTo(type)}`

/**
 * Posts the zip to slack
 * @param {string} type - Type of build to post
 * @param {string} tag  - Optional tag to build by default will build current branch
 */
const post = (type, tag) => {
  return () => Slack(`${copyTo(type)}.zip`, type, tag)
}

/**
 * Clean zip and copied folder
 * @param {string} type - Type of variant to clean
 */
const clean = (type) => `rm -r ${copyTo(type)} ${copyTo(type)}.zip`

/**
 * Executor function, posts a compiled package to Slack, for a particular tag
 * @param {string} type - Build variant to ship by default `release`
 * @param {string} tag  - Optional tag to build by default will build current branch
 */
const postToSlack = (type, tag) => {

  const _type = type || 'release'

  const commonTasks = [
    build(_type),
    copy(_type),
    zip(_type),
    post(_type, tag),
    clean(_type),
  ]

  const tasks = tag ? [checkout(tag), ...commonTasks] : commonTasks

  return Bluebird.reduce(tasks, (acc, task) => {
    return typeof task === 'string' ?
      Shell(task)
        .then(() => Object.assign(acc, { [task]: true })) :
      task()
        .then(() => Object.assign(acc, { slack: true }))
  }, {})
}

module.exports = postToSlack