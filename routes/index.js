const express = require('express')
const router = express.Router()
const passport = require('../config/passport.js')

const upload = require('../middleware/multer.js')

const restController = require('../controllers/restaurant-controller.js')
const userController = require('../controllers/user-controller.js')
const commentController = require('../controllers/comment-controller.js')

const admin = require('./modules/admin.js')

const { authenticated, authenticatedAdmin } = require('../middleware/auth.js')
const { generalErrorHandler } = require('../middleware/error-handler.js')

router.use('/admin', authenticatedAdmin, admin)

router.get('/users/:id/edit', authenticated, userController.editUser)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', upload.single('image'), authenticated, userController.putUser)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logout)

router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants', authenticated, restController.getRestaurants)

router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
router.post('/comments', authenticated, commentController.postComment)

router.use('/', (req, res) => res.redirect('/restaurants'))

router.use('/', generalErrorHandler)

module.exports = router
