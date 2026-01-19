const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const auth = require('../middleware/auth');

const router = express.Router();

// Check if Cloudinary is configured
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                               process.env.CLOUDINARY_API_KEY && 
                               process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary configured');
}

// Ensure upload directories exist (only needed for local storage)
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const uploadsRoot = path.join(__dirname, '..', 'uploads');
if (!isCloudinaryConfigured) {
  ensureDirExists(uploadsRoot);
  ensureDirExists(path.join(uploadsRoot, 'images'));
  ensureDirExists(path.join(uploadsRoot, 'files'));
}

// Configure Storage Engine (Cloudinary or Local)
let storage;
if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'vanguard_uploads',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf', 'doc', 'docx'],
      public_id: (req, file) => {
        const name = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9]/g, '_');
        return `${name}_${Date.now()}`;
      },
    },
  });
} else {
  // Local storage fallback
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(uploadsRoot, 'files'));
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname) || '';
      const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
      cb(null, `${base}_${timestamp}${ext.toLowerCase()}`);
    }
  });
}

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

// @route   POST /api/upload
// @desc    Upload a file (image or generic file). Returns public URL
// @access  Private (logged-in users)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Cloudinary path
    if (isCloudinaryConfigured) {
      // Cloudinary automatically handles upload, req.file.path is the URL
      return res.json({
        url: req.file.path, // Full Cloudinary URL
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname
      });
    }

    // Local Storage Path (Legacy logic)
    const type = (req.body.type || 'image').toLowerCase();
    const uploadedPath = req.file.path;
    const mimeType = req.file.mimetype;
    const originalName = req.file.originalname;

    console.log('Upload request (Local):', { type, mimeType, originalName, size: req.file.size });

    // If image, process and move into uploads/images with optimized output
    if (type === 'image' && mimeType.startsWith('image/')) {
      try {
        const imagesDir = path.join(uploadsRoot, 'images');
        const fileBase = path.basename(uploadedPath, path.extname(uploadedPath));
        const outputFilename = `${fileBase}.webp`;
        const outputPath = path.join(imagesDir, outputFilename);

        // Convert to webp and cap width for web usage
        const pipeline = sharp(uploadedPath).rotate();
        const metadata = await pipeline.metadata();
        await pipeline
          .resize({ width: Math.min(metadata.width || 1200, 1600), withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(outputPath);

        // Remove the temp original in files folder
        try { fs.unlinkSync(uploadedPath); } catch (e) {}

        const publicUrl = `/uploads/images/${outputFilename}`;

        return res.json({
          url: publicUrl,
          filename: outputFilename,
          mimeType: 'image/webp',
          width: metadata.width,
          height: metadata.height,
          originalName
        });
      } catch (sharpError) {
        console.error('Sharp processing error:', sharpError);
        // If sharp fails, fall back to storing as regular file
        const publicUrl = `/uploads/files/${path.basename(uploadedPath)}`;
        return res.json({
          url: publicUrl,
          filename: path.basename(uploadedPath),
          mimeType,
          originalName,
          size: req.file.size
        });
      }
    } else {
      // Non-image file
      const publicUrl = `/uploads/files/${path.basename(uploadedPath)}`;
      return res.json({
        url: publicUrl,
        filename: path.basename(uploadedPath),
        mimeType,
        originalName,
        size: req.file.size
      });
    }

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

module.exports = router;


