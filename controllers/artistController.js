const { db } = require('../config/database');
const path = require('path');
const fs = require('fs');

// Get all artists (excluding deleted ones)
const getAllArtists = async (req, res) => {
    try {
        const [artists] = await db.execute(`
            SELECT 
                unique_id,
                full_name,
                age,
                started_art_since,
                college_school,
                city,
                district,
                email,
                phone,
                socials,
                arts_uploaded,
                arts_sold,
                bio,
                profile_picture,
                joined_at,
                status
            FROM artists 
            WHERE status != 'deleted' 
            ORDER BY joined_at DESC
        `);

        res.render('admin/artists', { 
            artists,
            error: null,
            success: null 
        });
    } catch (error) {
        console.error('Artists fetch error:', error);
        res.render('admin/artists', { 
            artists: [],
            error: 'Error loading artists data',
            success: null 
        });
    }
};

// Get single artist for editing
const getArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const [artist] = await db.execute(
            'SELECT * FROM artists WHERE unique_id = ? AND status != "deleted"',
            [id]
        );

        if (artist.length === 0) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        res.json({ artist: artist[0] });
    } catch (error) {
        console.error('Get artist error:', error);
        res.status(500).json({ error: 'Error fetching artist data' });
    }
};

// Update artist
const updateArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            full_name,
            age,
            started_art_since,
            college_school,
            city,
            district,
            email,
            phone,
            socials,
            bio,
            status
        } = req.body;

        // Validate required fields
        if (!full_name || !email || !age) {
            return res.status(400).json({ error: 'Full name, email, and age are required' });
        }

        // Check if artist exists and get current profile picture
        const [existingArtist] = await db.execute(
            'SELECT unique_id, profile_picture FROM artists WHERE unique_id = ? AND status != "deleted"',
            [id]
        );

        if (existingArtist.length === 0) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        // Check if email is already taken by another artist
        const [emailCheck] = await db.execute(
            'SELECT unique_id FROM artists WHERE email = ? AND unique_id != ? AND status != "deleted"',
            [email, id]
        );

        if (emailCheck.length > 0) {
            return res.status(400).json({ error: 'Email already exists for another artist' });
        }

        // Handle profile picture upload
        let profile_picture = existingArtist[0].profile_picture; // Keep existing if no new upload
        if (req.file) {
            profile_picture = req.file.filename;
            
            // Delete old profile picture if it exists
            if (existingArtist[0].profile_picture) {
                const oldImagePath = path.join(__dirname, '../uploads/profiles', existingArtist[0].profile_picture);
                if (fs.existsSync(oldImagePath)) {
                    try {
                        fs.unlinkSync(oldImagePath);
                    } catch (err) {
                        console.log('Could not delete old profile picture:', err);
                    }
                }
            }
        }

        // Update artist
        await db.execute(`
            UPDATE artists SET 
                full_name = ?,
                age = ?,
                started_art_since = ?,
                college_school = ?,
                city = ?,
                district = ?,
                email = ?,
                phone = ?,
                socials = ?,
                bio = ?,
                status = ?,
                profile_picture = ?
            WHERE unique_id = ?
        `, [
            full_name,
            age,
            started_art_since,
            college_school,
            city,
            district,
            email,
            phone,
            socials,
            bio,
            status,
            profile_picture,
            id
        ]);

        res.json({ 
            success: 'Artist updated successfully',
            profile_picture: profile_picture 
        });
    } catch (error) {
        console.error('Update artist error:', error);
        res.status(500).json({ error: 'Error updating artist' });
    }
};

// Create new artist
const createArtist = async (req, res) => {
    try {
        const {
            full_name,
            age,
            started_art_since,
            college_school,
            city,
            district,
            email,
            phone,
            socials,
            bio,
            status
        } = req.body;

        // Validate required fields
        if (!full_name || !email || !age) {
            return res.status(400).json({ error: 'Full name, email, and age are required' });
        }

        // Check if email already exists
        const [emailCheck] = await db.execute(
            'SELECT email FROM artists WHERE email = ? AND status != "deleted"',
            [email]
        );

        if (emailCheck.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Generate unique ID
        const unique_id = 'ART' + Date.now() + Math.floor(Math.random() * 1000);

        // Handle profile picture upload
        let profile_picture = null;
        if (req.file) {
            profile_picture = req.file.filename;
        }

        // Insert new artist
        await db.execute(`
            INSERT INTO artists (
                unique_id,
                full_name,
                age,
                started_art_since,
                college_school,
                city,
                district,
                email,
                phone,
                socials,
                bio,
                status,
                profile_picture,
                arts_uploaded,
                arts_sold,
                joined_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NOW())
        `, [
            unique_id,
            full_name,
            age,
            started_art_since,
            college_school,
            city,
            district,
            email,
            phone,
            socials,
            bio,
            status || 'active',
            profile_picture
        ]);

        res.json({ 
            success: 'Artist created successfully',
            artist_id: unique_id,
            profile_picture: profile_picture 
        });
    } catch (error) {
        console.error('Create artist error:', error);
        res.status(500).json({ error: 'Error creating artist' });
    }
};

// Soft delete artist
const deleteArtist = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if artist exists
        const [existingArtist] = await db.execute(
            'SELECT unique_id, full_name FROM artists WHERE unique_id = ? AND status != "deleted"',
            [id]
        );

        if (existingArtist.length === 0) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        // Soft delete the artist
        await db.execute(
            'UPDATE artists SET status = "deleted" WHERE unique_id = ?',
            [id]
        );

        res.json({ success: `Artist ${existingArtist[0].full_name} has been deleted successfully` });
    } catch (error) {
        console.error('Delete artist error:', error);
        res.status(500).json({ error: 'Error deleting artist' });
    }
};

module.exports = {
    getAllArtists,
    getArtist,
    createArtist,
    updateArtist,
    deleteArtist
};
