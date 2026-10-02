const express = require('express');
const { body } = require('express-validator');
const complaintController = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Validation chains
const complaintValidation = [
  body('title').trim().notEmpty().withMessage('Complaint title is required').isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),
  body('description').trim().notEmpty().withMessage('Detailed description is required'),
  body('location').trim().notEmpty().withMessage('Campus location is required'),
  body('category').optional().isIn(['hostel', 'wifi', 'infrastructure', 'academics', 'cleanliness', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level')
];

// All complaint routes require authentication
router.use(protect);

// Student & Admin endpoints
router.get('/', complaintController.getAll);
router.post('/', complaintValidation, complaintController.create);
router.post('/upload', upload.single('image'), complaintController.uploadEvidence);
router.post('/ai-preview', complaintController.getAiPreview);
router.get('/:id', complaintController.getById);

// Student only endpoint
router.post('/:id/feedback', authorize('student'), complaintController.submitFeedback);

// Admin & Staff only endpoints
router.put('/:id/status', authorize('admin', 'staff'), complaintController.updateStatus);
router.put('/:id/assign', authorize('admin', 'staff'), complaintController.assign);

module.exports = router;
