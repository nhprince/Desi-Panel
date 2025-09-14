const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SSLCert = sequelize.define('SSLCert', {
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
    certPEM: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'cert_pem',
    },
    keyPEM: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'key_pem',
    },
    status: {
      type: DataTypes.ENUM('active', 'revoked'),
      allowNull: false,
      defaultValue: 'active',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at',
    },
  }, {
    tableName: 'ssl_certs',
    underscored: true,
  });

  return SSLCert;
};
