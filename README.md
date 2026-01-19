# Vanguard Machinery Trading Company Website

A professional, modern, and SEO-optimized website for Vanguard Machinery Trading Company, built with Node.js, Express, MySQL, and React.

## Features

### Frontend
- **Modern React 18** with functional components and hooks
- **Responsive Design** using Tailwind CSS
- **Smooth Animations** with Framer Motion
- **SEO Optimized** with meta tags and structured data
- **Mobile First** approach for all devices
- **Fast Loading** with optimized images and lazy loading

### Backend
- **Node.js & Express.js** server
- **MySQL Database** with Sequelize ORM
- **JWT Authentication** with role-based access control
- **RESTful API** design
- **File Upload** support with image processing
- **Email Notifications** for contact forms
- **Rate Limiting** and security middleware

### Content Management System (CMS)
- **Product Management** - Add, edit, delete products with categories
- **News Management** - Publish company news and industry updates
- **Contact Management** - Handle customer inquiries and responses
- **User Management** - Admin and editor roles with permissions
- **Media Library** - Upload and manage images

### SEO Features
- **Meta Tags** for all pages
- **Structured Data** (JSON-LD)
- **Sitemap Generation**
- **SEO-friendly URLs** with slugs
- **Image Optimization** and alt tags
- **Performance Optimization**

## Project Structure

```
newhtmlg/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind CSS configuration
├── models/                 # Database models
├── routes/                 # API routes
├── middleware/             # Custom middleware
├── config/                 # Configuration files
├── scripts/                # Database setup scripts
├── uploads/                # File uploads directory
├── server.js               # Main server file
├── package.json            # Backend dependencies
└── README.md              # This file
```

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn** package manager

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd newhtmlg
```

### 2. Install dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Database Setup

#### Create MySQL Database
```sql
CREATE DATABASE vanguard_machinery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Environment Configuration
Create a `.env` file in the root directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3307
DB_NAME=vanguard_machinery
DB_USER=root
DB_PASSWORD=Key-1122

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Optional - for contact form notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Setup Database and Create Default Users
```bash
npm run setup-db
```

This will create the database tables and default users:
- **Admin User**: `admin` / `admin123`
- **Editor User**: `editor` / `editor123`

## Running the Application

### Development Mode

#### Start Backend Server
```bash
npm run dev
```
The backend will run on `http://localhost:5000`

#### Start Frontend (in a new terminal)
```bash
cd client
npm start
```
The frontend will run on `http://localhost:3000`

### Production Mode

#### Build Frontend
```bash
npm run build
```

#### Start Production Server
```bash
npm start
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build frontend for production
- `npm run build:client` - Build only the frontend
- `npm run install:all` - Install both backend and frontend dependencies
- `npm run setup-db` - Setup database and create default users

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with pagination, filtering, sorting)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/:slug` - Get product by slug
- `POST /api/products` - Create new product (Admin/Editor)
- `PUT /api/products/:id` - Update product (Admin/Editor)
- `DELETE /api/products/:id` - Delete product (Admin)

### News
- `GET /api/news` - Get all news (with pagination, filtering, sorting)
- `GET /api/news/featured` - Get featured news
- `GET /api/news/categories` - Get news categories
- `GET /api/news/:slug` - Get news by slug
- `POST /api/news` - Create new news (Admin/Editor)
- `PUT /api/news/:id` - Update news (Admin/Editor)
- `DELETE /api/news/:id` - Delete news (Admin)

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all inquiries (Admin/Editor)
- `GET /api/contact/:id` - Get inquiry details (Admin/Editor)
- `PUT /api/contact/:id/status` - Update inquiry status (Admin/Editor)
- `PUT /api/contact/:id/respond` - Respond to inquiry (Admin/Editor)
- `PUT /api/contact/:id/read` - Mark inquiry as read (Admin/Editor)
- `DELETE /api/contact/:id` - Delete inquiry (Admin)

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard data
- `GET /api/admin/users` - Get all users (Admin)
- `POST /api/admin/users` - Create new user (Admin)
- `PUT /api/admin/users/:id` - Update user (Admin)
- `DELETE /api/admin/users/:id` - Delete user (Admin)

## Content Management

### Adding Products
1. Login as Admin or Editor
2. Navigate to Admin Panel > Products
3. Click "Add New Product"
4. Fill in product details and upload images
5. Set SEO fields for better search rankings
6. Publish the product

### Publishing News
1. Login as Admin or Editor
2. Navigate to Admin Panel > News
3. Click "Add New Article"
4. Write content with proper SEO optimization
5. Add featured image and tags
6. Publish the article

### Managing Inquiries
1. Login as Admin or Editor
2. Navigate to Admin Panel > Contact
3. View and respond to customer inquiries
4. Update status and assign to team members
5. Send email responses to customers

## SEO Features

### Meta Tags
- Dynamic title and description for each page
- Open Graph tags for social media sharing
- Twitter Card support
- Canonical URLs

### Structured Data
- Organization schema
- Product schema
- Article schema
- Breadcrumb navigation

### Performance
- Image optimization with Sharp
- Lazy loading for images
- Code splitting and bundling
- Compression middleware

## Deployment

### Environment Variables
Make sure to set all required environment variables in production:
- Database credentials
- JWT secret
- Email configuration
- File upload settings

### Database
- Use a production MySQL server
- Set up proper backups
- Configure connection pooling
- Enable SSL connections if required

### Security
- Change default JWT secret
- Enable HTTPS
- Set up proper CORS configuration
- Configure rate limiting
- Use environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact:
- Email: support@vanguardmachinery.com
- Website: https://vanguardmachinery.com

## Changelog

### Version 1.0.0
- Initial release
- MySQL database integration
- Complete CMS functionality
- SEO optimization features
- Responsive design
- Admin panel with role-based access
