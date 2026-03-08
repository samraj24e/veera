const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, leaveController.getAllLeaves);
router.post('/', authMiddleware, leaveController.createLeave);
router.put('/:id/approve', authMiddleware, leaveController.approveLeave);
router.put('/:id/reject', authMiddleware, leaveController.rejectLeave);

module.exports = router;
