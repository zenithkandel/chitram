#!/usr/bin/env node

/**
 * चित्रम् Health Check Script
 * This script tests all the main functionality of the chitram application
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chitram_db'
};

async function runHealthCheck() {
    console.log('🔍 Running चित्रम् Health Check...\n');
    
    let db;
    let allTestsPassed = true;
    
    try {
        // Test 1: Database Connection
        console.log('1. Testing database connection...');
        db = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection successful\n');
        
        // Test 2: Check required tables exist
        console.log('2. Checking database tables...');
        const tables = ['admin', 'artists', 'arts', 'contact_messages', 'orders', 'artist_applications'];
        
        for (const table of tables) {
            const [rows] = await db.execute(`SHOW TABLES LIKE '${table}'`);
            if (rows.length === 0) {
                console.log(`❌ Table '${table}' does not exist`);
                allTestsPassed = false;
            } else {
                console.log(`✅ Table '${table}' exists`);
            }
        }
        console.log();
        
        // Test 3: Check upload directories
        console.log('3. Checking upload directories...');
        const uploadDirs = [
            './uploads/applications',
            './uploads/profiles', 
            './uploads/artworks'
        ];
        
        for (const dir of uploadDirs) {
            if (fs.existsSync(dir)) {
                console.log(`✅ Directory '${dir}' exists`);
            } else {
                console.log(`❌ Directory '${dir}' missing`);
                allTestsPassed = false;
            }
        }
        console.log();
        
        // Test 4: Check admin user exists
        console.log('4. Checking admin user...');
        const [adminUsers] = await db.execute('SELECT COUNT(*) as count FROM admin');
        if (adminUsers[0].count > 0) {
            console.log('✅ Admin user exists');
        } else {
            console.log('❌ No admin user found');
            allTestsPassed = false;
        }
        console.log();
        
        // Test 5: Check required files
        console.log('5. Checking critical files...');
        const criticalFiles = [
            './server.js',
            './package.json',
            './.env',
            './config/database.js',
            './controllers/adminController.js',
            './routes/admin.js'
        ];
        
        for (const file of criticalFiles) {
            if (fs.existsSync(file)) {
                console.log(`✅ File '${file}' exists`);
            } else {
                console.log(`❌ Critical file '${file}' missing`);
                allTestsPassed = false;
            }
        }
        console.log();
        
        // Final result
        if (allTestsPassed) {
            console.log('🎉 All health checks passed! चित्रम् is ready to run.');
            console.log('🚀 Start the server with: npm start');
        } else {
            console.log('⚠️  Some health checks failed. Please fix the issues above.');
        }
        
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        allTestsPassed = false;
    } finally {
        if (db) {
            await db.end();
        }
    }
    
    process.exit(allTestsPassed ? 0 : 1);
}

// Run the health check
runHealthCheck();
