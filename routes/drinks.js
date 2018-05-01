const express = require('express')
const router = express.Router()
const db = require('../db')
const logger = require('../utils/logger')
const uploader = require('../utils/uploader')
const requiresLogin = require('../config/middlewares/authorization').requiresLogin
const ws = require('../config/websockets')

router.get('/drinks/getAllAvailable', requiresLogin, function (req, res, next) {
  db.getAllAvailableDrinks(req.user.id, (error, result) => {
    if (error) {
      logger.error('Couldn\'t retrieve drinks from db: ', error.message, error.stack)
      res.sendStatus(500)
    }
    else {
      res.json(result.rows)
    }
  })
})

router.post('/drinks/add', requiresLogin, uploader.single('drink-img'), function (req, res, next) {
  let name = req.body.name
  let startDate = new Date(req.body.startdate).toISOString()
  let endDate = new Date(req.body.enddate).toISOString()
  let alcoholPercentage = parseFloat(req.body.alcohol_percentage)
  let price = parseFloat(req.body.price)
  let volume = req.body.volume
  let isFinished = true
  let filename = null
  if (req.file) filename = req.file.filename

  db.getAllAvailableDrinks(req.user.id, (error, result) => {
    if (error) logger.error('Some problem with loading drinks from db.')
    else {
      let drinks = result.rows
      let leitudId = null
      for (let i in drinks) {
        let drink = drinks[i]
        /* Ignore .0 rounding errors with double equal signs for numeric variables. */
        if (drink.name === name &&
          drink.volume == volume &&
          drink.alcohol_percentage == alcoholPercentage &&
          drink.price == price &&
          (drink.userid === null || drink.userid === req.user.id)) {
          leitudId = drink.id
          break
        }
      }
      if (leitudId === null) {
        db.addDrink(name, volume, alcoholPercentage, price, req.user.id, filename, (error, result) => {
          if (error) logger.error('Could not add new drink to db.', error.message, error.stack)
          else {
            leitudId = result.rows[0]['id']
            db.addDrinkToUser(leitudId, req.user.id, startDate, endDate, isFinished, (error2, result2) => {
              if (error2) logger.log('error', error2)
              else {
                logger.log('info', 'Added a drink to db and user.')
                ws.updateDrinksForUser(req.user.id)
              }
            })
          }
        })
      } else {
        db.addDrinkToUser(leitudId, req.user.id, startDate, endDate, isFinished, (error2, result2) => {
          if (error2) logger.log('error', error2)
          else {
            logger.log('info', 'Added a drink to user.')
            ws.updateDrinksForUser(req.user.id)
          }
        })
      }
    }
  })
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

router.get('/drinks/listLastFiveDrinks', requiresLogin, function (req, res, next) {
  db.getLast5DrinksByUser(req.user.id, function (error, result) {
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