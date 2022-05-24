const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User
// const Comment = db.Comment
// const Restaurant = db.Restaurant
// const Favorite = db.Favorite
// const Like = db.Like
// const Followship = db.Followership
// const { getUser } = require('../../helpers/auth-helpers.js')
// const { imgurFileHandler } = require('../../helpers/file-helpers.js')
const jwt = require('jsonwebtoken')

const userServices = require('../../services/user-services.js')

const userController = {
  signIn: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password
      // const { password, ...newUserData } = userData
      const token = jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: '5d'
      })
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = userController
