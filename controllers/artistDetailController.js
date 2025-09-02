const { db } = require('../config/database');
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
                city,
                district,
                age,
                started_art_since as experience_years,
                college_school,
                bio,
                profile_picture as profile_image,
                socials,
                arts_uploaded,
                arts_sold,
                status,
                joined_at as created_at,
                joined_at as updated_at
            FROM artists 
            WHERE unique_id = ? AND status = 'active'
        `;

        const [artistResults] = await db.execute(artistQuery, [artistId]);

        if (artistResults.length === 0) {
            return res.status(404).render('error', { 
                error: 'Artist not found or not approved',
                title: 'Artist Not Found - चित्रम्'
            });
        }

        const artist = artistResults[0];

        // Parse JSON fields safely
        try {
            // Since the database doesn't have portfolio_images and certificates columns,
            // we'll set them as empty arrays for now
            artist.portfolio_images = [];
            artist.certificates = [];
            
            // Parse socials if it exists
            if (artist.socials) {
                artist.socials_parsed = JSON.parse(artist.socials);
            } else {
                artist.socials_parsed = {};
            }
        } catch (parseError) {
            console.error('Error parsing JSON fields:', parseError);
            artist.portfolio_images = [];
            artist.certificates = [];
            artist.socials_parsed = {};
        }

        // Get artist's artworks
        const artworksQuery = `
            SELECT 
                unique_id as id,
                art_name as title,
                art_description as description,
                cost as price,
                art_category as category,
                art_image as image_url,
                status,
                uploaded_at as created_at
            FROM arts 
            WHERE artist_unique_id = ? AND status = 'listed'
            ORDER BY uploaded_at DESC
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
                AVG(cost) as average_price,
                MIN(cost) as min_price,
                MAX(cost) as max_price,
                COUNT(DISTINCT art_category) as categories_count
            FROM arts 
            WHERE artist_unique_id = ? AND status = 'listed'
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
