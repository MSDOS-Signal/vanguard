const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'vanguard_machinery',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Key-1122',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
               define: {
             timestamps: true,
             underscored: true,
             charset: 'utf8mb4',
             collate: 'utf8mb4_unicode_ci'
           },
           dialectOptions: {
             charset: 'utf8mb4'
           }
  }
);

module.exports = sequelize;
