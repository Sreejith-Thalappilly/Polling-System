const User = require('./User');
const Poll = require('./Poll');
const Vote = require('./Vote');
const PollAllowedUser = require('./PollAllowedUser');

// Define associations
User.hasMany(Poll, {
  foreignKey: 'createdById',
  as: 'polls'
});

Poll.belongsTo(User, {
  foreignKey: 'createdById',
  as: 'createdBy'
});

User.hasMany(Vote, {
  foreignKey: 'userId',
  as: 'votes'
});

Vote.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Poll.hasMany(Vote, {
  foreignKey: 'pollId',
  as: 'votes'
});

Vote.belongsTo(Poll, {
  foreignKey: 'pollId',
  as: 'poll'
});

// Many-to-many relationship for private polls
User.belongsToMany(Poll, {
  through: PollAllowedUser,
  foreignKey: 'userId',
  as: 'allowedPolls'
});

Poll.belongsToMany(User, {
  through: PollAllowedUser,
  foreignKey: 'pollId',
  as: 'allowedUsers'
});

module.exports = {
  User,
  Poll,
  Vote,
  PollAllowedUser
};
