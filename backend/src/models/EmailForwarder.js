const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EmailForwarder = sequelize.define('EmailForwarder', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sourceDomainId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'source_domain_id',
    },
    sourceLocalPart: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: 'source_local_part',
      validate: {
        is: /^[a-zA-Z0-9._-]+$/,
      },
    },
    destinationEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'destination_email',
      validate: {
        isEmail: true,
      },
    },
  }, {
    tableName: 'email_forwarders',
    underscored: true,
    indexes: [
      { unique: true, fields: ['source_domain_id', 'source_local_part', 'destination_email'] },
    ],
  });

  return EmailForwarder;
};
