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

function getUserByUsername (username, cb) {
  pool.query('SELECT * from users where username=$1', [username], (err, result) => cb(err, result))
}

function addUser (user, cb) {
  pool.query('INSERT INTO public.users ' +
    '(username, password, firstname, middlename, lastname, service, gender, weight, type, facebook_id, ssn) VALUES ' +
    '($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)' +
    'RETURNING id;',
    [user.username, user.password, user.firstName, user.middleName, user.lastName, user.service, user.gender, user.weight, user.type, user.facebook_id, user.ssn],
    (err, res) => {
      cb(err, res)
    })
}
function init () {
  return readFile(pathModule.resolve(__dirname, './init.sql'), 'utf8')
    .then(tableDef => pool.query(tableDef))
}

function getUserByFacebookId (fbid, cb) {
  pool.query('SELECT * FROM users WHERE facebook_id=$1', [fbid], (err, res) => {
    cb(err, res)
  })
}

function getUserBySsn (ssn, cb) {
  pool.query('SELECT * FROM users WHERE ssn=$1', [ssn], (err, res) => cb(err, res))
}

function getUserById (uid, cb) {
  pool.query('SELECT * FROM public.users WHERE id = $1', [uid], (err, res) => cb(err, res))
}

function addStats (stats, cb) {
  pool.query('INSERT INTO public.stats ' +
    '(screen_width, screen_height, date, ip_addr, country_name, city, user_agent, os_name, browser_name, endpoint) VALUES ' +
    '($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',
    [stats.screenWidth, stats.screenHeight, stats.date, stats.ip_addr, stats.countryName, stats.city, stats.userAgent, stats.OSName, stats.browserName, stats.endPoint],
    (err, res) => cb(err, res)
  )
}

function getAllStats (cb) {
  pool.query('SELECT * FROM stats', (err, res) => cb(err, res))
}

function getAllDrinks (cb) {
  pool.query('SELECT * FROM drinks', (err, res) => cb(err, res))
}

function getDrinkById (drinkId, cb) {
  pool.query('SELECT * FROM drinks WHERE id = $1', [drinkId], (err, res) => cb(err, res))
}

function addDrinkToUser (drinkId, userId, cb) {
  pool.query('INSERT INTO usersanddrinks' +
    '(userid, drinkid) VALUES ' +
    '($1, $2);',
    [userId, drinkId], (err, res) => cb(err, res))
}

function getDrinksByUser (userId, cb) {
  pool.query('SELECT drinks.name, drinks.volume, drinks.price FROM drinks ' +
    'JOIN usersanddrinks on usersanddrinks.drinkid = drinks.id ' +
    'JOIN users ON usersanddrinks.userid = users.id ' +
    'WHERE users.id = $1', [userId], (err, res) => cb(err, res))
}

function getNumberOfDrinksByUser (userId, cb) {
  pool.query('SELECT COUNT(*) AS total FROM drinks ' +
    'JOIN usersanddrinks ON usersanddrinks.drinkid = drinks.id ' +
    'JOIN users ON usersanddrinks.userid = users.id ' +
    'WHERE users.id = $1', [userId], (err, res) => cb(err, res))
}

module.exports = {
  query: (text, params, callback) => pool.query(text, params, callback),
  init,
  addUser,
  pool,
  getUserByFacebookId,
  getUserById,
  getUserByUsername,
  getUserBySsn: getUserBySsn,
  addStats,
  getAllStats,
  getAllDrinks,
  getDrinkById,
  addDrinkToUser,
  getDrinksByUser,
  getNumberOfDrinksByUser
}