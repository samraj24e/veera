const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, payrollController.getAllPayroll);
router.post('/', authMiddleware, payrollController.createPayroll);

module.exports = router;
