const express = require('express');
const router = express.Router();
const multer = require('multer');
const blogController = require('../controllers/blogController');
const auth = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/trending', blogController.getTrendingBlogs);
router.get('/search', blogController.searchBlogs);
router.get('/user/:userId', blogController.getUserBlogs);
router.get('/:id', blogController.getBlog);
router.get('/', blogController.getAllBlogs);
router.post('/', auth, blogController.createBlog);
router.put('/:id', auth, blogController.updateBlog);
router.delete('/:id', auth, blogController.deleteBlog);
router.put('/:id/like', auth, blogController.likeBlog);
router.post('/upload', auth, upload.single('image'), blogController.uploadImage);

module.exports = router;
