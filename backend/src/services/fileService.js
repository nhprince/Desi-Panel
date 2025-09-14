const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const FILES_ROOT = process.env.FILES_ROOT || path.resolve(process.cwd(), 'storage');

function getUserRoot(userId) {
  return path.join(FILES_ROOT, 'users', userId);
}

function resolveUserPath(userId, relativePath = '') {
  const userRoot = getUserRoot(userId);
  const target = path.resolve(userRoot, relativePath || '.');
  const root = path.resolve(userRoot);
  if (!target.startsWith(root + path.sep) && target !== root) {
    throw new Error('Path traversal attempt detected');
  }
  return { root, target };
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function list(userId, relPath = '') {
  const { root, target } = resolveUserPath(userId, relPath);
  await ensureDir(target);
  const entries = await fsp.readdir(target, { withFileTypes: true });
  const items = await Promise.all(entries.map(async (ent) => {
    const full = path.join(target, ent.name);
    const stat = await fsp.stat(full);
    return {
      name: ent.name,
      type: ent.isDirectory() ? 'dir' : 'file',
      size: stat.size,
      mtime: stat.mtimeMs,
    };
  }));
  const relative = path.relative(root, target).replace(/\\/g, '/');
  return { path: relative, items };
}

async function remove(userId, relPath) {
  if (!relPath || relPath.trim() === '') throw new Error('Path is required');
  const { target } = resolveUserPath(userId, relPath);
  await fsp.rm(target, { recursive: true, force: true });
}

async function saveFile(userId, relDir, file) {
  const { target } = resolveUserPath(userId, relDir || '.');
  await ensureDir(target);
  const dest = path.join(target, file.originalname);
  // If using memory storage, file.buffer exists. If disk, file.path exists.
  if (file.buffer) {
    await fsp.writeFile(dest, file.buffer);
  } else if (file.path) {
    await fsp.rename(file.path, dest);
  } else {
    throw new Error('Unsupported upload payload');
  }
  return { filename: file.originalname };
}

async function makeDir(userId, relDir, name) {
  if (!name || /[\\/]/.test(name)) throw new Error('Invalid folder name');
  const { target } = resolveUserPath(userId, relDir || '.');
  const dirPath = path.join(target, name);
  await ensureDir(dirPath);
  return { name };
}

async function renamePath(userId, relPath, newName) {
  if (!newName || /[\\/]/.test(newName)) throw new Error('Invalid new name');
  if (!relPath || relPath.trim() === '') throw new Error('Path is required');
  const { target } = resolveUserPath(userId, relPath);
  const parent = path.dirname(target);
  const dest = path.join(parent, newName);
  await fsp.rename(target, dest);
}

async function movePath(userId, fromRel, toRelDir) {
  if (!fromRel) throw new Error('Source path required');
  const { target: src } = resolveUserPath(userId, fromRel);
  const { target: toDir } = resolveUserPath(userId, toRelDir || '.');
  await ensureDir(toDir);
  const dest = path.join(toDir, path.basename(src));
  await fsp.rename(src, dest);
}

async function copyRecursive(src, dest) {
  try {
    // Node 16.7+ supports fsp.cp
    if (typeof fsp.cp === 'function') {
      await fsp.cp(src, dest, { recursive: true });
      return;
    }
  } catch (e) {
    // fallback to manual
  }
  const stat = await fsp.stat(src);
  if (stat.isDirectory()) {
    await fsp.mkdir(dest, { recursive: true });
    const entries = await fsp.readdir(src, { withFileTypes: true });
    for (const ent of entries) {
      const s = path.join(src, ent.name);
      const d = path.join(dest, ent.name);
      if (ent.isDirectory()) await copyRecursive(s, d);
      else await fsp.copyFile(s, d);
    }
  } else {
    await fsp.copyFile(src, dest);
  }
}

async function copyPath(userId, fromRel, toRelDir) {
  if (!fromRel) throw new Error('Source path required');
  const { target: src } = resolveUserPath(userId, fromRel);
  const { target: toDir } = resolveUserPath(userId, toRelDir || '.');
  await ensureDir(toDir);
  const dest = path.join(toDir, path.basename(src));
  await copyRecursive(src, dest);
}

function getAbsolutePathFor(userId, relPath) {
  if (!relPath) throw new Error('Path is required');
  const { target } = resolveUserPath(userId, relPath);
  return target;
}

module.exports = { list, remove, saveFile, makeDir, renamePath, movePath, copyPath, getAbsolutePathFor, getUserRoot, resolveUserPath };
