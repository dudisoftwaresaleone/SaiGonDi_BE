import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError.js";

const extractValidationMessage = (error) => {
  if (!error) return "";
  // Joi v16/v17 attach isJoi and details array; prefer the detailed messages
  if (error.isJoi && Array.isArray(error.details)) {
    return error.details.map((d) => d.message).join(", ");
  }
  if (error && error.details && Array.isArray(error.details)) {
    return error.details.map((d) => d.message).join(", ");
  }
  if (typeof error === "string") return error;
  if (error.message)
    return String(error.message).replace(/^ValidationError:\s*/i, "");
  return String(error);
};

const register = async (req, res, next) => {
  const registerRule = Joi.object({
    firstName: Joi.string().min(1).max(30).required().messages({
      "string.base": "first name must be a string",
      "string.empty": "first name cannot be empty",
      "string.min": "first name must be at least 1 character long",
      "string.max": "first name must not exceed 30 characters",
    }),
    lastName: Joi.string().min(1).max(30).required().messages({
      "string.base": "last name must be a string",
      "string.empty": "last name cannot be empty",
      "string.min": "last name must be at least 1 character long",
      "string.max": "last name must not exceed 30 characters",
    }),
    email: Joi.string().email().required().messages({
      "string.base": "email must be a string",
      "string.empty": "email cannot be empty",
      "string.email": "email must be a valid email address",
    }),
    password: Joi.string().min(8).required().messages({
      "string.base": "password must be a string",
      "string.empty": "password cannot be empty",
      "string.min": "password must be at least 6 characters long",
    }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "passwords do not match",
        "string.empty": "confirm password cannot be empty",
      }),
    avatar: Joi.string().uri().optional().messages({
      "string.base": "avatar must be a string",
      "string.uri": "avatar must be a valid URL",
    }),
  }).unknown(true);

  try {
    const data = req?.body ? req.body : {};
    const validatedData = await registerRule.validateAsync(data, {
      abortEarly: false,
    });
    req.body = validatedData;
    next();
  } catch (error) {
    const message = extractValidationMessage(error);
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message));
  }
};

const login = async (req, res, next) => {
  const validationRule = Joi.object({
    email: Joi.string().email().required().messages({
      "string.base": "email must be a string",
      "string.empty": "email cannot be empty",
      "string.email": "email must be a valid email address",
    }),
    password: Joi.string().required().messages({
      "string.base": "password must be a string",
      "string.empty": "password cannot be empty",
    }),
  });

  try {
    const data = req?.body ? req.body : {};
    await validationRule.validateAsync(data, { abortEarly: false });
    next();
  } catch (error) {
    const message = extractValidationMessage(error);
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message));
  }
};

const requestToken = async (req, res, next) => {
  if (req.cookies && req.cookies.refreshToken) {
    return next();
  }

  const validationRule = Joi.object({
    refreshToken: Joi.string().required().messages({
      "string.base": "refresh token must be a string",
      "string.empty": "refresh token cannot be empty",
    }),
  });

  try {
    const data = req?.body ? req.body : {};
    await validationRule.validateAsync(data, { abortEarly: false });
    next();
  } catch (error) {
    const message = extractValidationMessage(error);
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message));
  }
};

const changePassword = async (req, res, next) => {
  const validationRule = Joi.object({
    currentPassword: Joi.string().min(6).required().messages({
      "string.base": "current password must be a string",
      "string.empty": "current password cannot be empty",
      "string.min": "current password must be at least 6 characters long",
    }),
    newPassword: Joi.string().min(6).required().messages({
      "string.base": "new password must be a string",
      "string.empty": "new password cannot be empty",
      "string.min": "new password must be at least 6 characters long",
    }),
  });

  try {
    const data = req?.body ? req.body : {};
    await validationRule.validateAsync(data, { abortEarly: false });
    next();
  } catch (error) {
    const message = extractValidationMessage(error);
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message));
  }
};

