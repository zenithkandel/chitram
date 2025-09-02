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

module.exports = {
    getGalleryArtworks
};
