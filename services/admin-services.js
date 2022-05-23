const { Restaurant, Category } = require('../models')
// const { imgurFileHandler } = require('../../helpers/file-helpers.js')
const { getOffset, getPagination } = require('../helpers/pagination.js')

const adminServices = {
  getRestaurants: (req, cb) => {
    const DEFAULT_LIMIT = 9
    const limit = Number(req.params.limit) || DEFAULT_LIMIT
    const page = Number(req.query.page) || 1
    const offset = getOffset(limit, page)
    Restaurant.findAndCountAll({
      raw: true,
      nest: true,
      include: [Category],
      limit,
      offset
    })
      .then(restaurants => {
        cb(null, {
          restaurants: restaurants.rows,
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => cb(err))
  },
  deleteRestaurant: (req, res, next, cb) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.destroy()
      })
      .then(deleteRestaurant => {
        cb(null, { restaurant: deleteRestaurant })
      })
      .catch(err => cb(err))
  }
}

module.exports = adminServices
