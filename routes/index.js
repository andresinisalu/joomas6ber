const express = require('express')
const router = express.Router()
const path = require('path')
const db = require('../db')
const passport = require('passport')

/* GET users listing. */
router.get('/login', function (req, res, next) {
  res.sendFile(path.resolve('public/views/login.html'))
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/users',
  failureRedirect: '/login'
}))

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err)
    req.logout()
    res.sendStatus(200)
  })
})

router.get('/login/facebook', passport.authenticate('facebook'))

router.get('/login/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => res.redirect('/users'))

/* GET home page. */
router.get('/', function (req, res, next) {
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

module.exports = router
