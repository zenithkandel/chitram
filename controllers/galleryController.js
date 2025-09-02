const { db } = require('../config/database');

// Get all artworks for gallery page
const getGalleryArtworks = async (req, res) => {
    try {
        const [artworks] = await db.execute(`
            SELECT 
                a.unique_id,
                a.art_name,
                a.art_image,
                a.cost,
                a.art_category,
                ar.full_name as artist_name
            FROM arts a
            LEFT JOIN artists ar ON a.artist_unique_id = ar.unique_id
            WHERE a.status = 'listed'
            AND ar.status = 'active'
            ORDER BY a.uploaded_at DESC
        `);

        res.render('gallery', { 
            artworks,
            error: null
        });
    } catch (error) {
        console.error('Gallery artworks fetch error:', error);
        res.render('gallery', { 
            artworks: [],
            error: 'Error loading artworks data'
        });
    }
};

// Search and filter artworks API endpoint
const searchAndFilterArtworks = async (req, res) => {
    try {
        const { q, sortBy, category } = req.query;
        
        let whereClause = `WHERE a.status = 'listed' AND ar.status = 'active'`;
        let orderClause = `ORDER BY a.uploaded_at DESC`;
        let queryParams = [];

        // Add search functionality
        if (q && q.trim() !== '') {
            const searchTerm = `%${q.trim()}%`;
            whereClause += ` AND (a.art_name LIKE ? OR ar.full_name LIKE ? OR a.art_category LIKE ?)`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        // Add category filter
        if (category && category !== 'all') {
            whereClause += ` AND a.art_category = ?`;
            queryParams.push(category);
        }

        // Add sorting
        switch (sortBy) {
            case 'date_newest':
                orderClause = `ORDER BY a.uploaded_at DESC`;
                break;
            case 'date_oldest':
                orderClause = `ORDER BY a.uploaded_at ASC`;
                break;
            case 'price_low_high':
                orderClause = `ORDER BY a.cost ASC`;
                break;
            case 'price_high_low':
                orderClause = `ORDER BY a.cost DESC`;
                break;
            default:
                orderClause = `ORDER BY a.uploaded_at DESC`;
        }

        const [artworks] = await db.execute(`
            SELECT 
                a.unique_id,
                a.art_name,
                a.art_image,
                a.cost,
                a.art_category,
                a.uploaded_at,
                ar.full_name as artist_name
            FROM arts a
            LEFT JOIN artists ar ON a.artist_unique_id = ar.unique_id
            ${whereClause}
            ${orderClause}
        `, queryParams);

        res.json({ artworks });
    } catch (error) {
        console.error('Search and filter artworks error:', error);
        res.status(500).json({ error: 'Error searching artworks' });
    }
};

// Get unique categories for filter dropdown
const getArtCategories = async (req, res) => {
    try {
        const [categories] = await db.execute(`
            SELECT DISTINCT art_category 
            FROM arts 
            WHERE status = 'listed' 
            AND art_category IS NOT NULL 
            AND art_category != ''
            ORDER BY art_category ASC
        `);

        res.json({ categories: categories.map(cat => cat.art_category) });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Error fetching categories' });
    }
};

module.exports = {
    getGalleryArtworks,
    searchAndFilterArtworks,
    getArtCategories
};
