const express = require('express');
const router = express.Router();
const {
  addComment,
  getComments,
  replyComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/:blogId', getComments);
router.post('/:blogId', protect, addComment);
router.post('/:commentId/reply', protect, replyComment);
router.delete('/:commentId', protect, deleteComment);

module.exports = router;
