const User = require('../models/User');
const Blog = require('../models/Blog');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name profileImage')
      .populate('following', 'name profileImage');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const postsCount = await Blog.countDocuments({ author: user._id, published: true });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, profileImage } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (profileImage) updates.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.followUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.userId.toString()) {
      return res.status(400).json({ error: 'You cannot follow yourself.' });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const alreadyFollowing = targetUser.followers.includes(req.userId);

    if (alreadyFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(targetId, { $pull: { followers: req.userId } });
      await User.findByIdAndUpdate(req.userId, { $pull: { following: targetId } });
      res.json({ message: 'Unfollowed successfully.', following: false });
    } else {
      // Follow
      await User.findByIdAndUpdate(targetId, { $addToSet: { followers: req.userId } });
      await User.findByIdAndUpdate(req.userId, { $addToSet: { following: targetId } });
      res.json({ message: 'Followed successfully.', following: true });
    }
  } catch (error) {
    next(error);
  }
};

exports.bookmarkBlog = async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const user = await User.findById(req.userId);

    const isBookmarked = user.bookmarks.includes(blogId);

    if (isBookmarked) {
      await User.findByIdAndUpdate(req.userId, { $pull: { bookmarks: blogId } });
      res.json({ message: 'Bookmark removed.', bookmarked: false });
    } else {
      await User.findByIdAndUpdate(req.userId, { $addToSet: { bookmarks: blogId } });
      res.json({ message: 'Blog bookmarked.', bookmarked: true });
    }
  } catch (error) {
    next(error);
  }
};

exports.getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'bookmarks',
      populate: { path: 'author', select: 'name profileImage' },
    });

    res.json({ bookmarks: user.bookmarks });
  } catch (error) {
    next(error);
  }
};
