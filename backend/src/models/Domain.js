const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Domain = sequelize.define('Domain', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('main', 'addon', 'subdomain', 'parked'),
      allowNull: false,
      defaultValue: 'main',
    },
  }, {
    tableName: 'domains',
    underscored: true,
  });

  return Domain;
};
