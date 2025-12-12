import mongoose from 'mongoose'
import Badge from '~/models/Badge.model.js'
import User from '~/models/User.model.js'
import UserBadge from '~/models/UserBadge.model.js'
import PointHistory from '~/models/PointHistory.model.js'
import ApiError from '~/utils/ApiError.js'

/**
 * Xử lý hành động của người dùng, cộng điểm và cập nhật huy hiệu.
 * @param {string} userId - ID của người dùng
 * @param {string} actionType - Loại hành động (vd: 'CREATE_BLOG', 'LIKE_PLACE')
 * @param {string} [sourceId] - ID của đối tượng liên quan (vd: ID của blog, place)
 */
const handleUserAction = async (userId, actionType, sourceId) => {
  // Use require here to avoid circular dependency issues at module load time
  const { badgeActionService } = require('./badgeAction.service.js')

  try {
    // The meta object in badgeActionService is flexible
    const meta = { sourceId }
    await badgeActionService.handleUserAction(userId, actionType, meta)
  } catch (error) {
    console.error(`Error in handleUserAction for user ${userId} and action ${actionType}:`, error)
    // Re-throwing the error so the caller knows something went wrong.
    // The original function threw an ApiError, so we should maintain that contract.
    throw new ApiError(500, 'Could not process user action due to a badge system error.')
  }
}

/**
 * Mở khóa huy hiệu cấp bậc tiếp theo cho người dùng.
 * @param {string} userId - ID người dùng.
 * @param {number} currentRankOrder - Thứ hạng của huy hiệu vừa hoàn thành.
 * @param {mongoose.ClientSession} session - Session của transaction.
 */
const _unlockNextRankBadge = async (userId, currentRankOrder, session) => {
  const nextBadge = await Badge.findOne({
    type: 'rank',
    rankOrder: currentRankOrder + 1,
    isActive: true
  }).session(session)

  if (nextBadge) {
    // Kiểm tra xem người dùng đã có bản ghi cho huy hiệu tiếp theo chưa
    const existingNextUserBadge = await UserBadge.findOne({
      userId,
      badgeId: nextBadge._id
    }).session(session)

    // Nếu chưa có, tạo mới với trạng thái 'in_progress'
    if (!existingNextUserBadge) {
      const nextUserBadge = new UserBadge({
        userId,
        badgeId: nextBadge._id,
        currentPoints: 0,
        requiredPoints: nextBadge.pointsRequired,
        status: 'in_progress'
      })
      await nextUserBadge.save({ session })
    }
  }
}

/**
 * Khởi tạo huy hiệu cấp bậc đầu tiên cho người dùng nếu họ chưa có.
 * @param {string} userId - ID người dùng.
 */
const initializeFirstRankBadge = async (userId) => {
  const firstBadge = await Badge.findOne({ type: 'rank', rankOrder: 1, isActive: true }).lean()
  if (!firstBadge) return // Không có huy hiệu rank đầu tiên

  const existingUserBadge = await UserBadge.findOne({ userId, badgeId: firstBadge._id }).lean()
  if (!existingUserBadge) {
    const newUserBadge = new UserBadge({
      userId,
      badgeId: firstBadge._id,
      currentPoints: 0,
      requiredPoints: firstBadge.pointsRequired,
      status: 'in_progress'
    })
    await newUserBadge.save()
  }
}

/**
 * Cộng điểm vào một huy hiệu (rank hoặc event) cho người dùng.
 * @param {string} userId
 * @param {string} badgeId
 * @param {number} pointsToAdd
 * @param {object} options - Tùy chọn, có thể chứa session
 */
