const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EmailAccount = sequelize.define('EmailAccount', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    domainId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'domain_id',
    },
    localPart: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: 'local_part',
      validate: {
        is: /^[a-zA-Z0-9._-]+$/,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    quotaMb: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1024,
      field: 'quota_mb',
    },
    status: {
      type: DataTypes.ENUM('active', 'disabled'),
      allowNull: false,
      defaultValue: 'active',
    },
  }, {
    tableName: 'email_accounts',
    underscored: true,
    indexes: [
      { unique: true, fields: ['domain_id', 'local_part'] },
    ],
  });

  return EmailAccount;
};
