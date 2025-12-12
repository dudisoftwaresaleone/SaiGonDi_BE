import UserModel from '~/models/User.model.js'
import PlaceModel from '~/models/Place.model.js'
import BlogModel from '~/models/Blog.model.js'
import BlogCommentModel from '~/models/BlogComment.model.js'
import ReviewModel from '~/models/Review.model.js'
import ServiceModel from '~/models/Service.model.js'




const getMe = async (adminId) => {
  const admin = await UserModel.findById(adminId).select(
    'firstName lastName email avatar role'
  )

  if (!admin) return null

  return {
    id: admin._id,
    email: admin.email,
    firstName: admin.firstName,
    lastName: admin.lastName,
    avatar: admin.avatar,
    role: admin.role,
    isAdmin: admin.role?.toLowerCase() === 'admin'
  }
}
const getLoginStats = async () => {
  try {
    const totalLogins = await UserModel.aggregate([
      { $group: { _id: null, total: { $sum: '$loginCount' } } }
    ])

    const topUsersByLogin = await UserModel.find()
      .sort({ loginCount: -1 })
      .limit(5)
      .select('fullName email avatar loginCount')

    return {
      totalLogins: totalLogins[0]?.total || 0,
      topUsersByLogin
    }
  } catch (error) {
    throw error
  }
}

const getOverviewStats = async () => {
  try {
    const now = new Date()

    const startOfThisWeek = new Date(now)
    startOfThisWeek.setDate(now.getDate() - now.getDay() + 1)
    startOfThisWeek.setHours(0, 0, 0, 0)

    const endOfThisWeek = new Date(startOfThisWeek)
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 7)

    const startOfLastWeek = new Date(startOfThisWeek)
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7)

    const endOfLastWeek = new Date(startOfThisWeek)

    const calcGrowth = (thisWeek, lastWeek) => {
      if (lastWeek === 0) return thisWeek > 0 ? 100 : 0
      return ((thisWeek - lastWeek) / lastWeek) * 100
    }

    const [userStats, blogStats, placeStats] = await Promise.all([
      UserModel.aggregate([
        {
          $facet: {
            thisWeek: [{ $match: { createdAt: { $gte: startOfThisWeek, $lt: endOfThisWeek } } }, { $count: 'count' }],
            lastWeek: [{ $match: { createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek } } }, { $count: 'count' }]
          }
        }
      ]),
      BlogModel.aggregate([
        {
          $facet: {
            thisWeek: [
              { $match: { createdAt: { $gte: startOfThisWeek, $lt: endOfThisWeek } } },
              { $group: { _id: null, count: { $sum: 1 }, views: { $sum: { $ifNull: ['$viewCount', 0] } } } }
            ],
            lastWeek: [
              { $match: { createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek } } },
              { $group: { _id: null, count: { $sum: 1 }, views: { $sum: { $ifNull: ['$viewCount', 0] } } } }
            ]
          }
        }
      ]),
      PlaceModel.aggregate([
        {
          $facet: {
            thisWeek: [{ $match: { createdAt: { $gte: startOfThisWeek, $lt: endOfThisWeek } } }, { $count: 'count' }],
            lastWeek: [{ $match: { createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek } } }, { $count: 'count' }]
          }
        }
      ])
    ])

    const thisWeekUsers = userStats[0].thisWeek[0]?.count || 0
    const lastWeekUsers = userStats[0].lastWeek[0]?.count || 0

    const thisWeekBlogs = blogStats[0].thisWeek[0]?.count || 0
    const lastWeekBlogs = blogStats[0].lastWeek[0]?.count || 0
    const thisWeekViews = blogStats[0].thisWeek[0]?.views || 0
    const lastWeekViews = blogStats[0].lastWeek[0]?.views || 0

    const thisWeekPlaces = placeStats[0].thisWeek[0]?.count || 0
    const lastWeekPlaces = placeStats[0].lastWeek[0]?.count || 0

    return {
      users: thisWeekUsers,
      blogs: thisWeekBlogs,
      places: thisWeekPlaces,
      views: thisWeekViews,
      growth: {
        users: calcGrowth(thisWeekUsers, lastWeekUsers),
        blogs: calcGrowth(thisWeekBlogs, lastWeekBlogs),
        places: calcGrowth(thisWeekPlaces, lastWeekPlaces),
        views: calcGrowth(thisWeekViews, lastWeekViews)
      }
    }
  } catch (error) {
    throw error
  }
}

