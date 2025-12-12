import express from 'express'
import { verifyToken, verifyAdmin } from '~/middlewares/auth.middleware.js'
import { placeValidation } from '~/validations/place.validation.js'
import { placeController } from '~/controllers/place.controller.js'

import { categoryValidation } from '~/validations/category.validation.js'
import { categoryController } from '~/controllers/category.controller.js'

import { userValidation } from '~/validations/user.validation.js'
import { userController } from '~/controllers/user.controller.js'

import { blogController } from '~/controllers/blog.controller.js'
import { blogCommentController } from '~/controllers/blogComment.controller.js' 
import { reviewController } from '~/controllers/review.controller.js'
import { adminValidation } from '~/validations/admin.validation.js'
import { adminController } from '~/controllers/admin.controller.js'
import { badgeValidation } from '~/validations/badge.validation.js'

import { badgeController } from '~/controllers/badge.controller.js'

import { generalValidation } from '~/validations/general.validation.js'
import { uploadFiles } from '~/middlewares/multer.middleware.js'
import { uploadPlaceImages } from '~/middlewares/cloudinary.middleware.js'


import { reportValidation } from '~/validations/report.validation.js'
import { reportController } from '~/controllers/report.controller.js'

const Router = express.Router()

Router.get('/me', verifyToken, verifyAdmin, adminController.getMe);
Router.post('/login', userValidation.login, userController.login)
Router.post('/places', verifyToken, uploadFiles.array('images', 10), uploadPlaceImages, placeValidation.createNew, placeController.createNew)
Router.get('/places', verifyToken, verifyAdmin, placeValidation.pagingValidate, placeController.getAllPlaces)
Router.get('/places/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, placeController.getAdminPlaceDetails)
Router.patch('/places/:id', verifyToken, verifyAdmin, uploadFiles.array('images', 10), uploadPlaceImages, generalValidation.paramIdValidate, placeController.updatePlace)

Router.put('/places/:id/approve', verifyToken, verifyAdmin, generalValidation.paramIdValidate, placeController.approvePlace)
Router.put('/places/:id/coordinates', verifyToken, verifyAdmin, placeValidation.updatePlaceCoordinates, placeController.updatePlaceCoordinates)
Router.delete('/places/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, placeController.destroyPlace)
Router.post('/categories', verifyToken, categoryValidation.createNew, categoryController.createNew)
Router.get('/categories', categoryController.getAllCategories)
Router.get('/categories/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, categoryController.getCategoryById)
Router.patch('/categories/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, categoryController.updateCategory)
Router.delete('/categories/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, categoryController.deleteCategory)

Router.get('/users', verifyToken, verifyAdmin, userController.getAllUsers)
Router.get('/users/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, userController.getUserDetails)
Router.patch('/users/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, userController.updateUserStatus)
Router.put('/users/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, userController.banUser)
Router.delete('/users/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, userController.destroyUser)

Router.get('/services', verifyToken, verifyAdmin, adminController.getAllServices)

Router.get('/posts', verifyToken, verifyAdmin, blogController.getBlogs)
Router.get('/posts/:id', verifyToken, verifyAdmin, blogController.getBlogById)
Router.put('/posts/:id/privacy', verifyToken, verifyAdmin, blogController.updateBlogPrivacy)
Router.put('/posts/:id/status', verifyToken, verifyAdmin, blogController.updateBlogStatus)
Router.delete('/posts/:id', verifyToken, verifyAdmin, blogController.deleteBlog)

Router.get('/stats/overview', verifyToken, verifyAdmin, adminController.getOverviewStats)
Router.get('/stats/daily', verifyToken, verifyAdmin, adminController.getDailyStats)
Router.get('/stats/popular', verifyToken, verifyAdmin, adminController.getPopularStats)
Router.get('/stats/topViewedPlaces', verifyToken, verifyAdmin, adminController.getTopViewedPlaces)
Router.get('/stats/logins', adminController.getLoginStats)
Router.get('/stats/categories', verifyToken, adminController.getCategoryStats)
Router.get('/stats/monthlyUsers', verifyToken, verifyAdmin, adminController.getUserMonthlyStats)
Router.get('/stats/topUsers', verifyToken, verifyAdmin, adminController.getTopUsers)


Router.get('/badges', verifyToken, verifyAdmin, badgeController.getAllBadges)
Router.get('/badges/:id', verifyToken, verifyAdmin, badgeController.getBadgeById)
Router.post('/badges', verifyToken, verifyAdmin, badgeValidation.createNew, badgeController.createBadge)
Router.patch('/badges/:id', verifyToken, verifyAdmin, badgeController.updateBadge)
Router.delete('/badges/:id', verifyToken, verifyAdmin, badgeController.deleteBadge)

Router.get('/reviews', verifyToken, verifyAdmin, adminValidation.getFilteredReviews, adminController.getFilteredReviews)
Router.delete('/reviews/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, adminController.deleteReview)
Router.put('/reviews/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, adminController.hideReview)

Router.get('/reports', verifyToken, verifyAdmin, reportController.getReports);
Router.get('/reports/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, reportController.getReportById);
Router.put('/reports/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, reportValidation.updateReport, reportController.updateReport);
Router.delete('/reports/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, reportController.deleteReport);

Router.get('/reports/comments/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, adminController.getReportedBlogCommentById);
Router.get('/reports/reviews/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, adminController.getReportedReviewById);
Router.get('/reports/places/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, adminController.getReportedPlaceById);
Router.get('/reports/blogs/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, adminController.getReportedBlogById);

export const adminRoute = Router
