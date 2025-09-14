const { body, param } = require('express-validator');

const usernameRule = body('username')
  .isString()
  .trim()
  .isLength({ min: 3, max: 32 })
  .matches(/^[a-zA-Z0-9._-]+$/)
  .withMessage('Username must be 3-32 chars and only contain letters, numbers, dot, underscore, hyphen');

const passwordRule = body('password')
  .isString()
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters');

const homeDirRule = body('homeDir')
  .optional()
  .isString()
  .isLength({ max: 256 })
  .custom((v) => {
    if (v.startsWith('/') || v.includes('..')) throw new Error('homeDir must be a relative path without ..');
    return true;
  });

const createFTPValidator = [usernameRule, passwordRule, homeDirRule];

const ftpIdParam = [param('id').isUUID().withMessage('Valid id is required')];

const updateStatusValidator = [
  ...ftpIdParam,
  body('status').isIn(['active', 'disabled']).withMessage('status must be active or disabled'),
];

const resetPasswordValidator = [
  ...ftpIdParam,
  passwordRule,
];

module.exports = {
  createFTPValidator,
  updateStatusValidator,
  resetPasswordValidator,
  ftpIdParam,
};
