import mongoose from 'mongoose'

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    icon: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['rank', 'event'],
      required: true
    },
    rankOrder: {
      type: Number,
      default: null
    },
    pointsRequired: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    condition: {
      type: Object,
      default: {}
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

const updateIsActive = (doc) => {
  if (doc && doc.type === 'event') {
    const now = new Date()
    if (doc.endDate && doc.endDate < now) {
      doc.isActive = false
    } else if (doc.startDate && doc.startDate > now) {
      doc.isActive = false
    } else if (doc.startDate && doc.endDate && doc.startDate <= now && doc.endDate >= now) {
      doc.isActive = true
    }
  }
}

badgeSchema.post('findOne', function (doc) {
  updateIsActive(doc)
})

badgeSchema.post('find', function (docs) {
  if (Array.isArray(docs)) {
    docs.forEach(updateIsActive)
  }
})


const BadgeModel = mongoose.model('badges', badgeSchema)

export default BadgeModel
