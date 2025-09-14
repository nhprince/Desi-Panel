const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HostingAccount = sequelize.define('HostingAccount', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    diskSpaceLimitMb: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10240,
      field: 'disk_space_limit_mb',
    },
    bandwidthLimitGb: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
      field: 'bandwidth_limit_gb',
    },
  }, {
    tableName: 'hosting_accounts',
    underscored: true,
  });

  return HostingAccount;
};
