const express = require('express')
const router = express.Router()
const path = require('path')
const db = require('../db')
const passport = require('passport')
const logger = require('../utils/logger')
const requiresAdmin = require('../config/middlewares/authorization').requiresAdmin
const requiresLogin = require('../config/middlewares/authorization').requiresLogin

/* GET users listing. */
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

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err)
    req.logout()
    //res.sendStatus(200)
    res.redirect('/login')
  })
})

router.get('/login/facebook', passport.authenticate('facebook'))

router.get('/login/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
  function (req, res, next) {
    res.redirect(req.session.returnTo || '/')
    delete req.session.returnTo
  })

/* GET home page. */
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

router.get('/login/client-cert', passport.authenticate('client-cert', { session: true, failureRedirect: '/login' }),
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

router.get('/stats', requiresAdmin, function (req, res, next) {
  res.sendFile(path.resolve('public/views/stats.html'))
})

router.post('/stats/add', function (req, res, next) {
  db.addStats(req.body, (error, result) => {
    if (error) logger.error('Couldn\'t add stats to db!', error.message, error.stack)
  })
})

router.get('/stats/getAll', requiresAdmin, function (req, res, next) {
    db.getAllStats((error, result) => {
      if (error) logger.error('Couldn\'t retrieve stats from db.')
      res.json(result.rows)
    })
  }
)

router.get('/about', function (req, res, next) {
  res.sendFile(path.resolve('public/views/about.html'))
})

router.get('/settings', function (req, res, next) {
  res.redirect('/')
})

router.get('/drinks/getAllAvailable', requiresLogin, function (req, res, next) {
  db.getAllDrinks((error, result) => {
    if (error) logger.error('Couldn\'t retrieve drinks from db.')
    res.json(result.rows)
  })
})

router.post('/drinks/add', requiresLogin, function (req, res, next) {
  let drinkId = parseInt(req.body.drinkId, 10)
  if (!isNaN(drinkId) && req.user.id) {
    db.getUserById(req.user.id, function (error1, result1) {
      if (error1) logger.log('error', error1)
      else {
        db.getDrinkById(drinkId, function (error2, result2) {
          if (error2) logger.log('error', error2)
          else {
            db.addDrinkToUser(drinkId, req.user.id, (error3, result3) => {
              if (error3) logger.log('error', error3)
              else logger.log('info', 'Added a drink to db!')
            })
          }
        })
      }
    })
  }
  res.redirect('/')
})

router.get('/drinks/listAllConsumed', requiresLogin, function (req, res, next) {
  db.getDrinksByUser(req.user.id, function (error, result) {
    if (error) {
      logger.log('error', 'Couldn\'t fetch all consumed drinks: ', error)
      res.send({})
    }
    else res.send(result.rows)
  })
})

router.get('/drinks/totalConsumed', requiresLogin, function (req, res, next) {
  db.getNumberOfDrinksByUser(req.user.id, function (error, result) {
    if (error) {
      logger.log('error', 'Couldn\'t fetch number of consumed drinks: ', error)
      res.send({ total: null })
    }
    else res.send({ total: result.rows[0].total })
  })
})

module.exports = router
