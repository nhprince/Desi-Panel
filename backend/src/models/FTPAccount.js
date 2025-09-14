const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FTPAccount = sequelize.define('FTPAccount', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-zA-Z0-9._-]+$/,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    homeDir: {
      type: DataTypes.STRING(1024),
      allowNull: false,
      defaultValue: '', // relative to user's root
      field: 'home_dir',
    },
    status: {
      type: DataTypes.ENUM('active', 'disabled'),
      allowNull: false,
      defaultValue: 'active',
    },
  }, {
    tableName: 'ftp_accounts',
    underscored: true,
  });

  return FTPAccount;
};
