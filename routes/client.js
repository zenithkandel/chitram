const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Home page
router.get('/', clientController.getHomePage);

// About page
router.get('/about', clientController.getAboutPage);

// Application form page
router.get('/apply', clientController.getApplicationPage);

// Artists pages
router.get('/artists', clientController.getArtistsPage);
router.get('/artist/:id', clientController.getArtistPage);

// Arts pages
router.get('/arts', clientController.getArtsPage);
router.get('/art/:id', clientController.getArtPage);

// Cart page
router.get('/cart', clientController.getCartPage);

// Checkout page
router.get('/checkout', clientController.getCheckoutPage);

// Order tracking page
router.get('/track', clientController.getTrackPage);

// API endpoints
router.post('/contact', clientController.submitContact);
router.post('/order', clientController.submitOrder);
router.get('/api/arts/search', clientController.searchArts);
router.get('/api/arts/load-more', clientController.loadMoreArts);
router.get('/api/order/:orderId', clientController.getOrderStatus);

module.exports = router;
