const bcrypt = require('bcryptjs');
const { db } = require('../config/database');
const { generateToken } = require('../config/jwt');

// Admin login
const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Get admin from database
        const [admins] = await db.execute(
            'SELECT * FROM admin WHERE username = ?',
            [username]
        );

        if (admins.length === 0) {
            return res.render('admin/login', { 
                error: 'Invalid username or password',
                username: username 
            });
        }

        const admin = admins[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
        
        if (!isPasswordValid) {
            return res.render('admin/login', { 
                error: 'Invalid username or password',
                username: username 
            });
        }

        // Update last login
        await db.execute(
            'UPDATE admin SET last_login = NOW() WHERE id = ?',
            [admin.id]
        );

        // Generate JWT token
        const token = generateToken({ 
            id: admin.id, 
            username: admin.username 
        });

        // Set cookie
        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('admin/login', { 
            error: 'An error occurred. Please try again.',
            username: req.body.username || '' 
        });
    }
};

// Admin logout
const adminLogout = (req, res) => {
    res.clearCookie('adminToken');
    res.redirect('/admin/login');
};

// Get dashboard data
const getDashboardData = async (req, res) => {
    try {
        // Get total artists
        const [totalArtists] = await db.execute('SELECT COUNT(*) as count FROM artists');
        
        // Get total arts
        const [totalArts] = await db.execute('SELECT COUNT(*) as count FROM arts');
        
        // Get arts sold
        const [artsSold] = await db.execute("SELECT COUNT(*) as count FROM arts WHERE status = 'sold' OR status = 'delivered'");
        
        // Get total orders
        const [totalOrders] = await db.execute('SELECT COUNT(*) as count FROM orders');
        
        // Get new orders (placed)
        const [newOrders] = await db.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'placed'");
        
        // Get processing orders
        const [processingOrders] = await db.execute("SELECT COUNT(*) as count FROM orders WHERE status IN ('seen', 'contacted', 'sold')");
        
        // Get contact messages
        const [totalMessages] = await db.execute('SELECT COUNT(*) as count FROM contact_messages');
        
        // Get unread messages
        const [unreadMessages] = await db.execute("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'");
        
        // Get total page views
        const [totalViews] = await db.execute('SELECT SUM(view_count) as total FROM page_views');
        
        // Get today's views
        const [todayViews] = await db.execute('SELECT view_count FROM page_views WHERE view_date = CURDATE()');

        const dashboardData = {
            totalArtists: totalArtists[0].count,
            totalArts: totalArts[0].count,
            artsSold: artsSold[0].count,
            totalOrders: totalOrders[0].count,
            newOrders: newOrders[0].count,
            processingOrders: processingOrders[0].count,
            totalMessages: totalMessages[0].count,
            unreadMessages: unreadMessages[0].count,
            totalViews: totalViews[0].total || 0,
            todayViews: todayViews[0]?.view_count || 0
        };

        res.render('admin/dashboard', { 
            dashboardData,
            error: null 
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.render('admin/dashboard', { 
            error: 'Error loading dashboard data',
            dashboardData: {} 
        });
    }
};

module.exports = {
    adminLogin,
    adminLogout,
    getDashboardData
};
