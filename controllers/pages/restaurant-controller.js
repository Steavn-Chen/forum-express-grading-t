const { Restaurant, Category, Comment, User, Favorite } = require('../../models')

const restaurantServices = require('../../services/restaurant-services.js')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) =>
      err ? next(err) : res.render('restaurants', data)
    )
  },
  getRestaurant: (req, res, next) => {
    return (
      Restaurant.findByPk(req.params.id, {
        include: [
          Category,
          {
            model: Comment,
            separate: true,
            order: [['created_at', 'DESC']],
            include: User
          },
          {
            model: User,
            as: 'FavoritedUsers'
          },
          {
            model: User,
            as: 'LikedUsers'
          }
        ]
        // order: [[Comment, 'created_at', 'DESC']]
      })
        // 個人寫法
        .then(restaurant => {
          if (!restaurant) throw new Error("Restaurant didn't exist!")
          const favoritedUsersId = restaurant.FavoritedUsers.some(
            f => f.id === req.user.id
          )
          const islikedUserId = restaurant.LikedUsers.some(
            l => l.id === req.user.id
          )
          // restaurant.dataValues = {
          //   ...restaurant.dataValues,
          //   isFavorited: favoritedUsersId,
          //   isLiked: islikedUserId
          // }
          restaurant.dataValues.isFavorited = favoritedUsersId
          restaurant.dataValues.isLiked = islikedUserId
          return restaurant.increment('viewCounts', { by: 1 })
        })
        .then(restaurant => {
          res.render('restaurant', { restaurant: restaurant.toJSON() })
        })
        //   // 教案寫法
        // .then(restaurant => {
        //   if (!restaurant) throw new Error("Restaurant didn't exist!")
        //   return restaurant.increment('viewCounts', { by: 1 })
        // })
        // .then(restaurant => {
        //   const isFavorited = restaurant.FavoritedUsers.some(fr => fr.id === req.user.id)
        //   const isLiked = restaurant.LikedUsers.some(l => l.id === req.user.id)
        //   res.render('restaurant', {
        //     restaurant: restaurant.toJSON(),
        //     isFavorited,
        //     isLiked
        //   })
        // })
        .catch(err => next(err))
    )
  },

  getDashboard: (req, res, next) => {
    return (
      Promise.all([
        Restaurant.findByPk(req.params.id, {
          include: [Category]
        }),
        Comment.count({ where: { restaurant_id: req.params.id } }),
        Favorite.count({ where: { restaurantId: req.params.id } })
      ])
        // 重構後
        .then(([restaurant, commentCounts, favoriteCounts]) => {
          if (!restaurant) throw new Error("Restaurant didn't exist!")
          // restaurant = restaurant.toJSON()
          // restaurant.commentCounts = commentLength
          // restaurant.favoriteCounts = favoriteLength
          restaurant = { ...restaurant.toJSON(), commentCounts, favoriteCounts }
          res.render('dashboard', { restaurant })
        })
        // 未重構前
        // .then(([restaurant, commentLength, favoriteLength]) => {
        //   if (!restaurant) throw new Error("Restaurant didn't exist!")
        //   restaurant.dataValues.commentCounts = commentLength
        //   restaurant.dataValues.favoriteCounts = favoriteLength
        //   res.render('dashboard', { restaurant: restaurant.toJSON() })
        // })
        .catch(err => next(err))
    )
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        raw: true,
        nest: true,
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        raw: true,
        nest: true,
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: ['User', 'Restaurant']
      })
    ]).then(([restaurants, comments]) => {
      res.render('feeds', {
        restaurants,
        comments
      })
    })
  },
  getTopRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    })
      .then(restaurants => {
        // const faveriteRestaurantId = req.user.FavoritedRestaurants.map(fr => fr.id)
        // console.log(faveriteRestaurantId)
        const result = restaurants.map(r => ({
          ...r.toJSON(),
          favoritedCount: r.FavoritedUsers.length,
          isFavorited:
            req.user &&
            req.user.FavoritedRestaurants.map(fr => fr.id).some(
              f => f === r.id
            )
        })).sort((a, b) => b.favoritedCount - a.favoritedCount)
        if (!restaurants) throw new Error("Restaurant didn't exist!")
        res.render('top-restaurants', {
          restaurants: result
        })
      })
      .catch(err => next(err))
  }
}
module.exports = restaurantController
