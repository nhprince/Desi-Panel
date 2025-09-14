const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { listDomains, createDomain, deleteDomain } = require('../controllers/domainController');
const { createDomainValidator, deleteDomainValidator } = require('../validators/domainValidators');

router.get('/', authMiddleware, listDomains);
router.post('/', authMiddleware, createDomainValidator, createDomain);
router.delete('/:id', authMiddleware, deleteDomainValidator, deleteDomain);

module.exports = router;
