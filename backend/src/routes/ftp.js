const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { listFTP, createFTP, updateFTPStatus, resetFTPPassword, deleteFTP } = require('../controllers/ftpController');
const { createFTPValidator, updateStatusValidator, resetPasswordValidator, ftpIdParam } = require('../validators/ftpValidators');

router.get('/', authMiddleware, listFTP);
router.post('/', authMiddleware, createFTPValidator, createFTP);
router.patch('/:id/status', authMiddleware, updateStatusValidator, updateFTPStatus);
router.post('/:id/reset-password', authMiddleware, resetPasswordValidator, resetFTPPassword);
router.delete('/:id', authMiddleware, ftpIdParam, deleteFTP);

module.exports = router;
