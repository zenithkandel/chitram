const { db } = require('../config/database');

// Get home page with statistics
const getHomePage = async (req, res) => {
    try {
        // Get today's page views
        const today = new Date().toISOString().split('T')[0];
        const [todayViews] = await db.execute(
            'SELECT view_count FROM page_views WHERE view_date = ?',
            [today]
        );
        const dailyViews = todayViews.length > 0 ? todayViews[0].view_count : 0;

        // Get total active artists
        const [activeArtists] = await db.execute(
            'SELECT COUNT(*) as total FROM artists WHERE status = "active"'
        );
        const totalArtists = activeArtists[0].total;

        // Get total listed arts
        const [listedArts] = await db.execute(
            'SELECT COUNT(*) as total FROM arts WHERE status = "listed"'
        );
        const totalArts = listedArts[0].total;

        // Update page views for today
        await db.execute(`
            INSERT INTO page_views (view_date, view_count) 
            VALUES (?, 1) 
            ON DUPLICATE KEY UPDATE view_count = view_count + 1
        `, [today]);

        res.render('home', {
            title: 'चित्रम् - Art Platform',
            dailyViews: dailyViews + 1, // Include current view
            totalArtists,
            totalArts
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.render('home', {
            title: 'चित्रम् - Art Platform',
            dailyViews: 0,
            totalArtists: 0,
            totalArts: 0
        });
    }
};

module.exports = {
    getHomePage
};
