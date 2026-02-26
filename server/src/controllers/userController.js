const User = require('../models/User');
const Blog = require('../models/Blog');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -firebaseUID')
      .populate('followers', 'name profileImage')
      .populate('following', 'name profileImage');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postCount = await Blog.countDocuments({ authorId: user._id, published: true });

    res.json({ success: true, user, postCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    if (req.file) {
      updateData.profileImage = await uploadToCloudinary(req.file.buffer, {
        transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto' }],
      });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password -firebaseUID');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow / Unfollow user
// @route   PUT /api/users/:id/follow
// @access  Private
const followUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = req.user.following.includes(req.params.id);

    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { following: req.params.id },
      });
      await User.findByIdAndUpdate(req.params.id, {
        $pull: { followers: req.user._id },
      });
      res.json({ success: true, message: 'Unfollowed successfully', following: false });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { following: req.params.id },
      });
      await User.findByIdAndUpdate(req.params.id, {
        $addToSet: { followers: req.user._id },
      });
      res.json({ success: true, message: 'Followed successfully', following: true });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Bookmark / Unbookmark blog
// @route   PUT /api/users/bookmark/:blogId
// @access  Private
const bookmarkBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const isBookmarked = req.user.bookmarks.includes(req.params.blogId);

    const update = isBookmarked
      ? { $pull: { bookmarks: req.params.blogId } }
      : { $addToSet: { bookmarks: req.params.blogId } };

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true })
      .select('-password -firebaseUID')
      .populate('bookmarks', 'title slug coverImage authorId createdAt');

    res.json({
      success: true,
      message: isBookmarked ? 'Bookmark removed' : 'Blog bookmarked',
      bookmarked: !isBookmarked,
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookmarks
// @route   GET /api/users/bookmarks
// @access  Private
const getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: { path: 'authorId', select: 'name profileImage' },
    });

    res.json({ success: true, bookmarks: user.bookmarks });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, followUser, bookmarkBlog, getBookmarks };
