const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads/profiles');
const artworkUploadDir = path.join(__dirname, '../uploads/artworks');
const applicationUploadDir = path.join(__dirname, '../uploads/applications');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(artworkUploadDir)) {
    fs.mkdirSync(artworkUploadDir, { recursive: true });
}

if (!fs.existsSync(applicationUploadDir)) {
    fs.mkdirSync(applicationUploadDir, { recursive: true });
}

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: artistId_timestamp.extension
        const artistId = req.params.id || 'new';
        const extension = path.extname(file.originalname);
        const filename = `artist_${artistId}_${Date.now()}${extension}`;
        cb(null, filename);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Configure multer for artwork image uploads
const artworkStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, artworkUploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: artwork_timestamp.extension
        const extension = path.extname(file.originalname);
        const filename = `artwork_${Date.now()}${extension}`;
        cb(null, filename);
    }
});

const artworkUpload = multer({
    storage: artworkStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for artworks
    }
});

// Configure multer for application uploads
const applicationStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, applicationUploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: application_timestamp.extension
        const extension = path.extname(file.originalname);
        const filename = `application_${Date.now()}${extension}`;
        cb(null, filename);
    }
});

const applicationUpload = multer({
    storage: applicationStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit for applications
    }
});

module.exports = {
    uploadProfilePicture: upload.single('profile_picture'),
    uploadArtworkImage: artworkUpload.single('art_image'),
    uploadApplicationImage: applicationUpload.single('profile_picture')
};
