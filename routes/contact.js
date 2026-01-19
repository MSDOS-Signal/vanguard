const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { Contact, User } = require('../models');
const auth = require('../middleware/auth');
const { isEditor } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// Lightweight chat-style endpoints
// List my threads (user) or all (staff)
router.get('/threads', auth, async (req, res) => {
  try {
    const isStaff = req.user.role === 'admin' || req.user.role === 'editor';
    const where = isStaff ? {} : { userId: req.user.id };
    const threads = await Contact.findAll({ 
      where, 
      order: [['updatedAt', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }]
    });

    // Add unread count and last message preview
    const threadsWithStats = threads.map(thread => {
      const messages = Array.isArray(thread.messages) ? thread.messages : [];
      const lastMessage = messages[messages.length - 1];
      const unreadCount = isStaff ? 
        (thread.isRead ? 0 : 1) : 
        messages.filter(m => m.from === 'admin' && !m.isRead).length;

      return {
        ...thread.toJSON(),
        unreadCount,
        lastMessage: lastMessage ? {
          text: lastMessage.text || (lastMessage.type === 'image' ? '[图片]' : lastMessage.type === 'video' ? '[视频]' : lastMessage.type === 'audio' ? '[语音]' : ''),
          type: lastMessage.type,
          at: lastMessage.at
        } : null
      };
    });

    res.json(threadsWithStats);
  } catch (err) {
    console.error('List threads error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start or reuse a thread for a product/topic
router.post('/threads', auth, async (req, res) => {
  try {
    const subject = String(req.body.subject || '').trim() || '聊天';
    // Try reuse: latest open thread with same subject for this user
    let thread = await Contact.findOne({ where: { userId: req.user.id, subject }, order: [['updatedAt', 'DESC']] });
    if (!thread) {
      thread = await Contact.create({
        name: req.user.username,
        email: req.user.email,
        subject,
        message: '',
        status: 'In Progress',
        userId: req.user.id,
        messages: []
      });
    }
    res.json(thread);
  } catch (err) {
    console.error('Create thread error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a thread (and include simple user info for sidebar)
router.get('/threads/:id', auth, async (req, res) => {
  try {
    const thread = await Contact.findByPk(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Not found' });
    const isStaff = req.user.role === 'admin' || req.user.role === 'editor';
    if (!isStaff && thread.userId !== req.user.id) return res.status(403).json({ message: 'Not permitted' });
    res.json(thread);
  } catch (err) {
    console.error('Get thread error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// @route   POST /api/contact
// @desc    Submit contact form / start a chat thread
// @access  Public
router.post('/', [
  body('name', 'Name is required').notEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('subject', 'Subject is required').notEmpty(),
  body('message', 'Message is required').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const contactData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || null,
      messages: [{ from: req.user ? 'user' : 'guest', text: req.body.message, at: new Date().toISOString() }]
    };

    const contact = await Contact.create(contactData);

    // Try sending emails if SMTP configured (non-blocking)
    try { await sendConfirmationEmail(contact); } catch (e) { console.log('Skip confirmation email:', e?.message); }
    try { await sendAdminNotification(contact); } catch (e) { console.log('Skip admin email:', e?.message); }

    res.json({ 
      message: 'Contact form submitted successfully',
      contactId: contact.id
    });
  } catch (err) {
    console.error('Contact create error:', err && err.stack ? err.stack : err);
    const dbMessage = err?.errors?.[0]?.message || err?.original?.sqlMessage || err?.message || 'Server error';
    res.status(500).json({ message: dbMessage });
  }
});
// @route   POST /api/contact/:id/messages
// @desc    Post a message in a contact thread (user or admin)
// @access  Private (user or editor/admin)
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact inquiry not found' });
    }

    // Permission: owner user or editor/admin
    const isStaff = req.user.role === 'admin' || req.user.role === 'editor';
    if (!isStaff && contact.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not permitted' });
    }

    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    const type = (req.body.type || 'text').toLowerCase(); // 'text' | 'image' | 'video' | 'audio'
    const url = typeof req.body.url === 'string' ? req.body.url.trim() : '';

    if (type === 'text' && !text) {
      return res.status(400).json({ message: 'Message text is required' });
    }
    if (type !== 'text' && !url) {
      return res.status(400).json({ message: 'Media url is required' });
    }

    const nextMessages = Array.isArray(contact.messages) ? contact.messages.slice() : [];
    const messageId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    nextMessages.push({ 
      id: messageId,
      from: isStaff ? 'admin' : 'user', 
      fromUserId: req.user.id,
      text, 
      type, 
      url, 
      at: new Date().toISOString(),
      recalled: false
    });

    await contact.update({ messages: nextMessages, isRead: isStaff ? contact.isRead : false, status: 'In Progress' });
    res.json({ messages: nextMessages });
  } catch (err) {
    console.error('Post message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/contact/:id/messages/:messageId/recall
// @desc    Recall a message (only own messages within 2 minutes)
// @access  Private
router.put('/:id/messages/:messageId/recall', auth, async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact inquiry not found' });
    }

    // Permission: owner user or editor/admin
    const isStaff = req.user.role === 'admin' || req.user.role === 'editor';
    if (!isStaff && contact.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not permitted' });
    }

    const messages = Array.isArray(contact.messages) ? contact.messages.slice() : [];
    const messageIndex = messages.findIndex(m => m.id === req.params.messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const message = messages[messageIndex];
    
    // Check if user can recall this message (own message)
    if (message.fromUserId !== req.user.id) {
      return res.status(403).json({ message: 'Can only recall your own messages' });
    }

    // Check time limit (2 minutes)
    const messageTime = new Date(message.at);
    const now = new Date();
    const timeDiff = now - messageTime;
    if (timeDiff > 2 * 60 * 1000) { // 2 minutes
      return res.status(400).json({ message: 'Can only recall messages within 2 minutes' });
    }

    // Mark as recalled
    messages[messageIndex] = { ...message, recalled: true };
    await contact.update({ messages });

    res.json({ messages });
  } catch (err) {
    console.error('Recall message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/contact
// @desc    Get all contact inquiries (Admin/Editor)
// @access  Private
router.get('/', [
  auth,
  isEditor,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['New', 'In Progress', 'Responded', 'Closed']),
  query('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  query('search').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Build filter object
    const where = {};
    
    if (req.query.status) {
      where.status = req.query.status;
    }
    
    if (req.query.priority) {
      where.priority = req.query.priority;
    }

    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } },
        { subject: { [Op.like]: `%${req.query.search}%` } },
        { message: { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    const { count, rows: contacts } = await Contact.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit,
      include: [{
        model: User,
        as: 'assignedUser',
        attributes: ['username']
      }]
    });

    res.json({
      contacts,
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

// @route   GET /api/contact/:id
// @desc    Get contact inquiry details (Admin/Editor)
// @access  Private
router.get('/:id', [auth, isEditor], async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'assignedUser',
        attributes: ['username']
      }]
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact inquiry not found' });
    }

    // Mark as read if not already read
    if (!contact.isRead) {
      await contact.update({ isRead: true });
    }

    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/contact/:id/status
// @desc    Update contact inquiry status (Admin/Editor)
// @access  Private
router.put('/:id/status', [
  auth,
  isEditor,
  body('status', 'Status is required').isIn(['New', 'In Progress', 'Responded', 'Closed']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('assignedTo').optional().isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact inquiry not found' });
    }

    await contact.update(req.body);
    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/contact/:id/respond
// @desc    Respond to contact inquiry (Admin/Editor)
// @access  Private
router.put('/:id/respond', [
  auth,
  isEditor,
  body('response', 'Response message is required').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact inquiry not found' });
    }

    const responseData = {
      message: req.body.response,
      respondedBy: req.user.id,
      respondedAt: new Date()
    };

    await contact.update({
      response: responseData,
      status: 'Responded'
    });

    // Send response email to user
    await sendResponseEmail(contact);

    res.json({ message: 'Response sent successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/contact/:id/read
// @desc    Mark contact inquiry as read (Admin/Editor)
// @access  Private
router.put('/:id/read', [auth, isEditor], async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact inquiry not found' });
    }

    await contact.update({ isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact inquiry (Admin only)
// @access  Private
router.delete('/:id', [auth, auth.isAdmin], async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact inquiry not found' });
    }

    await contact.destroy();
    res.json({ message: 'Contact inquiry deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions for sending emails
async function sendConfirmationEmail(contact) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: contact.email,
    subject: 'Thank you for contacting Vanguard Machinery',
    html: `
      <h2>Thank you for your inquiry</h2>
      <p>Dear ${contact.name},</p>
      <p>We have received your message and will get back to you shortly.</p>
      <p><strong>Your inquiry:</strong> ${contact.subject}</p>
      <p><strong>Message:</strong> ${contact.message}</p>
      <p>Best regards,<br>Vanguard Machinery Team</p>
    `
  });
}

async function sendAdminNotification(contact) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.SMTP_USER,
    subject: 'New Contact Form Submission',
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Subject:</strong> ${contact.subject}</p>
      <p><strong>Message:</strong> ${contact.message}</p>
      <p><strong>Company:</strong> ${contact.company || 'N/A'}</p>
      <p><strong>Country:</strong> ${contact.country || 'N/A'}</p>
      <p><strong>Inquiry Type:</strong> ${contact.inquiryType}</p>
      <p><strong>Submitted:</strong> ${contact.createdAt}</p>
    `
  });
}

async function sendResponseEmail(contact) {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: contact.email,
      subject: `Re: ${contact.subject}`,
      html: `
        <h2>Response to your inquiry</h2>
        <p>Dear ${contact.name},</p>
        <p>Thank you for contacting Vanguard Machinery. Here is our response:</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #007bff;">
          ${contact.response.message}
        </div>
        <p>If you have any further questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>Vanguard Machinery Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending response email:', error);
  }
}

module.exports = router;
