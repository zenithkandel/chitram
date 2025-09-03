const { db } = require('../config/database');
const path = require('path');
const fs = require('fs');

// Get all applications (pending and under_review by default)
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
            WHERE status IN ('pending', 'under_review')
            ORDER BY received_date DESC
        `);

        res.render('admin/applications', { 
            applications,
            error: null,
            success: null,
            pageType: 'new'
        });
    } catch (error) {
        console.error('Applications fetch error:', error);
        res.render('admin/applications', { 
            applications: [],
            error: 'Error loading applications data',
            success: null,
            pageType: 'new'
        });
    }
};

// Get approved applications
const getApprovedApplications = async (req, res) => {
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
            WHERE status = 'approved'
            ORDER BY reviewed_date DESC
        `);

        res.render('admin/applications', { 
            applications,
            error: null,
            success: null,
            pageType: 'approved'
        });
    } catch (error) {
        console.error('Approved applications fetch error:', error);
        res.render('admin/applications', { 
            applications: [],
            error: 'Error loading approved applications data',
            success: null,
            pageType: 'approved'
        });
    }
};

// Get rejected applications
const getRejectedApplications = async (req, res) => {
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
            WHERE status = 'rejected'
            ORDER BY reviewed_date DESC
        `);

        res.render('admin/applications', { 
            applications,
            error: null,
            success: null,
            pageType: 'rejected'
        });
    } catch (error) {
        console.error('Rejected applications fetch error:', error);
        res.render('admin/applications', { 
            applications: [],
            error: 'Error loading rejected applications data',
            success: null,
            pageType: 'rejected'
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
            'SELECT * FROM artist_applications WHERE unique_id = ?',
            [id]
        );

        if (existingApplication.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const application = existingApplication[0];

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
            try {
                // Check if artist with this email already exists
                const [existingArtist] = await db.execute(
                    'SELECT email FROM artists WHERE email = ?',
                    [application.email]
                );

                if (existingArtist.length === 0) {
                    // Handle profile picture - copy from applications folder to artists folder
                    let artistProfilePicture = null;
                    if (application.profile_picture) {
                        const oldPath = path.join(__dirname, '..', 'uploads', 'applications', application.profile_picture);
                        const newFileName = 'artist-' + Date.now() + '-' + application.profile_picture;
                        const newPath = path.join(__dirname, '..', 'uploads', 'profiles', newFileName);
                        
                        // Create artists profiles directory if it doesn't exist
                        const profilesDir = path.join(__dirname, '..', 'uploads', 'profiles');
                        if (!fs.existsSync(profilesDir)) {
                            fs.mkdirSync(profilesDir, { recursive: true });
                        }

                        // Copy file if it exists
                        if (fs.existsSync(oldPath)) {
                            fs.copyFileSync(oldPath, newPath);
                            artistProfilePicture = newFileName;
                        }
                    }

                    // Create artist record
                    await db.execute(`
                        INSERT INTO artists (
                            full_name, age, started_art_since, college_school, 
                            city, district, email, phone, socials, 
                            profile_picture, bio, status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
                    `, [
                        application.full_name, 
                        application.age, 
                        application.started_art_at, 
                        application.school_college,
                        application.city, 
                        application.district, 
                        application.email, 
                        application.phone, 
                        application.socials,
                        artistProfilePicture, 
                        application.bio
                    ]);

                    console.log(`✅ Artist record created for: ${application.full_name}`);
                }
            } catch (artistError) {
                console.error('Error creating artist record:', artistError);
                // Don't fail the status update if artist creation fails
            }
        }

        res.json({ 
            success: `Application ${status === 'approved' ? 'approved and artist account created' : status}`,
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
            city, district, email, phone, message, bio, socials
        } = req.body;

        // Validate required fields
        if (!full_name || !age || !city || !district || !email) {
            return res.status(400).json({ error: 'Please fill in all required fields' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }

        // Check if email already exists
        const [existingApp] = await db.execute(
            'SELECT email FROM artist_applications WHERE email = ?',
            [email]
        );

        if (existingApp.length > 0) {
            return res.status(400).json({ error: 'An application with this email already exists' });
        }

        // Prepare socials JSON - handle both string and object inputs
        let socialsData = null;
        if (socials) {
            try {
                // If it's already a string (JSON), parse it to validate
                if (typeof socials === 'string') {
                    socialsData = JSON.parse(socials);
                } else {
                    socialsData = socials;
                }
            } catch (error) {
                // If JSON parsing fails, treat as empty object
                socialsData = {};
            }
        }

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
            city, district, email, phone, socialsData ? JSON.stringify(socialsData) : null,
            message, profilePicture, bio
        ]);

        res.json({ success: true, message: 'Application submitted successfully! We will review your application and get back to you soon.' });
    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({ error: 'Error submitting application. Please try again.' });
    }
};

module.exports = {
    getAllApplications,
    getApprovedApplications,
    getRejectedApplications,
    getApplication,
    updateApplicationStatus,
    deleteApplication,
    submitApplication
};
