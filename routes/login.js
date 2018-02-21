var express = require('express')
var router = express.Router()
var path = require('path')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.sendFile(path.resolve('public/views/login.html'))
})


router.post('/', function (req, res, next) {
  res.redirect('/')
})


module.exports = router
