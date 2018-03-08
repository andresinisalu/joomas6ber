const bcrypt = require('bcrypt')
const logger = require('../utils/logger')
const FacebookStrategy = require('passport-facebook').Strategy
const LocalStrategy = require('passport-local').Strategy

module.exports = (passport, db) => {

  passport.use(new LocalStrategy((username, password, cb) => {
    db.getUserByUsername(username, (err, result) => {
      if (err) {
        logger.error('Error when selecting user on  login', err)
        return cb(err)
      }
      if (result.rows.length > 0) {
        const first = result.rows[0]
        bcrypt.compare(password, first.password, function (err, res) {
          if (res) {
            //cb(null, { id: first.id, username: first.username, type: first.type })
            cb(null, first) //Todo: mõelda välja, mis field'e vaja üldse.
          } else {
            cb(null, false)
          }
        })
      } else {
        cb(null, false)
      }
    })
  }))

  passport.use(new FacebookStrategy({
      clientID: process.env.FB_CLIENT_ID,
      clientSecret: process.env.FB_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/login/facebook/callback',
      profileFields: ['id', 'name', 'gender', 'email']
    },
    function (accessToken, refreshToken, profile, cb) {
      db.getUserByFacebookId(profile.id, (err, res) => {
        if (err) return cb(err)
        if (res.rowCount === 0) {
          // Create new user and add to db.
          user = {
            facebook_id: profile.id,
            gender: profile.gender,
            username: profile.username,
            service: profile.provider,
            firstName: profile.givenName,
            middleName: profile.middleName,
            lastName: profile.lastName,
            type: 'user'
          }
          db.addUser(user, (err, res) => {
            if (err) logger.error('Error adding new Facebook user to DB!', err.message, err.stack)
            else Object.assign(user, { id: res.rows[0]['id'] }) // Add 'id' field from db to obj.
            return cb(err, user)
          })
        } else {
          // Found an existing user.
          return cb(err, user)
        }
      })
    }))

  passport.serializeUser((user, done) => {
    done(null, user) //Todo: mõelda välja, mis asi jätta. user.id on variant.
  })

  passport.deserializeUser((user, cb) => {
    db.getUserById(parseInt(user.id, 10), (err, results) => {
      if (err) {
        logger.error('Error when selecting user on session deserialize', err)
        return cb(err)
      }
      cb(null, results.rows[0])
    })
  })
}