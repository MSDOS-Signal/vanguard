const sequelize = require('../config/database');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected. Altering news.category charset/collation...');

    // Ensure table and column use utf8mb4 to store Chinese safely
    await sequelize.query("ALTER TABLE `news` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    await sequelize.query("ALTER TABLE `news` MODIFY `category` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;");

    console.log('Alter complete.');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
}

run();


