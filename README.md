# चित्रम् (Chitram) - Art Selling Platform

A complete art selling platform built with Node.js, Express, MySQL, and EJS templates.

## 🎨 Features

- **Admin Dashboard**: Comprehensive admin panel for managing all aspects
- **Artist Management**: Add, edit, and manage artist profiles
- **Artwork Management**: Upload and manage artwork with images
- **Order Management**: Track and manage customer orders
- **Message System**: Handle customer inquiries with read/archive functionality
- **Application System**: Review and approve artist applications
- **File Upload**: Secure image upload with validation
- **Responsive Design**: Mobile-friendly interface

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- XAMPP or similar local server (for development)

### Installation

1. **Clone the repository**
   ```bash
   cd c:\xampp\htdocs\codes
   git clone <repository-url> chitram
   cd chitram
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   - Copy `.env.example` to `.env` (if available)
   - Update database credentials and other settings

4. **Setup database**
   ```bash
   npm run setup
   ```

5. **Run health check**
   ```bash
   npm run health
   ```

6. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

7. **Access the application**
   - Website: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - Default Login: admin / admin123

## 📁 Project Structure

```
chitram/
├── config/
│   └── database.js          # Database configuration
├── controllers/             # Route controllers
│   ├── adminController.js
│   ├── applicationController.js
│   ├── artistController.js
│   ├── artworkController.js
│   ├── messageController.js
│   └── orderController.js
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/                  # Route definitions
│   ├── admin/               # Admin routes
│   ├── admin.js
│   └── applications.js
├── uploads/                 # File uploads
│   ├── applications/        # Application profile pictures
│   ├── artworks/           # Artwork images
│   └── profiles/           # Artist profile pictures
├── views/                  # EJS templates
│   └── admin/              # Admin panel views
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
├── health-check.js        # System health check
├── package.json           # Dependencies and scripts
├── server.js              # Main server file
└── setup-database.js      # Database setup script
```

## 🛠️ Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with auto-reload
- `npm run setup` - Setup database schema and create admin user
- `npm run health` - Run system health check

## 🔧 Administration

### Admin Features
- **Dashboard**: Overview of all statistics
- **Artists**: Manage artist profiles and information
- **Artworks**: Upload and manage artwork catalog
- **Orders**: Track customer orders and payments
- **Messages**: Handle customer inquiries
- **Applications**: Review and approve artist applications

### Default Admin Credentials
- **Username**: admin
- **Password**: admin123
- **⚠️ Change these credentials after first login**

## 🗄️ Database Schema

The application uses the following main tables:
- `admin` - Admin user accounts
- `artists` - Artist profiles and information
- `arts` - Artwork catalog
- `orders` - Customer orders
- `contact_messages` - Customer inquiries
- `artist_applications` - Artist application submissions

## 🔒 Security Features

- Password hashing with bcryptjs
- Session-based authentication
- File upload validation
- SQL injection prevention
- XSS protection with Helmet
- Rate limiting

## 📱 Mobile Support

The admin panel is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones

## 🚧 Development

### Adding New Features
1. Create controller in `controllers/` directory
2. Add routes in `routes/` directory
3. Create views in `views/` directory
4. Update navigation if needed

### File Upload Guidelines
- Images are stored in `uploads/` directory
- Maximum file size: 5MB
- Supported formats: JPG, JPEG, PNG, GIF
- Files are automatically validated

## 🧪 Testing

Run the health check to verify all components:
```bash
npm run health
```

This checks:
- Database connectivity
- Required tables
- Upload directories
- Admin user
- Critical files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the health check: `npm run health`
2. Review server logs
3. Verify database connection
4. Check file permissions

---

**चित्रम्** - Where Art Meets Technology 🎨
