const { Restaurant, Category, User, Comment, Favorite } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination.js')

const restaurantServices = {
  getRestaurants: (req, cb) => {
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
    ])
      .then(([restaurants, categories]) => {
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants
          ? req.user.FavoritedRestaurants.map(fr => fr.id)
          : []
        const likedRestaurantsId = req.user?.LikedRestaurants
          ? req.user.LikedRestaurants.map(l => l.id)
          : []
        const data = restaurants.rows.map((r, _rIndex) => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(r.id),
          isLiked: likedRestaurantsId.includes(r.id)
        }))
        return cb(null, {
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
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
            f => f.id === req.user && req.user.id
          )
          const isLikedUserId = restaurant.LikedUsers.some(
            l => l.id === req.user && req.user.id
          )
          // restaurant.dataValues = {
          //   ...restaurant.dataValues,
          //   isFavorited: favoritedUsersId,
          //   isLiked: islikedUserId
          // }
          restaurant.dataValues.isFavorited = favoritedUsersId
          restaurant.dataValues.isLiked = isLikedUserId
          return restaurant.increment('viewCounts', { by: 1 })
        })
        .then(restaurant => {
          cb(null, { restaurant: restaurant.toJSON() })
        })
        .catch(err => cb(err))
    )
    //   // 教案寫法
    // .then(restaurant => {
    //   if (!restaurant) throw new Error("Restaurant didn't exist!")
    //   return restaurant.increment('viewCounts', { by: 1 })
    // })
    // .then(restaurant => {
    //   const isFavorited = restaurant.FavoritedUsers.some(fr => fr.id === req.user && req.user.id)
    //   const isLiked = restaurant.LikedUsers.some(l => l.id === req.user && req.user.id)
    //   res.json({
    //     restaurant: restaurant.toJSON(),
    //     isFavorited,
    //     isLiked
    //   })
    // })
    // .catch(err => next(err))
  },
  getDashboard: (req, cb) => {
    return Promise.all([
      Restaurant.findByPk(req.params.id, {
        include: [Category]
      }),
      Comment.count({ where: { restaurant_id: req.params.id } }),
      Favorite.count({ where: { restaurantId: req.params.id } })
    ])
      .then(([restaurant, commentCounts, favoriteCounts]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        const result = { ...restaurant.toJSON(), commentCounts, favoriteCounts }
        cb(null, { restaurant: result })
      })
      .catch(err => cb(err))
  },
  getFeeds: (req, cb) => {
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
    ])
      .then(([restaurants, comments]) => {
        cb(null, {
          restaurants,
          comments
        })
      })
      .catch(err => cb(err))
  },
  getTopRestaurants: (req, cb) => {
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    })
      .then(restaurants => {
        const result = restaurants
          .map(r => ({
            ...r.toJSON(),
            favoritedCount: r.FavoritedUsers.length,
            isFavorited:
              req.user &&
              req.user.FavoritedRestaurants.map(fr => fr.id).some(
                f => f === r.id
              )
          }))
          .sort((a, b) => b.favoritedCount - a.favoritedCount)
        if (!restaurants) throw new Error("Restaurant didn't exist!")
        cb(null, {
          restaurants: result
        })
      })
      .catch(err => cb(err))
  }
}

module.exports = restaurantServices
