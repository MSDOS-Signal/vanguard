const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const News = require('./News');
const Contact = require('./Contact');
const Category = require('./Category');

// Define associations
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'categoryRef' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Contact.belongsTo(User, { as: 'assignedUser', foreignKey: 'assignedTo' });
User.hasMany(Contact, { as: 'assignedContacts', foreignKey: 'assignedTo' });
// For chat threads: who opened the thread
Contact.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(Contact, { as: 'threads', foreignKey: 'userId' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Product,
  News,
  Contact,
  Category
};
