# Polling System

A comprehensive polling system built with Nest.js backend and vanilla JavaScript frontend, featuring role-based access control, secure authentication, and real-time poll management.

## Features

### Authentication & Authorization
- **Secure User Registration & Login**: JWT-based authentication with bcrypt password hashing
- **Role-Based Access Control**: Admin and User roles with appropriate permissions
- **Token Management**: Automatic token handling with expiration and refresh capabilities

### Polling System
- **Poll Creation**: Admin-only poll creation with comprehensive validation
- **Poll Visibility**: Public and private polls with user-specific access control
- **Poll Expiry**: Configurable expiry times with maximum 2-hour duration
- **Voting System**: Secure voting with duplicate prevention and eligibility checks
- **Real-time Results**: Live poll results with percentage calculations

### Edge Case Handling
- **Input Validation**: Comprehensive validation for all user inputs
- **Security Measures**: Protection against duplicate voting, unauthorized access
- **Error Handling**: Graceful error handling with user-friendly messages
- **Token Expiration**: Automatic logout on token expiration

## 🛠️ Technology Stack

### Backend
- **Express.js**: Fast, unopinionated web framework for Node.js
- **Sequelize**: Object-Relational Mapping for database operations
- **MySQL**: Primary database
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **Express Validator**: Input validation and sanitization

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **React Hook Form**: Form handling and validation
- **Lucide React**: Beautiful icon library

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Sreejith-Thalappilly/Polling-System.git
cd Polling-System
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
1. Start MySQL service
2. Create a MySQL database named `polling_system`
3. Run the database setup script: `mysql -u root -p < database-setup.sql`
4. Update the database configuration in your environment file

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=polling_system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=development
PORT=3001
```

### 5. Run the Application

#### Backend Only
```bash
# Development mode
npm run start:dev

# Production mode
npm start
```

#### Full Stack (Backend + Frontend)
```bash
# Run both backend and frontend
npm run dev
```

#### Frontend Only
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Access Points:**
- **Backend API**: `http://localhost:3001`
- **React Frontend**: `http://localhost:5173`
- **Full Application**: `http://localhost:5173` (with backend running)

## 📊 Database Schema

### Users Table
- `id`: UUID primary key
- `email`: Unique email address
- `password`: Hashed password
- `firstName`: User's first name
- `lastName`: User's last name
- `role`: User role (admin/user)
- `isActive`: Account status
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### Polls Table
- `id`: UUID primary key
- `title`: Poll title
- `description`: Poll description
- `options`: Array of poll options
- `visibility`: Poll visibility (public/private)
- `expiresAt`: Poll expiration timestamp
- `isActive`: Poll status
- `createdById`: Foreign key to users table
- `createdAt`: Poll creation timestamp
- `updatedAt`: Last update timestamp

### Votes Table
- `id`: UUID primary key
- `selectedOption`: User's selected option
- `userId`: Foreign key to users table
- `pollId`: Foreign key to polls table
- `createdAt`: Vote timestamp

### Poll Allowed Users (Many-to-Many)
- Junction table for private polls and allowed users

## 🔐 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Users
- `GET /users/profile` - Get current user profile
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID (Admin only)
- `PATCH /users/:id` - Update user (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

### Polls
- `POST /polls` - Create new poll (Admin only)
- `GET /polls` - Get all accessible polls
- `GET /polls/:id` - Get specific poll
- `PATCH /polls/:id` - Update poll (Admin only, active polls)
- `DELETE /polls/:id` - Delete poll (Admin only)
- `POST /polls/:id/vote` - Vote on poll
- `GET /polls/my-votes` - Get user's votes

## 🎯 Usage Guide

### For Administrators
1. **Create Polls**: Access the "Create New Poll" button to create public or private polls
2. **Manage Polls**: Edit active polls, delete polls, and manage poll settings
3. **User Management**: View and manage all users in the system
4. **Poll Analytics**: View detailed results and voting statistics

### For Users
1. **View Polls**: Access all public polls and private polls you're invited to
2. **Vote**: Cast votes on active polls (one vote per poll)
3. **View Results**: See poll results after voting or when polls expire
4. **Track Votes**: View your voting history in the "My Votes" section

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration with valid/invalid data
- [ ] User login with correct/incorrect credentials
- [ ] Admin poll creation with various configurations
- [ ] Public poll voting by regular users
- [ ] Private poll access control
- [ ] Poll expiry handling
- [ ] Duplicate vote prevention
- [ ] Role-based access control
- [ ] Token expiration handling
- [ ] Input validation and error handling

### API Testing with cURL

#### Register a new user
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Create a poll (Admin only)
```bash
curl -X POST http://localhost:3001/polls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Favorite Programming Language",
    "description": "What is your favorite programming language?",
    "options": ["JavaScript", "Python", "Java", "C++"],
    "visibility": "public",
    "expiresAt": "2024-12-31T23:59:59.000Z"
  }'
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation using class-validator
- **SQL Injection Prevention**: TypeORM query builder protection
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Role-Based Access**: Granular permission system
- **Token Expiration**: Automatic token invalidation

## 🚀 Deployment

### Production Deployment
1. Set `NODE_ENV=production` in your environment
2. Use a strong JWT secret key
3. Configure production database
4. Set up SSL/TLS certificates
5. Use a reverse proxy (nginx)
6. Configure proper logging and monitoring

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

## 📝 AI-Assisted Development

This project was developed with the assistance of AI tools to enhance development speed and code quality:

### AI Tools Used

- ChatGPT (OpenAI): Primarily used for frontend development assistance, as the developer is expertised in backend development
- Claude (Anthropic): Used for comprehensive code generation, architecture planning, and implementation guidance
- Code Review: AI-assisted code review for best practices and security considerations
- Documentation: AI-generated comprehensive documentation and README

### How AI Enhanced Development

1. Frontend Development: ChatGPT was extensively used for React component development, styling, and frontend logic implementation
2. Rapid Prototyping: AI helped generate boilerplate code and project structure
3. Best Practices: Ensured adherence to Nest.js best practices and security standards
4. Code Quality: AI-assisted in writing clean, maintainable, and well-documented code
5. Error Handling: Comprehensive error handling patterns suggested by AI
6. Documentation: Detailed documentation generated with AI assistance

### Development Process

- Initial project structure and configuration setup
- Entity design and database schema planning
- Authentication and authorization implementation
- API endpoint development and testing
- Frontend interface creation (primarily assisted by ChatGPT)
- Comprehensive documentation and testing guidelines

### Developer Expertise

- Backend Development: Expert-level proficiency in Node.js, Express.js, Sequelize, and database design
- Frontend Development: AI-assisted development using ChatGPT for React components, styling, and user interface implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request


## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👨‍💻 Author

**Sreejith Thalappilly**
- GitHub: [@Sreejith-Thalappilly](https://github.com/Sreejith-Thalappilly)
- Email: [your-email@example.com]

## 🙏 Acknowledgments

- Nest.js team for the excellent framework
- TypeORM for database management
- The open-source community for various libraries and tools
- AI assistance for accelerating development and ensuring code quality

---

**Note**: This project was developed as an assignment demonstrating full-stack development skills with modern web technologies and best practices.