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
var flash = require('connect-flash')
const del = require('del')
const fs = require('fs')
const app = express()
const db = require('./db')
require('./config/passport')(passport, db)
var i18n = require('i18n')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(require('morgan')('combined', { 'stream': logger.stream }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(i18n.init)
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

i18n.configure({
  locales: ['et', 'en'],
  directory: __dirname + '/locales',
  defaultLocale: 'et',
  extension: '.js',
  cookieName: 'i18n'
})

app.locals.__ = i18n.__

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

let index = require('./routes/index');
let drinks = require('./routes/drinks');
let banks = require('./routes/banks');
let login = require('./routes/login');
let stats = require('./routes/stats');
let users = require('./routes/users');
app.use('/', index);
app.use('/', banks);
app.use('/', login);
app.use('/', stats);
app.use('/', users);
app.use('/', drinks);


/* Will dynamically load all routes from /routes and bind them to their own endpoints defined by the filename */
// fs.readdirSync(__dirname + '/routes').forEach(function (file) {
//   if (file.substr(file.lastIndexOf('.') + 1) !== 'js') return
//   let name = file.substr(0, file.indexOf('.'))
//   let route = require('./routes/' + name)
//   app.use('/', route)
// })

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
