const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select('-password -firebaseUID').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block / Unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Admin
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block an admin user' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: user.isBlocked ? 'User blocked' : 'User unblocked',
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any blog (admin)
// @route   DELETE /api/admin/blogs/:id
// @access  Admin
const adminDeleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await Comment.deleteMany({ blogId: blog._id });
    await blog.deleteOne();

    res.json({ success: true, message: 'Blog deleted by admin' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalBlogs, totalComments, publishedBlogs] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      Comment.countDocuments(),
      Blog.countDocuments({ published: true }),
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalBlogs, totalComments, publishedBlogs },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blogs (admin view, includes drafts)
// @route   GET /api/admin/blogs
// @access  Admin
const getAllBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'name email profileImage'),
      Blog.countDocuments(),
    ]);

    res.json({
      success: true,
      blogs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, toggleBlockUser, adminDeleteBlog, getStats, getAllBlogs };
