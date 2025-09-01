const { db } = require('./config/database');

async function addTestMessages() {
    try {
        // Test messages with different statuses
        const testMessages = [
            {
                full_name: 'Rajesh Sharma',
                email: 'rajesh.sharma@email.com',
                phone: '9841234567',
                subject: 'Inquiry about Traditional Paintings',
                message: 'Hello, I am interested in purchasing some traditional Nepali paintings for my home. Could you please provide more information about available artworks and pricing?',
                status: 'unread'
            },
            {
                full_name: 'Maya Poudel',
                email: 'maya.poudel@gmail.com',
                phone: '9851234567',
                subject: 'Commission Request',
                message: 'I would like to commission a custom artwork for my office. I am looking for something that represents the beauty of Nepal mountains. Please let me know if this is possible.',
                status: 'read'
            },
            {
                full_name: 'Arjun Thapa',
                email: 'arjun.thapa@yahoo.com',
                phone: '',
                subject: 'Gallery Exhibition Inquiry',
                message: 'I am organizing an art exhibition and would like to know if any of your artists would be interested in participating. The event is scheduled for next month.',
                status: 'archived'
            },
            {
                full_name: 'Sita Koirala',
                email: 'sita.koirala@email.com',
                phone: '9861234567',
                subject: 'Artwork Delivery Question',
                message: 'I recently ordered a painting and wanted to check on the delivery status. My order number is #ORD001. When can I expect the delivery?',
                status: 'unread'
            }
        ];

        for (const message of testMessages) {
            await db.execute(
                `INSERT INTO contact_messages (full_name, email, phone, subject, message, status) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [message.full_name, message.email, message.phone, message.subject, message.message, message.status]
            );
        }

        console.log('✅ Test messages added successfully!');
        
        // Verify the messages were added
        const [messages] = await db.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
        console.log(`📧 Total messages in database: ${messages.length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding test messages:', error);
        process.exit(1);
    }
}

addTestMessages();
