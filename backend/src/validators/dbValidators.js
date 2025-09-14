const { body, param } = require('express-validator');

const createDbValidator = [
  body('engine').isIn(['mysql', 'mariadb']).withMessage('engine must be mysql or mariadb'),
  body('name')
    .isString()
    .trim()
    .isLength({ min: 3, max: 64 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('name must be 3-64 chars, alphanumeric/underscore only'),
];

const dbIdParam = [param('id').isUUID().withMessage('Valid database id is required')];

const createUserValidator = [
  ...dbIdParam,
  body('username')
    .isString()
    .trim()
    .isLength({ min: 3, max: 32 })
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('username must be 3-32 chars, letters/numbers/._-'),
  body('password').isString().isLength({ min: 8 }).withMessage('password min length 8'),
  body('host')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .matches(/^[^\s]+$/)
    .withMessage('host must not contain spaces'),
];

const userIdParam = [param('userId').isUUID().withMessage('Valid user id is required')];

const resetUserPasswordValidator = [
  ...userIdParam,
  body('password').isString().isLength({ min: 8 }).withMessage('password min length 8'),
];

module.exports = {
  createDbValidator,
  dbIdParam,
  createUserValidator,
  userIdParam,
  resetUserPasswordValidator,
};
