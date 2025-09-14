const { validationResult } = require('express-validator');
const { HostingAccount, Domain, EmailAccount, EmailForwarder } = require('../models');
const { hashPassword } = require('../utils/password');
const emailSvc = require('../services/emailService');

async function ensureAccount(userId) {
  const account = await HostingAccount.findOne({ where: { userId } });
  if (!account) throw new Error('Hosting account not found');
  return account;
}

async function ensureDomainForUser(domainId, userId) {
  const account = await ensureAccount(userId);
  const domain = await Domain.findOne({ where: { id: domainId, accountId: account.id } });
  if (!domain) throw new Error('Domain not found');
  return domain;
}

// Email Accounts
const listEmailAccounts = async (req, res) => {
  try {
    const account = await ensureAccount(req.user.id);
    const whereDomain = { accountId: account.id };
    if (req.query.domainId) {
      whereDomain.id = req.query.domainId;
    }
    const accounts = await EmailAccount.findAll({
      include: [{ model: Domain, as: 'domain', where: whereDomain, attributes: ['id', 'name'] }],
      order: [['createdAt', 'ASC']],
    });
    const data = accounts.map((a) => ({ id: a.id, domainId: a.domainId, localPart: a.localPart, quotaMb: a.quotaMb, status: a.status, email: `${a.localPart}@${a.domain.name}` }));
    res.json({ accounts: data });
  } catch (err) {
    console.error('List email accounts error:', err);
    res.status(400).json({ message: err.message || 'Failed to list email accounts' });
  }
};

const createEmailAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { domainId, localPart, password, quotaMb = 1024 } = req.body;
  try {
    const domain = await ensureDomainForUser(domainId, req.user.id);
    const exists = await EmailAccount.findOne({ where: { domainId, localPart } });
    if (exists) return res.status(409).json({ message: 'Email account already exists' });

    await emailSvc.provisionMailbox(domain.name, localPart, quotaMb);
    await emailSvc.setMailboxPassword(domain.name, localPart, password);

    const passwordHash = await hashPassword(password);
    const rec = await EmailAccount.create({ domainId, localPart, passwordHash, quotaMb, status: 'active' });
    res.status(201).json({ account: { id: rec.id, email: `${rec.localPart}@${domain.name}`, quotaMb: rec.quotaMb, status: rec.status } });
  } catch (err) {
    console.error('Create email account error:', err);
    res.status(400).json({ message: err.message || 'Failed to create email account' });
  }
};

const updateEmailStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id } = req.params;
  const { status } = req.body;
  try {
    const account = await ensureAccount(req.user.id);
    const rec = await EmailAccount.findOne({
      where: { id },
      include: [{ model: Domain, as: 'domain', where: { accountId: account.id } }],
    });
    if (!rec) return res.status(404).json({ message: 'Email account not found' });

    await emailSvc.setMailboxStatus(rec.domain.name, rec.localPart, status);
    rec.status = status;
    await rec.save();
    res.json({ account: { id: rec.id, email: `${rec.localPart}@${rec.domain.name}`, status: rec.status } });
  } catch (err) {
    console.error('Update email status error:', err);
    res.status(400).json({ message: err.message || 'Failed to update email status' });
  }
};

const resetEmailPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id } = req.params;
  const { password } = req.body;
  try {
    const account = await ensureAccount(req.user.id);
    const rec = await EmailAccount.findOne({
      where: { id },
      include: [{ model: Domain, as: 'domain', where: { accountId: account.id } }],
    });
    if (!rec) return res.status(404).json({ message: 'Email account not found' });

    await emailSvc.setMailboxPassword(rec.domain.name, rec.localPart, password);
    rec.passwordHash = await hashPassword(password);
    await rec.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('Reset email password error:', err);
    res.status(400).json({ message: err.message || 'Failed to reset email password' });
  }
};

const deleteEmailAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id } = req.params;
  try {
    const account = await ensureAccount(req.user.id);
    const rec = await EmailAccount.findOne({
      where: { id },
      include: [{ model: Domain, as: 'domain', where: { accountId: account.id } }],
    });
    if (!rec) return res.status(404).json({ message: 'Email account not found' });

    await emailSvc.deleteMailbox(rec.domain.name, rec.localPart);
    await rec.destroy();
    res.status(204).send();
  } catch (err) {
    console.error('Delete email account error:', err);
    res.status(400).json({ message: err.message || 'Failed to delete email account' });
  }
};

// Forwarders
const listForwarders = async (req, res) => {
  try {
    const account = await ensureAccount(req.user.id);
    const whereDomain = { accountId: account.id };
    if (req.query.domainId) whereDomain.id = req.query.domainId;
    const items = await EmailForwarder.findAll({
      include: [{ model: Domain, as: 'sourceDomain', where: whereDomain, attributes: ['id', 'name'] }],
      order: [['createdAt', 'ASC']],
    });
    const data = items.map((f) => ({ id: f.id, sourceDomainId: f.sourceDomainId, sourceLocalPart: f.sourceLocalPart, destinationEmail: f.destinationEmail, sourceEmail: `${f.sourceLocalPart}@${f.sourceDomain.name}` }));
    res.json({ forwarders: data });
  } catch (err) {
    console.error('List forwarders error:', err);
    res.status(400).json({ message: err.message || 'Failed to list forwarders' });
  }
};

const createForwarder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { sourceDomainId, sourceLocalPart, destinationEmail } = req.body;
  try {
    const domain = await ensureDomainForUser(sourceDomainId, req.user.id);
    const dup = await EmailForwarder.findOne({ where: { sourceDomainId, sourceLocalPart, destinationEmail } });
    if (dup) return res.status(409).json({ message: 'Forwarder already exists' });

    await emailSvc.createForwarder(`${sourceLocalPart}@${domain.name}`, destinationEmail);

    const rec = await EmailForwarder.create({ sourceDomainId, sourceLocalPart, destinationEmail });
    res.status(201).json({ forwarder: { id: rec.id, sourceEmail: `${rec.sourceLocalPart}@${domain.name}`, destinationEmail: rec.destinationEmail } });
  } catch (err) {
    console.error('Create forwarder error:', err);
    res.status(400).json({ message: err.message || 'Failed to create forwarder' });
  }
};

const deleteForwarder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id } = req.params;
  try {
    const account = await ensureAccount(req.user.id);
    const rec = await EmailForwarder.findOne({
      where: { id },
      include: [{ model: Domain, as: 'sourceDomain', where: { accountId: account.id } }],
    });
    if (!rec) return res.status(404).json({ message: 'Forwarder not found' });

    await emailSvc.deleteForwarder(`${rec.sourceLocalPart}@${rec.sourceDomain.name}`, rec.destinationEmail);

    await rec.destroy();
    res.status(204).send();
  } catch (err) {
    console.error('Delete forwarder error:', err);
    res.status(400).json({ message: err.message || 'Failed to delete forwarder' });
  }
};

module.exports = {
  listEmailAccounts,
  createEmailAccount,
  updateEmailStatus,
  resetEmailPassword,
  deleteEmailAccount,
  listForwarders,
  createForwarder,
  deleteForwarder,
};
