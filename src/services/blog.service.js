import Blog from '../models/Blog.model.js'
import Place from '../models/Place.model.js'
import Category from '../models/Category.model.js'
import slugify from 'slugify'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
import UserModel from '~/models/User.model.js'
import { userBadgeService } from './userBadge.service.js'
import mongoose from 'mongoose'

const BLOG_POPULATION_FIELDS = [
  { path: 'authorId', select: '_id firstName lastName avatar _destroyed banned' },
  { path: 'ward', select: '_id name' },
  { path: 'categories', select: '_id name' }
]

// Helper function to transform categories array to a comma-separated string of names
const transformCategoriesToString = (blog) => {
  if (!blog) return blog;

  const newBlog = { ...blog }; // Create a shallow copy

  if (newBlog.categories && Array.isArray(newBlog.categories) && newBlog.categories.length > 0) {
    newBlog.categories = newBlog.categories.map(cat => cat.name).join(', ');
  }
  return newBlog;
};

// Helper function to determine media type
const getMediaType = (url) => {
  if (!url) return null
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
  const ext = url.substring(url.lastIndexOf('.')).toLowerCase()

  if (imageExtensions.includes(ext)) {
    return 'image'
  } else if (videoExtensions.includes(ext)) {
    return 'video'
  }
  return null // Unknown type
}

// Helper function to process album data
const processAlbumData = (album) => {
  if (!Array.isArray(album)) {
    return []
  }
  return album.map(item => {
    let url = null;
    let type = null;
    let caption = null;

    if (typeof item === 'string') {
      url = item;
      type = getMediaType(item);
    } else if (typeof item === 'object' && item !== null) {
      url = item.url || null;
      type = item.type || null;
      caption = item.caption || null;

      if (url && !type) {
        type = getMediaType(url);
      }
    }

    if (url && type && ['image', 'video'].includes(type)) {
      return { url, type, caption };
    }
    return null;
  }).filter(Boolean);
}

// Helper function to get filtered blogs
const _getFilteredBlogs = async (filter, sortCriteria, page, limit) => {
  const skip = (page - 1) * limit
  const numericLimit = Number(limit)

  const totalBlogs = await Blog.countDocuments(filter)
  const blogs = await Blog.find(filter)
    .populate(BLOG_POPULATION_FIELDS)
    .sort(sortCriteria)
    .skip(skip)
    .limit(numericLimit)
    .lean()
  return {
    blogs: blogs.map(transformCategoriesToString),
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalBlogs / numericLimit),
      totalBlogs
    }
  }
}

// Lấy danh sách blogs
const getBlogs = async (query, user) => {
  const { search, tag, category, 'category[]': categoryArray, authorId, status, privacy, page = 1, limit = 10 } = query

  const filter = { destroy: false }

  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }
  if (tag) filter.tags = tag
  const categories = category || categoryArray;
  if (categories) {
    if (Array.isArray(categories)) {
      filter.categories = { $in: categories };
    } else {
      filter.categories = categories;
    }
  }

  if (authorId) filter.authorId = authorId
  if (privacy) filter.privacy = privacy

  if (user && user.role === 'admin') { // Only apply status filter if user is admin
    if (status) filter.status = status
  } else { // For non-admin users, force public and approved
    filter.privacy = 'public'
    filter.status = 'approved'
  }

  return _getFilteredBlogs(filter, { createdAt: -1 }, page, limit)
}

const searchBlogs = async (query, user) => {
  const { query: searchTerm, category, author, status, privacy, page = 1, limit = 10, sort, order } = query

  const filter = {
    destroy: false,
    title: { $not: { $regex: '^Chia sẻ', $options: 'i' } }
  }

  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } }
    ]
  }
  if (category) filter.categories = category
  if (author) filter.authorId = author
  if (privacy) filter.privacy = privacy

  if (user && user.role === 'admin') {
    if (status) filter.status = status
  } else {
    filter.privacy = 'public'
    filter.status = 'approved'
  }

  const skip = (page - 1) * limit
  const numericLimit = Number(limit)

  const sortMapping = {
    newest: 'createdAt',
    popular: 'viewCount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    title: 'title',
    views: 'viewCount'
  }

  const sortCriteria = {}
  const sortKey = sortMapping[sort] || 'createdAt'
  sortCriteria[sortKey] = order === 'asc' ? 1 : -1

  const { blogs, pagination } = await _getFilteredBlogs(filter, sortCriteria, page, limit)

  const transformedBlogs = blogs.map(transformCategoriesToString);

  return {
    blogs: transformedBlogs,
    pagination
  }
}

