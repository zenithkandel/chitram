const { db } = require('./config/database');

async function createApplicationsTable() {
    try {
        // Create artist_applications table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS artist_applications (
                unique_id INT PRIMARY KEY AUTO_INCREMENT,
                full_name VARCHAR(100) NOT NULL,
                age INT NOT NULL,
                started_art_at VARCHAR(50),
                school_college VARCHAR(200),
                city VARCHAR(100) NOT NULL,
                district VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                phone VARCHAR(20),
                socials JSON,
                message TEXT,
                profile_picture VARCHAR(255),
                bio TEXT,
                received_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
                reviewed_by VARCHAR(100),
                reviewed_date TIMESTAMP NULL,
                rejection_reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create indexes
        await db.execute('CREATE INDEX IF NOT EXISTS idx_applications_status ON artist_applications(status)');
        await db.execute('CREATE INDEX IF NOT EXISTS idx_applications_received_date ON artist_applications(received_date)');

        console.log('✅ Artist applications table created successfully!');
        
        // Add some test applications
        const testApplications = [
            {
                full_name: 'Anisha Maharjan',
                age: 22,
                started_art_at: 'Age 10',
                school_college: 'Kathmandu University',
                city: 'Lalitpur',
                district: 'Lalitpur',
                email: 'anisha.maharjan@email.com',
                phone: '9841234567',
                socials: JSON.stringify({
                    instagram: 'https://instagram.com/anisha_art',
                    facebook: 'https://facebook.com/anisha.maharjan',
                    twitter: '',
                    tiktok: '',
                    youtube: ''
                }),
                message: 'I am passionate about traditional Nepali art and would love to showcase my work on your platform. I specialize in Paubha paintings and contemporary fusion art.',
                bio: 'I am a fine arts graduate from Kathmandu University with specialization in traditional and contemporary art forms.',
                status: 'pending'
            },
            {
                full_name: 'Bikash Shrestha',
                age: 28,
                started_art_at: 'Age 15',
                school_college: 'Lalit Kala Campus',
                city: 'Kathmandu',
                district: 'Kathmandu',
                email: 'bikash.shrestha@gmail.com',
                phone: '9851234567',
                socials: JSON.stringify({
                    instagram: 'https://instagram.com/bikash_artist',
                    facebook: '',
                    twitter: '',
                    tiktok: 'https://tiktok.com/@bikash_art',
                    youtube: 'https://youtube.com/@bikashart'
                }),
                message: 'I create digital art and illustrations inspired by Nepali culture and traditions. I believe art can bridge the gap between tradition and modernity.',
                bio: 'Digital artist and illustrator with 8+ years of experience. I love creating art that tells stories about our beautiful country.',
                status: 'under_review'
            },
            {
                full_name: 'Sunita Tamang',
                age: 25,
                started_art_at: 'Age 8',
                school_college: 'NAFA (Nepal Academy of Fine Arts)',
                city: 'Pokhara',
                district: 'Kaski',
                email: 'sunita.tamang@yahoo.com',
                phone: '9861234567',
                socials: JSON.stringify({
                    instagram: 'https://instagram.com/sunita_paints',
                    facebook: 'https://facebook.com/sunita.tamang.artist',
                    twitter: '',
                    tiktok: '',
                    youtube: ''
                }),
                message: 'I am a landscape painter who captures the beauty of Nepal\'s mountains and nature. I would be honored to be part of your platform.',
                bio: 'Landscape painter passionate about capturing the natural beauty of Nepal. My work focuses on the majestic Himalayas and rural life.',
                status: 'approved'
            }
        ];

        for (const app of testApplications) {
            await db.execute(`
                INSERT INTO artist_applications (
                    full_name, age, started_art_at, school_college,
                    city, district, email, phone, socials,
                    message, bio, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                app.full_name, app.age, app.started_art_at, app.school_college,
                app.city, app.district, app.email, app.phone, app.socials,
                app.message, app.bio, app.status
            ]);
        }

        console.log('✅ Test applications added successfully!');
        
        // Verify the applications were added
        const [applications] = await db.execute('SELECT * FROM artist_applications ORDER BY received_date DESC');
        console.log(`📝 Total applications in database: ${applications.length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating applications table:', error);
        process.exit(1);
    }
}

createApplicationsTable();
