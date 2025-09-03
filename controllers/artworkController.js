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

// Search and filter artworks for admin (includes all statuses)
const searchAndFilterAdminArtworks = async (req, res) => {
    try {
        const { q, sortBy, category, status } = req.query;
        
        let whereClause = `WHERE a.status != 'deleted'`;
        let orderClause = `ORDER BY a.uploaded_at DESC`;
        let queryParams = [];

        // Add search functionality
        if (q && q.trim() !== '') {
            const searchTerm = `%${q.trim()}%`;
            whereClause += ` AND (a.art_name LIKE ? OR ar.full_name LIKE ? OR a.art_category LIKE ? OR a.art_description LIKE ?)`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Add category filter
        if (category && category !== 'all') {
            whereClause += ` AND a.art_category = ?`;
            queryParams.push(category);
        }

        // Add status filter (admin specific)
        if (status && status !== 'all') {
            whereClause += ` AND a.status = ?`;
            queryParams.push(status);
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
            case 'name_a_z':
                orderClause = `ORDER BY a.art_name ASC`;
                break;
            case 'name_z_a':
                orderClause = `ORDER BY a.art_name DESC`;
                break;
            default:
                orderClause = `ORDER BY a.uploaded_at DESC`;
        }

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
            ${whereClause}
            ${orderClause}
        `, queryParams);

        res.json({ artworks });
    } catch (error) {
        console.error('Admin search and filter artworks error:', error);
        res.status(500).json({ error: 'Error searching artworks' });
    }
};

// Get unique categories for admin filter dropdown
const getAdminArtCategories = async (req, res) => {
    try {
        const [categories] = await db.execute(`
            SELECT DISTINCT art_category 
            FROM arts 
            WHERE status != 'deleted' 
            AND art_category IS NOT NULL 
            AND art_category != ''
            ORDER BY art_category ASC
        `);

        res.json({ categories: categories.map(cat => cat.art_category) });
    } catch (error) {
        console.error('Get admin categories error:', error);
        res.status(500).json({ error: 'Error fetching categories' });
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

// Get artwork details for public view
const getArtworkDetails = async (req, res) => {
    try {
        const artworkId = req.params.id;
        
        if (!artworkId) {
            return res.status(400).render('error', { 
                error: 'Artwork ID is required',
                title: 'Error - Artwork Not Found'
            });
        }

        // Fetch artwork details with artist information
        const [artworkRows] = await db.execute(`
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
                ar.unique_id as artist_unique_id,
                ar.full_name as artist_name,
                ar.profile_picture as artist_profile_picture
            FROM arts a
            LEFT JOIN artists ar ON a.artist_unique_id = ar.unique_id
            WHERE a.unique_id = ? AND a.status IN ('listed', 'ordered', 'sold')
        `, [artworkId]);

        if (artworkRows.length === 0) {
            return res.status(404).render('error', { 
                error: 'Artwork not found or not available',
                title: 'Error - Artwork Not Found'
            });
        }

        const artwork = artworkRows[0];

        // Helper function to get valid image path
        const getValidImagePath = (imageName, folder, fallback) => {
            if (!imageName) return fallback;
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

        // Helper function to get relative time
        const getRelativeTime = (date) => {
            const now = new Date();
            const uploadDate = new Date(date);
            const diffInSeconds = Math.floor((now - uploadDate) / 1000);

            if (diffInSeconds < 60) {
                return diffInSeconds <= 1 ? '1 second ago' : `${diffInSeconds} seconds ago`;
            }

            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) {
                return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
            }

            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) {
                return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
            }

            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 30) {
                return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
            }

            const diffInMonths = Math.floor(diffInDays / 30);
            if (diffInMonths < 12) {
                return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
            }

            const diffInYears = Math.floor(diffInMonths / 12);
            return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
        };

        // Format the artwork data
        const formattedArtwork = {
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
            uploaded_at: artwork.uploaded_at,
            relative_time: getRelativeTime(artwork.uploaded_at),
            artist: {
                unique_id: artwork.artist_unique_id,
                name: artwork.artist_name || 'Unknown Artist',
                profile_picture: getValidImagePath(artwork.artist_profile_picture, 'profiles', '/images/default-artist.jpg')
            }
        };
        
        res.render('artwork-details', {
            title: `${formattedArtwork.art_name} - चित्रम्`,
            artwork: formattedArtwork
        });

    } catch (error) {
        console.error('Error fetching artwork details:', error);
        res.status(500).render('error', { 
            error: 'Error loading artwork details',
            title: 'Error - Server Error'
        });
    }
};

module.exports = {
    getAllArtworks,
    searchAndFilterAdminArtworks,
    getAdminArtCategories,
    getArtwork,
    createArtwork,
    updateArtwork,
    deleteArtwork,
    getAllArtistsForDropdown,
    getArtworkDetails
};
