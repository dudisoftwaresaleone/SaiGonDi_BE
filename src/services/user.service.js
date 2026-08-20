import ApiError from "~/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { jwtGenerate, requestNewToken } from "~/utils/jwt.js";
import UserModel from "~/models/User.model.js";
import OTPModel from "~/models/OTP.model.js";
import ReviewModel from "~/models/Review.model.js";
import CheckinModel from "~/models/Checkin.model.js";
import RefreshTokenModel from "~/models/RefreshToken.model.js";
import { userBadgeService } from "~/services/userBadge.service.js";
import sendMail from "~/utils/sendMail.js";
import BlogModel from "~/models/Blog.model.js";
import mongoose from "mongoose";
import {
  generateOTPEmailTemplate,
  generateOTPTextTemplate,
} from "~/templates/otpEmail.template.js";

const register = async (userData) => {
  try {
    const { email, firstName, lastName, password, avatar } = userData;
    const user = await UserModel.findOne({ email });

    if (user && user.emailVerified) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Email đã tồn tại. Vui lòng sử dụng email khác."
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpData = {
      email,
      otp,
      type: "registration",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      registrationData: {
        firstName,
        lastName,
        password,
        avatar,
      },
    };

    // Create new OTP first
    const newOtpDoc = await OTPModel.create(otpData);
    // Delete old registration OTPs for this email (keep the newest one just created)
    await OTPModel.deleteMany({
      email: email,
      type: "registration",
      _id: { $ne: newOtpDoc._id },
    });

    // Send professional email
    const htmlContent = generateOTPEmailTemplate({
      otp,
      type: "registration",
      userName: `${firstName} ${lastName}`,
      expiryMinutes: 5,
    });
    const textContent = generateOTPTextTemplate({
      otp,
      type: "registration",
      userName: `${firstName} ${lastName}`,
      expiryMinutes: 5,
    });

    await sendMail(
      email,
      " Mã OTP Xác Thực Đăng Ký - Sài Gòn Đi",
      textContent,
      htmlContent
    );

    return {
      message:
        "Đăng ký thành công. Vui lòng kiểm tra email của bạn để lấy mã OTP xác minh tài khoản.",
    };
  } catch (error) {
    console.error("[REGISTER] Real error:", error.message || error);
    console.error("[REGISTER] Stack:", error.stack);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Không thể đăng ký người dùng"
    );
  }
};

const verifyEmail = async (verificationData) => {
  try {
    const { email, otp } = verificationData;
    const otpRecord = await OTPModel.findOne({
      email,
      otp,
      type: "registration",
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Mã OTP không hợp lệ hoặc đã hết hạn"
      );
    }

    let user = await UserModel.findOne({ email });

    if (user) {
      if (user.emailVerified) {
        throw new ApiError(StatusCodes.CONFLICT, "Email đã được xác minh.");
      }
      // Update existing unverified user
      user.emailVerified = true;
      if (otpRecord.registrationData) {
        user.firstName = otpRecord.registrationData.firstName;
        user.lastName = otpRecord.registrationData.lastName;
        user.password = otpRecord.registrationData.password;
        user.avatar = otpRecord.registrationData.avatar;
      }
    } else {
      // User does not exist, create a new one (this should only happen if registrationData is present)
      if (!otpRecord.registrationData) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Thiếu dữ liệu đăng ký để tạo người dùng mới."
        );
      }
      const { firstName, lastName, password, avatar } =
        otpRecord.registrationData;
      user = new UserModel({
        firstName,
        lastName,
        email,
        avatar,
        password,
        emailVerified: true,
      });
    }

    await Promise.all([
      user.save(),
      OTPModel.deleteOne({ _id: otpRecord._id }),
    ]);
    return {
      message: "Email đã được xác minh thành công. Bạn có thể đăng nhập.",
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // Check for duplicate key error
    if (error.code === 11000) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Email đã tồn tại. Vui lòng sử dụng email khác. "
      );
    }
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Không xác minh được email."
    );
  }
};

