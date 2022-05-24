const passport = require('../config/passport.js')

// const authenticated = passport.authenticate('jwt', { session: false })
const authenticated = (req, res, next) => {
  return passport.authenticate('jwt', { session: false })(req, res, next)
}

const authenticatedAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next()
  return res.status(403).json({ status: 'success', message: 'permission denied' })
}

module.exports = { authenticated, authenticatedAdmin }
