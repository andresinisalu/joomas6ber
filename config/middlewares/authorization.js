module.exports = {
  requiresLogin: (req, res, next) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
    if (req.user && req.isAuthenticated()) return next()
    else {
      req.session.returnTo = req.originalUrl
      res.redirect('/login')
    }
  },

  requiresAdmin: (req, res, next) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
    if (req.user && req.user.type === 'admin' && req.isAuthenticated()) return next()
    else {
      req.session.returnTo = req.originalUrl
      res.redirect('/login')
    }
  }
}