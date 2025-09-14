const path = require('path');
const fsp = require('fs/promises');
const { getUserRoot, resolveUserPath } = require('./fileService');

async function ensureFTPHome(userId, relHome = '') {
  const { target } = resolveUserPath(userId, relHome || '.');
  await fsp.mkdir(target, { recursive: true });
  return target;
}

// The following system-level operations are stubbed for development.
// In production, integrate with Linux user management and vsftpd.
async function createSystemFTPUser(username, homeAbsPath) {
  console.log(`[FTP STUB] create user ${username} at ${homeAbsPath}`);
}

async function setSystemFTPPassword(username, password) {
  console.log(`[FTP STUB] set password for ${username}`);
}

async function setSystemFTPStatus(username, status) {
  console.log(`[FTP STUB] set status for ${username} => ${status}`);
}

async function deleteSystemFTPUser(username) {
  console.log(`[FTP STUB] delete user ${username}`);
}

module.exports = {
  ensureFTPHome,
  createSystemFTPUser,
  setSystemFTPPassword,
  setSystemFTPStatus,
  deleteSystemFTPUser,
};
