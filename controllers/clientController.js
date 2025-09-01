const { db } = require('../config/database');
const crypto = require('crypto');

// Helper function to record page views
const recordPageView = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Try to update existing record for today
        const [updateResult] = await db.execute(
            'UPDATE page_views SET view_count = view_count + 1 WHERE view_date = ?',
            [today]
        );
        
        // If no record exists for today, create one
        if (updateResult.affectedRows === 0) {
            await db.execute(
                'INSERT INTO page_views (view_date, view_count) VALUES (?, 1)',
                [today]
            );
        }
    } catch (error) {
        console.error('Page view tracking error:', error);
    }
};

// Helper function to get site statistics
const getSiteStats = async () => {
    try {
        const [totalViews] = await db.execute('SELECT SUM(view_count) as total FROM page_views');
        const [todayViews] = await db.execute('SELECT view_count FROM page_views WHERE view_date = CURDATE()');
        const [totalArts] = await db.execute('SELECT COUNT(*) as count FROM arts WHERE status = "listed"');
        const [totalArtists] = await db.execute('SELECT COUNT(*) as count FROM artists WHERE status = "active"');

        return {
            totalViews: totalViews[0].total || 0,
            todayViews: todayViews[0]?.view_count || 0,
            totalArts: totalArts[0].count || 0,
            totalArtists: totalArtists[0].count || 0
        };
    } catch (error) {
        console.error('Error getting site stats:', error);
        return { totalViews: 0, todayViews: 0, totalArts: 0, totalArtists: 0 };
    }
};

