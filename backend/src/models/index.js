const { sequelize } = require('../config/database');
const defineUser = require('./User');
const defineHostingAccount = require('./HostingAccount');
const defineDomain = require('./Domain');
const defineFTPAccount = require('./FTPAccount');
const defineSSLCert = require('./SSLCert');
const defineSqlDatabase = require('./SqlDatabase');
const defineSqlDbUser = require('./SqlDbUser');
const defineEmailAccount = require('./EmailAccount');
const defineEmailForwarder = require('./EmailForwarder');

const User = defineUser(sequelize);
const HostingAccount = defineHostingAccount(sequelize);
const Domain = defineDomain(sequelize);
const FTPAccount = defineFTPAccount(sequelize);
const SSLCert = defineSSLCert(sequelize);
const SqlDatabase = defineSqlDatabase(sequelize);
const SqlDbUser = defineSqlDbUser(sequelize);
const EmailAccount = defineEmailAccount(sequelize);
const EmailForwarder = defineEmailForwarder(sequelize);

// Associations
User.hasOne(HostingAccount, { as: 'hostingAccount', foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
HostingAccount.belongsTo(User, { as: 'user', foreignKey: { name: 'userId', allowNull: false } });

HostingAccount.hasMany(Domain, { as: 'domains', foreignKey: { name: 'accountId', allowNull: false }, onDelete: 'CASCADE' });
Domain.belongsTo(HostingAccount, { as: 'account', foreignKey: { name: 'accountId', allowNull: false } });

HostingAccount.hasMany(FTPAccount, { as: 'ftpAccounts', foreignKey: { name: 'accountId', allowNull: false }, onDelete: 'CASCADE' });
FTPAccount.belongsTo(HostingAccount, { as: 'account', foreignKey: { name: 'accountId', allowNull: false } });

// SSL: One active cert per domain (we keep revocations in same table)
Domain.hasOne(SSLCert, { as: 'sslCert', foreignKey: { name: 'domainId', allowNull: false }, onDelete: 'CASCADE' });
SSLCert.belongsTo(Domain, { as: 'domain', foreignKey: { name: 'domainId', allowNull: false } });

// Databases
HostingAccount.hasMany(SqlDatabase, { as: 'databases', foreignKey: { name: 'accountId', allowNull: false }, onDelete: 'CASCADE' });
SqlDatabase.belongsTo(HostingAccount, { as: 'account', foreignKey: { name: 'accountId', allowNull: false } });
SqlDatabase.hasMany(SqlDbUser, { as: 'users', foreignKey: { name: 'databaseId', allowNull: false }, onDelete: 'CASCADE' });
SqlDbUser.belongsTo(SqlDatabase, { as: 'database', foreignKey: { name: 'databaseId', allowNull: false } });

// Email
Domain.hasMany(EmailAccount, { as: 'emailAccounts', foreignKey: { name: 'domainId', allowNull: false }, onDelete: 'CASCADE' });
EmailAccount.belongsTo(Domain, { as: 'domain', foreignKey: { name: 'domainId', allowNull: false } });
Domain.hasMany(EmailForwarder, { as: 'emailForwarders', foreignKey: { name: 'sourceDomainId', allowNull: false }, onDelete: 'CASCADE' });
EmailForwarder.belongsTo(Domain, { as: 'sourceDomain', foreignKey: { name: 'sourceDomainId', allowNull: false } });

module.exports = {
  sequelize,
  User,
  HostingAccount,
  Domain,
  FTPAccount,
  SSLCert,
  SqlDatabase,
  SqlDbUser,
  EmailAccount,
  EmailForwarder,
};
