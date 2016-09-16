/**
 * Slack upload logic and utilites
 */

'use strict'

const fs                                = require('fs')
const spawn                             = require('child_process').spawn
const request                           = require('request-promise')
const { SLACK_TOKEN, SLACK_CHANNEL }    = require('./config')

/**
 * Uploads the zip file to Slack
 * @param {string} file - Path of file to upload
 * @param {string} type - Type of build to upload
 * @param {string} tag  - Tag to upload
 */
const Slack = (file, type, tag) => {
    console.log('Uploading zip to Slack')

    return request.post({
        url: 'https://slack.com/api/files.upload',
        qs:  { token: SLACK_TOKEN },
        json: true,
        formData: {
            channels: SLACK_CHANNEL,
            filename: `${type}${tag ? `-${tag}` : ''}.zip`,
            file:     fs.createReadStream(file),
        },
    }).then(res => {
        if (res.ok) {
            console.log('Uploaded to Slack')
        } else {
            console.log('Failed to upload')
            throw res
        }
    })
}

/**
 * Executes given command on the Shell
 * @param {string} command - Command to execute on shell
 */
const Shell = (command) => {
    return new Promise((resolve, reject) => {
        spawn(command).on('close', (code) => code === 0 ? resolve(code) : reject(code))
    })
}

module.exports = {
    Slack,
    Shell,
}