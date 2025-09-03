const express = require('express');
const router = express.Router();
const artistController = require('../../controllers/artistController');
const { authenticateAdmin } = require('../../middleware/auth');
const { uploadProfilePicture } = require('../../middleware/upload');

// All routes require authentication
router.use(authenticateAdmin);

// Search artists (admin) - must be before /:id route
router.get('/search', artistController.searchAdminArtists);

// Get all artists page
router.get('/', artistController.getAllArtists);

// Create new artist (with file upload)
router.post('/', uploadProfilePicture, artistController.createArtist);

// Get single artist (for editing)
router.get('/:id', artistController.getArtist);

// Update artist (with file upload)
router.put('/:id', uploadProfilePicture, artistController.updateArtist);

// Delete artist (soft delete)
router.delete('/:id', artistController.deleteArtist);

module.exports = router;