const getDailyStats = async () => {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)

    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const [daily, weekly, monthly] = await Promise.all([
      BlogModel.countDocuments({ createdAt: { $gte: today } }),
      BlogModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      BlogModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ])

    return {
      daily,
      weekly,
      monthly
    }
  } catch (error) {
    throw error
  }
}

const getPopularStats = async () => {
  try {
    const popularPlaces = await PlaceModel.find({ status: 'approved' })
      .sort({ avgRating: -1, totalRatings: -1, totalLikes: -1 })
      .limit(5)
      .select('name avgRating totalRatings')

    const popularBlogs = await BlogModel.aggregate([
      {
        $lookup: {
          from: 'blogcomments',
          localField: '_id',
          foreignField: 'blogId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' }
        }
      },
      {
        $addFields: {
          popularityScore: {
            $add: [
              { $multiply: [{ $ifNull: ['$viewCount', 0] }, 1] },
              { $multiply: [{ $ifNull: ['$totalLikes', 0] }, 3] },
              { $multiply: [{ $ifNull: ['$commentCount', 0] }, 5] },
              { $multiply: [{ $ifNull: ['$shareCount', 0] }, 8] }
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          totalLikes: 1,
          viewCount: 1,
          shareCount: 1,
          commentCount: 1,
          popularityScore: 1
        }
      },
      {
        $sort: { popularityScore: -1 }
      },
      { $limit: 5 }
    ])

    return {
      popularPlaces,
      popularBlogs
    }
  } catch (error) {
    throw error
  }
}

const getFilteredReviews = async (paging, query) => {
  try {
    const { page, limit } = paging

    const [reviews, total] = await Promise.all([
      ReviewModel.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 }),
      ReviewModel.countDocuments(query)
    ])

    return {
      reviews,
      total,
      page,
      limit
    }
  } catch (error) {
    throw error
  }
}

const deleteReview = async (id) => {
  try {
    const deletedReview = await ReviewModel.findByIdAndDelete(id)
    await deletedReview.updatePlaceAvgRating()
    return deletedReview
  } catch (error) {
    throw error
  }
}
const getTopViewedPlaces = async () => {
  try {
    const topPlaces = await PlaceModel.find({ status: 'approved' })
      .sort({ viewCount: -1 })
      .limit(6)
      .select('name address images avgRating viewCount');
    return topPlaces
  } catch (error) {
    throw error
  }
}
const getAllServices = async (queryParams = {}) => {
  try {
    const sortByMapping = {
      latest: 'createdAt',
      rating: 'avgRating'
    }
    const hasFilter = (queryParams.filter && queryParams.filter !== 'all')
    const sortBy = queryParams.sortBy || 'latest'
    const filterParam = queryParams.filter
    const matchConditions = {}
    if (queryParams.name) {
      const nameQuery = queryParams.name.toString().trim()
      if (nameQuery) {
        matchConditions.$or = [
          { name: { $regex: nameQuery, $options: 'i' } },
        ]
      }
    }
    if (hasFilter) {
      const fp = String(filterParam).toLowerCase()
      if (fp === 'false' || fp === '0') {
        matchConditions.banned = false
      } else if (fp === 'true' || fp === '1') {
        matchConditions.banned = true
      } else if (fp) {
        matchConditions.banned = filterParam
      }
    }
    const sortField = sortByMapping[sortBy] || sortBy
    let query = ServiceModel.find(matchConditions)
    if (sortField) {
      query = query.sort({ [sortField]: -1 })
    }

    const services = await query
    return services
  } catch (error) {
    throw error
  }
}