const addPointsToBadge = async (userId, badgeId, pointsToAdd, options = {}) => {
  const session = options.session || (await mongoose.startSession())
  const useExternalSession = !!options.session

  try {
    if (!useExternalSession) {
      session.startTransaction()
    }

    const badge = await Badge.findById(badgeId).session(session)
    if (!badge) {
      throw new ApiError(404, 'Badge not found.')
    }

    // Dependency check for rank badges: chỉ kiểm tra khi HOÀN THÀNH, không phải khi tích điểm
    let canComplete = true
    if (badge.type === 'rank' && badge.rankOrder > 1) {
      const prevBadge = await Badge.findOne({
        type: 'rank',
        rankOrder: badge.rankOrder - 1
      }).session(session)

      if (prevBadge) {
        const prevUserBadge = await UserBadge.findOne({
          userId,
          badgeId: prevBadge._id
        }).session(session)

        if (!prevUserBadge || prevUserBadge.status !== 'earned') {
          // Nếu huy hiệu trước chưa hoàn thành, không thể hoàn thành badge này
          canComplete = false
        }
      }
    }

    let userBadge = await UserBadge.findOne({ userId, badgeId }).session(session)

    if (userBadge && userBadge.status === 'earned') {
      // Huy hiệu đã hoàn thành, không tích điểm thêm
      if (!useExternalSession) {
        await session.abortTransaction()
        session.endSession()
      }
      return
    }

    if (!userBadge) {
      // Tạo mới UserBadge record
      if (badge.type === 'rank' || badge.type === 'event') {
        userBadge = new UserBadge({
          userId,
          badgeId,
          currentPoints: 0,
          requiredPoints: badge.pointsRequired,
          status: 'in_progress'
        })
      } else {
        if (!useExternalSession) {
          await session.abortTransaction()
          session.endSession()
        }
        return
      }
    }

    // Cộng điểm bình thường (dù chưa đủ điều kiện hoàn thành)
    userBadge.currentPoints += pointsToAdd
    if (userBadge.currentPoints > userBadge.requiredPoints) {
      userBadge.currentPoints = userBadge.requiredPoints
    }

    // Kiểm tra điều kiện hoàn thành
    if (canComplete && userBadge.currentPoints >= userBadge.requiredPoints) {
      userBadge.status = 'earned'
      userBadge.achievedAt = new Date()
      // Note: We are already incrementing the total points in handleUserAction.
      // To avoid double counting, we should not increment points here again when a badge is earned.
      // The points for a badge are a milestone, not extra points.
      // await User.findByIdAndUpdate(userId, { $inc: { points: badge.pointsRequired } }, { session })

      if (badge.type === 'rank' && badge.rankOrder) {
        await _unlockNextRankBadge(userId, badge.rankOrder, session)
      }
    }

    await userBadge.save({ session })

    if (!useExternalSession) {
      await session.commitTransaction()
      session.endSession()
    }
  } catch (error) {
    if (!useExternalSession) {
      await session.abortTransaction()
      session.endSession()
    }
    throw error
  }
}

/**
 * Trao một huy hiệu đặc biệt (thường là loại event, làm lần đầu) cho người dùng.
 * @param {string} userId
 * @param {string} badgeId
 * @param {object} options - Tùy chọn, có thể chứa session
 */
const grantSpecialBadge = async (userId, badgeId, options = {}) => {
  const session = options.session || (await mongoose.startSession())
  const useExternalSession = !!options.session

  try {
    if (!useExternalSession) {
      session.startTransaction()
    }

    const badge = await Badge.findById(badgeId).session(session)
    if (!badge) {
      throw new ApiError(404, 'Badge not found.')
    }

    const existingUserBadge = await UserBadge.findOne({ userId, badgeId }).session(session)
    if (existingUserBadge) {
      if (!useExternalSession) {
        await session.abortTransaction()
        session.endSession()
      }
      return
    }

    const userBadge = new UserBadge({
      userId,
      badgeId,
      currentPoints: badge.pointsRequired,
      requiredPoints: badge.pointsRequired,
      status: 'earned',
      achievedAt: new Date()
    })
    await userBadge.save({ session })

    await User.findByIdAndUpdate(userId, { $inc: { points: badge.pointsRequired } }, { session })

    if (!useExternalSession) {
      await session.commitTransaction()
      session.endSession()
    }
  } catch (error) {
    if (!useExternalSession) {
      await session.abortTransaction()
      session.endSession()
    }
    throw error
  }
}

/**
 * Tính số lượng từng loại action hoàn thành cho một badge
 * @param {string} userId
 * @param {object} badge - Badge object
 * @param {object} userBadgeData - User's progress for this badge
 */
const calculateBadgeActionCounts = async (userId, badge, userBadgeData) => {
  if (!userBadgeData || !badge.condition) {
    return {}
  }

  const actionCounts = {}
  
  // Get all actions for this badge from PointHistory
  const pointHistories = await PointHistory.find({ userId, badgeId: badge._id }).lean()
  
  // Count each action type
  for (const history of pointHistories) {
    const action = history.action
    if (!actionCounts[action]) {
      actionCounts[action] = 0
    }
    actionCounts[action]++
  }

  return actionCounts
}

/**
 * Lấy danh sách tất cả huy hiệu cùng với tiến trình của người dùng.
 * @param {string} userId
 */
