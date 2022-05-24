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
    restaurantServices.getDashboard(req, (err, data) =>
      err ? next(err) : res.render('dashboard', data)
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
