const { validationResult } = require('express-validator');
const { HostingAccount, SqlDatabase, SqlDbUser } = require('../models');
const { hashPassword } = require('../utils/password');
const dbSvc = require('../services/dbService');

async function ensureAccount(userId) {
  const account = await HostingAccount.findOne({ where: { userId } });
  if (!account) throw new Error('Hosting account not found');
  return account;
}

const listDatabases = async (req, res) => {
  try {
    const account = await ensureAccount(req.user.id);
    const databases = await SqlDatabase.findAll({
      where: { accountId: account.id },
      order: [['createdAt', 'ASC']],
      include: [{ model: SqlDbUser, as: 'users', attributes: ['id', 'username', 'host', 'createdAt'] }],
    });
    res.json({ databases });
  } catch (err) {
    console.error('List DB error:', err);
    res.status(400).json({ message: err.message || 'Failed to list databases' });
  }
};

const createDatabase = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { engine, name } = req.body;
  try {
    const account = await ensureAccount(req.user.id);
    const exists = await SqlDatabase.findOne({ where: { accountId: account.id, name } });
    if (exists) return res.status(409).json({ message: 'Database already exists' });

    await dbSvc.createDatabase(engine, name);

    const rec = await SqlDatabase.create({ accountId: account.id, engine, name, status: 'active' });
    res.status(201).json({ database: { id: rec.id, engine: rec.engine, name: rec.name, status: rec.status } });
  } catch (err) {
    console.error('Create DB error:', err);
    res.status(400).json({ message: err.message || 'Failed to create database' });
  }
};

const deleteDatabase = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id } = req.params;
  try {
    const account = await ensureAccount(req.user.id);
    const rec = await SqlDatabase.findOne({ where: { id, accountId: account.id } });
    if (!rec) return res.status(404).json({ message: 'Database not found' });

    await dbSvc.deleteDatabase(rec.engine, rec.name);

    await rec.destroy();
    res.status(204).send();
  } catch (err) {
    console.error('Delete DB error:', err);
    res.status(400).json({ message: err.message || 'Failed to delete database' });
  }
};

const createDbUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id } = req.params; // database id
  const { username, password, host = '%' } = req.body;
  try {
    const account = await ensureAccount(req.user.id);
    const db = await SqlDatabase.findOne({ where: { id, accountId: account.id } });
    if (!db) return res.status(404).json({ message: 'Database not found' });

    const dup = await SqlDbUser.findOne({ where: { databaseId: db.id, username, host } });
    if (dup) return res.status(409).json({ message: 'DB user already exists for this host' });

    await dbSvc.createDbUser(db.engine, db.name, username, password, host);

    const passwordHash = await hashPassword(password);
    const rec = await SqlDbUser.create({ databaseId: db.id, username, passwordHash, host });
    res.status(201).json({ user: { id: rec.id, username: rec.username, host: rec.host } });
  } catch (err) {
    console.error('Create DB user error:', err);
    res.status(400).json({ message: err.message || 'Failed to create DB user' });
  }
};

const resetDbUserPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { userId } = req.params;
  const { password } = req.body;
  try {
    const account = await ensureAccount(req.user.id);
    const user = await SqlDbUser.findOne({
      where: { id: userId },
      include: [{ model: SqlDatabase, as: 'database', where: { accountId: account.id } }],
    });
    if (!user) return res.status(404).json({ message: 'DB user not found' });

    await dbSvc.resetDbUserPassword(user.database.engine, user.database.name, user.username, password);

    user.passwordHash = await hashPassword(password);
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('Reset DB user password error:', err);
    res.status(400).json({ message: err.message || 'Failed to reset DB user password' });
  }
};

const deleteDbUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { userId } = req.params;
  try {
    const account = await ensureAccount(req.user.id);
    const user = await SqlDbUser.findOne({
      where: { id: userId },
      include: [{ model: SqlDatabase, as: 'database', where: { accountId: account.id } }],
    });
    if (!user) return res.status(404).json({ message: 'DB user not found' });

    await dbSvc.deleteDbUser(user.database.engine, user.database.name, user.username, user.host);

    await user.destroy();
    res.status(204).send();
  } catch (err) {
    console.error('Delete DB user error:', err);
    res.status(400).json({ message: err.message || 'Failed to delete DB user' });
  }
};

module.exports = {
  listDatabases,
  createDatabase,
  deleteDatabase,
  createDbUser,
  resetDbUserPassword,
  deleteDbUser,
};
