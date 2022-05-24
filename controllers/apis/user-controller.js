const jwt = require('jsonwebtoken')

const userController = {
  signIn: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      console.log(userData)
      delete userData.password
      const { password, ...newUserData } = userData
      console.log(newUserData)
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '5d' })
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
  }
}

module.exports = userController
