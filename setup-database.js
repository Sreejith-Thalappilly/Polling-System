const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Database configuration
const sequelize = new Sequelize('polling_system', 'dbuser', '', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  logging: console.log
});

async function setupDatabase() {
  try {
    console.log('Connecting to MySQL...');
    await sequelize.authenticate();
    console.log('Connected to MySQL successfully!');

    console.log('Reading database setup script...');
    const setupSQL = fs.readFileSync(path.join(__dirname, 'database-setup.sql'), 'utf8');
    
    console.log('Executing database setup...');
    await sequelize.query(setupSQL);
    
    console.log('Database setup completed successfully!');
    console.log('Tables created and sample data inserted.');
    console.log('Default admin user: admin@example.com / admin123');
    
    await sequelize.close();
    console.log('Setup complete! You can now run: npm start');
    
  } catch (error) {
    console.error('Setup failed:', error.message);
    console.log('\nMake sure:');
    console.log('1. MySQL is running');
    console.log('2. Database "polling_system" exists');
    console.log('3. MySQL credentials are correct');
    process.exit(1);
  }
}

setupDatabase();
