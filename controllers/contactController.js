const { db } = require('../config/database');

// Handle contact form submission
const submitContactForm = async (req, res) => {
    try {
        const { full_name, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!full_name || !email || !subject || !message) {
            return res.status(400).json({ 
                error: 'Full name, email, subject, and message are required' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Please enter a valid email address' 
            });
        }

        // Insert contact message into database
        await db.execute(`
            INSERT INTO contact_messages (full_name, email, phone, subject, message, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'unread', NOW())
        `, [full_name, email, phone || null, subject, message]);

        res.json({ 
            success: true,
            message: 'Thank you for your message! We will get back to you within 48 hours.' 
        });

    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({ 
            error: 'Sorry, there was an error sending your message. Please try again.' 
        });
    }
};

module.exports = {
    submitContactForm
};
