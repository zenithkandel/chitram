const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { authenticateAdmin } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateAdmin);

// Get all orders page
router.get('/', orderController.getAllOrders);

// Get single order (for viewing)
router.get('/:id', orderController.getOrder);

// Update order status
router.put('/:id/status', orderController.updateOrderStatus);

// Delete order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
