const express = require('express');
const router = express.Router();
const {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogs,
  getBlogBySlug,
  getTrendingBlogs,
  searchBlogs,
  likeBlog,
  getUserBlogs,
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/trending', getTrendingBlogs);
router.get('/search', searchBlogs);
router.get('/user/:userId', getUserBlogs);
router.get('/', getBlogs);
router.post('/', protect, upload.single('coverImage'), createBlog);
router.get('/:slug', getBlogBySlug);
router.put('/:id', protect, upload.single('coverImage'), updateBlog);
router.delete('/:id', protect, deleteBlog);
router.put('/:id/like', protect, likeBlog);

module.exports = router;
