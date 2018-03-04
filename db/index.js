const { Client } = require('pg')
// await client.connect()

// await client.end()

const { Pool } = require('pg')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'isherenow',
  port: 5432,
})

// pool.query('SELECT NOW()', (err, res) => {
//   console.log(err, res)
// })

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'isherenow',
  port: 5432,
})

function findUser(user){

}

client.connect()

// client.query('SELECT NOW()', (err, res) => {
//   console.log(err, res)
// })

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  }
}