const _ = require('lodash')
const Promise = require('bluebird')
const rp = require('request-promise')
const substruct = require('@internalfx/substruct')

module.exports = function (config) {
  const userConfig = substruct.services.userConfig
  let mailer
  let send

  const mailConf = _.get(userConfig, 'mailer') || {}

  if (mailConf.type === 'mailgun') {
    send = function (mail) {
      return rp({
        uri: `https://api:${mailConf.api_key}@api.mailgun.net/v3/${mailConf.domain}/messages`,
        method: 'POST',
        formData: {
          from: mailConf.fromEmail,
          to: mail.to,
          subject: mail.subject,
          text: mail.text || '',
          html: mail.html || ''
        }
      })
    }
  } else {
    const directTransport = require('nodemailer-direct-transport')
    mailer = Promise.promisifyAll(require('nodemailer').createTransport(directTransport()))

    send = function (mail) {
      console.log('Attempting to send mail directly')
      mail.from = mailConf.fromEmail || mail.to
      return mailer.sendMailAsync(mail)
    }
  }

  return Object.freeze({
    send
  })
}
