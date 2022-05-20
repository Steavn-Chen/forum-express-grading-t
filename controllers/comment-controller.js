const { User, Restaurant, Comment } = require('../models')

const commentController = {
  postComment: (req, res, next) => {
    const { restaurantId, text } = req.body
    const userId = req.user.id
    if (!text) throw new Error('Comment text is required')
    return Promise.all([
      User.findByPk(userId, { raw: true }),
      Restaurant.findByPk(restaurantId, { raw: true })
    ])
      .then(([user, restaurant]) => {
        if (!user) throw new Error("User dinn't exists")
        if (!restaurant) throw new Error("Restaurant didn't exists")
        return Comment.create({
          text,
          userId,
          restaurantId
        })
      })
      .then(() => res.redirect(`/restaurants/${restaurantId}`))
      .catch(err => next(err))
  }
}

module.exports = commentController
