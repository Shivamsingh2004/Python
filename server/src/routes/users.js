const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  followUser,
  bookmarkBlog,
  getBookmarks,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/bookmarks', protect, getBookmarks);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.put('/bookmark/:blogId', protect, bookmarkBlog);
router.get('/:id', getProfile);
router.put('/:id/follow', protect, followUser);

module.exports = router;