const sendPasswordResetOTP = async (email) => {
  try {
    const user = await UserModel.findOne({ email });

    if (!user || !user.emailVerified) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Không tìm thấy người dùng hoặc email chưa được xác minh"
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpData = {
      email,
      otp,
      type: "password-reset",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };

    // Create new OTP first
    const newOtpDoc = await OTPModel.create(otpData);

    // Then delete only expired or old password-reset OTPs for this email
    const deleteResult = await OTPModel.deleteMany({
      email: email,
      type: "password-reset",
      _id: { $ne: newOtpDoc._id },
    });

    // Find user to get name
    const userName =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : "bạn";

    // Send professional email
    const htmlContent = generateOTPEmailTemplate({
      otp,
      type: "password-reset",
      userName,
      expiryMinutes: 5,
    });
    const textContent = generateOTPTextTemplate({
      otp,
      type: "password-reset",
      userName,
      expiryMinutes: 5,
    });

    await sendMail(
      email,
      " Mã OTP Đặt Lại Mật Khẩu - Sài Gòn Đi",
      textContent,
      htmlContent
    );

    return { message: "Mã OTP đặt lại mật khẩu đã được gửi thành công." };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Không gửi được mã OTP đặt lại mật khẩu"
    );
  }
};

const resendRegistrationOTP = async (email) => {
  try {
    const [user, latestOtpRecord] = await Promise.all([
      UserModel.findOne({ email }),
      OTPModel.findOne({ email: email, type: "registration" }).sort({
        createdAt: -1,
      }),
    ]);

    if (user && user.emailVerified) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Email đã được xác minh. Vui lòng đăng nhập."
      );
    }

    let registrationData = null;

    if (latestOtpRecord && latestOtpRecord.registrationData) {
      registrationData = latestOtpRecord.registrationData;
    } else {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Không tìm thấy đăng ký nào đang chờ xử lý cho email này."
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpData = {
      email,
      otp,
      type: "registration",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      registrationData: registrationData,
    };

    // Create new OTP first
    const newOtpDoc = await OTPModel.create(otpData);
    // Then delete old registration OTPs for this email
    await OTPModel.deleteMany({
      email: email,
      type: "registration",
      _id: { $ne: newOtpDoc._id },
    });

    // Get user name from registration data
    const userName =
      registrationData.firstName && registrationData.lastName
        ? `${registrationData.firstName} ${registrationData.lastName}`
        : "bạn";

    // Send professional email
    const htmlContent = generateOTPEmailTemplate({
      otp,
      type: "registration",
      userName,
      expiryMinutes: 5,
    });
    const textContent = generateOTPTextTemplate({
      otp,
      type: "registration",
      userName,
      expiryMinutes: 5,
    });

    await sendMail(
      email,
      " Mã OTP Xác Thực Đăng Ký - Sài Gòn Đi",
      textContent,
      htmlContent
    );

    return {
      message:
        "Mã OTP đăng ký mới đã được gửi thành công. Vui lòng kiểm tra email của bạn.",
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Không gửi lại được mã OTP đăng ký"
    );
  }
};

