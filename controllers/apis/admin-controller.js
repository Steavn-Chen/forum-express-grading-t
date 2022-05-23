// const { Restaurant, Category } = require('../../models')
// const { imgurFileHandler } = require('../../helpers/file-helpers.js')
// const { getOffset, getPagination } = require('../../helpers/pagination.js')

const adminServices = require('../../services/admin-services.js')

const adminController = {
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.json(data))
  }
}

module.exports = adminController
