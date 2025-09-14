const { validationResult } = require('express-validator');
const { HostingAccount, Domain, SSLCert } = require('../models');
const { generateSelfSigned } = require('../services/sslService');

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

const listDomains = async (req, res) => {
  try {
    const account = await ensureAccount(req.user.id);
    const domains = await Domain.findAll({
      where: { accountId: account.id },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'name', 'type', 'createdAt'],
      include: [{
        model: SSLCert,
        as: 'sslCert',
        attributes: ['id', 'status', 'expiresAt', 'createdAt'],
      }],
    });
    res.json({ domains });
  } catch (err) {
    console.error('List SSL domains error:', err);
    res.status(400).json({ message: err.message || 'Failed to list SSL domains' });
  }
};

const issue = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { domainId } = req.body;
  try {
    const domain = await ensureDomainForUser(domainId, req.user.id);
    // Generate self-signed cert for development
    const { certPEM, keyPEM, expiresAt } = generateSelfSigned(domain.name, 90);
    // Upsert single cert per domain
    let cert = await SSLCert.findOne({ where: { domainId: domain.id } });
    if (cert) {
      cert.certPEM = certPEM;
      cert.keyPEM = keyPEM;
      cert.expiresAt = expiresAt;
      cert.status = 'active';
      await cert.save();
    } else {
      cert = await SSLCert.create({ domainId: domain.id, certPEM, keyPEM, expiresAt, status: 'active' });
    }
    res.status(201).json({ cert: { id: cert.id, status: cert.status, expiresAt: cert.expiresAt } });
  } catch (err) {
    console.error('Issue SSL error:', err);
    res.status(400).json({ message: err.message || 'Failed to issue SSL' });
  }
};

const revoke = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id } = req.params;
  try {
    const account = await ensureAccount(req.user.id);
    const cert = await SSLCert.findOne({
      where: { id },
      include: [{ model: Domain, as: 'domain', where: { accountId: account.id } }],
    });
    if (!cert) return res.status(404).json({ message: 'SSL cert not found' });
    cert.status = 'revoked';
    await cert.save();
    res.json({ cert: { id: cert.id, status: cert.status, expiresAt: cert.expiresAt } });
  } catch (err) {
    console.error('Revoke SSL error:', err);
    res.status(400).json({ message: err.message || 'Failed to revoke SSL' });
  }
};

const remove = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id } = req.params;
  try {
    const account = await ensureAccount(req.user.id);
    const cert = await SSLCert.findOne({
      where: { id },
      include: [{ model: Domain, as: 'domain', where: { accountId: account.id } }],
    });
    if (!cert) return res.status(404).json({ message: 'SSL cert not found' });
    await cert.destroy();
    res.status(204).send();
  } catch (err) {
    console.error('Delete SSL error:', err);
    res.status(400).json({ message: err.message || 'Failed to delete SSL' });
  }
};

module.exports = { listDomains, issue, revoke, remove };
