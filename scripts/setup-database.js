const sequelize = require('../config/database');
const { User, Product, News, Contact } = require('../models');

async function setupDatabase() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 同步所有模型到数据库
    await sequelize.sync({ force: false, alter: true });
    console.log('数据库表同步完成');

    // 检查是否需要创建默认管理员用户
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      await User.create({
        username: 'admin',
        email: 'admin@vanguardmachinery.com',
        password: '$2b$10$rQZ8K9mN2pL1vX3yW4uJ5e.6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
        role: 'admin',
        isActive: true
      });
      console.log('默认管理员用户已创建');
    }

    // 检查是否需要创建示例产品
    const productCount = await Product.count();
    if (productCount === 0) {
      const sampleProducts = [
        {
          name: 'CNC加工中心 VMC-850',
          slug: 'cnc-machining-center-vmc-850',
          category: 'CNC Machines',
          description: '高精度CNC加工中心，配备先进的自动化功能，适用于精密零件加工',
          mainImage: 'https://images.unsplash.com/photo-1565439363023-6d3a7c3c9c8b?w=400&h=300&fit=crop',
          price: 125000.00,
          isPublished: true,
          isFeatured: true
        },
        {
          name: '工业机器人手臂',
          slug: 'industrial-robot-arm',
          category: 'Automation Systems',
          description: '六轴工业机器人，适用于焊接、装配、搬运等多种工业应用',
          mainImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
          price: 85000.00,
          isPublished: true,
          isFeatured: true
        },
        {
          name: '精密测量仪器',
          slug: 'precision-measurement-instrument',
          category: 'Quality Control',
          description: '高精度三坐标测量机，确保产品质量控制标准',
          mainImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
          price: 95000.00,
          isPublished: true,
          isFeatured: false
        }
      ];

      for (const product of sampleProducts) {
        await Product.create(product);
      }
      console.log('示例产品已创建');
    }

    console.log('数据库设置完成');
    process.exit(0);
  } catch (error) {
    console.error('数据库设置失败:', error);
    process.exit(1);
  }
}

setupDatabase();
