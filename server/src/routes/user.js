const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/bookmarks', auth, userController.getBookmarks);
router.get('/:id', userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/follow/:id', auth, userController.followUser);
router.put('/bookmark/:blogId', auth, userController.bookmarkBlog);

module.exports = router;
