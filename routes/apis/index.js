const express = require('express')
const passport = require('../../config/passport.js')
const router = express.Router()

const userController = require('../../controllers/apis/user-controller.js')
const restController = require('../../controllers/apis/restaurant-controller.js')

const admin = require('./modules/admin.js')

const { apiErrorHandler } = require('../../middleware/error-handler.js')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth.js')

router.use('/admin', authenticated, authenticatedAdmin, admin)

router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)

router.get('/restaurants/top', authenticated, restController.getTopRestaurants)
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants', authenticated, restController.getRestaurants)

router.use('/', apiErrorHandler)

module.exports = router
