const bcrypt = require('bcryptjs')
const { User, Comment, Restaurant } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers.js')

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
  },
  getUser: (req, cb) => {
    return User.findByPk(req.params.id, {
      attributes: {
        exclude: ['password', 'isAdmin', 'createdAt', 'updatedAt']
      },
      include: [
        {
          model: Comment,
          attributes: {
            exclude: ['text', 'createdAt', 'updatedAt', 'userId']
          },
          include: [{ model: Restaurant, attributes: ['id', 'image'] }]
        },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
        { model: Restaurant, as: 'FavoritedRestaurants' }
      ]
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        let result = user.toJSON()
        const isFollowed = req.user?.Followings.some(f => f.id === user.id)
        const anotherUserId = Number(req.params.id)
        const userId = req.user.id
        if (user.dataValues.Comments) {
          const set = new Set()
          const Comments = result.Comments.filter(item =>
            !set.has(item.restaurantId) ? set.add(item.restaurantId) : false
          )
          result = {
            ...result,
            Comments,
            commentCounts: Comments.length,
            FollowingCounts: result.Followings.length,
            FollowerCounts: result.Followers.length,
            FavoritedRestaurantsCounts: result.FavoritedRestaurants.length
          }
        }
        cb(null, { user: result, anotherUserId, userId, isFollowed })
      })
      .catch(err => cb(err))
  },
  putUser: (req, cb) => {
    const { name, email } = req.body
    if (!name || !email) throw new Error('Name of Email are required.')
    const { file } = req
    return Promise.all([User.findByPk(req.params.id), imgurFileHandler(file)])
      .then(([user, filePath]) => {
        if (!user) throw new Error("User didn't exist!")
        return user.update({
          name,
          email,
          image: filePath || user.image
        })
      })
      .then((putUser) => {
        const { isAdmin, password, ...result } = putUser
        cb(null, { user: result })
      })
      .catch(err => cb(err))
  }
}

module.exports = userServices
