const express = require('express');
const router = express.Router();
const artworkController = require('../../controllers/artworkController');
const { authenticateAdmin } = require('../../middleware/auth');
const { uploadArtworkImage } = require('../../middleware/upload');

// All routes require authentication
router.use(authenticateAdmin);

// Get all artworks page
router.get('/', artworkController.getAllArtworks);

// Get all artists for dropdown (API endpoint)
router.get('/api/artists', artworkController.getAllArtistsForDropdown);

// Create new artwork (with file upload)
router.post('/', uploadArtworkImage, artworkController.createArtwork);

// Get single artwork (for editing)
router.get('/:id', artworkController.getArtwork);

// Update artwork (with file upload)
router.put('/:id', uploadArtworkImage, artworkController.updateArtwork);

// Delete artwork (soft delete)
router.delete('/:id', artworkController.deleteArtwork);

module.exports = router;
