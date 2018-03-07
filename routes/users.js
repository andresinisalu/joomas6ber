const express = require('express')
const requiresLogin = require('../config/middlewares/authorization').requiresLogin
const router = express.Router()

/* GET users listing. */
router.get('/', requiresLogin, function (req, res, next) {
  res.send('respond with a resource')
})

module.exports = router