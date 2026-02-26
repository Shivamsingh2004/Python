const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.get('/:blogId', commentController.getComments);
router.post('/:blogId', auth, commentController.addComment);
router.post('/reply/:commentId', auth, commentController.replyComment);
router.delete('/:commentId', auth, commentController.deleteComment);

module.exports = router;
