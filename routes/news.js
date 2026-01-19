const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { News } = require('../models');
const auth = require('../middleware/auth');
const { isEditor } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/news
// @desc    Get all news with pagination and filtering
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('sort').optional().isIn(['title', 'publishDate', 'createdAt', 'viewCount']),
  query('order').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    // Build filter object
    const where = { isPublished: true };
    
    if (req.query.category) {
      where.category = req.query.category;
    }

    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${req.query.search}%` } },
        { summary: { [Op.like]: `%${req.query.search}%` } },
        { content: { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    // Build sort object
    let order = [['publishDate', 'DESC']];
    if (req.query.sort) {
      order = [[req.query.sort, req.query.order === 'desc' ? 'DESC' : 'ASC']];
    }

    const { count, rows: news } = await News.findAndCountAll({
      where,
      order,
      offset,
      limit,
      attributes: { exclude: ['content', 'seoKeywords'] }
    });

    res.json({
      news,
      pagination: {
        current: page,
        pages: Math.ceil(count / limit),
        total: count,
        hasNext: page * limit < count,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/news/featured
// @desc    Get featured news
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const news = await News.findAll({
      where: { 
        isPublished: true, 
        isFeatured: true 
      },
      limit: 6,
      attributes: ['title', 'slug', 'summary', 'featuredImage', 'category', 'publishDate', 'author']
    });
    
    res.json(news);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/news/categories
// @desc    Get all news categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await News.findAll({
      attributes: [[News.sequelize.fn('DISTINCT', News.sequelize.col('category')), 'category']],
      raw: true
    });
    res.json(categories.map(cat => cat.category));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/news/:slug
// @desc    Get news by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const news = await News.findOne({
      where: { 
        slug: req.params.slug,
        isPublished: true
      }
    });

    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    // Increment view count
    await news.increment('viewCount');

    res.json(news);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/news
// @desc    Create new news article
// @access  Editor/Admin only
router.post('/', [
  auth,
  isEditor,
  body('title', 'Title is required').notEmpty(),
  body('summary', 'Summary is required').notEmpty(),
  body('content', 'Content is required').notEmpty(),
  body('author', 'Author is required').notEmpty(),
  body('featuredImage', 'Featured image is required').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const rawCategory = (req.body.category == null ? 'General' : req.body.category);
    const trimmed = String(rawCategory).trim();
    const safeCategory = (trimmed.length === 0 ? 'General' : trimmed).slice(0, 100);
    const payload = {
      ...req.body,
      category: safeCategory
    };
    const news = await News.create(payload);
    res.json(news);
  } catch (err) {
    console.error('News creation error:', err && err.stack ? err.stack : err);
    const dbMessage = err?.errors?.[0]?.message || err?.original?.sqlMessage || err?.message || 'Server error';
    res.status(500).json({ message: dbMessage });
  }
});

// @route   PUT /api/news/:id
// @desc    Update news article
// @access  Editor/Admin only
router.put('/:id', [
  auth,
  isEditor,
  body('title', 'Title is required').notEmpty(),
  body('summary', 'Summary is required').notEmpty(),
  body('content', 'Content is required').notEmpty(),
  body('author', 'Author is required').notEmpty(),
  body('featuredImage', 'Featured image is required').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const news = await News.findByPk(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    const rawCategory = (req.body.category == null ? (news.category || 'General') : req.body.category);
    const trimmed = String(rawCategory).trim();
    const safeCategory = (trimmed.length === 0 ? (news.category || 'General') : trimmed).slice(0, 100);
    const payload = {
      ...req.body,
      category: safeCategory
    };

    await news.update(payload);
    res.json(news);
  } catch (err) {
    console.error('News update error:', err && err.stack ? err.stack : err);
    const dbMessage = err?.errors?.[0]?.message || err?.original?.sqlMessage || err?.message || 'Server error';
    res.status(500).json({ message: dbMessage });
  }
});

// @route   DELETE /api/news/:id
// @desc    Delete news article
// @access  Admin only
router.delete('/:id', [auth, auth.isAdmin], async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    await news.destroy();
    res.json({ message: 'News article deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