const sendOTP = async (req, res, next) => {
  const sendOTPRule = Joi.object({
    email: Joi.string().email().required().messages({
      "string.base": "email must be a string",
      "string.empty": "email cannot be empty",
      "string.email": "email must be a valid email address",
    }),
  });

  try {
    const data = req?.body ? req.body : {};
    const validatedData = await sendOTPRule.validateAsync(data, {
      abortEarly: false,
    });
    req.body = validatedData;
    next();
  } catch (error) {
    const message = extractValidationMessage(error);
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message));
  }
};

const verifyOTP = async (req, res, next) => {
  const validationRule = Joi.object({
    email: Joi.string().email().required().messages({
      "string.base": "email must be a string",
      "string.empty": "email cannot be empty",
      "string.email": "email must be a valid email address",
    }),
    otp: Joi.string().required().length(6).messages({
      "string.base": "otp must be a string",
      "string.empty": "otp cannot be empty",
      "string.length": "otp must be exactly 6 characters long",
    }),
  });
  try {
    const data = req?.body ? req.body : {};
    await validationRule.validateAsync(data, { abortEarly: false });
    next();
  } catch (error) {
    const message = extractValidationMessage(error);
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message));
  }
};

const updateUserProfile = async (req, res, next) => {
  const validationRule = Joi.object({
    firstName: Joi.string().min(1).max(30).optional().messages({
      "string.base": "first name must be a string",
      "string.empty": "first name cannot be empty",
      "string.min": "first name must be at least 1 character long",
      "string.max": "first name must not exceed 30 characters",
    }),
    lastName: Joi.string().min(1).max(30).optional().messages({
      "string.base": "last name must be a string",
      "string.empty": "last name cannot be empty",
      "string.min": "last name must be at least 1 character long",
      "string.max": "last name must not exceed 30 characters",
    }),
    email: Joi.string().email().optional().messages({
      "string.base": "email must be a string",
      "string.empty": "email cannot be empty",
      "string.email": "email must be a valid email address",
    }),
    avatar: Joi.string().uri().optional().messages({
      "string.base": "avatar must be a string",
      "string.empty": "avatar cannot be empty",
      "string.uri": "avatar must be a valid URL",
    }),
    bio: Joi.string().max(200).optional().messages({
      "string.base": "bio must be a string",
      "string.empty": "bio cannot be empty",
      "string.max": "bio must not exceed 200 characters",
    }),
  });
  try {
    const data = req?.body ? req.body : {};
    await validationRule.validateAsync(data, { abortEarly: false });
    next();
  } catch (error) {
    const message = extractValidationMessage(error);
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message));
  }
};

const resetPassword = async (req, res, next) => {
  const resetPasswordRule = Joi.object({
    email: Joi.string().email().required().messages({
      "string.base": "Email phải là một chuỗi",
      "string.empty": "Email không được để trống",
      "string.email": "Email phải là một địa chỉ email hợp lệ",
    }),
    otp: Joi.string().required().length(6).messages({
      "string.base": "OTP phải là một chuỗi",
      "string.empty": "OTP không được để trống",
      "string.length": "OTP phải có đúng 6 ký tự",
    }),
    newPassword: Joi.string().min(6).required().messages({
      "string.base": "Mật khẩu mới phải là một chuỗi",
      "string.empty": "Mật khẩu mới không được để trống",
      "string.min": "Mật khẩu mới phải có ít nhất 6 ký tự",
    }),
  });
  try {
    const data = req?.body ? req.body : {};
    await resetPasswordRule.validateAsync(data, { abortEarly: false });
    next();
  } catch (error) {
    const message = extractValidationMessage(error);
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message));
  }
};

const updateUserLocation = async (req, res, next) => {
  const validationRule = Joi.object({
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
  });

  try {
    await validationRule.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const message = extractValidationMessage(error);
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message));
  }
};

export const userValidation = {
  register,
  login,
  requestToken,
  resetPassword,
  changePassword,
  sendOTP,
  verifyOTP,
  updateUserProfile,
  updateUserLocation,
};
