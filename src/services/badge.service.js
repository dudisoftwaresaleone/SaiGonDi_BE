import BadgeModel from '~/models/Badge.model.js'
import UserBadge from '~/models/UserBadge.model.js'
import { userBadgeService } from './userBadge.service.js'
import ApiError from '~/utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'

const getAllBadges = async () => {
  return await BadgeModel.find({}).sort({ createdAt: -1 })
}

const getAllBadgesWithProgress = async (userId) => {
  // delegate to userBadgeService.getBadgesForUser which returns badges with user progress
  if (typeof userBadgeService.getBadgesForUser === 'function') {
    return await userBadgeService.getBadgesForUser(userId)
  }
  // fallback: return all badges without progress
  return await BadgeModel.find({}).sort({ createdAt: -1 })
}


const createBadge = async (badgeData) => {
  const { name, type, rankOrder, startDate, endDate } = badgeData


  const existingBadge = await BadgeModel.findOne({ name })
  if (existingBadge) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Tên huy hiệu đã tồn tại.')
  }
  if (type === 'rank') {
    if (typeof rankOrder !== 'number') {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Hạng huy hiệu là bắt buộc và phải là một số.')
    }
    const highestRankBadge = await BadgeModel.findOne({ type: 'rank' }).sort({ rankOrder: -1 })
    const nextRank = highestRankBadge ? highestRankBadge.rankOrder + 1 : 1
    if (rankOrder !== nextRank) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, `Hạng huy hiệu tiếp theo phải là ${nextRank}.`)
    }
  } else if (type === 'event') {
    if (!startDate || !endDate) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Ngày bắt đầu và ngày kết thúc là bắt buộc cho huy hiệu sự kiện.')
    }
    if (new Date(startDate) >= new Date(endDate)) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Ngày kết thúc phải sau ngày bắt đầu.')
    }
  }

  const newBadge = new BadgeModel(badgeData)
  return await newBadge.save()
}

const updateBadge = async (badgeId, badgeData) => {
  const { name, type, rankOrder, startDate, endDate } = badgeData

  if (name) {
    const existingBadge = await BadgeModel.findOne({ name, _id: { $ne: badgeId } })
    if (existingBadge) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Tên huy hiệu đã tồn tại.')
    }
  }

  const badge = await BadgeModel.findById(badgeId)
  if (!badge) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Huy hiệu không tồn tại.')
  }
  const badgeType = type || badge.type

  if (badgeType === 'rank' && typeof rankOrder === 'number') {
    const existingRankBadge = await BadgeModel.findOne({ type: 'rank', rankOrder, _id: { $ne: badgeId } })
    if (existingRankBadge) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Hạng huy hiệu đã tồn tại.')
    }
  } else if (badgeType === 'event') {
    const sDate = startDate || badge.startDate
    const eDate = endDate || badge.endDate
    if (sDate && eDate && new Date(sDate) >= new Date(eDate)) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Ngày kết thúc phải sau ngày bắt đầu.')
    }
  }

  // Update badge
  const updatedBadge = await BadgeModel.findByIdAndUpdate(badgeId, badgeData, { new: true })

  // If pointsRequired was updated, sync it to all UserBadge records (only for in_progress badges)
  if (badgeData.pointsRequired !== undefined && badgeData.pointsRequired !== badge.pointsRequired) {
    // Update requiredPoints for all in_progress badges
    const userBadges = await UserBadge.find({ 
      badgeId: badgeId,
      status: 'in_progress'
    })

    for (const userBadge of userBadges) {
      userBadge.requiredPoints = badgeData.pointsRequired
      
      // If currentPoints already meets the new requirement, mark as earned
      if (userBadge.currentPoints >= badgeData.pointsRequired) {
        userBadge.status = 'earned'
        userBadge.achievedAt = new Date()
      }
      
      await userBadge.save()
    }
  }

  return updatedBadge
}

const deleteBadge = async (badgeId) => {
  return await BadgeModel.findByIdAndDelete(badgeId)
}

const getBadgeById = async (badgeId) => {
  return await BadgeModel.findById(badgeId)
}


export const badgeService = {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  getAllBadgesWithProgress,
  getBadgeById
}