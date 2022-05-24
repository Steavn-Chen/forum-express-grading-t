const express = require('express')
const passport = require('../../config/passport.js')
const router = express.Router()

const userController = require('../../controllers/apis/user-controller.js')
const restController = require('../../controllers/apis/restaurant-controller.js')

const admin = require('./modules/admin.js')

const { apiErrorHandler } = require('../../middleware/error-handler.js')

router.use('/admin', admin)

router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)

router.get('/restaurants/top', restController.getTopRestaurants)
router.get('/restaurants/feeds', restController.getFeeds)
router.get('/restaurants/:id/dashboard', restController.getDashboard)
router.get('/restaurants/:id', restController.getRestaurant)
router.get('/restaurants', restController.getRestaurants)

router.use('/', apiErrorHandler)

module.exports = router
