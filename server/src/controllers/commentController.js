const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const { getIO } = require('../utils/socket');

exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const blogId = req.params.blogId;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required.' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found.' });
    }

    const comment = await Comment.create({
      blog: blogId,
      user: req.userId,
      text,
    });

    await Blog.findByIdAndUpdate(blogId, { $inc: { commentsCount: 1 } });

    const populated = await comment.populate('user', 'name profileImage');

    // Emit realtime comment
    try {
      const io = getIO();
      io.to(blogId).emit('newComment', populated);
    } catch (_) {
      // Socket not available, skip
    }

    res.status(201).json({ comment: populated });
  } catch (error) {
    next(error);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Comment.countDocuments({ blog: req.params.blogId });
    const comments = await Comment.find({ blog: req.params.blogId })
      .populate('user', 'name profileImage')
      .populate('replies.user', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      comments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.replyComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    comment.replies.push({ user: req.userId, text });
    await comment.save();

    const populated = await comment.populate('replies.user', 'name profileImage');

    try {
      const io = getIO();
      io.to(comment.blog.toString()).emit('commentReply', populated);
    } catch (_) {
      // Socket not available, skip
    }

    res.json({ comment: populated });
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (comment.user.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await Blog.findByIdAndUpdate(comment.blog, { $inc: { commentsCount: -1 } });
    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({ message: 'Comment deleted.' });
  } catch (error) {
    next(error);
  }
};
