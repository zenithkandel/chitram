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

        // Get artist details using unique_id
        const [artistRows] = await connection.execute(
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
            profile_picture: artist.profile_picture ? `/uploads/profiles/${artist.profile_picture}` : '/images/default-artist.jpg',
            social_media: socialMedia
        };

        res.render('artist-profile', {
            title: `${formattedArtist.full_name} - Artist Profile`,
            artist: formattedArtist
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
