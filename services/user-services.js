const bcrypt = require('bcryptjs')
const { User } = require('../models')

const userServices = {
  signUp: (req, cb) => {
    const { name, email, password, passwordCheck } = req.body
    if (!password || !passwordCheck || !name || !email) throw new Error('所有欄位都是必填的!')
    if (password !== passwordCheck) {
      throw new Error('Passwords do not match!')
    }
    User.findOne({ where: { email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(password, 10)
      })
      .then(hash =>
        User.create({
          name,
          email,
          password: hash
        })
      )
      .then(user => {
        cb(null, { user })
      })
      .catch(err => cb(err))
  }
}

module.exports = userServices
