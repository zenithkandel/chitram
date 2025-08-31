const express = require('express');
const router = express.Router();
const artistController = require('../../controllers/artistController');
const { authenticateAdmin } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateAdmin);

// Get all artists page
router.get('/', artistController.getAllArtists);

// Get single artist (for editing)
router.get('/:id', artistController.getArtist);

// Update artist
router.put('/:id', artistController.updateArtist);

// Delete artist (soft delete)
router.delete('/:id', artistController.deleteArtist);

module.exports = router;
