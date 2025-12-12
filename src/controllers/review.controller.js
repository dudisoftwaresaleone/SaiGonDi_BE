import { StatusCodes } from 'http-status-codes'
import { reviewService } from '../services/review.service.js'
import { reportService } from '../services/report.service.js';
import { userBadgeService } from '../services/userBadge.service.js';


const createReview = async (req, res, next) => {
  try {
    const { placeId } = req.params
    const userId = req.user.id
    const newReview = await reviewService.createReview(placeId, req.body, userId)
    await userBadgeService.handleUserAction(userId, 'commentPlace', { placeId: placeId, reviewId: newReview._id });

    res.status(StatusCodes.CREATED).json({ success: true, data: newReview })
  } catch (error) {
    next(error)
  }
}

const getReviewsByPlaceId = async (req, res, next) => {
  try {
    const result = await reviewService.getReviewsByPlaceId(req.query)
    res.status(StatusCodes.OK).json({
      success: true,
      count: result.reviews.length,
      pagination: result.pagination,
      data: result.reviews
    })
  } catch (error) {
    next(error)
  }
}

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user

    await reviewService.deleteReview(id, user)
    res.status(StatusCodes.OK).json({ success: true, message: 'Đánh giá đã được xoá thành công.' })
  } catch (error) {
    next(error)
  }
}

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const updatedReview = await reviewService.updateReview(id, req.body, userId)
    res.status(StatusCodes.OK).json({ success: true, data: updatedReview })
  } catch (error) {
    next(error)
  }
}

const reportReview = async (req, res, next) => {
  try {
    const report = await reportService.createReport({
      reportedId: req.params.id,
      reportedModel: 'reviews',
      userId: req.user.id,
      reason: req.body.reason
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Review reported successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

export const reviewController = {
  createReview,
  getReviewsByPlaceId,
  deleteReview,
  updateReview,
  reportReview
}