// Lấy danh sách blogs có lượt xem nhiều
const getPopularBlogs = async (query, user) => {
  const { category, page = 1, limit = 10 } = query;

  const filter = { destroy: false };

  if (!user || user.role !== 'admin') {
    filter.privacy = 'public';
    filter.status = 'approved';
  }


  if (category) {
    if (Array.isArray(category)) {
      filter.categories = { $in: category }
    } else {
      filter.categories = category
    }
  }

  const skip = (page - 1) * limit;
  const numericLimit = Number(limit);

  const totalBlogs = await Blog.countDocuments(filter);
  const blogs = await Blog.find(filter)
    .populate(BLOG_POPULATION_FIELDS)
    .sort({ viewCount: -1 })
    .skip(skip)
    .limit(numericLimit)
    .lean();

  return {
    blogs: blogs.map(transformCategoriesToString),
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalBlogs / numericLimit),
      totalBlogs
    }
  };
};

// Lấy chi tiết blog
const getBlogById = async (id, user, checkPending = false) => {
  const blog = await Blog.findById(id)
    .populate(BLOG_POPULATION_FIELDS)
    .lean()

  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  }

  if (blog.privacy === 'private' &&
    blog.authorId._id.toString() !== user?.id &&
    user?.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xem bài viết này')
  }

  if (checkPending && blog.status === 'approved' && user?.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bài viết này đã được duyệt')
  }

  if (!checkPending && blog.status === 'pending' && user?.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bài viết này chưa được duyệt')
  }

  Blog.updateOne({ _id: id }, { $inc: { viewCount: 1 } }).exec()
  return transformCategoriesToString(blog);
}

const getBlogByIdPending = (id, user) => {
  return getBlogById(id, user, true)
}

// Lấy chi tiết blog theo slug
const getBlogBySlug = async (slug, user) => {
  const blog = await Blog.findOne({ slug })
    .populate(BLOG_POPULATION_FIELDS)
    .lean()

  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  }
  // Chặn xem bài private
  if (
    blog.privacy === 'private' &&
    blog.authorId._id.toString() !== user?.id &&
    user?.role !== 'admin'
  ) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xem bài viết này')
  }

  if (blog.status === 'pending' && user?.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bài viết này chưa được duyệt')
  }

  // Tăng view count
  Blog.updateOne({ _id: blog._id }, { $inc: { viewCount: 1 } }).exec()

  return blog
}

const createBlog = async (blogData, authorId) => {
  const { title, content, album, categories, tags, privacy, locationDetail, ward, province } = blogData

  if (categories && categories.length > 0) {
    const validCategories = await Category.countDocuments({
      _id: { $in: categories },
      type: 'blog'
    });
    if (validCategories !== categories.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Một hoặc nhiều danh mục không hợp lệ hoặc không phải là danh mục blog.');
    }
  }

  let baseSlug = slugify(title, { lower: true, strict: true, trim: true })
  let slug = baseSlug
  let count = 1
  while (await Blog.findOne({ slug })) {
    slug = `${baseSlug}-${count++}`
  }

  const processedAlbum = processAlbumData(album)

  const newBlog = await Blog.create({
    title,
    slug,
    mainImage: blogData.mainImage || (processedAlbum?.find(m => m.type === 'image')?.url ?? null),
    content,
    album: processedAlbum,
    categories: categories ? categories.map(id => new mongoose.Types.ObjectId(id)) : [],
    tags,
    privacy,
    authorId,
    locationDetail,
    ward,
    province: province || 'Hồ Chí Minh'
  })


  return newBlog.populate(BLOG_POPULATION_FIELDS);
}

// Cập nhật quyền riêng tư
const updateBlogPrivacy = async (blogId, newPrivacy, user) => {
  const blog = await Blog.findById(blogId).populate(BLOG_POPULATION_FIELDS);
  if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')

  if (blog.authorId.toString() !== user.id.toString() && user.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền thực hiện hành động này')
  }

  blog.privacy = newPrivacy
  await blog.save()
  return blog
}

