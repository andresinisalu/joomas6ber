module.exports = {
  requiresLogin: (req, res, next) => {
    if (req.user && req.isAuthenticated()) return next()
    res.redirect('/login')
  },

  requiresAdmin: (req, res, next) => {
    if (req.user && req.user.type === 'admin' && req.isAuthenticated()) return next()
    res.redirect('/login')
  }
}