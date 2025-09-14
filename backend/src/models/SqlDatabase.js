const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SqlDatabase = sequelize.define('SqlDatabase', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    engine: {
      type: DataTypes.ENUM('mysql', 'mariadb'),
      allowNull: false,
      defaultValue: 'mariadb',
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'deleting'),
      allowNull: false,
      defaultValue: 'active',
    },
  }, {
    tableName: 'sql_databases',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['account_id', 'name'],
      },
    ],
  });

  return SqlDatabase;
};
