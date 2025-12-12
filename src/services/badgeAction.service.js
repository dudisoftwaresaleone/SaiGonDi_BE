import mongoose from 'mongoose'
import Badge from '~/models/Badge.model.js'
import PointHistory from '~/models/PointHistory.model.js'
import UserModel from '~/models/User.model.js'
import Place from '~/models/Place.model.js'
import UserBadge from '~/models/UserBadge.model.js'
import { userBadgeService } from '~/services/userBadge.service.js'

const awardPoints = async (userId, badgeId, action, points, meta = {}, session) => {
  const user = await UserModel.findById(userId).session(session)
  if (!user) {
    throw new Error('User not found')
  }

  user.points += points
  await user.save({ session })

  const pointHistory = new PointHistory({
    userId,
    badgeId,
    action,
    points,
    meta
  })
  await pointHistory.save({ session })

  return user
}

/**
 * @param {string} userId - ID của người dùng thực hiện hành động.
 * @param {string} action - Tên của hành động (ví dụ: 'createReview').
 * @param {object} meta - Dữ liệu bổ sung liên quan đến hành động.
 */
const handleUserAction = async (userId, action, meta = {}) => {
  if (action === 'share_place') {
    if (meta && meta.placeId) {
      await Place.findByIdAndUpdate(meta.placeId, { $inc: { shareCount: 1 } });
    }
    return;
  }
  const now = new Date()
  const badges = await Badge.find({
    $or: [
      { type: { $ne: 'event' }, isActive: true },
      {
        type: 'event',
        startDate: { $lte: now },
        endDate: { $gte: now }
      }
    ]
  }).sort({ rankOrder: 1, createdAt: 1 })

  // Tách rank badges và event badges
  const rankBadges = badges.filter(b => b.type === 'rank')
  const eventBadges = badges.filter(b => b.type === 'event')

  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      // Tìm badge rank đang in_progress có rankOrder thấp nhất
      let targetRankBadge = null
      
      // Xử lý rank badges: chỉ cộng điểm vào badge đang in_progress có rankOrder thấp nhất
      if (rankBadges.length > 0) {
        const normalizedAction = action.toLowerCase().replace(/[-_]/g, '')
        for (const badge of rankBadges) {
          const condition = badge.condition || {}
          const matchedActionKey = Object.keys(condition).find(
            (key) => key.toLowerCase().replace(/[-_]/g, '') === normalizedAction
          )
          
          if (!matchedActionKey) continue

          // Kiểm tra user badge status
          const userBadge = await UserBadge.findOne({
            userId,
            badgeId: badge._id
          }).session(session)

          // Nếu badge chưa có UserBadge record, kiểm tra xem có phải badge đầu tiên không
          if (!userBadge) {
            if (badge.rankOrder === 1) {
              // Badge đầu tiên chưa được khởi tạo, sẽ được khởi tạo trong addPointsToBadge
              targetRankBadge = badge
              break
            }
            // Badge chưa unlock, bỏ qua
            continue
          }

          // Chỉ cộng điểm vào badge đang in_progress
          if (userBadge.status === 'in_progress') {
            targetRankBadge = badge
            break
          }
          
          // Nếu badge đã earned, tiếp tục tìm badge tiếp theo
          if (userBadge.status === 'earned') {
            continue
          }
        }

        // Nếu tìm thấy badge rank đang in_progress, cộng điểm vào đó
        if (targetRankBadge) {
          const condition = targetRankBadge.condition || {}
          const matchedActionKey = Object.keys(condition).find(
            (key) => key.toLowerCase().replace(/[-_]/g, '') === normalizedAction
          )

          if (matchedActionKey) {
            const actionCondition = condition[matchedActionKey]
            const pointsToAdd = parseInt(actionCondition.points || actionCondition.point, 10)
            
            if (!isNaN(pointsToAdd) && pointsToAdd > 0) {
              const countLimit = parseInt(actionCondition.count || actionCondition.Count, 10)
              if (!isNaN(countLimit) && countLimit > 0) {
                const actionCount = await PointHistory.countDocuments(
                  {
                    userId,
                    badgeId: targetRankBadge._id,
                    action: matchedActionKey
                  },
                  { session }
                )

                if (actionCount >= countLimit) {
                  // Đã đạt limit, không cộng điểm nữa
                } else {
                  await userBadgeService.addPointsToBadge(userId, targetRankBadge._id, pointsToAdd, { session })
                  await awardPoints(userId, targetRankBadge._id, action, pointsToAdd, meta, session)
                }
              } else {
                await userBadgeService.addPointsToBadge(userId, targetRankBadge._id, pointsToAdd, { session })
                await awardPoints(userId, targetRankBadge._id, action, pointsToAdd, meta, session)
              }
            }
          }
        }
      }

      // Xử lý event badges: chỉ cộng điểm nếu KHÔNG có rank badge đang in_progress
      // Nếu đã cộng điểm vào rank badge, thì không cộng vào event badge nữa để tránh duplicate
      const hasRankBadgeInProgress = targetRankBadge !== null
      
      if (!hasRankBadgeInProgress) {
        // Chỉ xử lý event badges nếu không có rank badge đang in_progress
        for (const badge of eventBadges) {
          const condition = badge.condition || {}
          const normalizedAction = action.toLowerCase().replace(/[-_]/g, '')
          const matchedActionKey = Object.keys(condition).find(
            (key) => key.toLowerCase().replace(/[-_]/g, '') === normalizedAction
          )

          if (!matchedActionKey) continue

          const actionCondition = condition[matchedActionKey]

          if (badge.type === 'event' && actionCondition.firstTime === true) {
            const actionCount = await PointHistory.countDocuments(
              {
                userId,
                badgeId: badge._id,
                action: matchedActionKey
              },
              { session }
            )

            if (actionCount === 0) {
              await userBadgeService.grantSpecialBadge(userId, badge._id, { session })
              await PointHistory.create(
                [
                  {
                    userId,
                    badgeId: badge._id,
                    action: matchedActionKey,
                    points: badge.pointsRequired,
                    meta
                  }
                ],
                { session }
              )
            }
            continue
          }

          if (badge.type === 'event') {
            const pointsToAdd = parseInt(actionCondition.points || actionCondition.point, 10)
            if (isNaN(pointsToAdd) || pointsToAdd <= 0) continue

            const countLimit = parseInt(actionCondition.count || actionCondition.Count, 10)
            if (!isNaN(countLimit) && countLimit > 0) {
              const actionCount = await PointHistory.countDocuments(
                {
                  userId,
                  badgeId: badge._id,
                  action: matchedActionKey
                },
                { session }
              )

              if (actionCount >= countLimit) {
                continue
              }
            }

            await userBadgeService.addPointsToBadge(userId, badge._id, pointsToAdd, { session })
            await awardPoints(userId, badge._id, action, pointsToAdd, meta, session)
          }
        }
      }
    })
  } finally {
    await session.endSession()
  }
}

const getPointHistoryByUserId = async (userId) => {
  const history = await PointHistory.find({ userId }).sort({ createdAt: -1 })
  return history
}
export const badgeActionService = {
  handleUserAction,
  getPointHistoryByUserId
}
