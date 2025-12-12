import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'

const checkinWard = async (req, res, next) => {
  const correctCondition = Joi.object({
    wardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    note: Joi.string().max(500).trim().allow('').optional(),
    imgList: Joi.array().items(Joi.string().uri()).max(10).optional(),
    device: Joi.string().max(100).trim().optional(),
    location: Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).optional()
  })

  try {
    // Validate body
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    
    // Validate wardId from params
    const paramSchema = Joi.object({
      id: Joi.string().pattern(OBJECT_ID_RULE).required().message(OBJECT_ID_RULE_MESSAGE)
    })
    await paramSchema.validateAsync(req.params, { abortEarly: false })
    
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const wardValidation = {
  checkinWard
}
