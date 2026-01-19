const { Category } = require('../models');
const sequelize = require('../config/database');

const defaultCategories = [
  {
    name: 'CNC Machines',
    description: '数控机床设备',
    isActive: true
  },
  {
    name: 'Industrial Equipment',
    description: '工业设备',
    isActive: true
  },
  {
    name: 'Manufacturing Tools',
    description: '制造工具',
    isActive: true
  },
  {
    name: 'Automation Systems',
    description: '自动化系统',
    isActive: true
  },
  {
    name: 'Quality Control',
    description: '质量控制设备',
    isActive: true
  },
  {
    name: 'Company News',
    description: '公司新闻',
    isActive: true
  },
  {
    name: 'Industry Updates',
    description: '行业动态',
    isActive: true
  },
  {
    name: 'Product Launches',
    description: '产品发布',
    isActive: true
  },
  {
    name: 'Partnerships',
    description: '合作伙伴',
    isActive: true
  },
  {
    name: 'Technology Trends',
    description: '技术趋势',
    isActive: true
  }
];

async function initCategories() {
  try {
    console.log('开始初始化分类...');
    
    // 检查是否已有分类
    const existingCategories = await Category.findAll();
    if (existingCategories.length > 0) {
      console.log(`已存在 ${existingCategories.length} 个分类，跳过初始化`);
      return;
    }
    
    // 创建默认分类
    for (const categoryData of defaultCategories) {
      await Category.create(categoryData);
      console.log(`创建分类: ${categoryData.name}`);
    }
    
    console.log('分类初始化完成！');
  } catch (error) {
    console.error('初始化分类失败:', error);
  } finally {
    await sequelize.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initCategories();
}

module.exports = { initCategories };