const express = require('express')
const router = express.Router()
const path = require('path')
const passport = require('passport')
const logger = require('../utils/logger')
const bcrypt = require('bcrypt')
const db = require('../db')

router.post('/register', function (req, res, next) {
  const saltRounds = 10
  const myPlaintextPassword = req.body.password
  bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
    db.addNewUser(req.body.firstName, req.body.lastName, req.body.username, hash)
  });
  res.redirect('/')
})

router.get('/register', function (req, res, next) {
  res.sendFile(path.resolve('public/views/register.html'))
})

module.exports = router