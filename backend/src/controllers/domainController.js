const { validationResult } = require('express-validator');
const { User, HostingAccount, Domain } = require('../models');

async function ensureAccount(userId) {
  const account = await HostingAccount.findOne({ where: { userId } });
  if (!account) throw new Error('Hosting account not found');
  return account;
}

const listDomains = async (req, res) => {
  try {
    const account = await ensureAccount(req.user.id);
    const domains = await Domain.findAll({ where: { accountId: account.id }, order: [['createdAt', 'ASC']] });
    res.json({ domains });
  } catch (err) {
    console.error('List domains error:', err);
    res.status(400).json({ message: err.message || 'Failed to list domains' });
  }
};

const createDomain = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, type } = req.body;
  try {
    const account = await ensureAccount(req.user.id);
    const exists = await Domain.findOne({ where: { accountId: account.id, name } });
    if (exists) return res.status(409).json({ message: 'Domain already exists' });
    const domain = await Domain.create({ accountId: account.id, name, type });
    res.status(201).json({ domain });
  } catch (err) {
    console.error('Create domain error:', err);
    res.status(400).json({ message: err.message || 'Failed to create domain' });
  }
};

const deleteDomain = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id } = req.params;
  try {
    const account = await ensureAccount(req.user.id);
    const deleted = await Domain.destroy({ where: { id, accountId: account.id } });
    if (!deleted) return res.status(404).json({ message: 'Domain not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Delete domain error:', err);
    res.status(400).json({ message: err.message || 'Failed to delete domain' });
  }
};

module.exports = { listDomains, createDomain, deleteDomain };
