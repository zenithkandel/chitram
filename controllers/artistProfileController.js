const { db } = require('../config/database');
const path = require('path');
const fs = require('fs');

// Helper function to validate image paths
const getValidImagePath = (imageName, folder, fallback) => {
    if (!imageName) {
        return fallback;
    }
    
    const imagePath = path.join(__dirname, '..', 'uploads', folder, imageName);
    
    try {
        if (fs.existsSync(imagePath)) {
            return `/uploads/${folder}/${imageName}`;
        }
    } catch (error) {
        console.log(`Image validation error for ${imageName}:`, error.message);
    }
    
    return fallback;
};

const getArtistProfile = async (req, res) => {
    try {
        const artistId = req.params.id;
        
        if (!artistId) {
            return res.status(400).render('error', { 
                error: 'Artist ID is required',
                title: 'Error - Artist Not Found'
            });
        }

        // Get artist details using unique_id
        const [artistRows] = await db.execute(
            `SELECT 
                unique_id,
                full_name,
                started_art_since,
                college_school,
                district,
                socials,
                bio,
                profile_picture,
                status
            FROM artists 
            WHERE unique_id = ? AND status = 'active'`,
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
        const [artworkRows] = await db.execute(
            `SELECT 
                unique_id,
                art_name,
                art_category,
                cost,
                art_image,
                art_description,
                work_hours,
                size_of_art,
                color_type,
                status,
                uploaded_at
            FROM arts 
            WHERE artist_unique_id = ? AND status IN ('listed', 'ordered', 'sold')
            ORDER BY uploaded_at DESC`,
            [artistId]
        );

        // Calculate experience in field (current year - started year)
        let experienceYears = 0;
        if (artist.started_art_since) {
            const currentYear = new Date().getFullYear();
            const startedYear = parseInt(artist.started_art_since);
            if (!isNaN(startedYear) && startedYear > 0) {
                experienceYears = currentYear - startedYear;
            }
        }

        // Parse social media from JSON
        let socialMedia = {};
        if (artist.socials) {
            try {
                socialMedia = JSON.parse(artist.socials);
            } catch (error) {
                console.log('Error parsing social media JSON:', error);
                socialMedia = {};
            }
        }

        // Format the artist data
        const formattedArtist = {
            unique_id: artist.unique_id,
            full_name: artist.full_name || 'Unknown Artist',
            experience_years: experienceYears,
            college_school: artist.college_school || 'Not specified',
            district: artist.district || 'Not specified',
            bio: artist.bio || 'No biography available',
            profile_picture: getValidImagePath(artist.profile_picture, 'profiles', '/images/default-artist.jpg'),
            social_media: socialMedia
        };

        // Format the artworks data
        const formattedArtworks = artworkRows.map(artwork => ({
            unique_id: artwork.unique_id,
            art_name: artwork.art_name,
            art_category: artwork.art_category,
            cost: parseFloat(artwork.cost) || 0,
            formatted_cost: `₹${(parseFloat(artwork.cost) || 0).toLocaleString('en-IN')}`,
            art_image: getValidImagePath(artwork.art_image, 'artworks', '/images/placeholder-art.jpg'),
            art_description: artwork.art_description || 'No description available',
            work_hours: artwork.work_hours || 'Not specified',
            size_of_art: artwork.size_of_art || 'Not specified',
            color_type: artwork.color_type === 'black_and_white' ? 'Black & White' : 'Color',
            status: artwork.status,
            uploaded_at: artwork.uploaded_at
        }));

        res.render('artist-profile', {
            title: `${formattedArtist.full_name} - Artist Profile`,
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
