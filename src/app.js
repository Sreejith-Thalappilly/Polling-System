const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Import database initialization
const { ConnectDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const pollRoutes = require('./routes/polls');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/polls', pollRoutes);



// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await ConnectDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Application: http://localhost:${PORT}`);
      console.log(`Default admin: admin@example.com / admin123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
