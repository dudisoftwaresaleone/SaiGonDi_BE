import { StatusCodes } from 'http-status-codes'
import { placeService } from '~/services/place.service.js'
import { reportService } from '~/services/report.service.js';
import { badgeActionService } from '~/services/badgeAction.service.js';
import SearchLogModel from '~/models/SearchLog.model.js'
import { get } from 'mongoose'


const createNew = async (req, res, next) => {
  try {
    const userId = req.user.id
    const newPlace = await placeService.createNew(req.body, userId ? userId : null)
    await badgeActionService.handleUserAction(userId, 'createPlace', { placeId: newPlace._id });

    res.status(StatusCodes.CREATED).json({
      message: 'Place created successfully',
      data: newPlace
    })
  } catch (error) {
    next(error)
  }
}

const getAllPlaces = async (req, res, next) => {
  try {
    const placeList = await placeService.getAllPlaces(req.query)
    res.status(StatusCodes.OK).json({
      message: 'Place list retrieved successfully',
      data: placeList
    })
  } catch (error) {
    next(error)
  }
}

const getApprovedPlaces = async (req, res, next) => {
  try {
    const approvedPlaces = await placeService.getApprovedPlaces(req.query)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': approvedPlaces
    })
  } catch (error) {
    next(error)
  }
}

const getPlaceMessages = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const messages = await placeService.getPlaceMessages()
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': messages
    })
  } catch (error) {
    next(error)
  }
}
const updatePlaceService = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const updatedPlace = await placeService.updatePlace(placeId, req.body)
    res.status(StatusCodes.OK).json({
      message: 'Đã cập nhật địa điểm thành công',
      data: updatedPlace
    })
  } catch (error) {
    next(error)
  }
}

const getPlacesMapdata = async (req, res, next) => {
  try {
    const mapData = await placeService.getPlacesMapdata(req.query)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': mapData
    })
  } catch (error) {
    next(error)
  }
}

const getPlaceDetails = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const placeDetails = await placeService.getPlaceDetails(placeId)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': placeDetails
    })
  } catch (error) {
    next(error)
  }
}
const getPlaceServices = async (req, res, next) => {
  try {
    const serviceId = req.query.serviceId 
    if (!serviceId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'serviceId is required' })
    }
    const places = await placeService.getPlaceServices(serviceId)
    res.status(StatusCodes.OK).json({
      success: true,
      data: places
    })
  } catch (error) {
    next(error)
  }
}

const updatePlace = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const updatedPlace = await placeService.updatePlace(placeId, req.body)
    res.status(StatusCodes.OK).json({
      message: 'Đã cập nhật địa điểm thành công',
      data: updatedPlace
    })
  } catch (error) {
    next(error)
  }
}

const destroyPlace = async (req, res, next) => {
  try {
    const placeId = req.params.id
    await placeService.destroyPlace(placeId)
    res.status(StatusCodes.OK).json({
      message: 'Đã xóa địa điểm thành công'
    })
  } catch (error) {
    next(error)
  }
}

const addToFavorites = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const userId = req.user.id
    const user = await placeService.addToFavorites(placeId, userId)
    await badgeActionService.handleUserAction(userId, 'favoritePlace', { placeId: placeId });
    res.status(StatusCodes.OK).json({
      'success': true,
      message: 'Đã thêm địa điểm vào yêu thích thành công',
      user
    })
  } catch (error) {
    next(error)
  }
}

const addViewCount = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const place = await placeService.addViewCount(placeId)
    res.status(StatusCodes.OK).json({
      'success': true,
      message: 'Đã tăng view count thành công',
      place
    })
  } catch (error) {
    next(error)
  }
}

const removeFromFavorites = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const userId = req.user.id
    const user = await placeService.removeFromFavorites(placeId, userId)
    res.status(StatusCodes.OK).json({
      'success': true,
      message: 'Đã xóa địa điểm khỏi yêu thích thành công',
      user
    })
  } catch (error) {
    next(error)
  }
}

const checkinPlace = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const userId = req.user.id
    const data = req.body
    const { note, device, imgList } = req.body;
    const checkinData = await placeService.checkinPlace(placeId, userId, {
      note,
      device,
      imgList
    });
    await badgeActionService.handleUserAction(userId, 'checkinPlace', { placeId: placeId });
    res.status(StatusCodes.OK).json({
      'success': true,
      message: 'Đã check-in thành công',
      data: checkinData
    })
  } catch (error) {
    next(error)
  }
}

const approvePlace = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const adminId = req.user.id
    const approvedPlace = await placeService.approvePlace(placeId, adminId)
    res.status(StatusCodes.OK).json({
      message: 'Địa điểm đã được phê duyệt thành công',
      data: approvedPlace
    })
  } catch (error) {
    next(error)
  }
}

const updatePlaceCoordinates = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const { latitude, longitude } = req.body
    const updatedPlace = await placeService.updatePlaceCoordinates(placeId, latitude, longitude)

    res.status(StatusCodes.OK).json({
      message: 'Đã cập nhật tọa độ địa điểm thành công',
      data: updatedPlace
    })
  } catch (error) {
    next(error)
  }
}


const getAdminPlaceDetails = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const placeDetails = await placeService.getAdminPlaceDetails(placeId)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': placeDetails
    })
  } catch (error) {
    next(error)
  }
}

const getNearbyPlaces = async (req, res, next) => {
  try {
    const nearbyPlaces = await placeService.getNearbyPlaces(req.query)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': nearbyPlaces
    })
  } catch (error) {
    next(error)
  }
}

const searchPlaces = async (req, res, next) => {
  try {
    // suggest=1: gợi ý khi đang gõ -> không ghi vào lịch sử từ khoá tìm kiếm
    if (req.query.query && req.query.suggest !== '1') {
      const keyword = req.query.query.toString().trim()
      if (keyword) {
        SearchLogModel.create({ keyword }).catch(err => console.error('Failed to log search keyword:', err));
      }
    }
    const filteredPlaces = await placeService.searchPlaces(req.query)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': filteredPlaces
    })
  } catch (error) {
    next(error)
  }
}
const getHotPlaces = async (req, res, next) => {
  try {
    const hotPlaces = await placeService.getHotPlaces();
    res.status(StatusCodes.OK).json({
      success: true,
      data: hotPlaces
    });
  } catch (error) {
    next(error);
  }
};

const reportPlace = async (req, res, next) => {
  try {
    const report = await reportService.createReport({
      reportedId: req.params.id,
      reportedModel: 'places',
      userId: req.user.id,
      reason: req.body.reason
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Place reported successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

const sharePlace = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const userId = req.user.id
    const place = await placeService.sharePlace(placeId, userId)
    await badgeActionService.handleUserAction(userId, 'sharePlace', { placeId: placeId });
    res.status(StatusCodes.OK).json({
      'success': true,
      message: 'Đã chia sẻ địa điểm thành công',
      data: place
    })
  } catch (error) {
    next(error)
  }
}

export const placeController = {
  createNew,
  getAllPlaces,
  getApprovedPlaces,
  getPlaceMessages,
  updatePlaceService,
  searchPlaces,
  getPlaceDetails,
  getPlaceServices,
  updatePlace,
  destroyPlace,
  addViewCount,
  addToFavorites,
  removeFromFavorites,
  checkinPlace,
  approvePlace,
  updatePlaceCoordinates,
  getAdminPlaceDetails,
  getPlacesMapdata,
  getNearbyPlaces,
  getHotPlaces,
  reportPlace,
  sharePlace
}