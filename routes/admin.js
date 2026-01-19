const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { User, Product, News, Contact, Category } = require('../models');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');
const { isEditor } = require('../middleware/auth');

const router = express.Router();

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Admin only
router.get('/dashboard', auth, isAdmin, async (req, res) => {
  try {
    // Get counts for dashboard
    const productCount = await Product.count();
    const newsCount = await News.count();
    const contactCount = await Contact.count();
    const userCount = await User.count();
    const unreadCount = await Contact.count({ where: { isRead: false } });

    // Get recent contacts
    const recentContacts = await Contact.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{
        model: User,
        as: 'assignedUser',
        attributes: ['username']
      }]
    });

    // Get recent products
    const recentProducts = await Product.findAll({
      where: { isPublished: true },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Get recent news
    const recentNews = await News.findAll({
      where: { isPublished: true },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      counts: {
        products: productCount,
        news: newsCount,
        contacts: contactCount,
        users: userCount,
        unread: unreadCount
      },
      recentContacts,
      recentProducts,
      recentNews
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// List all products (regardless of published) for admin
router.get('/products', auth, isAdmin, async (req, res) => {
  try {
    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Category CRUD (Admin only)
router.get('/categories', auth, isAdmin, async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/categories', [
  auth,
  isAdmin,
  body('name', 'Name is required').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, description } = req.body;
    const exists = await Category.findOne({ where: { name } });
    if (exists) return res.status(400).json({ message: 'Category already exists' });
    const category = await Category.create({ name, description });
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/categories/:id', [auth, isAdmin], async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Not found' });
    await category.update(req.body);
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/categories/:id', [auth, isAdmin], async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Not found' });
    await category.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/admin/users
// @desc    Get all users
// @access  Admin only
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/admin/users
// @desc    Create new user
// @access  Admin only
router.post('/users', [
  auth,
  isAdmin,
  body('username', 'Username is required').notEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  body('role', 'Role must be admin or editor').isIn(['admin', 'editor'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      role,
      isActive: true
    });

    // Return user without password
    const userResponse = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json(userResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/admin/users/:id
// @desc    Update user
// @access  Admin only
router.put('/users/:id', [
  auth,
  isAdmin,
  body('username', 'Username is required').notEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('role', 'Role must be admin or editor').isIn(['admin', 'editor'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, role, isActive } = req.body;

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username or email already exists (excluding current user)
    const existingUser = await User.findOne({
      where: {
        [Op.and]: [
          {
            [Op.or]: [{ username }, { email }]
          },
          {
            id: { [Op.ne]: req.params.id }
          }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Update user
    await user.update({
      username,
      email,
      role,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    // Return updated user without password
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete user
// @access  Admin only
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
