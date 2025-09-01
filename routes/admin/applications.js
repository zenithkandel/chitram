const express = require('express');
const router = express.Router();
const applicationController = require('../../controllers/applicationController');
const { authenticateAdmin } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateAdmin);

// Get all applications page
router.get('/', applicationController.getAllApplications);

// Get single application (for viewing)
router.get('/:id', applicationController.getApplication);

// Update application status
router.put('/:id/status', applicationController.updateApplicationStatus);

// Delete application
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
