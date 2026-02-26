const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res, next) => {
  try {
    const { title, content, tags, published } = req.body;

    let coverImage = '';
    if (req.file) {
      coverImage = await uploadToCloudinary(req.file.buffer);
    }

    const parsedTags = tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [];

    const blog = await Blog.create({
      title,
      content,
      authorId: req.user._id,
      coverImage,
      tags: parsedTags,
      published: published === 'true' || published === true,
      isDraft: !(published === 'true' || published === true),
    });

    res.status(201).json({ success: true, blog });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this blog' });
    }

    const { title, content, tags, published } = req.body;
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (tags) blog.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    if (req.file) {
      blog.coverImage = await uploadToCloudinary(req.file.buffer);
    }

    if (published !== undefined) {
      blog.published = published === 'true' || published === true;
      blog.isDraft = !blog.published;
    }

    await blog.save();

    res.json({ success: true, blog });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await Comment.deleteMany({ blogId: blog._id });
    await blog.deleteOne();

    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all published blogs (with pagination)
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const tag = req.query.tag;

    const query = { published: true };
    if (tag) query.tags = tag;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'name profileImage'),
      Blog.countDocuments(query),
    ]);

    res.json({
      success: true,
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true }).populate(
      'authorId',
      'name profileImage bio followers'
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.viewCount += 1;
    await blog.save();

    res.json({ success: true, blog });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending blogs
// @route   GET /api/blogs/trending
// @access  Public
const getTrendingBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ published: true })
      .sort({ viewCount: -1, likes: -1 })
      .limit(10)
      .populate('authorId', 'name profileImage');

    res.json({ success: true, blogs });
  } catch (error) {
    next(error);
  }
};

// @desc    Search blogs
// @route   GET /api/blogs/search
// @access  Public
const searchBlogs = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      $text: { $search: q },
      published: true,
    };

    const [blogs, total] = await Promise.all([
      Blog.find(query, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('authorId', 'name profileImage'),
      Blog.countDocuments(query),
    ]);

    res.json({
      success: true,
      blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like / Unlike blog
// @route   PUT /api/blogs/:id/like
// @access  Private
const likeBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const isLiked = blog.likes.includes(req.user._id);

    if (isLiked) {
      blog.likes.pull(req.user._id);
    } else {
      blog.likes.push(req.user._id);
    }

    await blog.save();

    res.json({
      success: true,
      liked: !isLiked,
      likesCount: blog.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's blogs
// @route   GET /api/blogs/user/:userId
// @access  Public
const getUserBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const isOwner =
      req.user && req.user._id.toString() === req.params.userId;
    const query = isOwner
      ? { authorId: req.params.userId }
      : { authorId: req.params.userId, published: true };

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'name profileImage'),
      Blog.countDocuments(query),
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

module.exports = {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogs,
  getBlogBySlug,
  getTrendingBlogs,
  searchBlogs,
  likeBlog,
  getUserBlogs,
};
