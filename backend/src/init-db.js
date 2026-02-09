import { sequelize, syncDatabase } from './lib/db.js';

async function initDatabase() {
  try {
    console.log('Starting database initialization...');
    await syncDatabase();
    console.log('✓ Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();