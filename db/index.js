const denodeify = require('denodeify')
const Client = require('pg')
const logger = require('../utils/logger')
const readFile = denodeify(require('fs').readFile)
const pathModule = require('path')

const dbconfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
}

const pool = new Client.Pool(dbconfig)

pool.on('error', function (err) {
  logger.error('idle client error', err.message, err.stack)
})

pool.connect((err) => {
  if (err) logger.log('error', 'Cannot establish connection to the database: %s', err)
  else logger.log('info', 'Connected to the database.')
})

function getUserByUsername (user, cb) {
  pool.query('SELECT * from users where username=$1', [user.username], function (err, result) {
    if (err) {
      logger.log('error', 'Error while retrieving an user=%s from db: %s', user.username, err)
    } else {
      logger.log('info', 'Found an user=%s.', user.username)
    }
    cb(err, result)
  })
}

function addUser (user, cb) {
  pool.query('INSERT INTO public.users ' +
    '(firstname, lastname, username, password) VALUES ' +
    '($1, $2, $3, $4);', [user.firstname, user.lastname, user.username, user.password],
    (err, res) => {
      cb(err, res)
    })
}

function init () {
  return readFile(pathModule.resolve(__dirname, './init.sql'), 'utf8')
    .then(tableDef => pool.query(tableDef))
}

module.exports = {
  query: (text, params, callback) => pool.query(text, params, callback),
  init,
  addUser,
  pool
}