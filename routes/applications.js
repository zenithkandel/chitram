const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { uploadApplicationImage } = require('../middleware/upload');

// Public application submission routes
router.post('/apply', uploadApplicationImage, applicationController.submitApplication);
router.post('/submit', uploadApplicationImage, applicationController.submitApplication);

module.exports = router;
