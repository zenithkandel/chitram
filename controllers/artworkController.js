const { db } = require('../config/database');
const path = require('path');
const fs = require('fs');

// Get all artworks with artist information
const getAllArtworks = async (req, res) => {
    try {
        const [artworks] = await db.execute(`
            SELECT 
                a.unique_id,
                a.art_name,
                a.art_category,
                a.cost,
                a.art_image,
                a.art_description,
                a.work_hours,
                a.size_of_art,
                a.color_type,
                a.status,
                a.uploaded_at,
                ar.full_name as artist_name,
                ar.unique_id as artist_unique_id
            FROM arts a
            LEFT JOIN artists ar ON a.artist_unique_id = ar.unique_id
            WHERE a.status != 'deleted' 
            ORDER BY a.uploaded_at DESC
        `);

        res.render('admin/artworks', { 
            artworks,
            error: null,
            success: null 
        });
    } catch (error) {
        console.error('Artworks fetch error:', error);
        res.render('admin/artworks', { 
            artworks: [],
            error: 'Error loading artworks data',
            success: null 
        });
    }
};

// Get single artwork for editing
const getArtwork = async (req, res) => {
    try {
        const { id } = req.params;
        const [artwork] = await db.execute(`
            SELECT 
                a.*,
                ar.full_name as artist_name
            FROM arts a
            LEFT JOIN artists ar ON a.artist_unique_id = ar.unique_id
            WHERE a.unique_id = ? AND a.status != 'deleted'
        `, [id]);

        if (artwork.length === 0) {
            return res.status(404).json({ error: 'Artwork not found' });
        }

        res.json({ artwork: artwork[0] });
    } catch (error) {
        console.error('Get artwork error:', error);
        res.status(500).json({ error: 'Error fetching artwork data' });
    }
};

