const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  company: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [2, 200]
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  productInterest: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  inquiryType: {
    type: DataTypes.ENUM('General Inquiry', 'Product Information', 'Quote Request', 'Technical Support', 'Partnership', 'Other'),
    defaultValue: 'General Inquiry',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('New', 'In Progress', 'Responded', 'Closed'),
    defaultValue: 'New',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
    defaultValue: 'Medium',
    allowNull: false
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  response: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  // New: chat-style message thread [{from: 'user'|'admin', text, at}]
  messages: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  // Link to the user who started the thread (nullable for guest)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  source: {
    type: DataTypes.ENUM('Website Form', 'Email', 'Phone', 'Social Media', 'Referral'),
    defaultValue: 'Website Form',
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'contacts'
});

module.exports = Contact;