const login = async (loginData) => {
  try {
    const user = await UserModel.findOne({ email: loginData.email }).select(
      "_id role email firstName lastName password banned emailVerified _destroyed provider"
    );
    if (!user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Tài khoản với email này chưa được đăng ký"
      );
    }

    if (user.provider && user.provider !== "local") {
      const providerName =
        user.provider === "google"
          ? "Google"
          : user.provider === "facebook"
          ? "Facebook"
          : user.provider;
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Tài khoản này được đăng nhập bằng ${providerName}. Vui lòng đăng nhập bằng ${providerName} hoặc đặt mật khẩu qua chức năng "Quên mật khẩu".`
      );
    }

    if (!user.emailVerified) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Vui lòng xác minh email của bạn trước khi đăng nhập."
      );
    }

    const isPasswordValid = await user.comparePassword(
      String(loginData.password).trim()
    );
    if (!isPasswordValid) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Email hoặc mật khẩu không đúng"
      );
    }
    if (user.banned) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Tài khoản của bạn đã bị cấm sử dụng"
      );
    }
    if (user._destroyed) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Tài khoản của bạn đã bị vô hiệu hóa"
      );
    }

    const { AccessToken, RefreshToken } = jwtGenerate({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    await Promise.all([
      RefreshTokenModel.create({ userId: user._id, token: RefreshToken }),
      user.saveLog(loginData.ipAddress, loginData.device),
    ]);
    const userData = {
      userId: user._id,
      role: user.role,
      email: user.email,
      fullName: user.firstName + " " + user.lastName,
    };
    return { userData, accessToken: AccessToken, refreshToken: RefreshToken };
  } catch (error) {
    throw error;
  }
};

const handleOAuthLogin = async (user, ipAddress, device) => {
  try {
    if (!user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Thông tin người dùng bị thiếu từ nhà cung cấp OAuth."
      );
    }

    if (!user.email) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Email người dùng là bắt buộc để đăng nhập OAuth."
      );
    }

    if (user.banned) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Tài khoản của bạn đã bị cấm");
    }
    if (user._destroyed) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Tài khoản của bạn đã bị hủy kích hoạt"
      );
    }

    // Ensure user is email verified for OAuth users
    if (!user.emailVerified) {
      user.emailVerified = true;
      await user.save();
    }

    const { AccessToken, RefreshToken } = jwtGenerate({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    await Promise.all([
      RefreshTokenModel.create({ userId: user._id, token: RefreshToken }),
      user.saveLog(ipAddress, device),
    ]);

    const userData = {
      userId: user._id,
      role: user.role,
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      fullName: user.lastName + " " + user.firstName,
    };
    return { userData, accessToken: AccessToken, refreshToken: RefreshToken };
  } catch (error) {
    console.error("OAuth login error:", error);
    throw error;
  }
};

const requestToken = async ({ refreshToken }) => {
  try {
    const refreshTokenDoc = await RefreshTokenModel.findOne({
      token: refreshToken,
    });
    if (!refreshTokenDoc) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Refresh Token không hợp lệ hoặc đã hết hạn"
      );
    }
    const newTokens = requestNewToken(refreshToken);
    return newTokens;
  } catch (error) {
    throw error;
  }
};

const revokeRefreshToken = async (userId) => {
  try {
    await RefreshTokenModel.deleteMany({ userId });
    return { message: "Đã thu hồi thành công các refresh token" };
  } catch (error) {
    throw error;
  }
};

const getAllUsers = async (queryParams = {}) => {
  try {
    const sortByMapping = {
      latest: "createdAt",
      rating: "avgRating",
    };
    const hasFilter = queryParams.filter && queryParams.filter !== "all";

    const filterParam = queryParams.filter;
    const rawLimit = queryParams.limit;
    let limit = null;
    if (rawLimit !== undefined && rawLimit !== null && rawLimit !== "") {
      const parsed = parseInt(rawLimit, 10);
      if (!Number.isNaN(parsed) && parsed > 0) limit = parsed;
    }

    const page = parseInt(queryParams.page, 10) || 1;
    const startIndex = limit ? (page - 1) * limit : 0;
    const sortBy = queryParams.sortBy || "latest";
    const sortOrder = queryParams.sortOrder === "desc" ? -1 : 1;
    const matchConditions = { _destroyed: { $ne: true }, role: "user" };

    if (queryParams.ids && queryParams.ids.length > 0) {
      matchConditions._id = {
        $in: queryParams.ids.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    if (queryParams.name) {
      const nameQuery = queryParams.name.toString().trim();
      if (nameQuery) {
        matchConditions.$or = [
          { firstName: { $regex: nameQuery, $options: "i" } },
          { lastName: { $regex: nameQuery, $options: "i" } },
          { email: { $regex: nameQuery, $options: "i" } },
        ];
      }
    }
    if (hasFilter) {
      const fp = String(filterParam).toLowerCase();
      if (fp === "false" || fp === "0") {
        matchConditions.banned = false;
      } else if (fp === "true" || fp === "1") {
        matchConditions.banned = true;
      } else if (fp) {
        matchConditions.banned = filterParam;
      }
    }
    const sortField = sortByMapping[sortBy] || sortBy;

    const aggregation = [
      { $match: matchConditions },
      { $sort: { [sortField]: sortOrder } },
      {
        $lookup: {
          from: "blogs",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$authorId", "$$userId"] },
                    { $eq: ["$status", "approved"] },
                    { $eq: ["$destroy", false] },
                    { $eq: ["$privacy", "public"] },
                    { $eq: ["$originalPostId", null] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "blogCount",
        },
      },
      {
        $addFields: {
          totalBlogs: {
            $ifNull: [{ $arrayElemAt: ["$blogCount.count", 0] }, 0],
          },
        },
      },
      { $project: { blogCount: 0 } },
    ];

    let users = [];
    let total = 0;

    if (limit) {
      const facetStage = {
        $facet: {
          users: [{ $skip: startIndex }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      };

      const results = await UserModel.aggregate([...aggregation, facetStage]);
      if (results && results[0]) {
        users = Array.isArray(results[0].users) ? results[0].users : [];
        total =
          results[0].total && results[0].total.length > 0
            ? results[0].total[0].count
            : 0;
      }
    } else {
      const results = await UserModel.aggregate(aggregation);
      users = Array.isArray(results) ? results : [];
      total = users.length;
    }

    return {
      users,
      pagination: {
        total,
        limit: limit || total,
        page: limit ? page : 1,
        totalPages: limit ? Math.ceil(total / limit) : 1,
      },
    };
  } catch (error) {
    throw error;
  }
};

const changePassword = async (userId, passwordData) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    // Prevent changing password for accounts created via OAuth providers
    if (user.provider && user.provider !== "local") {
      const providerName =
        user.provider === "google"
          ? "Google"
          : user.provider === "facebook"
          ? "Facebook"
          : user.provider;
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Tài khoản này được đăng nhập bằng ${providerName}. Vui lòng dùng Quên mật khẩu để thiết lập mật khẩu hoặc đăng nhập bằng ${providerName}.`
      );
    }

    const isCurrentPasswordValid = await user.comparePassword(
      passwordData.currentPassword
    );
    if (!isCurrentPasswordValid) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Mật khẩu hiện tại không chính xác"
      );
    }
    user.password = passwordData.newPassword;
    user.updatedAt = Date.now();
    await user.save();
    return { message: "Đổi mật khẩu thành công" };
  } catch (error) {
    throw error;
  }
};

