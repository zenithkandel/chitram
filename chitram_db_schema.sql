-- चित्रम् (Chitram) Art Selling Platform Database Schema
-- Created: August 31, 2025
-- Database: chitram_db

CREATE DATABASE IF NOT EXISTS chitram_db;
USE chitram_db;

-- Admin table
CREATE TABLE admin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artists table
CREATE TABLE artists (
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
);

-- Arts table
CREATE TABLE arts (
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
);

-- Contact Messages table
CREATE TABLE contact_messages (
    unique_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('unread', 'read', 'archived') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
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
);

-- Page Views table
CREATE TABLE page_views (
    sn INT PRIMARY KEY AUTO_INCREMENT,
    view_date DATE NOT NULL,
    view_count INT DEFAULT 1,
    UNIQUE KEY unique_date (view_date)
);

-- Create indexes for better performance
CREATE INDEX idx_artist_email ON artists(email);
CREATE INDEX idx_arts_artist ON arts(artist_unique_id);
CREATE INDEX idx_arts_category ON arts(art_category);
CREATE INDEX idx_arts_status ON arts(status);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_creation_date ON orders(creation_date_time);
CREATE INDEX idx_contact_status ON contact_messages(status);
CREATE INDEX idx_page_views_date ON page_views(view_date);

-- Insert default admin user (password: admin123 - change this in production)
INSERT INTO admin (username, password_hash) VALUES 
('admin', '$2b$10$rOzJlKvlCgJ3rFg4.hnY0ulJK8YKyFQWoNK5r8fYg7pHq4vN8bXRG');

-- Sample categories (you can add more as needed)
-- Common art categories for reference
-- Categories: Portrait, Landscape, Abstract, Sketch, Painting, Digital Art, Pencil Art, Watercolor, Oil Painting, Acrylic

COMMIT;
