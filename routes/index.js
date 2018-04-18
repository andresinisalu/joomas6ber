const express = require('express')
const router = express.Router()
const path = require('path')
const db = require('../db')
const logger = require('../utils/logger')
const passport = require('passport')
const requiresLogin = require('../config/middlewares/authorization').requiresLogin
const nodemailer = require('nodemailer')
const uploader = require('../utils/uploader')
const requiresAdmin = require('../config/middlewares/authorization').requiresAdmin
var i18n = require('i18n')

router.get('/', requiresLogin, function (req, res, next) {
  res.setLocale(i18n.getLocale())
  res.render('index', {
    i18n: res
  })
})

/* GET users listing. */
router.get('/login', function (req, res, next) {
  if (req.user && req.isAuthenticated()) res.redirect('/')
  else {
    res.setLocale(i18n.getLocale())
    res.render('login', {
      i18n: res
    })
  }
})

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err)
    req.logout()
    //res.sendStatus(200)
    res.redirect('/login')
  })
})

router.get('/about', function (req, res, next) {
  res.setLocale(i18n.getLocale())
  res.render('about', {
    i18n: res
  })
})

router.get('/lang', function (req, res, next) {
  var locale
  if (i18n.getLocale() === 'en') {
    locale = 'et'
  } else {
    locale = 'en'
  }
  res.cookie('locale', locale)
  res.setLocale(locale)
  i18n.setLocale(locale)
  console.log('Set language to ' + i18n.getLocale())
  res.redirect('back')
})

router.get('/settings', function (req, res, next) {
  res.redirect('/')
})

router.post('/about', function (req, res) {

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  var mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: req.body.email,
    subject: 'Teile kirjutati Joomas6ber appist',
    text: 'Tulge ja vaadake meid: https://guarded-castle-88406.herokuapp.com/'
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
  res.redirect('/about')
})

router.post('/about', function (req, res) {

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  var mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: req.body.email,
    subject: 'Teie abi vajatakse',
    text: 'Minge korjake oma laps üless'
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
})

module.exports = router;