// Xóa blog
const deleteBlog = async (blogId, user) => {
  const blog = await Blog.findById(blogId).populate(BLOG_POPULATION_FIELDS);
  if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')

  // if (blog.authorId.toString() !== user.id.toString() && user.role !== 'admin') {
  //   throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền thực hiện hành động này')
  // }

  if (user.role === 'admin') {
    blog.status = 'deleted'
    await blog.save()

    return { message: 'Bài viết đã bị đánh dấu xóa bởi admin' }
  } else {
    blog.status = 'deleted'
    await blog.save()
    return { message: 'Bài viết đã bị xoá bởi người dùng' }
  }
}

const likeBlog = async (blogId, userId) => {
  const blog = await Blog.findById(blogId).populate(BLOG_POPULATION_FIELDS);
  if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết.')

  const userIndex = blog.likeBy.findIndex(id => id.toString() === userId.toString())
  if (userIndex === -1) {
    blog.likeBy.push(userId)
  } else {
    blog.likeBy.splice(userIndex, 1)
  }
  blog.totalLikes = blog.likeBy.length
  await blog.save()
  return blog
}

const shareBlogById = async (blogId, userId) => {
  const originalBlog = await Blog.findById(blogId).populate(BLOG_POPULATION_FIELDS).lean();
  if (!originalBlog) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết gốc.')

  if (originalBlog.privacy !== 'public' || originalBlog.status !== 'approved') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bài viết này không thể chia sẻ.')
  }


  await Blog.updateOne({ _id: blogId }, { $inc: { shareCount: 1 } });



  const transformedAlbum = originalBlog.album.map(item => {
    if (typeof item === 'string') {
      const type = getMediaType(item)
      if (type) {
        return { type, url: item, caption: null }
      }
      return null
    }

    if (item && item.type && item.url) {
      return item
    }
    return null
  }).filter(Boolean)
  let baseSlug = slugify(originalBlog.title, { lower: true, strict: true, trim: true })
  let newSlug = `${baseSlug}-${Date.now()}`

  const newSharedBlog = await Blog.create({
    title: `Chia sẻ: ${originalBlog.title}`,
    slug: newSlug,
    mainImage: originalBlog.mainImage,
    content: originalBlog.content,
    album: transformedAlbum,
    categories: originalBlog.categories.map(c => c._id),
    tags: originalBlog.tags,
    privacy: 'private',
    totalLikes: 0,
    shareCount: 0,
    viewCount: 0,
    authorId: userId,
    locationDetail: originalBlog.locationDetail,
    ward: originalBlog.ward,
    province: originalBlog.province,
    originalPostId: originalBlog._id,
    status: 'approved',
    destroy: false,
    deletedAt: null
  })


  await UserModel.findByIdAndUpdate(userId, {
    $push: { sharedBlogs: { blog: originalBlog._id, sharedAt: new Date() } }
  })

  return newSharedBlog
}


const updateBlogStatus = async (blogId, newStatus, user) => {
  const blog = await Blog.findById(blogId).populate(BLOG_POPULATION_FIELDS);
  if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  if (user.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Chỉ admin mới có quyền chỉnh sửa trạng thái')
  }
  blog.status = newStatus
  await blog.save()
  return blog
}


const updateBlog = async (blogId, updateData, user) => {
  const blog = await Blog.findById(blogId).populate(BLOG_POPULATION_FIELDS);
  if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')

  if (updateData.categories) {
    const validCategories = await Category.countDocuments({
      _id: { $in: updateData.categories },
      type: 'blog'
    });
    if (validCategories !== updateData.categories.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Một hoặc nhiều danh mục không hợp lệ hoặc không phải là danh mục blog.');
    }
  }

  if (blog.authorId?._id?.toString() !== user.id.toString() && user.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền sửa bài viết này')
  }

  const allowedFields = ['title', 'content', 'album', 'mainImage', 'categories', 'tags', 'privacy', 'ward', 'locationDetail', 'province']
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      if (key === 'album') {
        blog[key] = processAlbumData(updateData[key])
      } else {
        blog[key] = updateData[key]
      }
    }
  })

  if (updateData.title) {
    let baseSlug = slugify(updateData.title, { lower: true, strict: true, trim: true })
    let slug = baseSlug
    let count = 1
    while (await Blog.findOne({ slug, _id: { $ne: blog._id } })) {
      slug = `${baseSlug}-${count++}`
    }
    blog.slug = slug
  }

  await blog.save()
  return blog
}

