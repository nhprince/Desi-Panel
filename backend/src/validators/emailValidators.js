const { body, param, query } = require('express-validator');

const emailLocalPart = /^[a-zA-Z0-9._-]+$/;

const createEmailAccountValidator = [
  body('domainId').isUUID().withMessage('Valid domainId is required'),
  body('localPart').isString().trim().matches(emailLocalPart).isLength({ min: 1, max: 64 }).withMessage('Invalid localPart'),
  body('password').isString().isLength({ min: 8 }).withMessage('Password min length 8'),
  body('quotaMb').optional().isInt({ min: 1, max: 1024 * 100 }).withMessage('quotaMb must be a positive integer'),
];

const emailAccountIdParam = [param('id').isUUID().withMessage('Valid id is required')];

const updateEmailStatusValidator = [
  ...emailAccountIdParam,
  body('status').isIn(['active', 'disabled']).withMessage('status must be active or disabled'),
];

const resetEmailPasswordValidator = [
  ...emailAccountIdParam,
  body('password').isString().isLength({ min: 8 }).withMessage('Password min length 8'),
];

const listAccountsQuery = [
  query('domainId').optional().isUUID().withMessage('domainId must be UUID'),
];

const createForwarderValidator = [
  body('sourceDomainId').isUUID().withMessage('Valid sourceDomainId is required'),
  body('sourceLocalPart').isString().trim().matches(emailLocalPart).isLength({ min: 1, max: 64 }).withMessage('Invalid local part'),
  body('destinationEmail').isEmail().withMessage('Valid destination email is required'),
];

const forwarderIdParam = [param('id').isUUID().withMessage('Valid id is required')];

const listForwardersQuery = [
  query('domainId').optional().isUUID().withMessage('domainId must be UUID'),
];

module.exports = {
  createEmailAccountValidator,
  emailAccountIdParam,
  updateEmailStatusValidator,
  resetEmailPasswordValidator,
  listAccountsQuery,
  createForwarderValidator,
  forwarderIdParam,
  listForwardersQuery,
};
