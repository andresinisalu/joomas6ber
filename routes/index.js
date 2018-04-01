const express = require('express')
const app = require('../app')
const router = express.Router()
const path = require('path')
const db = require('../db')
const passport = require('passport')
const logger = require('../utils/logger')
const uploader = require('../utils/uploader')
const requiresAdmin = require('../config/middlewares/authorization').requiresAdmin
const requiresLogin = require('../config/middlewares/authorization').requiresLogin
var i18n = new (require('i18n-2'))({
  locales: ['et', 'en'],
  updateFiles: false
});

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
  // res.sendFile(path.resolve('public/views/index.html'))
  res.render('index', {
    title: "Joogisõber",
    menu: i18n.__('Menu'),
    mainpage: i18n.__('Main Page'),
    changelang: i18n.__('Change to Estonian'),
    aboutus: i18n.__('About us'),
    settings: i18n.__('Settings'),
    logout: i18n.__('Log Out'),
    name: i18n.__('Name'),
    volume: i18n.__("Volume"),
    alcoholcontent:i18n.__("Alcohol content"),
    price:i18n.__("Price"),
    starttime:i18n.__("Start time"),
    endtime:i18n.__("End time")
  })
})

//TODO: mby remove?
// router.get('/testDB', function (req, res, next) {
//   db.query('SELECT * FROM users', [], function (error, result) {
//     if (error) res.render('error', { error: error, message: 'Database error!' })
//     else {
//       res.render('index', { title: result.rows[0].firstname })
//     }
//   })
// })

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

router.get('/changeLang', function (req, res, next) {
  if (i18n.getLocale() === "en"){
    i18n = new (require('i18n-2'))({
      locales: ['et'],
    });
  } else {
    i18n = new (require('i18n-2'))({
      locales: ['en'],
      updateFiles: false
    });
  }
  console.log("Set language to " + i18n.getLocale())
  res.redirect("back");
})

  // router.get('/about', function (req, res, next) {
  //   // var aboutData = data;
  //   // aboutData['title'] = "About Us";
  //   res.render('about', JSON.stringify(data));


  router.get('/about', function (req, res, next) {
    // var aboutData = data;
    // aboutData['title'] = "About Us";
    res.render('about', {
      title: i18n.__('About us'),
      whoarewe: i18n.__('Who are we'),
      whotext: i18n.__('We are students from University of Tartu - Andre, Erik and Jan. '),
      whatwedo: i18n.__('What do we do'),
      whattext: i18n.__('We created this website to ' +
        'spread knowledge about alcohol consumption (and also to finish our web app development course).'),
      menu: i18n.__('Menu'),
      mainpage: i18n.__('Main Page'),
      changelang: i18n.__('Change to Estonian'),
      aboutus: i18n.__('About us'),
      settings: i18n.__('Settings'),
      logout: i18n.__('Log Out')
    })
  })




router.get('/settings', function (req, res, next) {
  res.redirect('/')
})

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
  let startDate = new Date(req.body.startDate).toISOString()
  let endDate = new Date(req.body.endDate).toISOString()
  let alcoholPercentage = parseFloat(req.body.alcoholPercentage)
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
          if (error) logger.error('Could not add new drink to db.')
          else {
            leitudId = result.rows[0]['id']
            db.addDrinkToUser(leitudId, req.user.id, startDate, endDate, isFinished, (error2, result2) => {
              if (error2) logger.log('error', error2)
              else logger.log('info', 'Added a drink to db and user.')
            })
          }
        })
      } else {
        db.addDrinkToUser(leitudId, req.user.id, startDate, endDate, isFinished, (error2, result2) => {
          if (error2) logger.log('error', error2)
          else logger.log('info', 'Added a drink to user.')
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
