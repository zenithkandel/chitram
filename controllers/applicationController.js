const { db } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './public/uploads/applications/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'profile_picture') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Profile picture must be an image file'));
            }
        } else {
            cb(new Error('Unexpected field'));
        }
    }
});

// Get all applications
const getAllApplications = async (req, res) => {
    try {
        const [applications] = await db.execute(`
            SELECT 
                unique_id,
                full_name,
                age,
                started_art_at,
                school_college,
                city,
                district,
                email,
                phone,
                socials,
                message,
                profile_picture,
                bio,
                received_date,
                status,
                reviewed_by,
                reviewed_date,
                rejection_reason,
                created_at
            FROM artist_applications 
            ORDER BY received_date DESC
        `);

        res.render('admin/applications', { 
            applications,
            error: null,
            success: null 
        });
    } catch (error) {
        console.error('Applications fetch error:', error);
        res.render('admin/applications', { 
            applications: [],
            error: 'Error loading applications data',
            success: null 
        });
    }
};

// Get single application for viewing
const getApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const [application] = await db.execute(
            'SELECT * FROM artist_applications WHERE unique_id = ?',
            [id]
        );

        if (application.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Parse socials JSON if it exists
        if (application[0].socials) {
            try {
                application[0].socials = JSON.parse(application[0].socials);
            } catch (e) {
                application[0].socials = {};
            }
        }

        res.json({ application: application[0] });
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({ error: 'Error fetching application data' });
    }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        // Validate status
        const validStatuses = ['pending', 'under_review', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Check if application exists
        const [existingApplication] = await db.execute(
            'SELECT unique_id, full_name, email, status FROM artist_applications WHERE unique_id = ?',
            [id]
        );

        if (existingApplication.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Prepare update data
        let updateQuery = 'UPDATE artist_applications SET status = ?, reviewed_by = ?, reviewed_date = NOW()';
        let updateParams = [status, 'admin']; // You can get actual admin name from session

        // Add rejection reason if status is rejected
        if (status === 'rejected' && rejectionReason) {
            updateQuery += ', rejection_reason = ?';
            updateParams.push(rejectionReason);
        }

        updateQuery += ' WHERE unique_id = ?';
        updateParams.push(id);

        // Update application status
        await db.execute(updateQuery, updateParams);

        // If approved, create artist record
        if (status === 'approved') {
            const application = existingApplication[0];
            
            // Get application details for creating artist record
            const [fullApplication] = await db.execute(
                'SELECT * FROM artist_applications WHERE unique_id = ?',
                [id]
            );
            
            if (fullApplication.length > 0) {
                const app = fullApplication[0];
                
                // Create artist record
                await db.execute(`
                    INSERT INTO artists (
                        full_name, age, started_art_at, school_college, 
                        city, district, email, phone, socials, 
                        profile_picture, bio, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
                `, [
                    app.full_name, app.age, app.started_art_at, app.school_college,
                    app.city, app.district, app.email, app.phone, app.socials,
                    app.profile_picture, app.bio
                ]);
            }
        }

        res.json({ 
            success: `Application status updated to ${status}`,
            status: status 
        });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ error: 'Error updating application status' });
    }
};

// Delete application
const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if application exists and get profile picture path
        const [existingApplication] = await db.execute(
            'SELECT unique_id, full_name, profile_picture FROM artist_applications WHERE unique_id = ?',
            [id]
        );

        if (existingApplication.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Delete profile picture file if it exists
        if (existingApplication[0].profile_picture) {
            const filePath = path.join(__dirname, '..', 'public', 'uploads', 'applications', existingApplication[0].profile_picture);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete the application
        await db.execute(
            'DELETE FROM artist_applications WHERE unique_id = ?',
            [id]
        );

        res.json({ success: `Application from "${existingApplication[0].full_name}" has been deleted successfully` });
    } catch (error) {
        console.error('Delete application error:', error);
        res.status(500).json({ error: 'Error deleting application' });
    }
};

// Public application submission
const submitApplication = async (req, res) => {
    try {
        const {
            full_name, age, started_art_at, school_college,
            city, district, email, phone, message, bio,
            instagram, facebook, twitter, tiktok, youtube
        } = req.body;

        // Validate required fields
        if (!full_name || !age || !city || !district || !email) {
            return res.status(400).json({ error: 'Please fill in all required fields' });
        }

        // Check if email already exists
        const [existingApp] = await db.execute(
            'SELECT email FROM artist_applications WHERE email = ?',
            [email]
        );

        if (existingApp.length > 0) {
            return res.status(400).json({ error: 'An application with this email already exists' });
        }

        // Prepare socials JSON
        const socials = {
            instagram: instagram || '',
            facebook: facebook || '',
            twitter: twitter || '',
            tiktok: tiktok || '',
            youtube: youtube || ''
        };

        // Get profile picture filename if uploaded
        const profilePicture = req.file ? req.file.filename : null;

        // Insert application
        await db.execute(`
            INSERT INTO artist_applications (
                full_name, age, started_art_at, school_college,
                city, district, email, phone, socials,
                message, profile_picture, bio
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            full_name, parseInt(age), started_art_at, school_college,
            city, district, email, phone, JSON.stringify(socials),
            message, profilePicture, bio
        ]);

        res.json({ success: 'Application submitted successfully! We will review your application and get back to you soon.' });
    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({ error: 'Error submitting application. Please try again.' });
    }
};

module.exports = {
    getAllApplications,
    getApplication,
    updateApplicationStatus,
    deleteApplication,
    submitApplication,
    upload
};
