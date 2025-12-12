import { adminService } from '../services/admin.service.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import UserModel from '../models/User.model.js'
import { get } from 'mongoose'

const getMe = async (req, res, next) => {
  try {
    const adminId = req.user?.id
    if (!adminId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token không hợp lệ hoặc thiếu ID')
    }

    const admin = await adminService.getMe(adminId)

    if (!admin) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Không tìm thấy user')
    }

    if (!admin.isAdmin) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền admin')
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        avatar: admin.avatar,
        role: admin.role
      }
    })
  } catch (error) {
    next(error)
  }
}

const getOverviewStats = async (req, res, next) => {
  try {
    const stats = await adminService.getOverviewStats()
    res.status(StatusCodes.OK).json({
      success: true,
      data: stats
    })
  } catch (error) {
    next(error)
  }
}

const getDailyStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDailyStats()
    res.status(StatusCodes.OK).json({
      success: true,
      data: stats
    })
  } catch (error) {
    next(error)
  }
}
const getLoginStats = async (req, res, next) => {
  try {
    const stats = await adminService.getLoginStats()
    res.status(StatusCodes.OK).json({
      success: true,
      data: stats
    })
  } catch (error) {
    next(error)
  }
}

const getTopViewedPlaces = async (req, res, next) => {
  try {
    const places = await adminService.getTopViewedPlaces()
    res.status(StatusCodes.OK).json({
      success: true,
      data: places
    })
  } catch (error) {
    next(error)
  }
}

const getPopularStats = async (req, res, next) => {
  try {
    const stats = await adminService.getPopularStats()
    res.status(StatusCodes.OK).json({
      success: true,
      data: stats
    })
  } catch (error) {
    next(error)
  }
}
const getAllServices = async (req, res, next) => {
  try {
    const services = await adminService.getAllServices(req.query)
    res.status(StatusCodes.OK).json({
      success: true,
      data: services
    })
  } catch (error) {
    next(error)
  }
}

const getFilteredReviews = async (req, res, next) => {
  try {
    const reviews = await adminService.getFilteredReviews(req.query, req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      data: reviews
    })
  } catch (error) {
    next(error)
  }
}

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params
    const deletedReview = await adminService.deleteReview(id)
    res.status(StatusCodes.OK).json({
      success: true,
      data: deletedReview
    })
  } catch (error) {
    next(error)
  }
}

const hideReview = async (req, res, next) => {
  try {
    const { id } = req.params
    const review = await adminService.hideReview(id)
    res.status(StatusCodes.OK).json({
      success: true,
      data: review
    })
  } catch (error) {
    next(error)
  }
}

const getReportedBlogCommentById = async (req, res, next) => {
  try {
    const { id } = req.params
    const comment = await adminService.getReportedBlogCommentById(id)
    if (!comment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Bình luận không tồn tại')
    }
    res.status(StatusCodes.OK).json({
      success: true,
      data: comment
    })
  } catch (error) {
    next(error)
  }
}

const getReportedReviewById = async (req, res, next) => {
  try {
    const { id } = req.params
    const review = await adminService.getReportedReviewById(id)
    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Đánh giá không tồn tại')
    }
    res.status(StatusCodes.OK).json({
      success: true,
      data: review
    })
  } catch (error) {
    next(error)
  }
}

const getReportedPlaceById = async (req, res, next) => {
  try {
    const { id } = req.params
    const place = await adminService.getReportedPlaceById(id)
    if (!place) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Địa điểm không tồn tại')
    }
    res.status(StatusCodes.OK).json({
      success: true,
      data: place
    })
  } catch (error) {
    next(error)
  }
}

const getReportedBlogById = async (req, res, next) => {
  try {
    const { id } = req.params
    const blog = await adminService.getReportedBlogById(id)
    if (!blog) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Bài viết không tồn tại')
    }
    res.status(StatusCodes.OK).json({
      success: true,
      data: blog
    })
  } catch (error) {
    next(error)
  }
}

const getCategoryStats = async (req, res, next) => {
  try {
    const data = await adminService.getCategoryStats();
    res.status(StatusCodes.OK).json({
      success: true,
      data
    });
  } catch (error) {
    next(error)
  }
}
const getUserMonthlyStats = async (req, res, next) => {
  try {
    const stats = await adminService.getUserMonthlyStats()
    res.status(StatusCodes.OK).json({
      success: true,
      data: stats
    })
  } catch (error) {
    next(error)
  }
}

const getTopUsers = async (req, res, next) => {
  try {
    const topUsers = await adminService.getTopUsers()
    res.status(StatusCodes.OK).json({
      success: true,
      data: topUsers
    });
  } catch (error) {
    next(error)
  }
}



export const adminController = {
  getMe,
  getOverviewStats,
  getDailyStats,
  getPopularStats,
  getAllServices,
  getFilteredReviews,
  deleteReview,
  hideReview,
  getReportedBlogCommentById,
  getReportedReviewById,
  getReportedPlaceById,
  getReportedBlogById,
  getTopViewedPlaces,
  getLoginStats,
  getCategoryStats,
  getUserMonthlyStats,
  getTopUsers
}