const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Reply text is required'],
      maxlength: [1000, 'Reply cannot exceed 1000 characters'],
    },
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    replies: [replySchema],
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ blogId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
