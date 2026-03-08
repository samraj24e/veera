const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const employeeController = require('../controllers/employeeController');
const exportController = require('../controllers/exportController');
const { authMiddleware } = require('../middleware/auth');

// Multer config for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Employee CRUD routes
router.get('/', authMiddleware, employeeController.getAllEmployees);
router.get('/dashboard', authMiddleware, employeeController.getDashboardStats);
router.get('/export/excel', authMiddleware, exportController.exportExcel);
router.get('/export/pdf', authMiddleware, exportController.exportPDF);
router.get('/:id', authMiddleware, employeeController.getEmployee);
router.post('/', authMiddleware, upload.single('photo'), employeeController.createEmployee);
router.put('/:id', authMiddleware, upload.single('photo'), employeeController.updateEmployee);
router.delete('/:id', authMiddleware, employeeController.deleteEmployee);

module.exports = router;
