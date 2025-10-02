# Quick Setup Instructions

## Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Git

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
1. Start MySQL service
2. Create database: `CREATE DATABASE polling_system;`
3. Run the setup script: `mysql -u root -p < database-setup.sql`

### 3. Environment Configuration
Create `.env` file in root directory:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=polling_system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
NODE_ENV=development
PORT=3001
```

### 4. Start Application
```bash
# Windows
start.bat

# Linux/Mac
./start.sh

# Or manually
npm run start:dev
```

### 5. Access Application
- Open browser: `http://localhost:3001`
- Default admin: `admin@example.com` / `admin123`

## Testing the System

### 1. Register a New User
- Click "Register" tab
- Fill in user details
- Register as regular user

### 2. Admin Functions (Login as admin)
- Create new polls (public/private)
- Set poll duration (max 2 hours)
- Add users to private polls
- Manage existing polls

### 3. User Functions
- View public polls
- Vote on active polls
- View poll results
- Check voting history

## API Testing
Use the provided cURL examples in README.md to test API endpoints directly.

## Troubleshooting

### Common Issues
1. **Database Connection Error**: Check PostgreSQL is running and credentials are correct
2. **Port Already in Use**: Change PORT in .env file
3. **JWT Token Issues**: Ensure JWT_SECRET is set
4. **CORS Errors**: Check CORS configuration in main.ts

### Logs
Check console output for detailed error messages and debugging information.

## Production Deployment
1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure production database
4. Set up SSL/TLS
5. Use reverse proxy (nginx)

## Support
Refer to the comprehensive README.md for detailed documentation and troubleshooting guide.
