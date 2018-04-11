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
  pool.query('SELECT * from users where username=$1', [username], cb)
}

function addUser (user, cb) {
  pool.query('INSERT INTO public.users ' +
    '(username, password, firstname, middlename, lastname, service, gender, weight, type, facebook_id, ssn) VALUES ' +
    '($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)' +
    'RETURNING id;',
    [user.username, user.password, user.firstName, user.middleName, user.lastName, user.service, user.gender, user.weight, user.type, user.facebook_id, user.ssn], cb)
}
function init () {
  return readFile(pathModule.resolve(__dirname, './init.sql'), 'utf8')
    .then(tableDef => pool.query(tableDef))
}

function getUserByFacebookId (fbid, cb) {
  pool.query('SELECT * FROM users WHERE facebook_id=$1', [fbid], cb)
}

function getUserBySsn (ssn, cb) {
  pool.query('SELECT * FROM users WHERE ssn=$1', [ssn], cb)
}

function getUserById (uid, cb) {
  pool.query('SELECT * FROM public.users WHERE id = $1', [uid], cb)
}

function addStats (stats, cb) {
  pool.query('INSERT INTO public.stats ' +
    '(screen_width, screen_height, date, ip_addr, country_name, city, user_agent, os_name, browser_name, endpoint) VALUES ' +
    '($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',
    [stats.screenWidth, stats.screenHeight, stats.date, stats.ip_addr, stats.countryName, stats.city, stats.userAgent, stats.OSName, stats.browserName, stats.endPoint],
    cb
  )
}

function getAllStats (cb) {
  pool.query('SELECT * FROM stats', cb)
}

function getAllAvailableDrinks (userId, cb) {
  pool.query('SELECT * FROM drinks ' +
    'WHERE (userid IS NULL OR userid = $1);', [userId], cb)
}

function getDrinkById (drinkId, cb) {
  pool.query('SELECT * FROM drinks WHERE id = $1', [drinkId], cb)
}

function addDrinkToUser (drinkId, userId, startDate, endDate, isFinished, cb) {
  pool.query('INSERT INTO consumed_drinks' +
    '(userid, drinkid, startdate, enddate, isfinished) VALUES ' +
    '($1, $2, $3, $4, $5);',
    [userId, drinkId, startDate, endDate, isFinished], cb)
}

function getDrinksByUser (userId, cb) {
  pool.query('SELECT drinks.name, drinks.volume, drinks.price,drinks.alcohol_percentage, consumed_drinks.startdate, consumed_drinks.enddate FROM drinks ' +
    'JOIN consumed_drinks on consumed_drinks.drinkid = drinks.id ' +
    'JOIN users ON consumed_drinks.userid = users.id ' +
    'WHERE users.id = $1', [userId], cb)
}

function getNumberOfDrinksByUser (userId, cb) {
  pool.query('SELECT COUNT(*) AS total FROM drinks ' +
    'JOIN consumed_drinks ON consumed_drinks.drinkid = drinks.id ' +
    'JOIN users ON consumed_drinks.userid = users.id ' +
    'WHERE users.id = $1', [userId], cb)
}

function addDrink (name, volume, alcoholPercentage, price, userId, filename, cb) {
  pool.query('INSERT INTO drinks' +
    '(name, volume, alcohol_percentage, price, userid, filename) VALUES ' +
    '($1, $2, $3, $4, $5, $6)' +
    'RETURNING id;',
    [name, volume, alcoholPercentage, price, userId, filename], cb)
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
  getAllAvailableDrinks,
  getDrinkById,
  addDrinkToUser,
  getDrinksByUser,
  getNumberOfDrinksByUser,
  addDrink
}