const getBlogsByAuthor = async (authorId, user) => {
  const filter = { authorId, destroy: false }

  if (user.role !== 'admin' && user.id.toString() !== authorId.toString()) {
    filter.privacy = 'public'
    filter.status = 'approved'
  }

  const blogs = await Blog.find(filter)
    .populate(BLOG_POPULATION_FIELDS)
    .sort({ createdAt: -1 })
    .lean()

  return blogs.map(transformCategoriesToString);
}

const getBlogsByPlaceIdentifier = async (identifier, query, user) => {
  const { page = 1, limit = 10, status } = query

  let place = null

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    place = await Place.findById(identifier).populate('ward', 'name').lean()
  }

  if (!place) {
    place = await Place.findOne({ slug: identifier }).populate('ward', 'name').lean()
  }

  if (!place) {
    place = await Place.findOne({ name: { $regex: identifier, $options: 'i' } }).populate('ward', 'name').lean()
  }

  const filter = { destroy: false }


  if (place) {
    const orConditions = []
    if (place.name) {
      // Tách các từ trong tên địa điểm
      const keywords = place.name.split(/\s+/).filter(Boolean)

      keywords.forEach((word) => {
        orConditions.push({ title: { $regex: word, $options: 'i' } })
        orConditions.push({ slug: { $regex: slugify(word, { lower: true, strict: true, trim: true }), $options: 'i' } })
      })
    }

    if (place.ward?._id) {
      orConditions.push({ ward: place.ward._id })
    }
    if (orConditions.length > 0) {
      filter.$or = orConditions
    }
  } else {
    const searchTerm = slugify(identifier, { lower: true, strict: true, trim: true })
    filter.$or = [
      { title: { $regex: identifier, $options: 'i' } },
      { slug: { $regex: searchTerm, $options: 'i' } }
    ]
  }

  if (user && user.role === 'admin') {
    if (status) filter.status = status
  } else {
    filter.privacy = 'public'
    filter.status = 'approved'
  }

  const skip = (page - 1) * limit
  const numericLimit = Number(limit)

  const totalBlogs = await Blog.countDocuments(filter)
  const blogs = await Blog.find(filter)
    .select('title slug mainImage authorId ward createdAt totalLikes viewCount shareCount privacy status tags categories')
    .populate(BLOG_POPULATION_FIELDS)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(numericLimit)
    .lean()

  const transformedBlogs = blogs.map(transformCategoriesToString);

  return {
    blogs: transformedBlogs,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalBlogs / numericLimit),
      totalBlogs
    }
  }
}

const getBlogsByWard = async (wardId, query, user) => {
  const { page = 1, limit = 10, status } = query

  const filter = { destroy: false, ward: wardId }

  if (user && user.role === 'admin') {
    if (status) filter.status = status
  } else {
    filter.privacy = 'public'
    filter.status = 'approved'
  }

  const skip = (page - 1) * limit
  const numericLimit = Number(limit)

  const totalBlogs = await Blog.countDocuments(filter)
  const blogs = await Blog.find(filter)
    .populate(BLOG_POPULATION_FIELDS)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(numericLimit)
    .lean()

  const transformedBlogs = blogs.map(transformCategoriesToString);

  return {
    blogs: transformedBlogs,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalBlogs / numericLimit),
      totalBlogs
    }
  }
}


const getHotBlogs = async (limit = 2) => {
  try {
    const hotBlogs = await Blog.find({ status: 'approved', privacy: 'public', destroy: false })
      .sort({ viewCount: -1 })
      .limit(limit)
      .select('title slug mainImage authorId createdAt viewCount totalLikes categories ward')
      .lean();

    return hotBlogs.map(transformCategoriesToString);
  } catch (error) {
    throw error
  }
}

const getBlogForEdit = async (id, user) => {
  const blog = await Blog.findById(id)
    .populate(BLOG_POPULATION_FIELDS)
    .lean()

  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  }

  if (blog.authorId._id.toString() !== user?.id.toString() && user?.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền chỉnh sửa bài viết này')
  }

  const transformedBlog = {
    ...transformCategoriesToString(blog),
    privacy: blog.privacy,
    status: blog.status
  }
  return transformedBlog
}
export const blogService = {
  getBlogs,
  getPopularBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlogPrivacy,
  getBlogsByAuthor,
  deleteBlog,
  likeBlog,
  updateBlogStatus,
  updateBlog,
  shareBlogById,
  getBlogsByPlaceIdentifier,
  getBlogsByWard,
  getHotBlogs,
  searchBlogs,
  getBlogForEdit,
  getBlogByIdPending
}
