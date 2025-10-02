const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PollAllowedUser = sequelize.define('PollAllowedUser', {
  pollId: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'polls',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'poll_allowed_users',
  timestamps: false
});

module.exports = PollAllowedUser;
