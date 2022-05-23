const { Restaurant, Category } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers.js')
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
  postRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } =
      req.body
    if (!name) throw new Error('Restaurant name is required!')
    const { file } = req
    imgurFileHandler(file)
      .then(filePath =>
        Restaurant.create({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || null,
          categoryId
        })
      )
      .then(newRestaurant => {
        cb(null, { restaurant: newRestaurant })
      })
      .catch(err => cb(err))
  },
  deleteRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.destroy()
      })
      .then(deleteRestaurant => {
        cb(null, { restaurant: deleteRestaurant })
      })
      .catch(err => cb(err))
  },
  putRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } =
      req.body
    if (!name) throw new Error('Restaurant name is required!')
    const { file } = req
    Promise.all([Restaurant.findByPk(req.params.id), imgurFileHandler(file)])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image,
          categoryId
        })
      })
      .then(putRestaurant => {
        cb(null, { restaurant: putRestaurant })
      })
      .catch(err => cb(err))
  }
}

module.exports = adminServices
