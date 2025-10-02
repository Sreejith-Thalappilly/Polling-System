const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Poll = sequelize.define('Poll', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      len: [1, 500]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 2000]
    }
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidOptions(value) {
        if (!Array.isArray(value) || value.length < 2) {
          throw new Error('Poll must have at least 2 options');
        }
        value.forEach(option => {
          if (typeof option !== 'string' || option.trim().length === 0) {
            throw new Error('All options must be non-empty strings');
          }
        });
      }
    }
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'public',
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isFuture(value) {
        if (new Date(value) <= new Date()) {
          throw new Error('Expiry date must be in the future');
        }
      },
      isWithinLimit(value) {
        const maxExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
        if (new Date(value) > maxExpiry) {
          throw new Error('Poll duration cannot exceed 2 hours');
        }
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'polls',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Instance methods
Poll.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

Poll.prototype.canVote = function() {
  return this.isActive && !this.isExpired();
};

Poll.prototype.getResults = function(votes = []) {
  if (votes.length === 0) {
    return this.options.map(option => ({ option, votes: 0, percentage: 0 }));
  }

  const voteCounts = votes.reduce((acc, vote) => {
    acc[vote.selectedOption] = (acc[vote.selectedOption] || 0) + 1;
    return acc;
  }, {});

  return this.options.map(option => {
    const votes = voteCounts[option] || 0;
    const percentage = votes.length > 0 ? (votes / votes.length) * 100 : 0;
    return { option, votes, percentage: Math.round(percentage * 100) / 100 };
  });
};

module.exports = Poll;
