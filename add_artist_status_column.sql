-- Add status column to artists table
-- This column will indicate whether the artist is active or deleted

USE chitram_db;

-- Add the status column to artists table
ALTER TABLE artists 
ADD COLUMN status ENUM('active', 'inactive', 'deleted') DEFAULT 'active' 
AFTER joined_at;

-- Update existing records to have 'active' status
UPDATE artists 
SET status = 'active' 
WHERE status IS NULL;

-- Verify the change
DESCRIBE artists;

-- Show current artists with their status
SELECT unique_id, full_name, email, status, joined_at 
FROM artists 
ORDER BY unique_id;
