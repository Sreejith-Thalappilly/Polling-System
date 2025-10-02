const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vote = sequelize.define('Vote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  selectedOption: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      len: [1, 500]
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  pollId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'polls',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'votes',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'pollId']
    }
  ]
});

module.exports = Vote;
