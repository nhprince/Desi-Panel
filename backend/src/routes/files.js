const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { listHandler, rootListHandler, uploadHandler, deleteHandler, mkdirHandler, renameHandler, moveHandler, copyHandler, downloadHandler } = require('../controllers/fileController');

// List root
router.get('/', authMiddleware, rootListHandler);
// Upload (uses ?dir=relative/path)
router.post('/upload', authMiddleware, ...uploadHandler);
// Make directory (?dir=relative/path)
router.post('/mkdir', authMiddleware, mkdirHandler);
// Rename { path, newName }
router.post('/rename', authMiddleware, renameHandler);
// Move { from, toDir }
router.post('/move', authMiddleware, moveHandler);
// Copy { from, toDir }
router.post('/copy', authMiddleware, copyHandler);
// Download file
router.get('/download/*', authMiddleware, downloadHandler);
// List any subpath (must be after /upload)
router.get('/*', authMiddleware, listHandler);
// Delete file or dir in subpath
router.delete('/*', authMiddleware, deleteHandler);

module.exports = router;
