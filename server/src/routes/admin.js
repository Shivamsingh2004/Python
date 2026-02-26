const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/users', auth, admin, adminController.getAllUsers);
router.put('/users/:id/block', auth, admin, adminController.blockUser);
router.delete('/blogs/:id', auth, admin, adminController.deleteBlog);
router.get('/stats', auth, admin, adminController.getStats);

module.exports = router;
