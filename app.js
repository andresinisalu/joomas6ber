const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const env = require('dotenv').config()
const winston = require('winston')
const logger = require('./utils/logger')
const passport = require('passport')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const flash = require('connect-flash')
const del = require('del')
const fs = require('fs')
const app = express()
const db = require('./db')
require('./config/passport')(passport, db)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(require('morgan')('combined', { 'stream': logger.stream }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
  store: new pgSession({
    pool: db.pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 } // 30 days
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

/* Will dynamically load all routes from /routes and bind them to their own endpoints defined by the filename */
fs.readdirSync(__dirname + '/routes').forEach(function (file) {
  if (file.substr(file.lastIndexOf('.') + 1) !== 'js') return
  let name = file.substr(0, file.indexOf('.'))
  let route = require('./routes/' + name)
  app.use('/', route)
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

db.init()

/* Will clear uploads folder for testing */
const uploads_folder = path.join('public', 'images', 'uploads')
del.sync([uploads_folder + '/**', '!' + uploads_folder], '!' + path.join('public', 'images', 'uploads', '.gitignore'))

module.exports = app
