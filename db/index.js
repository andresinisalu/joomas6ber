const { Client } = require('pg')
const logger = require('../utils/logger')

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
})

client.connect((err) => {
  if (err) logger.log('error', 'Cannot establish connection to the database: %s', err)
  else logger.log('info', 'Connected to the database.')
})

function getUserByUsername (user, cb) {
  client.query('SELECT * from users where username=$1', [user.username], function (err, result) {
    if (err) {
      logger.log('error', 'Error while retrieving an user={} from db: {}', user.username, err)
    } else {
      logger.log('info', 'Found an user=%s.', user.username)
    }
    cb(err, result)
  })
}

function addUser (user, cb) {
  client.query('INSERT INTO public.users ' +
    '(firstname, lastname, username, password) VALUES ' +
    '($1, $2, $3, $4);', [user.firstname, user.lastname, user.username, user.password],
    (err, res) => {
      cb(err, res)
    })
}

function init () {
  /* Delete all previous tables for testing purposes */
  client.query('drop owned by current_user;')

  /* Create new table named 'Users' */
  client.query('CREATE TABLE public.users\n' +
    '("firstname" text NOT NULL,\n' +
    '"lastname" text NOT NULL,\n' +
    '"Id" serial NOT NULL,\n' +
    '"username" text NOT NULL UNIQUE,\n' +
    '"password" text NOT NULL,\n' +
    'CONSTRAINT "Id" PRIMARY KEY ("Id")\n' +
    ');\n' +
    'ALTER TABLE public.users OWNER to joomas6ber;')

  /* Add a test user */
  addUser({
    username: 'test',
    password: 'test',
    firstname: 'FirstName',
    lastname: 'LastName'
  }, (err, res) => {
    if (err) logger.log('error', 'Couldn\'t add user to the database.')
    else logger.log('info', 'Successfully added an user to the database.')
  })

  /* Test if user was successfully added */
  getUserByUsername({ username: 'test' }, (err, res) => {
    if (err) logger.log('info', 'Database is not working properly!')
    else logger.log('info', 'Database is working properly.')
  })
}

module.exports = {
  query: (text, params, callback) => client.query(text, params, callback),
  init,
  addUser
}