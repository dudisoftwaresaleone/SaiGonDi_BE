import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'

const createNew = async (req, res, next) => {
  const reportRule = Joi.object({
    reportedId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
    reportedModel: Joi.string().valid('blogs', 'places', 'reviews', 'blog_comments').required(),
    reason: Joi.string().required()
  })
  try {
    await reportRule.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const updateReport = async (req, res, next) => {
  const reportRule = Joi.object({
    status: Joi.string().valid('pending', 'resolved', 'rejected').required()
  })
  try {
    await reportRule.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const reportValidation = {
  createNew,
  updateReport
}
