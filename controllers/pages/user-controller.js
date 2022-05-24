const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followership
const { getUser } = require('../../helpers/auth-helpers.js')
const { imgurFileHandler } = require('../../helpers/file-helpers.js')

const userServices = require('../../services/user-services.js')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '成功註冊。')
      res.redirect('/signin')
    })
    // if (req.body.password !== req.body.passwordCheck) {
    //   throw new Error('Passwords do not match!')
    // }
    // User.findOne({ where: { email: req.body.email } })
    //   .then(user => {
    //     if (user) throw new Error('Email already exists!')
    //     return bcrypt.hash(req.body.password, 10)
    //   })
    //   .then(hash =>
    //     User.create({
    //       name: req.body.name,
    //       email: req.body.email,
    //       password: hash
    //     })
    //   )
    //   .then(() => {
    //     req.flash('success_messages', '成功註冊。')
    //     res.redirect('/signin')
    //   })
    //   .catch(err => next(err))
  },

  signInPage: (req, res) => {
    res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入 !')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功 !')
    req.logout()
    res.redirect('/signIn')
  },
  getUser: (req, res, next) => {
    return User.findByPk(req.params.id, {
      // raw: true,
      // nest: true,
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
        res.render('users/profile', { user: result })
      })
      .catch(err => next(err))
  },
  // 未重構前
  // getUser: (req, res, next) => {
  //   return User.findByPk(req.params.id, {
  //     // raw: true,
  //     // nest: true,
  //     attributes: {
  //       exclude: ['password', 'isAdmin', 'createdAt', 'updatedAt']
  //     },
  //     include: [
  //       {
  //         model: Comment,
  //         attributes: {
  //           exclude: ['text', 'createdAt', 'updatedAt', 'userId']
  //         },
  //         include: [{ model: Restaurant, attributes: ['id', 'image'] }]
  //       },
  //       { model: User, as: 'Followers' },
  //       { model: User, as: 'Followings' },
  //       { model: Restaurant, as: 'FavoritedRestaurants' }
  //     ]
  //   })
  //     .then(user => {
  //       if (!user) throw new Error("User didn't exist!")
  //       if (user.dataValues.Comments) {
  //         const set = new Set()
  //         user.dataValues.Comments = user.dataValues.Comments.filter(item =>
  //           !set.has(item.dataValues.restaurantId)
  //             ? set.add(item.dataValues.restaurantId)
  //             : false
  //         )
  //         console.log(user)
  //         user.dataValues.commentCounts = user.dataValues.Comments.length
  //         user.dataValues.FollowingCounts = user.dataValues.Followings.length
  //         user.dataValues.FollowerCounts = user.dataValues.Followers.length
  //         user.dataValues.FavoritedRestaurantsCounts =
  //           user.dataValues.FavoritedRestaurants.length
  //       }
  //       res.render('users/profile', { user: user.toJSON() })
  //     })
  //     .catch(err => next(err))
  // },
  editUser: (req, res, next) => {
    if (Number(getUser(req).id) !== Number(req.params.id)) {
      throw new Error('Only edit your own information。')
    }
    return User.findByPk(req.params.id, {
      raw: true,
      nest: true
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        return res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const { name, email } = req.body
    if (!name) throw new Error('Name are required.')
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
      .then(() => {
        req.flash('success_messages', '使用者資料編輯成功')
        res.redirect(`/users/${req.params.id}`)
      })
      .catch(err => next(err))
  },

  addFavorite: (req, res, next) => {
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
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
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
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  addLike: (req, res, next) => {
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
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeLike: (req, res, next) => {
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
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  getTopUsers: (req, res, next) => {
    return User.findAll({
      include: [
        {
          model: User,
          as: 'Followers'
        }
      ]
    }).then(users => {
      // users = users.map(user => ({
      //   ...user.toJSON(),
      //   followerCount: user.Followers.length,
      //   isFollowed: req.user.Followings.some(f => f.id === user.id)
      // }))
      // users = users.sort((a, b) => b.followerCount - a.followerCount)
      // res.render('top-users', { users: users })

      // 優化後的版本，保留原來撈出來的資料，可以做比對用。
      const result = users
        .map(user => ({
          ...user.toJSON(),
          followerCount: user.Followers.length,
          isFollowed: req.user.Followings.some(f => f.id === user.id)
        }))
        .sort((a, b) => b.followerCount - a.followerCount)
      res.render('top-users', { users: result })
    })
  },
  addFollowing: (req, res, next) => {
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
        if (!user) throw new Error("User didn't exist!")
        if (followship) throw new Error('You have followed this user!')
        return Followship.create({
          followerId: req.user.id,
          followingId: userId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFollowing: (req, res, next) => {
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
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}
module.exports = userController
