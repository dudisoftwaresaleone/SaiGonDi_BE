import { blogCommentService } from '~/services/blogComment.service.js'
import { reportService } from '../services/report.service.js';
import { userBadgeService } from '../services/userBadge.service.js';
import { StatusCodes } from 'http-status-codes'


const createComment = async (req, res, next) => {
  try {
    const { blogId } = req.params
    const userId = req.user.id

    if (req.cloudFiles?.images?.length) {
      req.body.images = req.cloudFiles.images
    }

    const newComment = await blogCommentService.createComment(blogId, req.body, userId)
    await userBadgeService.handleUserAction(req.user.id, 'commentBlog', { blogId: blogId, commentId: newComment._id });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: newComment
    })
  } catch (error) {
    next(error)
  }
}

const getCommentsByBlog = async (req, res, next) => {
  try {
    const { blogId } = req.params
    const { comments, pagination } = await blogCommentService.getCommentsByBlog(blogId, req.query)
    res.status(StatusCodes.OK).json({
      success: true,
      count: comments.length,
      pagination,
      data: comments
    })
  } catch (error) {
    next(error)
  }
}

const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    if (req.cloudFiles?.images?.length) {
      req.body.images = req.cloudFiles.images
    }
    
    const updatedComment = await blogCommentService.updateComment(id, userId, req.body)
    res.status(StatusCodes.OK).json({ success: true, data: updatedComment })
  } catch (error) {
    next(error)
  }
}

const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user
    await blogCommentService.deleteComment(id, user)
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Bình luận đã được xoá thành công.'
    })
  } catch (error) {
    next(error)
  }
}

const likeComment = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const updatedComment = await blogCommentService.likeComment(id, userId)
    res.status(StatusCodes.OK).json({ success: true, data: updatedComment })
  } catch (error) {
    next(error)
  }
}

const reportComment = async (req, res, next) => {
  try {
    const report = await reportService.createReport({
      reportedId: req.params.id,
      reportedModel: 'blog_comments',
      userId: req.user.id,
      reason: req.body.reason
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Comment reported successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};


export const blogCommentController = {
  createComment,
  getCommentsByBlog,
  updateComment,
  deleteComment,
  likeComment,
  reportComment
}
