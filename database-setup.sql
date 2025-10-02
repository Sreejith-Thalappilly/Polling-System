-- MySQL Database setup script for Polling System
-- Run this script to create the database and initial admin user

-- Create database
CREATE DATABASE IF NOT EXISTS polling_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE polling_system;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user' NOT NULL,
    isActive BOOLEAN DEFAULT TRUE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    options JSON NOT NULL,
    visibility ENUM('public', 'private') DEFAULT 'public' NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    isActive BOOLEAN DEFAULT TRUE NOT NULL,
    createdById VARCHAR(36) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE CASCADE
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    selectedOption VARCHAR(500) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    pollId VARCHAR(36) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_poll (userId, pollId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pollId) REFERENCES polls(id) ON DELETE CASCADE
);

-- Create poll_allowed_users junction table for private polls
CREATE TABLE IF NOT EXISTS poll_allowed_users (
    pollId VARCHAR(36) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    PRIMARY KEY (pollId, userId),
    FOREIGN KEY (pollId) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);


-- Insert a default admin user (password: admin123)
INSERT INTO users (id, email, password, firstName, lastName, role, isActive) 
VALUES (
    UUID(), 
    'admin@example.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXvOoDp2J3j6', -- admin123
    'System', 
    'Administrator', 
    'admin', 
    TRUE
) ON DUPLICATE KEY UPDATE email = email;

-- Create some sample polls for testing
INSERT INTO polls (id, title, description, options, visibility, expiresAt, createdById)
SELECT 
    UUID(),
    'What is your favorite programming language?',
    'Help us understand the community preferences for programming languages.',
    JSON_ARRAY('JavaScript', 'Python', 'Java', 'C++', 'TypeScript'),
    'public',
    DATE_ADD(NOW(), INTERVAL 2 HOUR),
    u.id
FROM users u 
WHERE u.email = 'admin@example.com'
LIMIT 1;

INSERT INTO polls (id, title, description, options, visibility, expiresAt, createdById)
SELECT 
    UUID(),
    'Which framework do you prefer for web development?',
    'Share your preference for web development frameworks.',
    JSON_ARRAY('React', 'Vue.js', 'Angular', 'Svelte', 'Next.js'),
    'public',
    DATE_ADD(NOW(), INTERVAL 1 HOUR),
    u.id
FROM users u 
WHERE u.email = 'admin@example.com'
LIMIT 1;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON polling_system.* TO 'your_app_user'@'localhost';
-- FLUSH PRIVILEGES;