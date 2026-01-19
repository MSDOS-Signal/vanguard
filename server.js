const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import models to ensure they are initialized
require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// CORS MUST be early so preflight gets headers
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.CORS_ORIGIN || ''
  ].filter(Boolean),
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
  maxAge: 86400
}));
app.options('*', cors());

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'development' ? false : {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}));

// Rate limiting (disabled by default). Enable by setting ENABLE_RATE_LIMIT=true
if (process.env.ENABLE_RATE_LIMIT === 'true') {
  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => req.method === 'OPTIONS'
  });
  app.use('/api/', limiter);
}

// Middleware
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test database connection
const ensureColumn = async (sequelize, table, column, definition) => {
  const [rows] = await sequelize.query(
    "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    { replacements: [table, column] }
  );
  const exists = Array.isArray(rows) ? rows[0]?.cnt > 0 : rows.cnt > 0;
  if (!exists) {
    await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
  }
};

sequelize.authenticate()
  .then(async () => {
    console.log('Database connection established successfully.');
    // Sync models
    await sequelize.sync();

    // Ensure utf8mb4 for proper Chinese text storage and adequate length for category
    try {
      await sequelize.query("ALTER TABLE products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
      await sequelize.query("ALTER TABLE products MODIFY category VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL");
      // Ensure users.role enum contains all roles
      await sequelize.query("ALTER TABLE users MODIFY role ENUM('admin','editor','user') NOT NULL DEFAULT 'user'");
      // Ensure contacts table has new chat columns (guard for MySQL versions without IF NOT EXISTS)
      await ensureColumn(sequelize, 'contacts', 'messages', 'messages JSON NULL');
      await ensureColumn(sequelize, 'contacts', 'user_id', 'user_id INT NULL');
    } catch (e) {
      // Ignore if table/column already matches desired schema
      console.log('Schema check/update for products table:', e?.message || 'ok');
    }
  })
  .then(() => {
    console.log('Database models synchronized and schema verified.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/news', require('./routes/news'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/categories', require('./routes/categories'));
app.use('/api/seo', require('./routes/seo'));
app.use('/api/upload', require('./routes/upload'));

// Explicit preflight handler (some proxies strip auto headers)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(204);
  }
  next();
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
