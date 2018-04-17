const express = require('express')
const router = express.Router()
const path = require('path')
const db = require('../db')
const logger = require('../utils/logger')
const requiresAdmin = require('../config/middlewares/authorization').requiresAdmin

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

module.exports = router