const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

// @desc    Add comment to blog
// @route   POST /api/comments/:blogId
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = await Comment.create({
      blogId: req.params.blogId,
      userId: req.user._id,
      text,
    });

    blog.commentCount += 1;
    await blog.save();

    await comment.populate('userId', 'name profileImage');

    const io = req.app.get('io');
    if (io) {
      io.to(req.params.blogId).emit('new_comment', comment);
    }

    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a blog
// @route   GET /api/comments/:blogId
// @access  Public
const getComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ blogId: req.params.blogId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name profileImage')
        .populate('replies.userId', 'name profileImage'),
      Comment.countDocuments({ blogId: req.params.blogId }),
    ]);

    res.json({
      success: true,
      comments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to a comment
// @route   POST /api/comments/:commentId/reply
// @access  Private
const replyComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.replies.push({ userId: req.user._id, text });
    await comment.save();
    await comment.populate('replies.userId', 'name profileImage');

    const io = req.app.get('io');
    if (io) {
      io.to(comment.blogId.toString()).emit('new_reply', {
        commentId: comment._id,
        reply: comment.replies[comment.replies.length - 1],
      });
    }

    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (
      comment.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Blog.findByIdAndUpdate(comment.blogId, { $inc: { commentCount: -1 } });
    await comment.deleteOne();

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { addComment, getComments, replyComment, deleteComment };
