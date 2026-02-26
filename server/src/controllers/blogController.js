const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');

exports.createBlog = async (req, res, next) => {
  try {
    const { title, content, coverImage, tags, published } = req.body;

    const blog = await Blog.create({
      title,
      content,
      author: req.userId,
      coverImage: coverImage || '',
      tags: tags || [],
      published: published || false,
      draft: !published,
    });

    const populated = await blog.populate('author', 'name profileImage');
    res.status(201).json({ blog: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found.' });
    }

    if (blog.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this blog.' });
    }

    const { title, content, coverImage, tags, published } = req.body;
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (tags) blog.tags = tags;
    if (published !== undefined) {
      blog.published = published;
      blog.draft = !published;
    }

    await blog.save();
    const populated = await blog.populate('author', 'name profileImage');

    res.json({ blog: populated });
  } catch (error) {
    next(error);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found.' });
    }

    if (blog.author.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this blog.' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name profileImage bio');

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found.' });
    }

    // Increment view count
    blog.viewCount += 1;
    await blog.save();

    res.json({ blog });
  } catch (error) {
    next(error);
  }
};

exports.getAllBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const tag = req.query.tag;

    const filter = { published: true };
    if (tag) filter.tags = tag;

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate('author', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
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

exports.getTrendingBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ published: true })
      .populate('author', 'name profileImage')
      .sort({ viewCount: -1, likes: -1 })
      .limit(10);

    res.json({ blogs });
  } catch (error) {
    next(error);
  }
};

exports.searchBlogs = async (req, res, next) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const filter = {
      published: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
    };

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate('author', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      blogs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.likeBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found.' });
    }

    const isLiked = blog.likes.includes(req.userId);

    if (isLiked) {
      blog.likes.pull(req.userId);
    } else {
      blog.likes.addToSet(req.userId);
    }

    await blog.save();
    res.json({ liked: !isLiked, likesCount: blog.likes.length });
  } catch (error) {
    next(error);
  }
};

exports.getUserBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const draftOnly = req.query.drafts === 'true';

    const filter = { author: req.params.userId };
    if (draftOnly) {
      filter.draft = true;
    } else {
      filter.published = true;
    }

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate('author', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      blogs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'blogverse' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    next(error);
  }
};
