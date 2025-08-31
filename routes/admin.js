const express = require('express');
const router = express.Router();
const { authenticateAdmin, redirectIfAuthenticated } = require('../middleware/auth');
const { adminLogin, adminLogout, getDashboardData } = require('../controllers/adminController');

// Redirect /admin to appropriate page
router.get('/', authenticateAdmin, (req, res) => {
    res.redirect('/admin/dashboard');
});

// Login page (only if not authenticated)
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('admin/login', { error: null, username: '' });
});

// Login POST
router.post('/login', redirectIfAuthenticated, adminLogin);

// Dashboard (requires authentication)
router.get('/dashboard', authenticateAdmin, getDashboardData);

// Logout
router.post('/logout', adminLogout);
router.get('/logout', adminLogout);

module.exports = router;
