const express = require('express')
const router = express.Router()
const passport = require('passport')
const path = require('path')
const logger = require('../utils/logger')

router.get('/login', function (req, res, next) {
  if (req.user && req.isAuthenticated()) res.redirect('/')
  else {
    res.sendFile(path.resolve('public/views/login.html'))
  }
})

router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function (req, res, next) {
  res.redirect(req.session.returnTo || '/')
  delete req.session.returnTo
})

router.get('/login/facebook', passport.authenticate('facebook'))

router.get('/login/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
  function (req, res, next) {
    res.redirect(req.session.returnTo || '/')
    delete req.session.returnTo
  })

router.get('/login/client-cert', passport.authenticate('client-cert', {
    session: true,
    failureRedirect: '/login'
  }),
  function (req, res, next) {
    res.redirect(req.session.returnTo || '/')
    delete req.session.returnTo
  })

/* Redirects HTTP to HTTPS for ID-card authentication */
router.get('/login/secure', (req, res, next) => {
  if (!req.client.encrypted) {
    res.redirect('https://' + req.headers.host.split(':')[0] + '/login/client-cert')
  } else {
    res.redirect('/login/client-cert')
  }
})

module.exports = router