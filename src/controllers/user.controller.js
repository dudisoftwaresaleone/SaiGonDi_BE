import { StatusCodes } from "http-status-codes";
import { userService } from "~/services/user.service.js";
import UserModel from "~/models/User.model.js";

const register = async (req, res, next) => {
  try {
    const result = await userService.register(req.body);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const result = await userService.verifyEmail(req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const sendPasswordResetOTP = async (req, res, next) => {
  try {
    const result = await userService.sendPasswordResetOTP(req.body.email);
    res.status(StatusCodes.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const verifyPasswordResetOTP = async (req, res, next) => {
  try {
    const result = await userService.verifyPasswordResetOTP(req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const resendRegistrationOTP = async (req, res, next) => {
  try {
    const result = await userService.resendRegistrationOTP(req.body.email);
    res.status(StatusCodes.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { userData, accessToken, refreshToken } = await userService.login({
      ...req.body,
      ipAddress: req.ip,
      device: req.headers["user-agent"],
    });

    let updatedUser = null;
    if (userData && userData.userId) {
      updatedUser = await UserModel.findByIdAndUpdate(
        userData.userId,
        { $inc: { loginCount: 1 } },
        { new: true }
      ).select("firstName lastName email avatar role loginCount");
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Đăng nhập thành công",
      user: updatedUser || userData,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (userId) await userService.revokeRefreshToken(userId);
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("session", {
      httpOnly: true,
      secure: isProd,
      domain: "localhost",
      sameSite: "Strict",
      path: "/",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      domain: "localhost",
      path: "/",
      sameSite: "Strict",
      secure: isProd,
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    next(error);
  }
};

const requestToken = async (req, res, next) => {
  try {
    // Accept refreshToken from request body or HttpOnly cookie
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Refresh token is required" });
    const newToken = await userService.requestToken({ refreshToken });
    // Set new access token in HttpOnly cookie as well
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("session", newToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(StatusCodes.OK).json({
      success: true,
      accessToken: newToken,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.query);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming user ID is stored in req.user by verifyToken middleware
    await userService.changePassword(userId, req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      const ApiError = (await import("~/utils/ApiError.js")).default;
      const { StatusCodes } = await import("http-status-codes");
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Vui lòng đăng nhập");
    }
    const userId =
      req?.query?.userId || req.user.id || req.user._id || req.user.userId;
    const profile = await userService.getUserProfile(userId);
    res.status(StatusCodes.OK).json({
      success: true,
      user: profile,
    });
  } catch (error) {
    next(error);
  }
};

const getUserDetails = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const userDetails = await userService.getUserDetails(userId);
    res.status(StatusCodes.OK).json({
      success: true,
      user: userDetails,
    });
  } catch (error) {
    next(error);
  }
};

const banUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await userService.banUser(userId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Người dùng đã bị khóa thành công",
    });
  } catch (error) {
    next(error);
  }
};
const updateUserStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await userService.updateUserStatus(userId, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Trạng thái người dùng đã được cập nhật thành công",
    });
  } catch (error) {
    next(error);
  }
};
const banSelf = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await userService.banUser(userId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Tài khoản của bạn đã bị khóa thành công",
    });
  } catch (error) {
    next(error);
  }
};

const destroyUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await userService.destroyUser(userId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Người dùng đã bị xóa thành công",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await userService.resetPassword(req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    next(error);
  }
};

const updateUserLocation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { longitude, latitude } = req.body;
    const result = await userService.updateUserLocation(
      userId,
      longitude,
      latitude
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const getOutstandingBloggers = async (req, res, next) => {
  try {
    const outstandingBloggers = await userService.getOutstandingBloggers();
    res.status(StatusCodes.OK).json({
      success: true,
      data: outstandingBloggers,
    });
  } catch (error) {
    next(error);
  }
};

const oAuthLoginCallback = async (req, res, next) => {
  try {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    if (!req.user) {
      const script = `
        <script>
          (function(){
            var client = ${JSON.stringify(clientUrl)};
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({ error: 'no_user_found' }, client);
              window.close();
              return;
            }
            window.location.href = client + '/auth/login';
          })();
        </script>
      `;
      return res.send(script);
    }

    const { userData, accessToken, refreshToken } =
      await userService.handleOAuthLogin(
        req.user,
        req.ip,
        req.headers["user-agent"]
      );

    // Set HttpOnly cookies for access and refresh tokens (do not expose tokens via URL)
    const isProd = process.env.NODE_ENV === "production";
    // Session cookie (short-lived access token)
    res.cookie("session", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day as requested
    });
    // Refresh token cookie (longer-lived)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Notify opener only about success (no tokens in URL)
    const script = `
      <script>
        (function(){
          try {
            var client = ${JSON.stringify(clientUrl)};
            var payload = { success: true };
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(payload, client);
              window.close();
              return;
            }
            window.location.href = client + '/auth/callback?success=true';
          } catch (e) {
            window.location.href = ${JSON.stringify(clientUrl + "/auth/login")};
          }
        })();
      </script>
    `;
    res.send(script);
  } catch (error) {
    console.error("OAuth callback error:", error);
    const client = process.env.CLIENT_URL || "http://localhost:3000";
    const script = `
      <script>
        (function(){
          var client = ${JSON.stringify(client)};
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ error: ${JSON.stringify(
              error.message || "authentication_failed"
            )} }, client);
            window.close();
            return;
          }
          window.location.href = client + '/auth/login';
        })();
      </script>
    `;
    res.send(script);
  }
};

const getUserBlogs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const blogs = await userService.getUserBlogs(userId);
    res.status(StatusCodes.OK).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

const trackUserAction = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { activityType } = req.body

    if (!activityType) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Activity type is required'
      })
    }

    // Dynamically import badgeActionService to avoid circular dependencies
    const { badgeActionService } = await import('~/services/badgeAction.service.js')
    
    // Handle the user action and award points if applicable
    await badgeActionService.handleUserAction(userId, activityType, {})

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Action tracked: ${activityType}`
    })
  } catch (error) {
    next(error)
  }
}

const getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query
    const limitNum = Math.min(parseInt(limit, 10) || 10, 100)
    const pageNum = Math.max(parseInt(page, 10) || 1, 1)

    const leaderboard = await UserModel.find({})
      .select('firstName lastName email avatar points')
      .sort({ points: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean()

    const total = await UserModel.countDocuments({})

    const result = leaderboard.map((user, index) => ({
      ...user,
      rank: (pageNum - 1) * limitNum + index + 1
    }))

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    next(error)
  }
}

export const userController = {
  register,
  login,
  logout,
  resetPassword,
  requestToken,
  getAllUsers,
  getUserDetails,
  changePassword,
  verifyEmail,
  verifyPasswordResetOTP,
  sendPasswordResetOTP,
  resendRegistrationOTP,
  getProfile,
  banUser,
  updateUserStatus,
  banSelf,
  destroyUser,
  updateUserLocation,
  getOutstandingBloggers,
  oAuthLoginCallback,
  getUserBlogs,
  trackUserAction,
  getLeaderboard
};