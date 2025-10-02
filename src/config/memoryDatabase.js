// In-memory database for demonstration purposes
// This is a simple implementation that stores data in memory
// In production, you should use a proper database like PostgreSQL

let users = [];
let polls = [];
let votes = [];
let pollAllowedUsers = [];

// Helper function to generate UUIDs
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// User operations
const User = {
  async create(userData) {
    const user = {
      id: generateId(),
      ...userData,
      password: await require('bcryptjs').hash(userData.password, 12),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(user);
    return user;
  },

  async findByPk(id) {
    return users.find(user => user.id === id);
  },

  async findOne(options) {
    if (options.where && options.where.email) {
      return users.find(user => user.email === options.where.email);
    }
    return null;
  },

  async findAll(options = {}) {
    let result = [...users];
    if (options.attributes && options.attributes.exclude) {
      result = result.map(user => {
        const filtered = { ...user };
        options.attributes.exclude.forEach(attr => delete filtered[attr]);
        return filtered;
      });
    }
    return result;
  },

  async update(id, updateData) {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updateData, updatedAt: new Date() };
      return users[userIndex];
    }
    return null;
  },

  async destroy(id) {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      return true;
    }
    return false;
  }
};

// Poll operations
const Poll = {
  async create(pollData) {
    const poll = {
      id: generateId(),
      ...pollData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    polls.push(poll);
    return poll;
  },

  async findByPk(id, options = {}) {
    const poll = polls.find(p => p.id === id);
    if (!poll) return null;

    if (options.include) {
      const result = { ...poll };
      
      // Add createdBy user
      if (options.include.some(inc => inc.as === 'createdBy')) {
        result.createdBy = await User.findByPk(poll.createdById);
      }
      
      // Add allowed users
      if (options.include.some(inc => inc.as === 'allowedUsers')) {
        const allowedUserIds = pollAllowedUsers
          .filter(pau => pau.pollId === poll.id)
          .map(pau => pau.userId);
        result.allowedUsers = await Promise.all(
          allowedUserIds.map(id => User.findByPk(id))
        );
      }
      
      // Add votes
      if (options.include.some(inc => inc.as === 'votes')) {
        result.votes = votes.filter(vote => vote.pollId === poll.id);
      }
      
      return result;
    }

    return poll;
  },

  async findAll(options = {}) {
    let result = [...polls];
    
    if (options.include) {
      result = await Promise.all(result.map(async (poll) => {
        const pollWithIncludes = { ...poll };
        
        if (options.include.some(inc => inc.as === 'createdBy')) {
          pollWithIncludes.createdBy = await User.findByPk(poll.createdById);
        }
        
        if (options.include.some(inc => inc.as === 'allowedUsers')) {
          const allowedUserIds = pollAllowedUsers
            .filter(pau => pau.pollId === poll.id)
            .map(pau => pau.userId);
          pollWithIncludes.allowedUsers = await Promise.all(
            allowedUserIds.map(id => User.findByPk(id))
          );
        }
        
        if (options.include.some(inc => inc.as === 'votes')) {
          pollWithIncludes.votes = votes.filter(vote => vote.pollId === poll.id);
        }
        
        return pollWithIncludes;
      }));
    }
    
    return result;
  },

  async update(id, updateData) {
    const pollIndex = polls.findIndex(poll => poll.id === id);
    if (pollIndex !== -1) {
      polls[pollIndex] = { ...polls[pollIndex], ...updateData, updatedAt: new Date() };
      return polls[pollIndex];
    }
    return null;
  },

  async destroy(id) {
    const pollIndex = polls.findIndex(poll => poll.id === id);
    if (pollIndex !== -1) {
      polls.splice(pollIndex, 1);
      // Also remove related votes and allowed users
      votes = votes.filter(vote => vote.pollId !== id);
      pollAllowedUsers = pollAllowedUsers.filter(pau => pau.pollId !== id);
      return true;
    }
    return false;
  },

  // Instance methods
  isExpired() {
    return new Date() > this.expiresAt;
  },

  canVote() {
    return this.isActive && !this.isExpired();
  },

  getResults(votes = []) {
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
  }
};

// Vote operations
const Vote = {
  async create(voteData) {
    const vote = {
      id: generateId(),
      ...voteData,
      createdAt: new Date()
    };
    votes.push(vote);
    return vote;
  },

  async findOne(options) {
    if (options.where && options.where.userId && options.where.pollId) {
      return votes.find(vote => 
        vote.userId === options.where.userId && 
        vote.pollId === options.where.pollId
      );
    }
    return null;
  },

  async findAll(options = {}) {
    let result = [...votes];
    
    if (options.where && options.where.userId) {
      result = result.filter(vote => vote.userId === options.where.userId);
    }
    
    if (options.include) {
      result = await Promise.all(result.map(async (vote) => {
        const voteWithIncludes = { ...vote };
        
        if (options.include.some(inc => inc.as === 'poll')) {
          voteWithIncludes.poll = await Poll.findByPk(vote.pollId);
        }
        
        return voteWithIncludes;
      }));
    }
    
    return result;
  }
};

// PollAllowedUser operations
const PollAllowedUser = {
  async bulkCreate(allowedUsers, pollId) {
    const newEntries = allowedUsers.map(user => ({
      pollId,
      userId: user.id
    }));
    pollAllowedUsers.push(...newEntries);
    return newEntries;
  }
};

// Initialize with sample data
const initializeMemoryDatabase = async () => {
  // Create admin user
  const admin = await User.create({
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin'
  });

  // Create sample polls
  const poll1 = await Poll.create({
    title: 'What is your favorite programming language?',
    description: 'Help us understand the community preferences for programming languages.',
    options: ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript'],
    visibility: 'public',
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    createdById: admin.id
  });

  const poll2 = await Poll.create({
    title: 'Which framework do you prefer for web development?',
    description: 'Share your preference for web development frameworks.',
    options: ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js'],
    visibility: 'public',
    expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
    createdById: admin.id
  });

  console.log('✅ Memory database initialized with sample data');
  return { admin, poll1, poll2 };
};

module.exports = {
  User,
  Poll,
  Vote,
  PollAllowedUser,
  initializeMemoryDatabase
};
