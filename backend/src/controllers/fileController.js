const multer = require('multer');
const path = require('path');
const { list, remove, saveFile, makeDir, renamePath, movePath, copyPath, getAbsolutePathFor } = require('../services/fileService');

// Use memory storage so we can control final destination
const upload = multer({ storage: multer.memoryStorage() });

const listHandler = async (req, res) => {
  try {
    const rel = (req.params[0] || '').replace(/^\/+|\/+$/g, '');
    const data = await list(req.user.id, rel);
    res.json(data);
  } catch (err) {
    console.error('List files error:', err);
    res.status(400).json({ message: err.message || 'Failed to list files' });
  }
};

const rootListHandler = async (req, res) => {
  try {
    const data = await list(req.user.id, '');
    res.json(data);
  } catch (err) {
    console.error('List root files error:', err);
    res.status(400).json({ message: err.message || 'Failed to list files' });
  }
};

const uploadHandler = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
      const dir = (req.query.dir || '').toString();
      const info = await saveFile(req.user.id, dir, req.file);
      res.status(201).json(info);
    } catch (err) {
      console.error('Upload error:', err);
      res.status(400).json({ message: err.message || 'Failed to upload file' });
    }
  }
];

const deleteHandler = async (req, res) => {
  try {
    const rel = (req.params[0] || '').replace(/^\/+|\/+$/g, '');
    if (!rel) return res.status(400).json({ message: 'Path required' });
    await remove(req.user.id, rel);
    res.status(204).send();
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(400).json({ message: err.message || 'Failed to delete file' });
  }
};

const mkdirHandler = async (req, res) => {
  try {
    const dir = (req.query.dir || '').toString();
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Folder name is required' });
    const result = await makeDir(req.user.id, dir, name);
    res.status(201).json(result);
  } catch (err) {
    console.error('Mkdir error:', err);
    res.status(400).json({ message: err.message || 'Failed to create folder' });
  }
};

module.exports = { listHandler, rootListHandler, uploadHandler, deleteHandler, mkdirHandler };
const renameHandler = async (req, res) => {
  try {
    const { path: relPath, newName } = req.body || {};
    if (!relPath || !newName) return res.status(400).json({ message: 'path and newName are required' });
    await renamePath(req.user.id, relPath, newName);
    res.json({ ok: true });
  } catch (err) {
    console.error('Rename error:', err);
    res.status(400).json({ message: err.message || 'Failed to rename' });
  }
};

const moveHandler = async (req, res) => {
  try {
    const { from, toDir } = req.body || {};
    if (!from) return res.status(400).json({ message: 'from is required' });
    await movePath(req.user.id, from, toDir || '');
    res.json({ ok: true });
  } catch (err) {
    console.error('Move error:', err);
    res.status(400).json({ message: err.message || 'Failed to move' });
  }
};

const copyHandler = async (req, res) => {
  try {
    const { from, toDir } = req.body || {};
    if (!from) return res.status(400).json({ message: 'from is required' });
    await copyPath(req.user.id, from, toDir || '');
    res.json({ ok: true });
  } catch (err) {
    console.error('Copy error:', err);
    res.status(400).json({ message: err.message || 'Failed to copy' });
  }
};

const downloadHandler = async (req, res) => {
  try {
    const rel = (req.params[0] || '').replace(/^\/+|\/+$/g, '');
    if (!rel) return res.status(400).json({ message: 'Path required' });
    const abs = getAbsolutePathFor(req.user.id, rel);
    const stat = await require('fs/promises').stat(abs);
    if (stat.isDirectory()) return res.status(400).json({ message: 'Cannot download a directory' });
    res.download(abs, path.basename(abs));
  } catch (err) {
    console.error('Download error:', err);
    res.status(400).json({ message: err.message || 'Failed to download' });
  }
};

module.exports = { listHandler, rootListHandler, uploadHandler, deleteHandler, mkdirHandler, renameHandler, moveHandler, copyHandler, downloadHandler };
