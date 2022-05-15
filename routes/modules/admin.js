const express = require('express')
const router = express.Router()

const adminController = require('../../controllers/admin-controller.js')

const { authenticatedAdmin } = require('../../middleware/auth.js')

router.get('/restaurants', authenticatedAdmin, adminController.getRestaurants)
router.use('/', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router
