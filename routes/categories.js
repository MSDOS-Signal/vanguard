const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { Category, Product, News } = require('../models');
const auth = require('../middleware/auth');
const { isEditor } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/categories
// @desc    Get all categories for admin
// @access  Admin/Editor only
router.get('/', [auth, isEditor], async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'slug', 'description', 'isActive', 'createdAt', 'updatedAt']
    });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/categories/:id
// @desc    Get category by ID
// @access  Admin/Editor only
router.get('/:id', [auth, isEditor], async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/categories
// @desc    Create new category
// @access  Admin/Editor only
router.post('/', [
  auth,
  isEditor,
  body('name', 'Category name is required').notEmpty().isLength({ min: 2, max: 100 }),
  body('description').optional().isLength({ max: 500 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, isActive = true } = req.body;
    
    // Check if category name already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    const category = await Category.create({
      name,
      description,
      isActive
    });
    
    res.status(201).json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/categories/:id
// @desc    Update category
// @access  Admin/Editor only
router.put('/:id', [
  auth,
  isEditor,
  body('name', 'Category name is required').notEmpty().isLength({ min: 2, max: 100 }),
  body('description').optional().isLength({ max: 500 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, description, isActive } = req.body;
    
    // Check if category name already exists (excluding current category)
    if (name !== category.name) {
      const existingCategory = await Category.findOne({ 
        where: { 
          name,
          id: { [Op.ne]: req.params.id }
        } 
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }

    await category.update({
      name,
      description,
      isActive
    });
    
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/categories/:id
// @desc    Delete category
// @access  Admin only
router.delete('/:id', [auth, auth.isAdmin], async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category is being used by products or news
    const productCount = await Product.count({ where: { categoryId: req.params.id } });
    const newsCount = await News.count({ where: { category: category.name } });
    
    if (productCount > 0 || newsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It is being used by ${productCount} products and ${newsCount} news articles.` 
      });
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/categories/:id/usage
// @desc    Get category usage statistics
// @access  Admin/Editor only
router.get('/:id/usage', [auth, isEditor], async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const productCount = await Product.count({ where: { categoryId: req.params.id } });
    const newsCount = await News.count({ where: { category: category.name } });
    
    res.json({
      category: category.name,
      productCount,
      newsCount,
      totalUsage: productCount + newsCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
