
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'reportedModel'
    },
    reportedModel: {
      type: String,
      required: true,
      enum: ['blogs', 'places', 'reviews', 'blog_comments']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    },
    collection: 'reports'
  }
);

const ReportModel = mongoose.model('Report', reportSchema);

export default ReportModel;
