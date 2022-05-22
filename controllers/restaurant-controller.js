const { Restaurant, Category, Comment, User } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination.js')
const restaurantController = {
  getRestaurants: (req, res) => {
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    const categoryId = Number(req.query.categoryId) || ''
    const where = {}
    if (categoryId) where.categoryId = categoryId
    return Promise.all([
      Restaurant.findAndCountAll({
        include: Category,
        // where: { ...categoryId ? { categoryId } : {} },
        where: where,
        // where: { categoryId },
        limit,
        offset,
        raw: true,
        nest: true
      }),
      Category.findAll({ raw: true })
    ]).then(([restaurants, categories]) => {
      // console.log(restaurants)
      const favoritedRestaurantsId = req.user.FavoritedRestaurants.map(
        fr => fr.id
      )
      const likedRestaurantsId = req.user.LikedRestaurants.map(l => l.id)
      const data = restaurants.rows.map((r, _rIndex) => ({
        ...r,
        description: r.description.substring(0, 50),
        // isFavorited: req.user && req.user.FavoritedRestaurants.map(fr => fr.id).includes(r.id)
        isFavorited: req.user && favoritedRestaurantsId.includes(r.id),
        isLiked: req.user && likedRestaurantsId.includes(r.id)
      }))
      return res.render('restaurants', {
        restaurants: data,
        categories,
        categoryId,
        pagination: getPagination(limit, page, restaurants.count)
      })
    })
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
    return Promise.all([
      Restaurant.findByPk(req.params.id, {
        include: [Category]
      }),
      Comment.count({ where: { restaurant_id: req.params.id } })
      // Comment.max(Sequelize.cast(Sequelize.col('restaurant_id'), 'DATEONLY'))
      // Comment.findAndCountAll({
      //   raw: true,
      //   nest: true,
      //   attributes: { exclude: ['id'] }
      // })
    ])
      .then(([restaurant, commentLength]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        restaurant.dataValues.commentCounts = commentLength
        res.render('dashboard', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
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
    return Restaurant.findAll()
      .then(restaurants => {
        const result = restaurants.map(r => ({ ...r.toJSON() }))
        if (!restaurants) throw new Error("Restaurant didn't exist!")
        res.render('top-restaurants', {
          restaurants: result
        })
      })
      .catch(err => next(err))
  }
}
module.exports = restaurantController
