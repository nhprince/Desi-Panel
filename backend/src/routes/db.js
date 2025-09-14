const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const ctrl = require('../controllers/dbController');
const v = require('../validators/dbValidators');

router.get('/', authMiddleware, ctrl.listDatabases);
router.post('/', authMiddleware, v.createDbValidator, ctrl.createDatabase);
router.delete('/:id', authMiddleware, v.dbIdParam, ctrl.deleteDatabase);

router.post('/:id/users', authMiddleware, v.createUserValidator, ctrl.createDbUser);
router.post('/users/:userId/reset-password', authMiddleware, v.resetUserPasswordValidator, ctrl.resetDbUserPassword);
router.delete('/users/:userId', authMiddleware, v.userIdParam, ctrl.deleteDbUser);

module.exports = router;