// Create new artwork
const createArtwork = async (req, res) => {
    try {
        const {
            art_name,
            artist_unique_id,
            art_category,
            cost,
            art_description,
            work_hours,
            size_of_art,
            color_type,
            status
        } = req.body;

        // Validate required fields
        if (!art_name || !artist_unique_id || !art_category || !cost) {
            return res.status(400).json({ error: 'Art name, artist, category, and cost are required' });
        }

        // Validate artist exists
        const [artistCheck] = await db.execute(
            'SELECT unique_id FROM artists WHERE unique_id = ? AND status != "deleted"',
            [artist_unique_id]
        );

        if (artistCheck.length === 0) {
            return res.status(400).json({ error: 'Selected artist not found' });
        }

        // Handle art image upload
        let art_image = null;
        if (req.file) {
            art_image = req.file.filename;
        } else {
            return res.status(400).json({ error: 'Art image is required' });
        }

        // Insert new artwork
        const [result] = await db.execute(`
            INSERT INTO arts (
                art_name,
                artist_unique_id,
                art_category,
                cost,
                art_image,
                art_description,
                work_hours,
                size_of_art,
                color_type,
                status,
                uploaded_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            art_name,
            artist_unique_id,
            art_category,
            cost,
            art_image,
            art_description,
            work_hours,
            size_of_art,
            color_type,
            status || 'listed'
        ]);

        // Update artist's arts_uploaded count
        await db.execute(`
            UPDATE artists 
            SET arts_uploaded = arts_uploaded + 1 
            WHERE unique_id = ?
        `, [artist_unique_id]);

        res.json({ 
            success: 'Artwork created successfully',
            artwork_id: result.insertId,
            art_image: art_image 
        });
    } catch (error) {
        console.error('Create artwork error:', error);
        res.status(500).json({ error: 'Error creating artwork' });
    }
};

// Update artwork
const updateArtwork = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            art_name,
            artist_unique_id,
            art_category,
            cost,
            art_description,
            work_hours,
            size_of_art,
            color_type,
            status
        } = req.body;

        // Validate required fields
        if (!art_name || !artist_unique_id || !art_category || !cost) {
            return res.status(400).json({ error: 'Art name, artist, category, and cost are required' });
        }

        // Check if artwork exists and get current art image
        const [existingArtwork] = await db.execute(
            'SELECT unique_id, art_image, artist_unique_id FROM arts WHERE unique_id = ? AND status != "deleted"',
            [id]
        );

        if (existingArtwork.length === 0) {
            return res.status(404).json({ error: 'Artwork not found' });
        }

        // Validate artist exists
        const [artistCheck] = await db.execute(
            'SELECT unique_id FROM artists WHERE unique_id = ? AND status != "deleted"',
            [artist_unique_id]
        );

        if (artistCheck.length === 0) {
            return res.status(400).json({ error: 'Selected artist not found' });
        }

        // Handle art image upload
        let art_image = existingArtwork[0].art_image; // Keep existing if no new upload
        if (req.file) {
            art_image = req.file.filename;
            
            // Delete old art image if it exists
            if (existingArtwork[0].art_image) {
                const oldImagePath = path.join(__dirname, '../uploads/artworks', existingArtwork[0].art_image);
                if (fs.existsSync(oldImagePath)) {
                    try {
                        fs.unlinkSync(oldImagePath);
                    } catch (err) {
                        console.log('Could not delete old art image:', err);
                    }
                }
            }
        }

        // Update artwork
        await db.execute(`
            UPDATE arts SET 
                art_name = ?,
                artist_unique_id = ?,
                art_category = ?,
                cost = ?,
                art_image = ?,
                art_description = ?,
                work_hours = ?,
                size_of_art = ?,
                color_type = ?,
                status = ?
            WHERE unique_id = ?
        `, [
            art_name,
            artist_unique_id,
            art_category,
            cost,
            art_image,
            art_description,
            work_hours,
            size_of_art,
            color_type,
            status,
            id
        ]);

        // Update artist counts if artist changed
        if (existingArtwork[0].artist_unique_id !== parseInt(artist_unique_id)) {
            // Decrease count for old artist
            await db.execute(`
                UPDATE artists 
                SET arts_uploaded = GREATEST(arts_uploaded - 1, 0) 
                WHERE unique_id = ?
            `, [existingArtwork[0].artist_unique_id]);

            // Increase count for new artist
            await db.execute(`
                UPDATE artists 
                SET arts_uploaded = arts_uploaded + 1 
                WHERE unique_id = ?
            `, [artist_unique_id]);
        }

        res.json({ 
            success: 'Artwork updated successfully',
            art_image: art_image 
        });
    } catch (error) {
        console.error('Update artwork error:', error);
        res.status(500).json({ error: 'Error updating artwork' });
    }
};

// Soft delete artwork
const deleteArtwork = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if artwork exists
        const [existingArtwork] = await db.execute(
            'SELECT unique_id, art_name, artist_unique_id FROM arts WHERE unique_id = ? AND status != "deleted"',
            [id]
        );

        if (existingArtwork.length === 0) {
            return res.status(404).json({ error: 'Artwork not found' });
        }

        // Soft delete the artwork
        await db.execute(
            'UPDATE arts SET status = "deleted" WHERE unique_id = ?',
            [id]
        );

        // Decrease artist's arts_uploaded count
        await db.execute(`
            UPDATE artists 
            SET arts_uploaded = GREATEST(arts_uploaded - 1, 0) 
            WHERE unique_id = ?
        `, [existingArtwork[0].artist_unique_id]);

        res.json({ success: `Artwork "${existingArtwork[0].art_name}" has been deleted successfully` });
    } catch (error) {
        console.error('Delete artwork error:', error);
        res.status(500).json({ error: 'Error deleting artwork' });
    }
};

// Get all artists for dropdown
const getAllArtistsForDropdown = async (req, res) => {
    try {
        const [artists] = await db.execute(`
            SELECT unique_id, full_name 
            FROM artists 
            WHERE status = 'active' 
            ORDER BY full_name ASC
        `);

        res.json({ artists });
    } catch (error) {
        console.error('Get artists dropdown error:', error);
        res.status(500).json({ error: 'Error fetching artists' });
    }
};

module.exports = {
    getAllArtworks,
    getArtwork,
    createArtwork,
    updateArtwork,
    deleteArtwork,
    getAllArtistsForDropdown
};
