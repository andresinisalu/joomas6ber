const WebSocket = require('ws')
const cookie = require('cookie')
const db = require('../db')
const logger = require('../utils/logger')
const cookieParser = require('cookie-parser')

let wss = null
module.exports.init = function (server) {
  wss = new WebSocket.Server({ server })

  wss.on('connection', (ws, req) => {
    /* Add session info to ws object. */
    let cookies = cookie.parse(req.headers.cookie)
    let sid = cookieParser.signedCookie(cookies['connect.sid'], process.env.SESSION_SECRET)
    db.getSessionFromSID(sid, (err, res) => {
      if (err) console.log(err)
      else {
        ws.user = res.rows[0].sess.passport.user
      }
    })
  })
}

module.exports.updateDrinksForUser = function (userId) {
  wss.clients.forEach((client) => {
    if (client.user && client.user.id === userId) {
      db.getDrinksByUser(userId, function (error, result) {
        if (error) logger.log('error', 'Couldn\'t fetch all consumed drinks: ', error)
        else {
          client.send(JSON.stringify({
            command: 'updateDrinks',
            data: result.rows
          }))
        }
      })
    }
  })
}