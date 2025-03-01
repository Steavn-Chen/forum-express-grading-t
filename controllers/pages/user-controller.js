const db = require('../../models')
const User = db.User

const { getUser } = require('../../helpers/auth-helpers.js')

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
  },

  signInPage: (req, res) => {
    res.render('signin')
  },

  signIn: (req, res, next) => {
    userServices.signIn(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '成功登入 !')
      res.redirect('/restaurants')
    })
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功 !')
    req.logout()
    res.redirect('/signIn')
  },
  getUser: (req, res, next) => {
    userServices.getUser(req, (err, data) => err ? next(err) : res.render('users/profile', data))
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
    userServices.putUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '使用者資料編輯成功')
      res.redirect(`/users/${req.params.id}`)
    })
  },
  addFavorite: (req, res, next) => {
    userServices.addFavorite(req, (err, data) =>
      err ? next(err) : res.redirect('back')
    )
  },
  removeFavorite: (req, res, next) => {
    userServices.removeFavorite(req, (err, data) =>
      err ? next(err) : res.redirect('back')
    )
  },
  addLike: (req, res, next) => {
    userServices.addLike(req, (err, data) =>
      err ? next(err) : res.redirect('back')
    )
  },
  removeLike: (req, res, next) => {
    userServices.removeLike(req, (err, data) =>
      err ? next(err) : res.redirect('back')
    )
  },
  getTopUsers: (req, res, next) => {
    userServices.getTopUsers(req, (err, data) =>
      err ? next(err) : res.render('top-users', data)
    )
  },
  addFollowing: (req, res, next) => {
    userServices.addFollowing(req, (err, data) =>
      err ? next(err) : res.redirect('back')
    )
  },
  removeFollowing: (req, res, next) => {
    userServices.removeFollowing(req, (err, data) =>
      err ? next(err) : res.redirect('back')
    )
  }
}
module.exports = userController
