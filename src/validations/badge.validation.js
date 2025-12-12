import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'

const createNew = async (req, res, next) => {
  const validationRule = Joi.object({
    name: Joi.string().min(3).required().messages({
      'string.base': 'name must be a string',
      'string.empty': 'name cannot be empty',
      'string.min': 'Tên huy hiệu phải có ít nhất 3 ký tự'
    }),
    description: Joi.string().min(2).required().messages({
      'string.base': 'description must be a string',
      'string.empty': 'description cannot be empty',
      'string.min': 'Mô tả phải có ít nhất 2 ký tự'
    }),
    icon: Joi.string().required().messages({
      'string.base': 'icon must be a string',
      'string.empty': 'icon cannot be empty'
    }),
    type: Joi.string().valid('rank', 'event').required().messages({
      'string.base': 'type must be a string',
      'string.empty': 'type cannot be empty',
      'any.only': 'Loại huy hiệu phải là "rank" hoặc "event"'
    }),
    rankOrder: Joi.when('type', {
      is: 'rank',
      then: Joi.number().required().messages({
        'number.base': 'Hạng huy hiệu phải là một số.',
        'any.required': 'Hạng huy hiệu là bắt buộc cho loại "rank".'
      }),
      otherwise: Joi.forbidden()
    }),
    pointsRequired: Joi.number().optional(),
    isActive: Joi.boolean().optional(),
    condition: Joi.object({
      special: Joi.string().optional(),
      favoritePlaces: Joi.object({
        count: Joi.number().min(1).optional(),
        placeId: Joi.string().optional()
      }).optional(),
      createBlog: Joi.object({
        count: Joi.number().min(1).optional(),
        points: Joi.number().optional()
      }).optional()
    }).unknown(true).optional(),
    startDate: Joi.when('type', {
      is: 'event',
      then: Joi.date().required().messages({
        'date.base': 'Ngày bắt đầu phải là ngày hợp lệ.',
        'any.required': 'Ngày bắt đầu là bắt buộc cho loại "event".'
      }),
      otherwise: Joi.forbidden()
    }),
    endDate: Joi.when('type', {
      is: 'event',
      then: Joi.date().required().greater(Joi.ref('startDate')).messages({
        'date.base': 'Ngày kết thúc phải là ngày hợp lệ.',
        'any.required': 'Ngày kết thúc là bắt buộc cho loại "event".',
        'date.greater': 'Ngày kết thúc phải sau ngày bắt đầu.'
      }),
      otherwise: Joi.forbidden()
    })
  })
  try {
    const data = req?.body ? req.body : {}
    await validationRule.validateAsync(data, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  const validationRule = Joi.object({
    name: Joi.string().min(3).optional().messages({
      'string.base': 'name must be a string',
      'string.min': 'Tên huy hiệu phải có ít nhất 3 ký tự'
    }),
    description: Joi.string().min(2).optional().messages({
      'string.base': 'description must be a string',
      'string.min': 'Mô tả phải có ít nhất 2 ký tự'
    }),
    icon: Joi.string().optional().messages({
      'string.base': 'icon must be a string'
    }),
    type: Joi.string().valid('rank', 'event').optional().messages({
      'string.base': 'type must be a string',
      'any.only': 'Loại huy hiệu phải là "rank" hoặc "event"'
    }),
    rankOrder: Joi.number().optional(),
    pointsRequired: Joi.number().optional(),
    isActive: Joi.boolean().optional(),
    condition: Joi.object({
      special: Joi.string().optional(),
      favoritePlaces: Joi.object({
        count: Joi.number().min(1).optional(),
        placeId: Joi.string().optional()
      }).optional(),
      createBlog: Joi.object({
        count: Joi.number().min(1).optional(),
        points: Joi.number().optional()
      }).optional()
    }).unknown(true).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional().greater(Joi.ref('startDate')).messages({
      'date.greater': 'Ngày kết thúc phải sau ngày bắt đầu.'
    })
  })
  try {
    const data = req?.body ? req.body : {}
    await validationRule.validateAsync(data, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}


export const badgeValidation = {
  createNew,
  update
}
