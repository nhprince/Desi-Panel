const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { listDomains, issue, revoke, remove } = require('../controllers/sslController');
const { issueValidator, sslIdParam } = require('../validators/sslValidators');

router.get('/domains', authMiddleware, listDomains);
router.post('/issue', authMiddleware, issueValidator, issue);
router.post('/:id/revoke', authMiddleware, sslIdParam, revoke);
router.delete('/:id', authMiddleware, sslIdParam, remove);

module.exports = router;
