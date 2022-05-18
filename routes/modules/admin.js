const express = require('express')
const router = express.Router()

const upload = require('../../middleware/multer.js')

const adminController = require('../../controllers/admin-controller.js')
const categoryController = require('../../controllers/category-controller.js')

router.get('/restaurants/create', adminController.createRestaurant)
router.get('/restaurants/:id/edit', adminController.editRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)
// router.post('/categories', categoryController.postCategory)
router.get('/restaurants', adminController.getRestaurants)
router.get('/categories', categoryController.getCategories)

router.get('/users', adminController.getUsers)
router.patch('/users/:id/toggleAdmin', adminController.patchUser)

router.use('/', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router
