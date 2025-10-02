const express = require('express');
const { User } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all users (Admin only)
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: { user: req.user }
  });
});

// Get user by ID (Admin only)
router.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Update user (Admin only)
router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove password from update data if present
    delete updateData.password;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for email uniqueness if email is being updated
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ 
        where: { email: updateData.email } 
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    await user.update(updateData);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (Admin only)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
