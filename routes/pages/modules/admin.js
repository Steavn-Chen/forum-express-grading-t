const express = require('express')
const router = express.Router()

const upload = require('../../../middleware/multer.js')

const adminController = require('../../../controllers/pages/admin-controller.js')
const categoryController = require('../../../controllers/pages/category-controller.js')

const { generalErrorHandler } = require('../../../middleware/error-handler.js')

router.get('/restaurants/create', adminController.createRestaurant)
router.get('/restaurants/:id/edit', adminController.editRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)
router.get('/restaurants', adminController.getRestaurants)

router.get('/categories/:id', categoryController.getCategories)
router.put('/categories/:id', categoryController.putCategories)
router.delete('/categories/:id', categoryController.deleteCategories)
router.get('/categories', categoryController.getCategories)
router.post('/categories', categoryController.postCategory)

router.get('/users', adminController.getUsers)
router.patch('/users/:id/toggleAdmin', adminController.patchUser)

// router.use('/', (req, res) => res.redirect('/admin/restaurants'))
router.get('/', (req, res) => res.redirect('/admin/restaurants'))

router.use('/', generalErrorHandler)

module.exports = router
