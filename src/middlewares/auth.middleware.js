import { jwtVerify } from "~/utils/jwt.js";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError.js";

export const verifyToken = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token && req.cookies && req.cookies.session) token = req.cookies.session;
  if (!token)
    return next(
      new ApiError(StatusCodes.UNAUTHORIZED, "Token không được cung cấp")
    );

  try {
    const decoded = jwtVerify(token);
    req.user = decoded;
    next();
  } catch (err) {
    next(
      new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Token không hợp lệ hoặc đã hết hạn"
      )
    );
  }
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user || !req.user.role || req.user.role !== "admin") {
    return next(
      new ApiError(StatusCodes.FORBIDDEN, "Bạn không có quyền truy cập")
    );
  }
  next();
};

export const verifyTokenOptional = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwtVerify(token);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }

  next();
};
