const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// Public application submission route
router.post('/apply', applicationController.upload.single('profile_picture'), applicationController.submitApplication);

module.exports = router;
