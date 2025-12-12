import UserModel from '../models/User.model.js';
import ReportModel from '../models/Report.model.js';
import BlogModel from '../models/Blog.model.js';
import PlaceModel from '../models/Place.model.js';
import ReviewModel from '../models/Review.model.js';
import BlogCommentModel from '../models/BlogComment.model.js';
import ApiError from '../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

const createReport = async (reportData) => {
  const { reportedId, reportedModel, userId } = reportData;

  // Kiểm tra người dùng báo cáo
  let contentOwnerId;

  switch (reportedModel) {
    case 'blogs': {
      const blog = await BlogModel.findById(reportedId);
      if (!blog) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy blog');
      }
      contentOwnerId = blog.authorId;
      break;
    }
    case 'places': {
      const place = await PlaceModel.findById(reportedId);
      if (!place) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy địa điểm');
      }
      contentOwnerId = place.createdBy;
      break;
    }
    case 'reviews': {
      const review = await ReviewModel.findById(reportedId);
      if (!review) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đánh giá');
      }
      contentOwnerId = review.userId;
      break;
    }
    case 'blog_comments': {
      const blogComment = await BlogCommentModel.findById(reportedId);
      if (!blogComment) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bình luận');
      }
      contentOwnerId = blogComment.userId;
      break;
    }
    default:
      break;
  }

  // Kiểm tra người dùng báo cáo có phải là chủ sở hữu nội dung không
  if (contentOwnerId && contentOwnerId.toString() === userId.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không thể báo cáo nội dung của chính mình');
  }

  // Kiểm tra xem người dùng đã báo cáo nội dung này chưa
  const existingReport = await ReportModel.findOne({
    reportedId,
    reportedModel,
    userId
  });

  if (existingReport) {
    throw new ApiError(StatusCodes.CONFLICT, 'Bạn đã báo cáo nội dung này rồi');
  }

  return await ReportModel.create(reportData);
};

const getReports = async (query) => {
  const { page = 1, limit = 10, status, reportedModel, type, search } = query;
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (reportedModel) {
    filter.reportedModel = reportedModel;
  }

  if (type) {
    filter.reportedModel = type;
  }

  // Logic tìm kiếm mới
  if (search) {
    const searchRegex = new RegExp(search, 'i'); // 'i' để không phân biệt chữ hoa chữ thường

    // Tìm các user có tên khớp với từ khóa tìm kiếm
    const matchingUsers = await UserModel.find({
      $or: [{ firstName: searchRegex }, { lastName: searchRegex }]
    }).select('_id');

    const userIds = matchingUsers.map(user => user._id);

    // Thêm điều kiện $or để tìm kiếm trên nhiều trường
    filter.$or = [
      { reason: searchRegex }, // Tìm trong lý do báo cáo
      { userId: { $in: userIds } } // Tìm trong danh sách người báo cáo khớp
    ];
  }

  const total = await ReportModel.countDocuments(filter);
  const reports = await ReportModel.find(filter)
    .populate('userId', 'firstName lastName avatar')
    .populate('reportedId')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    reports,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getReportById = async (reportId) => {
  const report = await ReportModel.findById(reportId)
    .populate('userId', 'firstName lastName avatar')
    .populate('reportedId');

  if (!report) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy báo cáo');
  }

  return report;
};

const updateReport = async (reportId, updateData) => {
  const { status } = updateData;
  const report = await ReportModel.findByIdAndUpdate(
    reportId,
    { $set: { status: status } },
    { new: true }
  );

  if (!report) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy báo cáo');
  }

  if (report.status === 'resolved') {
    let contentCreatorId;

    switch (report.reportedModel) {
      case 'blogs': {
        const blog = await BlogModel.findById(report.reportedId);
        if (blog) contentCreatorId = blog.authorId;
        break;
      }
      case 'places': {
        const place = await PlaceModel.findById(report.reportedId);
        if (place) contentCreatorId = place.createdBy;
        break;
      }
      case 'reviews': {
        const review = await ReviewModel.findById(report.reportedId);
        if (review) contentCreatorId = review.userId;
        break;
      }
      case 'blog_comments': {
        const blogComment = await BlogCommentModel.findById(report.reportedId);
        if (blogComment) contentCreatorId = blogComment.userId;
        break;
      }
      default:
        // Handle unknown reportedModel or log an error
        break;
    }

    if (contentCreatorId) {
      // Find all content IDs created by this user across all relevant models
      const userBlogIds = (await BlogModel.find({ authorId: contentCreatorId }).select('_id')).map(b => b._id);
      const userPlaceIds = (await PlaceModel.find({ createdBy: contentCreatorId }).select('_id')).map(p => p._id);
      const userReviewIds = (await ReviewModel.find({ userId: contentCreatorId }).select('_id')).map(r => r._id);
      const userBlogCommentIds = (await BlogCommentModel.find({ userId: contentCreatorId }).select('_id')).map(bc => bc._id);

      const allReportedContentIds = [
        ...userBlogIds,
        ...userPlaceIds,
        ...userReviewIds,
        ...userBlogCommentIds
      ];

      // Count approved reports for any content created by this user
      const approvedReportsCount = await ReportModel.countDocuments({
        reportedId: { $in: allReportedContentIds },
        status: 'resolved'
      });

      if (approvedReportsCount >= 5) {
        await UserModel.findByIdAndUpdate(contentCreatorId, { banned: true });
        console.log(`Người dùng ${contentCreatorId} đã bị cấm do 5 hoặc nhiều báo cáo đã được phê duyệt.`);
      }
    }
  }

  return report;
};

const deleteReport = async (reportId) => {
  const report = await ReportModel.findByIdAndDelete(reportId);

  if (!report) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy báo cáo');
  }

  return report;
};

export const reportService = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport
};