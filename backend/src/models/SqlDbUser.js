const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SqlDbUser = sequelize.define('SqlDbUser', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(32),
      allowNull: false,
      validate: {
        is: /^[a-zA-Z0-9._-]+$/,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    host: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '%',
    },
  }, {
    tableName: 'sql_db_users',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['database_id', 'username', 'host'],
      },
    ],
  });

  return SqlDbUser;
};
