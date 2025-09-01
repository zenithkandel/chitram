const express = require('express');
const router = express.Router();
const applicationController = require('../../controllers/applicationController');
const { authenticateAdmin } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateAdmin);

// Get all applications page (new applications)
router.get('/', applicationController.getAllApplications);

// Get approved applications page
router.get('/approved', applicationController.getApprovedApplications);

// Get rejected applications page
router.get('/rejected', applicationController.getRejectedApplications);

// Get single application (for viewing)
router.get('/:id', applicationController.getApplication);

// Update application status
router.put('/:id/status', applicationController.updateApplicationStatus);
router.post('/:id/status', applicationController.updateApplicationStatus);

// Delete application
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
