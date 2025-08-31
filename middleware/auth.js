const { verifyToken } = require('../config/jwt');

const authenticateAdmin = (req, res, next) => {
    try {
        // Check for token in cookies
        const token = req.cookies?.adminToken;
        
        if (!token) {
            return res.redirect('/admin/login');
        }

        // Verify token
        const decoded = verifyToken(token);
        req.admin = decoded;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.clearCookie('adminToken');
        return res.redirect('/admin/login');
    }
};

const redirectIfAuthenticated = (req, res, next) => {
    try {
        const token = req.cookies?.adminToken;
        
        if (token) {
            verifyToken(token);
            return res.redirect('/admin/dashboard');
        }
        
        next();
    } catch (error) {
        // Token is invalid, continue to login
        res.clearCookie('adminToken');
        next();
    }
};

module.exports = { authenticateAdmin, redirectIfAuthenticated };
