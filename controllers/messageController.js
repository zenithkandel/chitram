const { db } = require('../config/database');

// Get all messages
const getAllMessages = async (req, res) => {
    try {
        const [messages] = await db.execute(`
            SELECT 
                unique_id,
                full_name,
                email,
                phone,
                subject,
                message,
                status,
                created_at
            FROM contact_messages 
            ORDER BY created_at DESC
        `);

        res.render('admin/messages', { 
            messages,
            error: null,
            success: null 
        });
    } catch (error) {
        console.error('Messages fetch error:', error);
        res.render('admin/messages', { 
            messages: [],
            error: 'Error loading messages data',
            success: null 
        });
    }
};

// Get single message for viewing
const getMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const [message] = await db.execute(
            'SELECT * FROM contact_messages WHERE unique_id = ?',
            [id]
        );

        if (message.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json({ message: message[0] });
    } catch (error) {
        console.error('Get message error:', error);
        res.status(500).json({ error: 'Error fetching message data' });
    }
};

// Update message status
const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['unread', 'read', 'archived'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Check if message exists
        const [existingMessage] = await db.execute(
            'SELECT unique_id, subject, status FROM contact_messages WHERE unique_id = ?',
            [id]
        );

        if (existingMessage.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Update message status
        await db.execute(
            'UPDATE contact_messages SET status = ? WHERE unique_id = ?',
            [status, id]
        );

        res.json({ 
            success: `Message status updated to ${status}`,
            status: status 
        });
    } catch (error) {
        console.error('Update message status error:', error);
        res.status(500).json({ error: 'Error updating message status' });
    }
};

// Delete message
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if message exists
        const [existingMessage] = await db.execute(
            'SELECT unique_id, subject FROM contact_messages WHERE unique_id = ?',
            [id]
        );

        if (existingMessage.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Delete the message
        await db.execute(
            'DELETE FROM contact_messages WHERE unique_id = ?',
            [id]
        );

        res.json({ success: `Message "${existingMessage[0].subject}" has been deleted successfully` });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ error: 'Error deleting message' });
    }
};

module.exports = {
    getAllMessages,
    getMessage,
    updateMessageStatus,
    deleteMessage
};