// Home page
const getHomePage = async (req, res) => {
    try {
        await recordPageView();
        
        const stats = await getSiteStats();
        
        // Get latest 20 arts with artist information
        const [latestArts] = await db.execute(`
            SELECT 
                a.unique_id,
                a.art_name,
                a.cost,
                a.art_image,
                a.art_description,
                a.size_of_art,
                a.color_type,
                a.uploaded_at,
                ar.full_name as artist_name,
                ar.unique_id as artist_id
            FROM arts a
            JOIN artists ar ON a.artist_unique_id = ar.unique_id
            WHERE a.status = 'listed'
            ORDER BY a.uploaded_at DESC
            LIMIT 20
        `);

        res.render('client/home', {
            title: 'चित्रम् - Online Art Gallery',
            stats,
            latestArts,
            error: null
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.render('client/home', {
            title: 'चित्रम् - Online Art Gallery',
            stats: { totalViews: 0, todayViews: 0, totalArts: 0, totalArtists: 0 },
            latestArts: [],
            error: 'Error loading page data'
        });
    }
};

// About page
const getAboutPage = async (req, res) => {
    try {
        await recordPageView();
        
        res.render('client/about', {
            title: 'About Us - चित्रम्',
            error: null,
            success: null
        });
    } catch (error) {
        console.error('About page error:', error);
        res.render('client/about', {
            title: 'About Us - चित्रम्',
            error: 'Error loading page',
            success: null
        });
    }
};

// Application form page
const getApplicationPage = async (req, res) => {
    try {
        await recordPageView();
        
        res.render('client/apply', {
            title: 'Apply as Artist - चित्रम्',
            error: null,
            success: null
        });
    } catch (error) {
        console.error('Application page error:', error);
        res.render('client/apply', {
            title: 'Apply as Artist - चित्रम्',
            error: 'Error loading page',
            success: null
        });
    }
};

// Artists page
const getArtistsPage = async (req, res) => {
    try {
        await recordPageView();
        
        const [artists] = await db.execute(`
            SELECT 
                unique_id as id,
                full_name,
                age,
                started_art_at,
                city,
                district,
                profile_picture,
                bio,
                socials,
                school_college,
                created_at
            FROM artist_applications 
            WHERE status = 'approved'
            ORDER BY created_at DESC
        `);

        // Get stats for the page
        const [totalArtists] = await db.execute('SELECT COUNT(*) as count FROM artist_applications WHERE status = "approved"');
        const [totalArtworks] = await db.execute('SELECT COUNT(*) as count FROM arts WHERE status = "listed"');
        const [avgAgeResult] = await db.execute('SELECT AVG(age) as avg FROM artist_applications WHERE status = "approved"');
        const [locationsResult] = await db.execute('SELECT COUNT(DISTINCT city) as count FROM artist_applications WHERE status = "approved"');

        const stats = {
            totalArtists: totalArtists[0].count || 0,
            totalArtworks: totalArtworks[0].count || 0,
            avgAge: Math.round(avgAgeResult[0].avg || 0),
            locations: locationsResult[0].count || 0
        };

        res.render('client/artists', {
            title: 'Our Artists - चित्रम्',
            artists,
            stats,
            pagination: null,
            error: null
        });
    } catch (error) {
        console.error('Artists page error:', error);
        res.render('client/artists', {
            title: 'Our Artists - चित्रम्',
            artists: [],
            stats: { totalArtists: 0, totalArtworks: 0, avgAge: 0, locations: 0 },
            pagination: null,
            error: 'Error loading artists data'
        });
    }
};

// Individual artist page
const getArtistPage = async (req, res) => {
    try {
        await recordPageView();
        
        const { id } = req.params;
        
        // Get artist details
        const [artist] = await db.execute(`
            SELECT * FROM artist_applications WHERE unique_id = ? AND status = 'approved'
        `, [id]);

        if (artist.length === 0) {
            return res.status(404).render('client/error', {
                title: 'Artist Not Found - चित्रम्',
                error: 'Artist not found or not approved yet.'
            });
        }

        // Get artist's arts
        const [artworks] = await db.execute(`
            SELECT 
                unique_id as id,
                art_name as title,
                cost as price,
                art_image as image,
                art_description as description,
                size_of_art,
                color_type,
                status,
                uploaded_at as created_at
            FROM arts 
            WHERE artist_unique_id = ? AND status = 'listed'
            ORDER BY uploaded_at DESC
        `, [id]);

        // Process artworks to match expected format
        const processedArtworks = artworks.map(art => ({
            ...art,
            status: art.status === 'listed' ? 'available' : art.status
        }));

        // Get artist stats
        const [totalArtworks] = await db.execute(`
            SELECT COUNT(*) as count FROM arts WHERE artist_unique_id = ?
        `, [id]);
        
        const [soldArtworks] = await db.execute(`
            SELECT COUNT(*) as count FROM arts WHERE artist_unique_id = ? AND status = 'sold'
        `, [id]);

        const stats = {
            artworks: totalArtworks[0].count || 0,
            sold: soldArtworks[0].count || 0,
            avgPrice: 0 // Will calculate if needed
        };

        res.render('client/artist-detail', {
            title: `${artist[0].full_name} - चित्रम्`,
            artist: artist[0],
            artworks: processedArtworks,
            stats,
            error: null
        });
    } catch (error) {
        console.error('Artist page error:', error);
        res.status(500).render('client/error', {
            title: 'Error - चित्रम्',
            error: 'Error loading artist data'
        });
    }
};

// All arts page
const getArtsPage = async (req, res) => {
    try {
        await recordPageView();
        
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let query = `
            SELECT 
                a.unique_id as id,
                a.art_name as title,
                a.cost as price,
                a.art_image as image,
                a.art_description as description,
                a.status,
                a.uploaded_at as created_at,
                ap.full_name as artist_name,
                ap.unique_id as artist_id
            FROM arts a
            JOIN artist_applications ap ON a.artist_unique_id = ap.unique_id
            WHERE ap.status = 'approved' AND a.status = 'listed'
        `;
        
        let countQuery = `
            SELECT COUNT(*) as total
            FROM arts a
            JOIN artist_applications ap ON a.artist_unique_id = ap.unique_id
            WHERE ap.status = 'approved' AND a.status = 'listed'
        `;

        let queryParams = [];
        let countParams = [];

        if (search) {
            query += ` AND (a.art_name LIKE ? OR a.art_description LIKE ? OR ap.full_name LIKE ?)`;
            countQuery += ` AND (a.art_name LIKE ? OR a.art_description LIKE ? OR ap.full_name LIKE ?)`;
            const searchParam = `%${search}%`;
            queryParams = [searchParam, searchParam, searchParam];
            countParams = [searchParam, searchParam, searchParam];
        }

        query += ` ORDER BY a.uploaded_at DESC LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        const [arts] = await db.execute(query, queryParams);
        const [totalCount] = await db.execute(countQuery, countParams);

        const totalArts = totalCount[0].total;
        const totalPages = Math.ceil(totalArts / limit);

        // Get stats for the page (map database statuses to our display statuses)
        const [totalArtsCount] = await db.execute('SELECT COUNT(*) as count FROM arts');
        const [availableCount] = await db.execute('SELECT COUNT(*) as count FROM arts WHERE status = "listed"');
        const [soldCount] = await db.execute('SELECT COUNT(*) as count FROM arts WHERE status = "sold"');
        const [avgPriceResult] = await db.execute('SELECT AVG(cost) as avg FROM arts WHERE status = "listed"');

        const stats = {
            totalArts: totalArtsCount[0].count || 0,
            available: availableCount[0].count || 0,
            sold: soldCount[0].count || 0,
            avgPrice: Math.round(avgPriceResult[0].avg || 0)
        };

        // Map database status to display status
        const processedArts = arts.map(art => ({
            ...art,
            status: art.status === 'listed' ? 'available' : art.status
        }));

        const pagination = {
            currentPage: page,
            totalPages,
            totalItems: totalArts,
            limit
        };

        res.render('client/arts', {
            title: 'All Arts - चित्रम्',
            arts: processedArts,
            stats,
            pagination,
            search,
            error: null
        });
    } catch (error) {
        console.error('Arts page error:', error);
        res.render('client/arts', {
            title: 'All Arts - चित्रम्',
            arts: [],
            stats: { totalArts: 0, available: 0, sold: 0, avgPrice: 0 },
            pagination: null,
            search: '',
            error: 'Error loading arts data'
        });
    }
};

// Individual art page
const getArtPage = async (req, res) => {
    try {
        await recordPageView();
        
        const { id } = req.params;
        
        // Get art details with artist information
        const [artResult] = await db.execute(`
            SELECT 
                a.*,
                ar.full_name,
                ar.profile_picture,
                ar.bio,
                ar.city,
                ar.district,
                ar.unique_id as artist_id
            FROM arts a
            JOIN artist_applications ar ON a.artist_unique_id = ar.unique_id
            WHERE a.unique_id = ? AND ar.status = 'approved'
        `, [id]);

        if (artResult.length === 0) {
            return res.status(404).render('client/error', {
                title: 'Artwork Not Found - चित्रम्',
                error: 'Artwork not found or not available.'
            });
        }

        const art = artResult[0];
        const artist = {
            unique_id: art.artist_id,
            full_name: art.full_name,
            profile_picture: art.profile_picture,
            bio: art.bio,
            city: art.city,
            district: art.district
        };

        // Get related arts from the same artist (excluding current art)
        const [relatedArts] = await db.execute(`
            SELECT 
                unique_id,
                art_name,
                cost,
                art_image,
                uploaded_at
            FROM arts 
            WHERE artist_unique_id = ? AND unique_id != ? AND status = 'listed'
            ORDER BY uploaded_at DESC
            LIMIT 4
        `, [art.artist_unique_id, id]);

        // Clean up the art object for display
        const displayArt = {
            unique_id: art.unique_id,
            title: art.art_name,
            price: art.cost,
            image: art.art_image,
            description: art.art_description,
            status: art.status,
            size_of_art: art.size_of_art,
            color_type: art.color_type,
            uploaded_at: art.uploaded_at
        };

        res.render('client/art-detail', {
            title: `${art.art_name} - चित्रम्`,
            art: displayArt,
            artist,
            relatedArts,
            error: null
        });
    } catch (error) {
        console.error('Art page error:', error);
        res.status(500).render('client/error', {
            title: 'Error - चित्रम्',
            error: 'Error loading artwork data'
        });
    }
};

// Cart page
const getCartPage = async (req, res) => {
    try {
        await recordPageView();
        
        res.render('client/cart', {
            title: 'Shopping Cart - चित्रम्',
            error: null
        });
    } catch (error) {
        console.error('Cart page error:', error);
        res.render('client/cart', {
            title: 'Shopping Cart - चित्रम्',
            error: 'Error loading cart page'
        });
    }
};

// Checkout page
const getCheckoutPage = async (req, res) => {
    try {
        await recordPageView();
        
        res.render('client/checkout', {
            title: 'Checkout - चित्रम्',
            error: null,
            success: null
        });
    } catch (error) {
        console.error('Checkout page error:', error);
        res.render('client/checkout', {
            title: 'Checkout - चित्रम्',
            error: 'Error loading checkout page',
            success: null
        });
    }
};

// Order tracking page
const getTrackPage = async (req, res) => {
    try {
        await recordPageView();
        
        res.render('client/track', {
            title: 'Track Order - चित्रम्',
            order: null,
            error: null
        });
    } catch (error) {
        console.error('Track page error:', error);
        res.render('client/track', {
            title: 'Track Order - चित्रम्',
            order: null,
            error: 'Error loading tracking page'
        });
    }
};

// Submit contact form
const submitContact = async (req, res) => {
    try {
        const { full_name, email, phone, subject, message } = req.body;

        // Basic validation
        if (!full_name || !email || !subject || !message) {
            return res.status(400).json({ 
                error: 'Please fill in all required fields' 
            });
        }

        // Insert into database
        await db.execute(`
            INSERT INTO contact_messages (
                full_name, email, phone, subject, message, status, created_at
            ) VALUES (?, ?, ?, ?, ?, 'unread', NOW())
        `, [full_name, email, phone || null, subject, message]);

        res.json({ 
            success: 'Message sent successfully! We will get back to you soon.' 
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            error: 'Error sending message. Please try again.' 
        });
    }
};

// Submit order
const submitOrder = async (req, res) => {
    try {
        const { 
            customer_name, 
            customer_phone, 
            customer_email, 
            shipping_address, 
            customer_message, 
            cart_items 
        } = req.body;

        // Basic validation
        if (!customer_name || !customer_phone || !customer_email || !shipping_address || !cart_items || cart_items.length === 0) {
            return res.status(400).json({ 
                error: 'Please fill in all required fields and ensure cart is not empty' 
            });
        }

        // Calculate total amount
        let total_amount = 0;
        for (const item of cart_items) {
            const [art] = await db.execute('SELECT cost FROM arts WHERE unique_id = ?', [item.art_id]);
            if (art.length > 0) {
                total_amount += parseFloat(art[0].cost);
            }
        }

        // Generate order ID
        const order_id = 'CHT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

        // Insert order
        await db.execute(`
            INSERT INTO orders (
                order_id, customer_name, customer_phone, customer_email,
                shipping_address, customer_message, total_amount, item_count,
                item_list, creation_date_time, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'placed')
        `, [
            order_id, 
            customer_name, 
            customer_phone, 
            customer_email,
            shipping_address, 
            customer_message || null, 
            total_amount, 
            cart_items.length,
            JSON.stringify(cart_items)
        ]);

        res.json({ 
            success: 'Order placed successfully!',
            order_id: order_id,
            message: 'We will reach out to you within 48 hours.'
        });
    } catch (error) {
        console.error('Order submission error:', error);
        res.status(500).json({ 
            error: 'Error placing order. Please try again.' 
        });
    }
};

// Search arts API
const searchArts = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.json({ arts: [] });
        }

        const searchTerm = `%${q.trim()}%`;
        
        const [arts] = await db.execute(`
            SELECT 
                a.unique_id,
                a.art_name,
                a.cost,
                a.art_image,
                a.size_of_art,
                ar.full_name as artist_name
            FROM arts a
            JOIN artists ar ON a.artist_unique_id = ar.unique_id
            WHERE a.status = 'listed' 
            AND (a.art_name LIKE ? OR a.art_description LIKE ? OR ar.full_name LIKE ?)
            ORDER BY a.uploaded_at DESC
            LIMIT 20
        `, [searchTerm, searchTerm, searchTerm]);

        res.json({ arts });
    } catch (error) {
        console.error('Search arts error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
};

// Load more arts API
const loadMoreArts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = page * limit; // Skip already loaded arts

        const [arts] = await db.execute(`
            SELECT 
                a.unique_id,
                a.art_name,
                a.cost,
                a.art_image,
                a.art_description,
                a.size_of_art,
                a.color_type,
                a.uploaded_at,
                ar.full_name as artist_name,
                ar.unique_id as artist_id
            FROM arts a
            JOIN artists ar ON a.artist_unique_id = ar.unique_id
            WHERE a.status = 'listed'
            ORDER BY a.uploaded_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        res.json({ arts, hasMore: arts.length === limit });
    } catch (error) {
        console.error('Load more arts error:', error);
        res.status(500).json({ error: 'Error loading more arts' });
    }
};

// Get order status API
const getOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const [order] = await db.execute(`
            SELECT 
                order_id,
                customer_name,
                total_amount,
                item_count,
                creation_date_time,
                received_date_time,
                delivered_date_time,
                status
            FROM orders 
            WHERE order_id = ?
        `, [orderId]);

        if (order.length === 0) {
            return res.status(404).json({ 
                error: 'Order not found. Please check your order ID.' 
            });
        }

        res.json({ order: order[0] });
    } catch (error) {
        console.error('Get order status error:', error);
        res.status(500).json({ 
            error: 'Error fetching order status' 
        });
    }
};

module.exports = {
    getHomePage,
    getAboutPage,
    getApplicationPage,
    getArtistsPage,
    getArtistPage,
    getArtsPage,
    getArtPage,
    getCartPage,
    getCheckoutPage,
    getTrackPage,
    submitContact,
    submitOrder,
    searchArts,
    loadMoreArts,
    getOrderStatus
};
