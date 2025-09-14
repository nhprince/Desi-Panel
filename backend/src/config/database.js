const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const useSqlite = (process.env.USE_SQLITE || '').toLowerCase() === '1' || (process.env.USE_SQLITE || '').toLowerCase() === 'true';
let sequelize;
if (!useSqlite && databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
  });
} else {
  // Dev-friendly SQLite fallback when DATABASE_URL is not provided
  const sqlitePath = process.env.SQLITE_PATH || path.resolve(__dirname, '../../data/dev.sqlite');
  const dir = path.dirname(sqlitePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqlitePath,
    logging: false,
  });
}

module.exports = { sequelize };
