// Development stubs for database provisioning
// In production, integrate with MySQL/MariaDB servers and run real SQL commands

async function createDatabase(engine, name) {
  console.log(`[DB STUB] create database ${name} on ${engine}`)
}

async function deleteDatabase(engine, name) {
  console.log(`[DB STUB] delete database ${name} on ${engine}`)
}

async function createDbUser(engine, dbName, username, password, host = '%') {
  console.log(`[DB STUB] create user ${username}@${host} for db ${dbName} on ${engine}`)
}

async function resetDbUserPassword(engine, dbName, username, password) {
  console.log(`[DB STUB] reset password for ${username} on ${engine}`)
}

async function deleteDbUser(engine, dbName, username, host = '%') {
  console.log(`[DB STUB] delete user ${username}@${host} for db ${dbName} on ${engine}`)
}

module.exports = {
  createDatabase,
  deleteDatabase,
  createDbUser,
  resetDbUserPassword,
  deleteDbUser,
}
