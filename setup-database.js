const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const setupDatabase = async () => {
    let connection;
    
    try {
        console.log('🔧 Setting up चित्रम् database...');
        
        // Connect to MySQL without database first
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        // Create database first
        await connection.query('CREATE DATABASE IF NOT EXISTS chitram_db');
        
        // Switch to the database
        await connection.query('USE chitram_db');

        // Create tables individually
        const createQueries = [
            `CREATE TABLE IF NOT EXISTS admin (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                last_login DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS artists (
                unique_id INT PRIMARY KEY AUTO_INCREMENT,
                full_name VARCHAR(100) NOT NULL,
                age INT NOT NULL,
                started_art_since VARCHAR(50),
                college_school VARCHAR(150),
                city VARCHAR(50),
                district VARCHAR(50),
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                socials TEXT,
                arts_uploaded INT DEFAULT 0,
                arts_sold INT DEFAULT 0,
                bio TEXT,
                profile_picture VARCHAR(255),
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS arts (
                unique_id INT PRIMARY KEY AUTO_INCREMENT,
                art_name VARCHAR(150) NOT NULL,
                artist_unique_id INT NOT NULL,
                art_category VARCHAR(50) NOT NULL,
                cost DECIMAL(10,2) NOT NULL,
                art_image VARCHAR(255) NOT NULL,
                art_description TEXT,
                work_hours VARCHAR(50),
                size_of_art VARCHAR(50),
                color_type ENUM('black_and_white', 'color') NOT NULL,
                status ENUM('listed', 'ordered', 'sold', 'delivered') DEFAULT 'listed',
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (artist_unique_id) REFERENCES artists(unique_id) ON DELETE CASCADE
            )`,
            
            `CREATE TABLE IF NOT EXISTS contact_messages (
                unique_id INT PRIMARY KEY AUTO_INCREMENT,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                subject VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                status ENUM('unread', 'read', 'archived') DEFAULT 'unread',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS orders (
                unique_id INT PRIMARY KEY AUTO_INCREMENT,
                order_id VARCHAR(50) UNIQUE NOT NULL,
                customer_name VARCHAR(100) NOT NULL,
                customer_phone VARCHAR(20) NOT NULL,
                customer_email VARCHAR(100) NOT NULL,
                shipping_address TEXT NOT NULL,
                customer_message TEXT,
                total_amount DECIMAL(10,2) NOT NULL,
                item_count INT NOT NULL,
                item_list JSON NOT NULL,
                creation_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                received_date_time TIMESTAMP NULL,
                delivered_date_time TIMESTAMP NULL,
                status ENUM('placed', 'seen', 'contacted', 'sold', 'delivered', 'canceled') DEFAULT 'placed'
            )`,
            
            `CREATE TABLE IF NOT EXISTS page_views (
                sn INT PRIMARY KEY AUTO_INCREMENT,
                view_date DATE NOT NULL,
                view_count INT DEFAULT 1,
                UNIQUE KEY unique_date (view_date)
            )`
        ];

        // Execute each table creation query
        for (const query of createQueries) {
            await connection.query(query);
        }

        // Insert default admin if not exists
        await connection.query(
            'INSERT IGNORE INTO admin (username, password_hash) VALUES (?, ?)',
            [process.env.ADMIN_USERNAME, 'temp_password']
        );

        console.log('✅ Database schema created successfully');

        // Create admin user with hashed password
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        
        await connection.query(
            'UPDATE admin SET password_hash = ? WHERE username = ?',
            [hashedPassword, process.env.ADMIN_USERNAME]
        );

        console.log('✅ Admin user created successfully');
        console.log(`👑 Admin Username: ${process.env.ADMIN_USERNAME}`);
        console.log(`🔑 Admin Password: ${process.env.ADMIN_PASSWORD}`);
        
        await connection.end();
        
        console.log('🎨 चित्रम् database setup completed!');
        console.log('🚀 You can now start the server with: npm run dev');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        if (connection) await connection.end();
        process.exit(1);
    }
};

setupDatabase();
