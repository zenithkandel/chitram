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

// Root route
app.get('/', getHomePage);

// Placeholder routes for navigation links
app.get('/about', (req, res) => {
    res.send(`
        <h1>About चित्रम्</h1>
        <p>About page coming soon...</p>
        <a href="/">← Back to Home</a>
    `);
});

app.get('/apply', (req, res) => {
    res.send(`
        <h1>Artist Application</h1>
        <p>Artist application form coming soon...</p>
        <a href="/">← Back to Home</a>
    `);
});

app.get('/artists', (req, res) => {
    res.send(`
        <h1>Our Artists</h1>
        <p>Artists page coming soon...</p>
        <a href="/">← Back to Home</a>
    `);
});

app.get('/gallery', (req, res) => {
    res.send(`
        <h1>Art Gallery</h1>
        <p>Gallery page coming soon...</p>
        <a href="/">← Back to Home</a>
    `);
});

app.get('/cart', (req, res) => {
    res.send(`
        <h1>Shopping Cart</h1>
        <p>Cart page coming soon...</p>
        <a href="/">← Back to Home</a>
    `);
});

app.get('/track', (req, res) => {
    res.send(`
        <h1>Track Orders</h1>
        <p>Order tracking page coming soon...</p>
        <a href="/">← Back to Home</a>
    `);
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
