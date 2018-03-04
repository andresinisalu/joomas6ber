const { Client } = require('pg')
require('dotenv')
const { Pool } = require('pg')

const pool = new Pool({
  user: process.env.DBUSER,
  host: 'localhost',
  database: process.env.DB,
  password: process.env.DBPW,
  port: 5432,
})

const client = new Client({
  user: process.env.DBUSER,
  host: 'localhost',
  database: process.env.DB,
  password: process.env.DBPW,
  port: 5432,
})

// function findUser(user){}

client.connect()

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  }
}