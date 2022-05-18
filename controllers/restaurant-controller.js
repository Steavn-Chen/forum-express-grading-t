const { Restaurant, Category } = require('../models')

const restaurantController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({
      include: Category,
      raw: true,
      nest: true
    }).then(restaurants => {
      const data = restaurants.map((r, _rIndex) => ({
        ...r,
        description: r.description.substring(0, 50)
      }))
      return res.render('restaurants', { restaurants: data })
    })
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category,
      raw: true,
      nest: true
    }).then(restaurant => {
      if (!restaurant) throw new Error("Restaurant didn't exist!")
      return res.render('restaurant', { restaurant })
    })
  }
}

module.exports = restaurantController
