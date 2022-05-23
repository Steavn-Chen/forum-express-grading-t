const express = require('express')
const router = express.Router()

const restController = require('../../controllers/apis/restaurant-controller.js')

const admin = require('./modules/admin.js')

const { apiErrorHandler } = require('../../middleware/error-handler.js')

router.use('/admin', admin)

router.get('/restaurants', restController.getRestaurants)

router.use('/', apiErrorHandler)

module.exports = router
