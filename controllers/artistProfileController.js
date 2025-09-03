const connection = require('../config/database');

const getArtistProfile = async (req, res) => {
    try {
        const artistId = req.params.id;
        
        if (!artistId) {
            return res.status(400).render('error', { 
                error: 'Artist ID is required',
                title: 'Error - Artist Not Found'
            });
        }

        // Get artist details
        const [artistRows] = await connection.execute(
            `SELECT 
                id,
                name,
                email,
                phone,
                bio,
                specialty,
                experience_years,
                education,
                awards,
                exhibition_history,
                artistic_style,
                profile_image,
                status,
                created_at
            FROM artists 
            WHERE id = ? AND status = 'active'`,
            [artistId]
        );

        if (artistRows.length === 0) {
            return res.status(404).render('error', { 
                error: 'Artist not found or inactive',
                title: 'Error - Artist Not Found'
            });
        }

        const artist = artistRows[0];

        // Get artist's artworks
        const [artworkRows] = await connection.execute(
            `SELECT 
                id,
                title,
                description,
                price,
                category,
                medium,
                dimensions,
                image_url,
                status,
                created_at
            FROM arts 
            WHERE artist_id = ? AND status = 'available'
            ORDER BY created_at DESC`,
            [artistId]
        );

        // Format the data
        const formattedArtist = {
            ...artist,
            profile_image: artist.profile_image || '/images/default-artist.jpg',
            bio: artist.bio || 'No biography available',
            specialty: artist.specialty || 'General Art',
            experience_years: artist.experience_years || 0,
            education: artist.education || 'Not specified',
            awards: artist.awards || 'None listed',
            exhibition_history: artist.exhibition_history || 'No exhibitions listed',
            artistic_style: artist.artistic_style || 'Contemporary'
        };

        const formattedArtworks = artworkRows.map(artwork => ({
            ...artwork,
            image_url: artwork.image_url || '/images/placeholder-art.jpg',
            price: parseFloat(artwork.price) || 0,
            formatted_price: (parseFloat(artwork.price) || 0).toLocaleString('en-IN'),
            description: artwork.description || 'No description available'
        }));

        res.render('artist-profile', {
            title: `${formattedArtist.name} - Artist Profile`,
            artist: formattedArtist,
            artworks: formattedArtworks,
            artworkCount: formattedArtworks.length
        });

    } catch (error) {
        console.error('Error fetching artist profile:', error);
        res.status(500).render('error', { 
            error: 'Error loading artist profile',
            title: 'Error - Server Error'
        });
    }
};

module.exports = {
    getArtistProfile
};
