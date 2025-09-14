const { body, param } = require('express-validator');

const createDomainValidator = [
  body('name').isFQDN().withMessage('Valid domain name is required'),
  body('type').isIn(['addon', 'subdomain', 'parked']).withMessage('Type must be addon, subdomain, or parked'),
];

const deleteDomainValidator = [
  param('id').isUUID().withMessage('Valid domain id is required'),
];

module.exports = { createDomainValidator, deleteDomainValidator };
