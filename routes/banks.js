const express = require('express')
const router = express.Router()
const ipizza = require('ipizza')
const logger = require('../utils/logger')

ipizza.set({
  hostname: process.env.HOSTNAME || 'http://joomas6ber:3000',
  appHandler: router,
  returnRoute: '/banks',
  cancelRoute: '/banks/canceled',
  logLevel: 'info',
  env: 'development',
  throwOnErrors: false
})

ipizza.provider(
  {
    provider: 'seb',
    //gateway: 'https://www.seb.ee/cgi-bin/unet3.sh/un3min.r', // No point in using real URL right now.
    gateway: 'http://localhost:3480/banklink/seb',
    clientId: 'uid13',
    privateKey: './config/certificates/banks/user_key_seb.pem',
    certificate: './config/certificates/banks/bank_cert_seb.pem',
    alias: 'seb'
  })

ipizza.provider(
  {
    provider: 'swedbank'
    //gateway: 'https://www.swedbank.ee/banklink', // No point in using real URL right now.
    , gateway: 'http://localhost:3480/banklink/swedbank'
    , clientId: 'uid26'
    , privateKey: './config/certificates/banks/user_key_swedbank.pem'
    , certificate: './config/certificates/banks/bank_cert_swedbank.pem'
    , alias: 'swedbank'
  })

ipizza.on('success', function (reply, req, res) {
  req.flash('info', 'Transaction succeeded! :)')
  //Shouldn't actually redirect here because banks expect us to respond with 200 (not 301).
  res.redirect('/banks')
})

ipizza.on('error', function (reply, req, res) {
  req.flash('info', 'Transaction failed :(')
  res.redirect('/banks')
})

router.post('/banks/pay', function (req, res) {
  let payment = ipizza.payment({
    provider: req.body.provider
    , id: 1
    , msg: 'Development funds for Joomas6ber'
    , amount: req.body.amount
    , curr: req.body.curr || 'EUR'
    , ref: ''
    , lang: 'ENG'
    , account: 'EE501000000000000123'
    , accountName: 'Joomas6ber'
    , encoding: 'UTF-8'
  })
  payment.pipe(res)
})

router.get('/banks', function (req, res) {
  res.render('banks', { messages: req.flash('info') })
})

router.post('/banks', function (req, res) {
  res.redirect('/banks')
})

router.post('/banks/canceled/*', function (req, res) {
  req.flash('info', 'Transaction failed :(')
  res.redirect('/banks')
})

module.exports = router