const verifyPasswordResetOTP = async (reqBody) => {
  try {
    const { email, otp } = reqBody;
    const otpRecord = await OTPModel.findOne({
      email,
      otp,
      type: "password-reset",
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Mã OTP không hợp lệ hoặc đã hết hạn"
      );
    }

    return { message: "Xác nhận mã OTP thành công" };
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (reqBody) => {
  try {
    const { email, otp, newPassword } = reqBody;

    const otpRecord = await OTPModel.findOne({
      email,
      otp,
      type: "password-reset",
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Mã OTP không hợp lệ hoặc đã hết hạn"
      );
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    // If the account was created via OAuth and has no password, allow setting a new password
    let isSamePassword = false;
    if (user.password) {
      isSamePassword = await user.comparePassword(newPassword);
    }
    if (isSamePassword) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Mật khẩu mới không được trùng với mật khẩu hiện tại"
      );
    }

    // Set the new password and convert provider to local so user can login with email/password
    user.password = newPassword;
    if (user.provider && user.provider !== "local") {
      user.provider = "local";
    }
    // Ensure emailVerified is true when resetting password
    if (!user.emailVerified) user.emailVerified = true;
    await user.save();

    await OTPModel.deleteOne({ _id: otpRecord._id });

    return { message: "Đặt lại mật khẩu thành công" };
  } catch (error) {
    throw error;
  }
};

const getUserProfile = async (userId) => {
  try {
    const user = await UserModel.findById(userId).select("-password");
    // Basic existence check
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    // Account destroyed
    if (user._destroyed) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Tài khoản đã bị xóa");
    }
    // Allow users and admins to fetch their own profile; keep backward compatibility for OAuth users without role
    if (user.role && !["user", "admin"].includes(user.role)) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    if (user.banned) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Tài khoản này đã bị cấm");
    }
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalCheckins,
      thisMonthCheckins,
      lastMonthCheckins,
      blogs,
      thisMonthBlogs,
      lastMonthBlogs,
      reviews,
      thisMonthReviews,
      lastMonthReviews,
      badges,
    ] = await Promise.all([
      CheckinModel.countDocuments({ userId }),
      CheckinModel.countDocuments({
        userId,
        createdAt: { $gte: startOfThisMonth },
      }),
      CheckinModel.countDocuments({
        userId,
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      BlogModel.find({ authorId: userId }).sort({ createdAt: -1 }),
      BlogModel.countDocuments({
        authorId: userId,
        createdAt: { $gte: startOfThisMonth },
      }),
      BlogModel.countDocuments({
        authorId: userId,
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      ReviewModel.find({ userId }),
      ReviewModel.countDocuments({
        userId,
        createdAt: { $gte: startOfThisMonth },
      }),
      ReviewModel.countDocuments({
        userId,
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      userBadgeService.getBadgesForUser(userId),
    ]);

    const checkinGrowth =
      lastMonthCheckins > 0
        ? Math.round(
            ((thisMonthCheckins - lastMonthCheckins) / lastMonthCheckins) * 100
          )
        : thisMonthCheckins > 0
        ? 100
        : 0;

    const totalBlogs = blogs.length;
    const blogGrowth =
      lastMonthBlogs > 0
        ? Math.round(((thisMonthBlogs - lastMonthBlogs) / lastMonthBlogs) * 100)
        : thisMonthBlogs > 0
        ? 100
        : 0;

    const totalReviews = reviews.length;
    const reviewGrowth =
      lastMonthReviews > 0
        ? Math.round(
            ((thisMonthReviews - lastMonthReviews) / lastMonthReviews) * 100
          )
        : thisMonthReviews > 0
        ? 100
        : 0;

    return {
      userId: user._id,
      email: user.email,
      fullName: `${user.lastName} ${user.firstName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar || null,
      cover: user.cover || null,
      bio: user.bio || "",
      favorites: user.favorites || [],
      provider: user.provider || "",

      checkinCount: totalCheckins,
      blogCount: totalBlogs,
      reviewCount: totalReviews,

      checkinGrowth,
      blogGrowth,
      reviewGrowth,

      blogs,
      badges,
    };
  } catch (error) {
    throw error;
  }
};

const getUserDetails = async (userId) => {
  try {
    const user = await UserModel.findById(userId)
      .select("-password -__v")
      .populate("favorites", "name address avgRating totalRatings")
      .populate({ path: "sharedBlogs.blog", select: "title content" });

    if (!user || user.role !== "user" || user._destroyed) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    if (user.banned) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Tài khoản này đã bị cấm");
    }

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const blogFilter = {
      authorId: userId,
      status: "approved",
      destroy: false,
      privacy: "public",
      originalPostId: null,
    };
    const results = await Promise.all([
      CheckinModel.countDocuments({ userId }),
      CheckinModel.countDocuments({
        userId,
        createdAt: { $gte: startOfThisMonth },
      }),
      CheckinModel.countDocuments({
        userId,
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      BlogModel.find(blogFilter).sort({ createdAt: -1 }),
      BlogModel.countDocuments({
        ...blogFilter,
        createdAt: { $gte: startOfThisMonth },
      }),
      BlogModel.countDocuments({
        ...blogFilter,
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      ReviewModel.find({ userId }),
      ReviewModel.countDocuments({
        userId,
        createdAt: { $gte: startOfThisMonth },
      }),
      ReviewModel.countDocuments({
        userId,
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      userBadgeService.getBadgesForUser(userId),
    ]);

    const totalCheckins = results[0];
    const thisMonthCheckins = results[1];
    const lastMonthCheckins = results[2];
    const blogs = results[3];
    const thisMonthBlogs = results[4];
    const lastMonthBlogs = results[5];
    const reviews = results[6];
    const thisMonthReviews = results[7];
    const lastMonthReviews = results[8];
    const badges = results[9];

    const checkinGrowth =
      lastMonthCheckins > 0
        ? Math.round(
            ((thisMonthCheckins - lastMonthCheckins) / lastMonthCheckins) * 100
          )
        : thisMonthCheckins > 0
        ? 100
        : 0;

    const totalAllBlogs = blogs.length;
    const blogGrowth =
      lastMonthBlogs > 0
        ? Math.round(((thisMonthBlogs - lastMonthBlogs) / lastMonthBlogs) * 100)
        : thisMonthBlogs > 0
        ? 100
        : 0;

    const totalReviews = reviews.length;
    const reviewGrowth =
      lastMonthReviews > 0
        ? Math.round(
            ((thisMonthReviews - lastMonthReviews) / lastMonthReviews) * 100
          )
        : thisMonthReviews > 0
        ? 100
        : 0;

    return {
      userId: user._id,
      fullName: `${user.lastName} ${user.firstName}`,
      firstName: user.firstName,
      bio: user.bio,
      lastName: user.lastName,
      avatar: user.avatar || null,
      cover: user.cover || null,
      phone: user.phone || "",
      email: user.email,
      points: user.points || 0,
      favorites: user.favorites || [],
      sharedBlogs: user.sharedBlogs || [],
      totalBlogs: totalAllBlogs,
      checkinCount: totalCheckins,
      blogCount: totalAllBlogs,
      reviewCount: totalReviews,
      checkinGrowth,
      blogGrowth,
      reviewGrowth,
      blogs,
      badges,
    };
  } catch (error) {
    throw error;
  }
};

const banUser = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user || user.role !== "user") {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    if (user.banned) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Tài khoản này đã bị cấm");
    }
    user.banned = true;
    await user.save();
  } catch (error) {
    throw error;
  }
};

const updateUserStatus = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    if (user.banned === true) {
      user.banned = false;
    } else {
      user.banned = true;
    }
    await user.save();
  } catch (error) {
    throw error;
  }
};
const banSelf = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user || user.role !== "user") {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    if (user.banned) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Tài khoản đã bị khóa trước đó"
      );
    }
    user.banned = true;
    await user.save();
    return { message: "Tài khoản của bạn đã được khóa thành công" };
  } catch (error) {
    throw error;
  }
};

const destroyUser = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user || user.role !== "user") {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    user._destroyed = true;
    await user.save();
  } catch (error) {
    throw error;
  }
};

const getUserReviews = async (userId) => {
  try {
    const reviews = await ReviewModel.find({ userId }).select(
      "placeId comment totalLikes rating images createdAt"
    );
    return reviews;
  } catch (error) {
    throw error;
  }
};

const updateUserProfile = async (userId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now(), // Update the updatedAt field
    };
    const user = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

const getScoreAndTitle = async (userId) => {
  try {
    const user = await UserModel.findById(userId).select("points").lean();
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }

    const points = user.points || 0;
    let title = "Tân binh"; // Default title: Newbie

    if (points >= 1000) {
      title = "Bậc thầy"; // Master
    } else if (points >= 500) {
      title = "Nhà thám hiểm"; // Adventurer
    } else if (points >= 100) {
      title = "Người khám phá"; // Explorer
    }

    return { points, title };
  } catch (error) {
    throw error;
  }
};

const updateUserLocation = async (userId, longitude, latitude) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    user.currentLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
    await user.save();
    return { message: "Cập nhật vị trí người dùng thành công" };
  } catch (error) {
    throw error;
  }
};

const getOutstandingBloggers = async () => {
  try {
    const outstandingBloggers = await BlogModel.aggregate([
      {
        $match: { status: { $ne: "pending" } },
      },
      {
        $group: {
          _id: "$authorId",
          totalBlogs: { $sum: 1 },
          totalLikes: { $sum: "$totalLikes" },
          totalShares: { $sum: "$shareCount" },
        },
      },
      {
        $match: {
          totalBlogs: { $gt: 0 },
          totalLikes: { $gte: 0 },
          totalShares: { $gte: 0 },
        },
      },
      {
        $sort: {
          totalBlogs: -1,
          totalLikes: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
      {
        $match: {
          "author.banned": { $ne: true },
          "author._destroyed": { $ne: true },
        },
      },
      {
        $project: {
          _id: 0,
          author: {
            _id: "$author._id",
            firstName: "$author.firstName",
            lastName: "$author.lastName",
            avatar: "$author.avatar",
            bio: "$author.bio",
          },
          totalBlogs: 1,
          totalLikes: 1,
          totalShares: 1,
        },
      },
    ]);
    return outstandingBloggers;
  } catch (error) {
    throw error;
  }
};

const getUserBlogs = async (userId) => {
  try {
    const blogs = await BlogModel.find({
      authorId: userId,
      status: { $in: ["pending", "approved"] },
    }).sort({ createdAt: -1 });
    return blogs;
  } catch (error) {
    throw error;
  }
};

export const userService = {
  register,
  login,
  handleOAuthLogin,
  resetPassword,
  requestToken,
  revokeRefreshToken,
  getAllUsers,
  changePassword,
  verifyEmail,
  verifyPasswordResetOTP,
  sendPasswordResetOTP,
  resendRegistrationOTP,
  getUserDetails,
  getUserProfile,
  banUser,
  updateUserStatus,
  banSelf,
  destroyUser,
  getUserReviews,
  updateUserProfile,
  getScoreAndTitle,
  updateUserLocation,
  getOutstandingBloggers,
  getUserBlogs,
};
