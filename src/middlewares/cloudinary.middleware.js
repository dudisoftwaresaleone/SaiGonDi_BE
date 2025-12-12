import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config(); // Load .env

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// 🔹 Hàm upload buffer
const uploadToCloudinary = (fileBuffer, folder = 'blogs', resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// 🔹 Hàm upload base64 (cho content)
const uploadBase64ToCloudinary = async (base64String, folder = 'blogs') => {
  try {
    let resourceType = 'image';
    if (base64String.startsWith('data:video')) resourceType = 'video';
    const uploaded = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: resourceType,
    });
    return { type: resourceType, url: uploaded.secure_url };
  } catch (error) {
    console.error('Base64 upload error:', error);
    return null;
  }
};

// ===============================================================
// Middleware upload cho Blog
// ===============================================================
export const uploadBlogFiles = async (req, res, next) => {
  try {
    const cloudFiles = { mainImage: null, album: [], content: [] };

    //Upload các file từ form-data (mainImage, album, content)
    if (req.files && typeof req.files === "object") {
      for (const key in req.files) {
        const fileList = req.files[key];
        for (const file of fileList) {
          const mimeType = file.mimetype;
          const type = mimeType.startsWith("video/") ? "video" : "image";
          const url = await uploadToCloudinary(file.buffer, "blogs", type);

          //Phân loại chính xác theo field name
          if (key === "mainImage") {
            cloudFiles.mainImage = url;
          } else if (key === "album") {
            cloudFiles.album.push({ type, url });
          } else if (key === "content") {
            cloudFiles.content.push({ type, url });
          }
        }
      }
    }

    // Upload ảnh/video base64 trong content (nếu có)
    let bodyContent = [];
    if (typeof req.body.content === "string") {
      try {
        bodyContent = JSON.parse(req.body.content);
      } catch {
        bodyContent = [];
      }
    } else if (Array.isArray(req.body.content)) {
      bodyContent = req.body.content;
    }

    for (const block of bodyContent) {
      if (
        (block.type === "image" && block.url?.startsWith("data:image")) ||
        (block.type === "video" && block.url?.startsWith("data:video"))
      ) {
        const uploaded = await uploadBase64ToCloudinary(block.url, "blogs/content");
        if (uploaded) cloudFiles.content.push(uploaded);
      }
    }

    req.cloudFiles = cloudFiles;
    next();
  } catch (error) {
    console.error("Error in uploadBlogFiles:", error);
    next(error);
  }
};

// ===============================================================
// Upload cho Place
// ===============================================================
export const uploadPlaceImages = async (req, res, next) => {
  try {
    const files = req.files || [];
    const imageUrls = [];

    for (const file of files) {
      const url = await uploadToCloudinary(file.buffer, 'places', 'image');
      imageUrls.push(url);
    }

    req.body.images = [...(req.body.images || []), ...imageUrls];
    next();
  } catch (error) {
    next(error);
  }
};

// ===============================================================
// Upload cho Comment (chỉ ảnh)
// ===============================================================
export const uploadCommentImages = async (req, res, next) => {
  try {
    const files = req.files || [];
    const urls = [];

    for (const file of files) {
      const url = await uploadToCloudinary(file.buffer, 'comments', 'image');
      urls.push(url);
    }

    req.body = {
      ...req.body,
      images: [...(req.body.images || []), ...urls],
    };
    next();
  } catch (error) {
    next(error);
  }
};

// ===============================================================
// Upload cho Avatar
// ===============================================================
export const uploadAvatar = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return next();

    const url = await uploadToCloudinary(file.buffer, 'avatars', 'image');
    req.body.avatar = url;

    next();
  } catch (error) {
    next(error);
  }
};
