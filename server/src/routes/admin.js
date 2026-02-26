const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  toggleBlockUser,
  adminDeleteBlog,
  getStats,
  getAllBlogs,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.get('/blogs', getAllBlogs);
router.delete('/blogs/:id', adminDeleteBlog);

module.exports = router;
