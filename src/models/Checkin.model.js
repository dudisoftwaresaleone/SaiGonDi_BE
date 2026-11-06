import mongoose from 'mongoose'

const checkinSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'places',
    required: false
  },
  wardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'wards',
    required: false
  },
  note: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  imgList: {
    type: [String],
    default: []
  },
  checkinTime: {
    type: Date,
    default: Date.now
  },
  device: {
    type: String,
    default: 'Unknown Device'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Điểm đến hot: lọc theo tháng + gom theo placeId; lịch sử check-in theo user
checkinSchema.index({ createdAt: -1, placeId: 1 })
checkinSchema.index({ userId: 1, createdAt: -1 })
checkinSchema.index({ userId: 1, checkinTime: -1 })

const Checkin = mongoose.model('Checkin', checkinSchema)

export default Checkin
