const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000,
  },
}, {
  timestamps: true,
});

const commentSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: 2000,
  },
  replies: [replySchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Comment', commentSchema);
