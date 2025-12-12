import Ward from '../models/Ward.model.js'
import Checkin from '../models/Checkin.model.js'
import User from '../models/User.model.js'
import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'

// Lấy tất cả phường/xã
const getAll = async () => {
  return await Ward.find()
}

// Lấy phường/xã theo _id
const getById = async (id) => {
  return await Ward.findById(id)
}

// Lấy phường/xã theo tên
const getByName = async (name) => {
  return await Ward.findOne({ name: new RegExp('^' + name + '$', 'i') }) // Case-insensitive search
}

// Lấy phường/xã gần tọa độ
const getByCoordinates = async (longitude, latitude, radius = 5000) => {
  return await Ward.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radius // Bán kính tính bằng mét
      }
    }
  })
}

// Cập nhật tọa độ của phường/xã
const updateCoordinates = async (id, coordinates) => {
  return await Ward.findByIdAndUpdate(
    id,
    { location: { type: 'Point', coordinates } },
    { new: true } // Trả về dữ liệu sau khi cập nhật
  )
}

const checkinWard = async (wardId, userId, checkinData) => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại')
    }
    const ward = await Ward.findById(wardId)
    if (!ward) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Phường/xã không tồn tại')
    }
    const existingCheckin = await Checkin.findOne({ userId, wardId })
    if (existingCheckin) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Người dùng đã check-in phường/xã này trước đó')
    }
    const newCheckin = await Checkin.create({
      userId,
      wardId,
      note: checkinData.note || '',
      device: checkinData.device || 'Web App',
      imgList: checkinData.imgList || [],
      checkinTime: new Date()
    })
    
    // Populate thông tin ward và user
    await newCheckin.populate([
      { path: 'wardId', select: 'name type location' },
      { path: 'userId', select: 'fullname avatar email' }
    ])
    
    return newCheckin
  } catch (error) {
    throw error
  }
}
  const getUserCheckins = async (userId) => {
    try {
      const checkins = await Checkin.find({ userId })
        .sort({ checkinTime: -1 })
        .populate({
          path: 'wardId',
          select: 'name type location'
        })
        .lean()
      const formatted = checkins.map(c => ({
        id: c._id,
        userId: c.userId,
        wardId: c.wardId?._id || null,
        wardName: c.wardId?.name || null,
        note: c.note,
        imgList: c.imgList || [],
        device: c.device,
        checkinTime: c.checkinTime,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        ward: c.wardId || null
      }))

      return formatted;
    } catch (error) {
      throw error;
    }
  };
  

export const wardService = {
  getAll,
  getById,
  getUserCheckins,
  checkinWard,
  getByName,
  getByCoordinates,
  updateCoordinates
}