const getCategoryStats = async () => {
  try {
    const stats = await BlogModel.aggregate([
      { $match: { status: 'approved', destroy: false, categories: { $exists: true, $ne: [], $type: 'array' } } },
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories',
          count: { $sum: 1 },
          views: { $sum: { $ifNull: ['$viewCount', 0] } }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: { $ifNull: ['$categoryInfo.name', 'Unknown'] },
          count: 1,
          views: 1
        }
      },
      { $sort: { views: -1 } }
    ])
    return stats
  } catch (error) {
    throw error
  }
}
const getUserMonthlyStats = async () => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [thisMonth, lastMonth] = await Promise.all([
      UserModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: { $dayOfMonth: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      UserModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
          }
        },
        {
          $group: {
            _id: { $dayOfMonth: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ])

    return { thisMonth, lastMonth }
  } catch (error) {
    throw error
  }
}
const hideReview = async (id) => {
  try {
    const review = await ReviewModel.findByIdAndUpdate(id, { _hidden: true }, { new: true })
    return review
  } catch (error) {
    throw error
  }
}

const getReportedBlogCommentById = async (id) => {
  try {
    const comment = await BlogCommentModel.findById(id).populate('userId', 'firstName lastName avatar').populate('blogId', 'title')
    return comment
  } catch (error) {
    throw error
  }
}

const getReportedReviewById = async (id) => {
  try {
    const review = await ReviewModel.findById(id).populate('userId', 'firstName lastName avatar').populate('placeId', 'name')
    return review
  } catch (error) {
    throw error
  }
}

const getReportedPlaceById = async (id) => {
  try {
    const place = await PlaceModel.findById(id).populate('authorId', 'firstName lastName avatar')
    return place
  } catch (error) {
    throw error
  }
}

const getReportedBlogById = async (id) => {
  try {
    const blog = await BlogModel.findById(id).populate('authorId', 'firstName lastName avatar')
    return blog
  } catch (error) {
    throw error
  }
}

const getTopUsers = async () => {
  const topUsers = await BlogModel.aggregate([
    { $match: { status: 'approved', destroy: false } },
    {
      $group: {
        _id: '$authorId',
        totalBlogs: { $sum: 1 },
        totalShares: { $sum: { $ifNull: ['$shareCount', 0] } },
        totalLikes: { $sum: { $ifNull: ['$totalLikes', 0] } }
      }
    },
    {
      $addFields: {
                    activityScore: {
                      $add: [
                        { $multiply: [{ $ifNull: ['$totalShares', 0] }, 2] },
                        { $multiply: [{ $ifNull: ['$totalBlogs', 0] }, 1] },
                        { $multiply: [{ $ifNull: ['$totalLikes', 0] }, 0.5] }
                      ]
                    }      }
    },
    { $sort: { activityScore: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'author'
      }
    },
    { $unwind: '$author' },

    {
      $lookup: {
        from: 'user_badges',
        localField: 'author._id',
        foreignField: 'userId',
        as: 'userBadges'
      }
    },
    {
      $lookup: {
        from: 'badges',
        localField: 'userBadges.badgeId',
        foreignField: '_id',
        as: 'badgeDetails'
      }
    },
    {
      $addFields: {
        badges: {
          $map: {
            input: '$userBadges',
            as: 'ub',
            in: {
              name: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: '$badgeDetails',
                          as: 'bd',
                          cond: { $eq: ['$$bd._id', '$$ub.badgeId'] }
                        }
                      },
                      as: 'bd',
                      in: '$$bd.name'
                    }
                  },
                  0
                ]
              },
              status: '$$ub.status',
              achievedAt: '$$ub.achievedAt',
              updatedAt: '$$ub.updatedAt'
            }
          }
        }
      }
    },
    {
      $addFields: {
        latestBadge: {
          $arrayElemAt: [
            {
              $slice: [
                {
                  $filter: {
                    input: '$badges',
                    as: 'b',
                    cond: { $eq: ['$$b.status', 'earned'] }
                  }
                },
                -1
              ]
            },
            0
          ]
        }
      }
    },
    {
      $project: {
        _id: 0,
        userId: '$author._id',
        fullName: { $concat: ['$author.firstName', ' ', '$author.lastName'] },
        firstName: '$author.firstName',
        lastName: '$author.lastName',
        avatar: '$author.avatar',
        badges: 1,
        latestBadge: 1,
        totalBlogs: 1,
        totalShares: 1,
        totalLikes: 1,
        activityScore: 1
      }
    }
  ])

  return topUsers
}


export const adminService = {
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
