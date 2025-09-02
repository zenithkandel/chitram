const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// Public application submission routes
router.post('/apply', applicationController.upload.single('profile_picture'), applicationController.submitApplication);
router.post('/submit', applicationController.upload.single('profile_picture'), applicationController.submitApplication);

module.exports = router;
