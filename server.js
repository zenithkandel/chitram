const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import database and test connection
const { testConnection } = require('./config/database');

// Import routes
const adminRoutes = require('./routes/admin');
const applicationRoutes = require('./routes/applications');
const { getHomePage } = require('./controllers/homeController');
const { submitContactForm } = require('./controllers/contactController');
const { getPublicArtists, searchArtists } = require('./controllers/artistController');
const { getGalleryArtworks, searchAndFilterArtworks, getArtCategories } = require('./controllers/galleryController');
const { getTrackOrdersPage, trackOrder } = require('./controllers/trackOrderController');
const { getArtistProfile } = require('./controllers/artistProfileController');
const { getArtworkDetails } = require('./controllers/artworkController');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
const artworksDir = path.join(uploadsDir, 'artworks');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir);
}

if (!fs.existsSync(artworksDir)) {
    fs.mkdirSync(artworksDir);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);

// API Routes
app.post('/api/contact', submitContactForm);
app.get('/api/artists/search', searchArtists);
app.get('/api/gallery/search', searchAndFilterArtworks);
app.get('/api/gallery/categories', getArtCategories);
app.post('/api/track-order', trackOrder);

// Root route
app.get('/', getHomePage);

// About page route
app.get('/about', (req, res) => {
    res.render('about');
});

// Apply page route
app.get('/apply', (req, res) => {
    res.render('apply');
});

// Artists page route
app.get('/artists', getPublicArtists);

// Individual artist profile route
app.get('/artist/:id', getArtistProfile);

// Gallery page route
app.get('/gallery', getGalleryArtworks);

// Individual artwork details route
app.get('/artwork/:id', getArtworkDetails);

app.get('/cart', (req, res) => {
    res.send(`
        <h1>Shopping Cart</h1>
        <p>Cart page coming soon...</p>
        <a href="/">← Back to Home</a>
    `);
});

// Track Orders page route
app.get('/track-orders', getTrackOrdersPage);

// Legacy track route (redirect to track-orders)
app.get('/track', (req, res) => {
    res.redirect('/track-orders');
});

// 404 handler
app.use((req, res) => {
    res.status(404).send(`
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/">Go Home</a>
    `);
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    
    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    
    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({ error: 'Only image files are allowed!' });
    }
    
    res.status(500).send(`
        <h1>500 - Internal Server Error</h1>
        <p>Something went wrong on our end.</p>
        <a href="/">Go Home</a>
    `);
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ Cannot start server: Database connection failed');
            process.exit(1);
        }

        app.listen(PORT, () => {
            console.log(`
🎨 चित्रम् Server Running Successfully!
📍 Server: http://localhost:${PORT}
👑 Admin Panel: http://localhost:${PORT}/admin
🗄️  Database: Connected
🚀 Environment: ${process.env.NODE_ENV || 'development'}
            `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();