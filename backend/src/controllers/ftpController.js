const { validationResult } = require('express-validator');
const { HostingAccount, FTPAccount } = require('../models');
const { hashPassword } = require('../utils/password');
const {
  ensureFTPHome,
  createSystemFTPUser,
  setSystemFTPPassword,
  setSystemFTPStatus,
  deleteSystemFTPUser,
} = require('../services/ftpService');

async function ensureAccount(userId) {
  const account = await HostingAccount.findOne({ where: { userId } });
  if (!account) throw new Error('Hosting account not found');
  return account;
}

const listFTP = async (req, res) => {
  try {
    const account = await ensureAccount(req.user.id);
    const items = await FTPAccount.findAll({ where: { accountId: account.id }, order: [['createdAt', 'ASC']] });
    res.json({ items });
  } catch (err) {
    console.error('List FTP error:', err);
    res.status(400).json({ message: err.message || 'Failed to list FTP accounts' });
  }
};

const createFTP = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { username, password, homeDir = '' } = req.body;
  try {
    const account = await ensureAccount(req.user.id);
    const exists = await FTPAccount.findOne({ where: { username } });
    if (exists) return res.status(409).json({ message: 'Username already exists' });

    // Ensure home directory exists under the user's storage
    const absHome = await ensureFTPHome(req.user.id, homeDir);

    // Stub system user creation for development
    await createSystemFTPUser(username, absHome);
    await setSystemFTPPassword(username, password);

    const passwordHash = await hashPassword(password);
    const rec = await FTPAccount.create({
      accountId: account.id,
      username,
      passwordHash,
      homeDir,
      status: 'active',
    });

    res.status(201).json({ item: { id: rec.id, username: rec.username, homeDir: rec.homeDir, status: rec.status } });
  } catch (err) {
    console.error('Create FTP error:', err);
    res.status(400).json({ message: err.message || 'Failed to create FTP account' });
  }
};

const updateFTPStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id } = req.params;
  const { status } = req.body;
  try {
    const account = await ensureAccount(req.user.id);
    const rec = await FTPAccount.findOne({ where: { id, accountId: account.id } });
    if (!rec) return res.status(404).json({ message: 'FTP account not found' });

    await setSystemFTPStatus(rec.username, status);
    rec.status = status;
    await rec.save();

    res.json({ item: { id: rec.id, username: rec.username, homeDir: rec.homeDir, status: rec.status } });
  } catch (err) {
    console.error('Update FTP status error:', err);
    res.status(400).json({ message: err.message || 'Failed to update FTP status' });
  }
};

const resetFTPPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id } = req.params;
  const { password } = req.body;
  try {
    const account = await ensureAccount(req.user.id);
    const rec = await FTPAccount.findOne({ where: { id, accountId: account.id } });
    if (!rec) return res.status(404).json({ message: 'FTP account not found' });

    await setSystemFTPPassword(rec.username, password);
    rec.passwordHash = await hashPassword(password);
    await rec.save();

    res.json({ ok: true });
  } catch (err) {
    console.error('Reset FTP password error:', err);
    res.status(400).json({ message: err.message || 'Failed to reset password' });
  }
};

const deleteFTP = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id } = req.params;
  try {
    const account = await ensureAccount(req.user.id);
    const rec = await FTPAccount.findOne({ where: { id, accountId: account.id } });
    if (!rec) return res.status(404).json({ message: 'FTP account not found' });

    await deleteSystemFTPUser(rec.username);
    await rec.destroy();

    res.status(204).send();
  } catch (err) {
    console.error('Delete FTP error:', err);
    res.status(400).json({ message: err.message || 'Failed to delete FTP account' });
  }
};

module.exports = { listFTP, createFTP, updateFTPStatus, resetFTPPassword, deleteFTP };
