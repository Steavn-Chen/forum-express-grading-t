const { Restaurant, Category, Comment, User, Favorite } = require('../../models')

const restaurantServices = require('../../services/restaurant-services.js')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) =>
      err ? next(err) : res.render('restaurants', data)
    )
  },
  getRestaurant: (req, res, next) => {
    restaurantServices.getRestaurant(req, (err, data) =>
      err ? next(err) : res.render('restaurant', data)
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
