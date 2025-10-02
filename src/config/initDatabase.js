const { sequelize } = require('./database');
const { User, Poll, Vote, PollAllowedUser } = require('../models');

const initDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized successfully.');

    // Create default admin user if it doesn't exist
    const adminUser = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!adminUser) {
      const admin = await User.create({
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Default admin user created:', admin.email);
    }

    // Create sample polls if they don't exist
    const existingPolls = await Poll.count();
    if (existingPolls === 0) {
      const admin = await User.findOne({ where: { email: 'admin@example.com' } });
      
      if (admin) {
        const samplePolls = [
          {
            title: 'What is your favorite programming language?',
            description: 'Help us understand the community preferences for programming languages.',
            options: ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript'],
            visibility: 'public',
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
            createdById: admin.id
          },
          {
            title: 'Which framework do you prefer for web development?',
            description: 'Share your preference for web development frameworks.',
            options: ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js'],
            visibility: 'public',
            expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
            createdById: admin.id
          }
        ];

        for (const pollData of samplePolls) {
          await Poll.create(pollData);
        }
        console.log('✅ Sample polls created successfully.');
      }
    }

    console.log('🚀 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initDatabase };
