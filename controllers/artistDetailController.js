const db = require('../config/database');
const { formatDate } = require('../utils/dateFormatter');

// Get individual artist page
const getArtistDetail = async (req, res) => {
    try {
        const artistId = req.params.id;
        
        if (!artistId) {
            return res.status(400).render('error', { 
                error: 'Artist ID is required',
                title: 'Error - चित्रम्'
            });
        }

        // Get artist details
        const artistQuery = `
            SELECT 
                unique_id,
                full_name,
                email,
                phone,
                address,
                age,
                gender,
                experience_years,
                art_style,
                bio,
                profile_image,
                portfolio_images,
                certificates,
                status,
                created_at,
                updated_at
            FROM artists 
            WHERE unique_id = ? AND status = 'approved'
        `;

        const [artistResults] = await db.execute(artistQuery, [artistId]);

        if (artistResults.length === 0) {
            return res.status(404).render('error', { 
                error: 'Artist not found or not approved',
                title: 'Artist Not Found - चित्रम्'
            });
        }

        const artist = artistResults[0];

        // Parse JSON fields
        try {
            artist.portfolio_images = artist.portfolio_images ? JSON.parse(artist.portfolio_images) : [];
            artist.certificates = artist.certificates ? JSON.parse(artist.certificates) : [];
        } catch (parseError) {
            console.error('Error parsing JSON fields:', parseError);
            artist.portfolio_images = [];
            artist.certificates = [];
        }

        // Get artist's artworks
        const artworksQuery = `
            SELECT 
                id,
                title,
                description,
                price,
                category,
                image_url,
                status,
                created_at
            FROM arts 
            WHERE artist_id = ? AND status = 'approved'
            ORDER BY created_at DESC
        `;

        const [artworkResults] = await db.execute(artworksQuery, [artistId]);

        // Format dates
        artist.formatted_created_at = formatDate(artist.created_at);
        artist.formatted_updated_at = formatDate(artist.updated_at);

        artworkResults.forEach(artwork => {
            artwork.formatted_created_at = formatDate(artwork.created_at);
            artwork.formatted_price = parseFloat(artwork.price).toLocaleString();
        });

        // Get artist statistics
        const statsQuery = `
            SELECT 
                COUNT(*) as total_artworks,
                AVG(price) as average_price,
                MIN(price) as min_price,
                MAX(price) as max_price,
                COUNT(DISTINCT category) as categories_count
            FROM arts 
            WHERE artist_id = ? AND status = 'approved'
        `;

        const [statsResults] = await db.execute(statsQuery, [artistId]);
        const stats = statsResults[0] || {
            total_artworks: 0,
            average_price: 0,
            min_price: 0,
            max_price: 0,
            categories_count: 0
        };

        // Format stats
        stats.formatted_average_price = parseFloat(stats.average_price || 0).toLocaleString();
        stats.formatted_min_price = parseFloat(stats.min_price || 0).toLocaleString();
        stats.formatted_max_price = parseFloat(stats.max_price || 0).toLocaleString();

        res.render('artist-detail', {
            title: `${artist.full_name} - Artist Details - चित्रम्`,
            artist,
            artworks: artworkResults,
            stats
        });

    } catch (error) {
        console.error('Error getting artist details:', error);
        res.status(500).render('error', { 
            error: 'Error loading artist details. Please try again later.',
            title: 'Error - चित्रम्'
        });
    }
};

module.exports = {
    getArtistDetail
};
