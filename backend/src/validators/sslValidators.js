const { body, param } = require('express-validator');

const issueValidator = [
  body('domainId').isUUID().withMessage('Valid domainId is required')
];

const sslIdParam = [
  param('id').isUUID().withMessage('Valid id is required')
];

module.exports = { issueValidator, sslIdParam };
