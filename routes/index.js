const express = require('express')
const router = express.Router()
const path = require('path')
const db = require('../db')
const logger = require('../utils/logger')
const requiresLogin = require('../config/middlewares/authorization').requiresLogin

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

module.exports = router
