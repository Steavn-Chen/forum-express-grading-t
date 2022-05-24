const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
// const Like = db.Like
// const Followship = db.Followership
// const { getUser } = require('../../helpers/auth-helpers.js')
const { imgurFileHandler } = require('../../helpers/file-helpers.js')
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
    userServices.signUp(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  getUser: (req, res, next) => {
    userServices.getUser(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  putUser: (req, res, next) => {
    userServices.putUser(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  getTopUsers: (req, res, next) => {
    userServices.getTopUsers(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  addFavorite: (req, res, next) => {
    userServices.addFavorite(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  removeFavorite: (req, res, next) => {
    userServices.removeFavorite(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  }
}

module.exports = userController
