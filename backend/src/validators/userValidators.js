const { body } = require('express-validator');

const updateMeValidator = [
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('newPassword').optional().isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  body('currentPassword').custom((value, { req }) => {
    // Require currentPassword if changing email or password
    if ((req.body.email && req.body.email.length) || (req.body.newPassword && req.body.newPassword.length)) {
      if (!value || !value.length) {
        throw new Error('Current password is required to make changes');
      }
    }
    return true;
  })
];

module.exports = { updateMeValidator };
