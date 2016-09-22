/**
 * Script to upload app updates to Slack
 */

'use strict'

import * as path from 'path'
import * as glob from 'glob'
import { reduce } from 'bluebird'
import { Slack, Shell } from './utils'
import { ANDROID_SRC, OUTPUT_APKS } from './config'

/**
 * Returns path to copy folder for build type
 * @param {string} type Type of build to copy
 */
const copyTo = (type: string) => path.join(OUTPUT_APKS, type)

/**
 * Returns a promise of files array (of apk files) for a particular build type
 * @param {string} type Type of build can be
 */
const apkFiles = (type: string): Promise<string[]> => new Promise((resolve, reject) => {
  glob(path.join(OUTPUT_APKS, `*${type}.apk`), (err, files) => {
    if (err) {
      reject(err)
    } else {
      resolve(files)
    }
  })
})

/**
 * Returns command to checkout a particular tag
 * @param {string} tag Git tag to checkout
 */
const checkout = (tag: string): Executable => ({
  command: 'git',
  args: ['checkout', tag]
})

/**
 * Returns command to build particular app type
 * @param {string} type Type of build to produce
 */
const build = (type: string): Executable => ({
  command: './gradlew',
  args: [`assemble${type[0].toUpperCase()}${type.substr(1)}`],
})

/**
 * Make folder to copy to
 */
const make = (type: string): Executable => ({
  command: 'mkdir',
  args: ['-p', copyTo(type)],
})

/**
 * Copy built files to build folder
 * @param {string} type Type of build to copy
 */
const copy = (type: string, apks: string[]): Executable => ({
  command: 'cp',
  args: [...apks, copyTo(type)],
})

/**
 * Zip release folder
 * @param {string} type Type of build to zip
 */
const zip = (type: string): Executable => ({
  command: 'zip',
  args: ['-r', `${copyTo(type)}.zip`, copyTo(type)],
})

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
const clean = (type: string): Executable => ({
  command: 'rm',
  args: ['-r', copyTo(type), `${copyTo(type)}.zip`],
})

/**
 * Executor function, posts a compiled package to Slack, for a particular tag
 * @param {string} type Build variant to ship by default `release`
 * @param {string} tag  Optional tag to build by default will build current branch
 */
const postToSlack = async (type: string = 'release', tag?: string) => {

  if (tag) {
    await Shell(checkout(tag))
  }

  // await Shell(build(type))

  const apks = await apkFiles(type)

  const tasks = [
    make(type),
    copy(type, apks),
    zip(type),
    post(type, tag),
    clean(type),
  ]

  return reduce(tasks, (acc, task) => {
    return typeof task === 'object' ?
      Shell(task)
        .then(() => Object.assign(acc, { [(task as Executable).command]: true })) :
      task()
        .then(() => Object.assign(acc, { slack: true }))
  }, {})
}

export default postToSlack