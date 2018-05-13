const express = require('express')
const router = express.Router()
const path = require('path')
const db = require('../db')

router.post('/deleteAccount', function (req, res, next) {
  db.deleteUser(req.user.id)
  req.session.destroy((err) => {
    if (err) return next(err)
    req.logout()
    //res.sendStatus(200)
    res.redirect('/login')
  })
})

router.get('/deleteAccount', function (req, res, next) {
  res.sendFile(path.resolve('public/views/deleteAccount.html'))
})

module.exports = router