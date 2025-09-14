const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const ctrl = require('../controllers/emailController');
const v = require('../validators/emailValidators');

// Email accounts
router.get('/accounts', authMiddleware, v.listAccountsQuery, ctrl.listEmailAccounts);
router.post('/accounts', authMiddleware, v.createEmailAccountValidator, ctrl.createEmailAccount);
router.patch('/accounts/:id/status', authMiddleware, v.updateEmailStatusValidator, ctrl.updateEmailStatus);
router.post('/accounts/:id/reset-password', authMiddleware, v.resetEmailPasswordValidator, ctrl.resetEmailPassword);
router.delete('/accounts/:id', authMiddleware, v.emailAccountIdParam, ctrl.deleteEmailAccount);

// Forwarders
router.get('/forwarders', authMiddleware, v.listForwardersQuery, ctrl.listForwarders);
router.post('/forwarders', authMiddleware, v.createForwarderValidator, ctrl.createForwarder);
router.delete('/forwarders/:id', authMiddleware, v.forwarderIdParam, ctrl.deleteForwarder);

module.exports = router;
