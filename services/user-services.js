const bcrypt = require('bcryptjs')
const {
  User,
  Comment,
  Restaurant,
  Favorite,
  Like,
  Followship
} = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers.js')
const { Op } = require('sequelize')

const userServices = {
  signUp: (req, cb) => {
    const { name, email, password, passwordCheck } = req.body
    if (!password || !passwordCheck || !name || !email) {
      throw new Error('所有欄位都是必填的!')
    }
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
    return Promise.all([
      User.findByPk(req.params.id),
      imgurFileHandler(file),
      User.findAll({
        where: {
          email: {
            [Op.not]: [req.user.email]
          }
        }
      })
    ])
      .then(([user, filePath, emailData]) => {
        const emailCheck = emailData
          .map(e => e.dataValues.email)
          .includes(email)
        if (!user) throw new Error("User didn't exist!")
        if (emailCheck) throw new Error('Email is used!')
        if (Number(req.user.id) !== Number(req.params.id)) {
          throw new Error('只能編輯自己的資料。')
        }
        return user.update({
          name,
          email,
          image: filePath || user.image
        })
      })
      .then(putUser => {
        const { isAdmin, password, ...result } = putUser.toJSON()
        cb(null, { user: result })
      })
      .catch(err => cb(err))
  },
  getTopUsers: (req, cb) => {
    return User.findAll({
      include: [
        {
          model: User,
          as: 'Followers'
        }
      ]
    })
      .then(users => {
        const result = users
          .map(user => ({
            ...user.toJSON(),
            followerCount: user.Followers.length,
            isFollowed: req.user.Followings.some(f => f.id === user.id)
          }))
          .sort((a, b) => b.followerCount - a.followerCount)
        cb(null, { users: result })
      })
      .catch(err => cb(err))
  },
  addFavorite: (req, cb) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (favorite) throw new Error('You have favorited this restaurant!')
        return Favorite.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(addFr => cb(null, { addFr }))
      .catch(err => cb(err))
  },
  removeFavorite: (req, cb) => {
    const { restaurantId } = req.params
    return Favorite.findOne({
      where: {
        userId: req.user.id,
        restaurantId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error("You haven't favorited this restaurant")
        return favorite.destroy()
      })
      .then(removeFr => cb(null, { removeFr }))
      .catch(err => cb(err))
  },
  addLike: (req, cb) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Like.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, like]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (like) throw new Error('You have liked this restaurant!')
        return Like.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(addLike => cb(null, { addLike }))
      .catch(err => cb(err))
  },
  removeLike: (req, cb) => {
    const { restaurantId } = req.params
    return Like.findOne({
      where: {
        userId: req.user.id,
        restaurantId
      }
    })
      .then(like => {
        if (!like) throw new Error("You haven't liked this restaurant")
        return like.destroy()
      })
      .then(removeLike => cb(null, { removeLike }))
      .catch(err => cb(err))
  },
  addFollowing: (req, cb) => {
    console.log(req.params)
    console.log(req.user.id)
    const { userId } = req.params
    return Promise.all([
      User.findByPk(userId),
      Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: userId
        }
      })
    ])
      .then(([user, followship]) => {
        console.log(user)
        console.log(followship)
        if (!user) throw new Error("User didn't exist!")
        if (followship) throw new Error('You have followed this user!')
        return Followship.create({
          followerId: req.user.id,
          followingId: userId
        })
      })
      .then(addFo => cb(null, { addFo }))
      .catch(err => cb(err))
  },
  removeFollowing: (req, cb) => {
    const { userId } = req.params
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: userId
      }
    })
      .then(followship => {
        if (!followship) throw new Error("You haven't followed this user")
        return followship.destroy()
      })
      .then(removeFo => cb(null, { removeFo }))
      .catch(err => cb(err))
  }
}

module.exports = userServices
