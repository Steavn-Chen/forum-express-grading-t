const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const { getUser } = require('../helpers/auth-helpers.js')
const { imgurFileHandler } = require('../helpers/file-helpers.js')
const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res, next) => {
    if (req.body.password !== req.body.passwordCheck) {
      throw new Error('Passwords do not match!')
    }
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash =>
        User.create({
          name: req.body.name,
          email: req.body.email,
          password: hash
        })
      )
      .then(() => {
        req.flash('success_messages', '成功註冊。')
        res.redirect('/signin')
      })
      .catch(err => next(err))
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
        }
      ]
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        if (user.dataValues.Comments) {
          const set = new Set()
          user.dataValues.Comments = user.dataValues.Comments.filter(item =>
            !set.has(item.dataValues.restaurantId)
              ? set.add(item.dataValues.restaurantId)
              : false
          )
          user.dataValues.commentCounts = user.dataValues.Comments.length
        }
        res.render('users/profile', { user: user.toJSON() })
      })
      .catch(err => next(err))
  },
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
    return Promise.all([
      User.findByPk(req.params.id),
      imgurFileHandler(file)
    ])
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
  }
}
module.exports = userController