const getBadgesForUser = async (userId) => {
  // This function ensures the first rank badge is created with 'in_progress' status
  await initializeFirstRankBadge(userId)

  // 1. Get ALL badges and the user's progress
  const allBadges = await Badge.find({}).sort({ rankOrder: 1, createdAt: 1 }).lean()
  const userBadges = await UserBadge.find({ userId: userId }).lean()

  // 2. Create a map for efficient lookup
  const userBadgesMap = userBadges.reduce((acc, ub) => {
    acc[ub.badgeId.toString()] = ub
    return acc
  }, {})

  const now = new Date()

  // 3. Combine badge data with user progress
  const result = await Promise.all(allBadges.map(async (badge) => {
    const userBadgeData = userBadgesMap[badge._id.toString()]

    // Start with the status from the database if it exists, otherwise it's locked.
    let status = userBadgeData ? userBadgeData.status : 'locked'
    let isActive = badge.isActive

    // If a badge is earned, its status should remain 'earned' regardless of other conditions.
    if (status !== 'earned') {
      if (badge.type === 'event') {
        const startDate = badge.startDate ? new Date(badge.startDate) : null
        const endDate = badge.endDate ? new Date(badge.endDate) : null

        const isEventActive = (!startDate || startDate <= now) && (!endDate || endDate >= now)
        isActive = isEventActive

        if (endDate && endDate < now) {
          status = 'expired' // Event ended and wasn't earned
        } else if (isEventActive && !userBadgeData) {
          status = 'in_progress' // Active event, not yet started by user
        }
      } else if (badge.type === 'rank') {
        isActive = true // Rank badges are always available
        // The first rank badge should show as 'in_progress' if the user hasn't started it.
        if (badge.rankOrder === 1 && !userBadgeData) {
          status = 'in_progress'
        }
      }
    } else {
       if (badge.type === 'rank') {
        isActive = true
      }
    }

    // Calculate action counts for this badge
    const actionCounts = await calculateBadgeActionCounts(userId, badge, userBadgeData)

    return {
      ...badge,
      isActive,
      userProgress: {
        status: status,
        currentPoints: userBadgeData?.currentPoints || 0,
        achievedAt: userBadgeData?.achievedAt || null
      },
      condition: badge.condition || {},
      actionCounts: actionCounts
    }
  }))

  return result
}

const checkAndAwardTopRank = async (userId, session) => {
  // 1. Đếm tổng số rank cơ bản (rankOrder từ 1 đến 6)
  const totalBaseRanks = await Badge.countDocuments({ type: 'rank', rankOrder: { $gte: 1, $lte: 6 }, isActive: true }).session(
    session
  )

  // 2. Đếm số rank mà người dùng đã đạt được
  const earnedUserRanks = await UserBadge.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'earned' } },
    {
      $lookup: {
        from: 'badges',
        localField: 'badgeId',
        foreignField: '_id',
        as: 'badgeDetails'
      }
    },
    { $unwind: '$badgeDetails' },
    { $match: { 'badgeDetails.type': 'rank', 'badgeDetails.rankOrder': { $gte: 1, $lte: 6 } } }
  ]).session(session)

  // 3. Nếu người dùng đã hoàn thành tất cả các rank cơ bản
  if (earnedUserRanks.length >= totalBaseRanks) {
    // 4. Tìm rank cao nhất (Thách Đấu)
    const topRankBadge = await Badge.findOne({ 'condition.special': 'top_5_challenger', isActive: true }).session(session)
    if (!topRankBadge) return // Không tìm thấy rank Thách Đấu

    // 5. Đếm xem đã có bao nhiêu người đạt được rank này
    const topRankHoldersCount = await UserBadge.countDocuments({ badgeId: topRankBadge._id, status: 'earned' }).session(
      session
    )

    // 6. Nếu ít hơn 5 người và người dùng này chưa có, trao rank
    if (topRankHoldersCount < 5) {
      const userAlreadyHasTopRank = await UserBadge.findOne({ userId, badgeId: topRankBadge._id }).session(session)
      if (!userAlreadyHasTopRank) {
        await grantSpecialBadge(userId, topRankBadge._id, session)
      }
    }
  }
}

export const userBadgeService = {
  handleUserAction,
  addPointsToBadge,
  getBadgesForUser,
  initializeFirstRankBadge,
  grantSpecialBadge,
  checkAndAwardTopRank
}
