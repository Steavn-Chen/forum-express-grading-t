const { Restaurant, Category } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination.js')
const restaurantController = {
  getRestaurants: (req, res) => {
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    const categoryId = Number(req.query.categoryId) || ''
    return Promise.all([
      Restaurant.findAndCountAll({
        include: Category,
        where: {
          ...(categoryId ? { categoryId } : {})
        },
        limit,
        offset,
        raw: true,
        nest: true
      }),
      Category.findAll({ raw: true })
    ]).then(([restaurants, categories]) => {
      const favoritedRestaurantsId = req.user?.FavoritedRestaurants
        ? req.user.FavoritedRestaurants.map((fr) => fr.id)
        : []
      const likedRestaurantsId = req.user?.LikedRestaurants
        ? req.user.LikedRestaurants.map((l) => l.id)
        : []
      const data = restaurants.rows.map((r, _rIndex) => ({
        ...r,
        description: r.description.substring(0, 50),
        isFavorited: req.user && favoritedRestaurantsId.includes(r.id),
        isLiked: req.user && likedRestaurantsId.includes(r.id)
      }))
      return res.json({
        restaurants: data,
        categories,
        categoryId,
        pagination: getPagination(limit, page, restaurants.count)
      })
    })
  }
}

module.exports = restaurantController
