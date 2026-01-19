const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { Product, Category } = require('../models');
const auth = require('../middleware/auth');
const { isEditor } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with pagination and filtering
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('sort').optional().isIn(['name', 'price', 'createdAt', 'viewCount']),
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
      // Support category by name or slug
      const categoryFilter = req.query.category;
      const category = await Category.findOne({
        where: {
          [Op.or]: [
            { name: categoryFilter },
            { slug: categoryFilter }
          ],
          isActive: true
        }
      });
      if (category) {
        where.categoryId = category.id;
      } else {
        // no matching category, return empty
        return res.json({ products: [], pagination: { current: 1, pages: 0, total: 0, hasNext: false, hasPrev: false } });
      }
    }

    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { description: { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    // Build sort object
    let order = [['createdAt', 'DESC']];
    if (req.query.sort) {
      order = [[req.query.sort, req.query.order === 'desc' ? 'DESC' : 'ASC']];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order,
      offset,
      limit,
      include: [{ model: Category, as: 'categoryRef', attributes: ['id', 'name', 'slug'] }],
      attributes: { exclude: ['specifications', 'seoKeywords'] }
    });

    res.json({
      products,
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

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { 
        isPublished: true, 
        isFeatured: true 
      },
      limit: 6,
      attributes: ['id', 'name', 'slug', 'mainImage', 'category', 'price', 'description', 'viewCount', 'createdAt']
    });
    
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'slug', 'description']
    });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:slug
// @desc    Get product by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { 
        slug: req.params.slug,
        isPublished: true
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    await product.increment('viewCount');

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Editor/Admin only
router.post('/', [
  auth,
  isEditor,
  body('name', 'Product name is required').notEmpty(),
  body('category', 'Product category is required').notEmpty().isLength({ min: 2, max: 100 }),
  body('categoryId').optional().isInt(),
  body('description', 'Description is required').notEmpty(),
  body('mainImage').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array()); // 添加日志
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('Received product data:', req.body); // 添加日志
    
    const { categoryId, category, images, seo_keywords, ...productData } = req.body;
    
    // 确保category字段存在
    const categoryToUse = (category || 'CNC Machines');
    const safeCategory = String(categoryToUse).slice(0, 100); // guard against DB truncation
    
    // 处理分类
    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && safeCategory) {
      const existing = await Category.findOne({ where: { name: safeCategory } });
      if (existing) {
        resolvedCategoryId = existing.id;
      }
    }
    
    // 确保必要的字段有默认值
    const productPayload = {
      ...productData,
      category: safeCategory, // 显式设置category并限制长度
      categoryId: resolvedCategoryId,
      images: images || [],
      seoKeywords: seo_keywords || [],
      isPublished: productData.isPublished !== undefined ? productData.isPublished : false,
      isFeatured: productData.isFeatured !== undefined ? productData.isFeatured : false,
      viewCount: productData.viewCount || 0,
      mainImage: productData.mainImage || '/api/placeholder/400/300' // 提供默认图片
    };
    
    console.log('Creating product with:', productPayload); // 添加日志
    
    const product = await Product.create(productPayload);
    res.json(product);
  } catch (err) {
    console.error('Product creation error:', err && err.stack ? err.stack : err);
    // Return more actionable error info without leaking internals
    const dbMessage = err?.errors?.[0]?.message || err?.original?.sqlMessage || err?.message || 'Server error';
    res.status(500).json({ message: dbMessage });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Editor/Admin only
router.put('/:id', [
  auth,
  isEditor,
  body('name', 'Product name is required').notEmpty(),
  body('description', 'Description is required').notEmpty(),
  body('mainImage', 'Main image is required').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { categoryId, category } = req.body;
    let resolvedCategoryId = categoryId || product.categoryId;
    if (!categoryId && category) {
      const existing = await Category.findOne({ where: { name: category } });
      if (existing) {
        resolvedCategoryId = existing.id;
      }
    }
    await product.update({ ...req.body, categoryId: resolvedCategoryId });
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Admin only
router.delete('/:id', [auth, auth.isAdmin], async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
