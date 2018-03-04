const express = require('express')
const router = express.Router()
const path = require('path')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.sendFile(path.resolve('public/views/login.html'))
})

router.post('/', function (req, res, next) {
  res.redirect('/')
  console.log(req.body.username)
})

module.exports = router
