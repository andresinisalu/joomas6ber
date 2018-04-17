const express = require('express')
const router = express.Router()
const path = require('path')
const db = require('../db')
const logger = require('../utils/logger')
const requiresLogin = require('../config/middlewares/authorization').requiresLogin
const nodemailer = require('nodemailer')

router.get('/', requiresLogin, function (req, res, next) {
  res.sendFile(path.resolve('public/views/index.html'))
})

router.get('/testDB', function (req, res, next) {
  db.query('SELECT * FROM users', [], function (error, result) {
    if (error) res.render('error', { error: error, message: 'Database error!' })
    else {
      res.render('index', { title: result.rows[0].firstname })
    }
  })
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
  res.sendFile(path.resolve('public/views/about.html'))
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

module.exports = router
