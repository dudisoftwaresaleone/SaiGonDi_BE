import mongoose from 'mongoose'
import ApiError from '~/utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import CategoryModel from '~/models/Category.model.js'

const createNew = async (categoryData) => {
  try {
    const newCategory = await CategoryModel.create({
      ...categoryData
    })
    return newCategory
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const getAllCategories = async (query) => {
  try {
    const filter = { deleted: { $ne: true } }
    if (query && query.type) {
      filter.type = query.type
    }

    const aggregationPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: 'categories',
          as: 'blogs'
        }
      },
      {
        $lookup: {
          from: 'places',
          localField: '_id',
          foreignField: 'categories',
          as: 'places'
        }
      },
      {
        $addFields: {
          blogCount: { $size: '$blogs' },
          placeCount: { $size: '$places' }
        }
      },
      {
        $project: {
          blogs: 0,
          places: 0
        }
      }
    ]

    const categories = await CategoryModel.aggregate(aggregationPipeline)
    return categories
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const updateCategory = async (categoryId, updateData) => {
  try {
    const updatedCategory = await CategoryModel.findByIdAndUpdate(categoryId, updateData, { new: true })
    if (!updatedCategory) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy danh mục')
    }
    return updatedCategory
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const deleteCategory = async (categoryId) => {
  try {
    const deletedCategory = await CategoryModel.findByIdAndUpdate(categoryId, { deleted: true, deletedAt: new Date() }, { new: true })
    if (!deletedCategory) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy danh mục')
    }
    return deletedCategory
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}


const getCategoryById = async (categoryId, query) => {
  try {
    const categoryIdObject = new mongoose.Types.ObjectId(categoryId)

    const aggregationPipeline = [
      {
        $match: {
          _id: categoryIdObject,
          deleted: { $ne: true }
        }
      },
      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: 'categories',
          as: 'blogs'
        }
      },
      {
        $lookup: {
          from: 'places',
          localField: '_id',
          foreignField: 'categories',
          as: 'places'
        }
      },
      {
        $addFields: {
          blogCount: { $size: '$blogs' },
          placeCount: { $size: '$places' }
        }
      }
    ]

    if (query && query.populate === 'blogs.authorId') {
      aggregationPipeline.push(
        {
          $unwind: {
            path: '$blogs',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            'blogs.authorId': { $exists: true, $ne: null }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'blogs.authorId',
            foreignField: '_id',
            as: 'authorDetails'
          }
        },
        {
          $unwind: {
            path: '$authorDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            'blogs.author': '$authorDetails'
          }
        },
        {
          $group: {
            _id: '$_id',
            doc: { $first: '$$ROOT' },
            blogs: {
              $push: {
                $cond: { if: '$blogs._id', then: '$blogs', else: null }
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            doc: {
              $mergeObjects: [
                '$doc',
                {
                  blogs: {
                    $filter: {
                      input: '$blogs',
                      as: 'blog',
                      cond: { $ne: ['$$blog', null] }
                    }
                  }
                }
              ]
            }
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: ['$doc', { blogs: '$blogs' }]
            }
          }
        }
      )
    }

    const result = await CategoryModel.aggregate(aggregationPipeline)

    if (!result || result.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy danh mục')
    }
    
    const finalResult = result[0]

    if (finalResult.blogs && finalResult.blogs.length > 0 && (!finalResult.blogs[0] || !finalResult.blogs[0]._id)) {
      finalResult.blogs = []
    }
    
    return finalResult
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    if (error.name === 'BSONTypeError') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Id danh mục không hợp lệ')
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

export const categoryService = {
  createNew,
  getAllCategories,
  updateCategory,
  getCategoryById,
  deleteCategory
}
