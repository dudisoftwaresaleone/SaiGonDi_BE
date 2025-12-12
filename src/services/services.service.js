import ApiError from '~/utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import ServiceModel from '~/models/Service.model.js'
import PlaceModel from '~/models/Place.model.js'
import mongoose from 'mongoose'

const createNew = async (serviceData) => {
  try {
    const newService = await ServiceModel.create({
      ...serviceData
    })
    return newService
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const getAllServices = async () => {
  try {
    const services = await ServiceModel.find({})
    return services
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const updateService = async (serviceId, updateData) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid service id')
    }

    const payload = updateData && typeof updateData === 'object' ? { ...updateData } : {}
    payload.updatedAt = new Date()

    const updatedService = await ServiceModel.findByIdAndUpdate(
      serviceId,
      payload,
      { new: true, runValidators: true }
    )
    if (!updatedService) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy dịch vụ')
    }
    return updatedService
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const deleteService = async (serviceId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid service id')
    }

    const deletedService = await ServiceModel.findByIdAndDelete(serviceId)
    if (!deletedService) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy dịch vụ')
    }
    await PlaceModel.updateMany({ services: serviceId }, { $pull: { services: serviceId } })

    return deletedService
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

export const serviceService = {
  createNew,
  getAllServices,
  updateService,
  deleteService
}