const express = require('express');
const { Op } = require('sequelize');
const { Poll, Vote, User, PollAllowedUser } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validatePollCreation, validateVote } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all accessible polls for the current user
router.get('/', async (req, res, next) => {
  try {
    const polls = await Poll.findAll({
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'allowedUsers',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: { attributes: [] }
        },
        {
          model: Vote,
          as: 'votes',
          attributes: ['id', 'selectedOption', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Filter polls based on visibility and user access
    const accessiblePolls = polls.filter(poll => {
      if (poll.visibility === 'public') {
        return true;
      }
      if (poll.visibility === 'private') {
        return poll.createdById === req.user.id || 
               poll.allowedUsers.some(user => user.id === req.user.id);
      }
      return false;
    });

    // Add computed properties
    const pollsWithResults = accessiblePolls.map(poll => {
      const pollData = poll.toJSON();
      pollData.isExpired = poll.isExpired();
      pollData.canVote = poll.canVote();
      pollData.results = poll.getResults(poll.votes);
      pollData.totalVotes = poll.votes.length;
      return pollData;
    });

    res.json({
      success: true,
      data: { polls: pollsWithResults }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's votes
router.get('/my-votes', async (req, res, next) => {
  try {
    const votes = await Vote.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Poll,
          as: 'poll',
          attributes: ['id', 'title', 'description']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { votes }
    });
  } catch (error) {
    next(error);
  }
});

// Get specific poll
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findByPk(id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'allowedUsers',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: { attributes: [] }
        },
        {
          model: Vote,
          as: 'votes',
          attributes: ['id', 'selectedOption', 'createdAt']
        }
      ]
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check access permissions
    const hasAccess = poll.visibility === 'public' || 
                     poll.createdById === req.user.id ||
                     poll.allowedUsers.some(user => user.id === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this poll'
      });
    }

    const pollData = poll.toJSON();
    pollData.isExpired = poll.isExpired();
    pollData.canVote = poll.canVote();
    pollData.results = poll.getResults(poll.votes);
    pollData.totalVotes = poll.votes.length;

    res.json({
      success: true,
      data: { poll: pollData }
    });
  } catch (error) {
    next(error);
  }
});

// Create new poll (Admin only)
router.post('/', requireAdmin, validatePollCreation, async (req, res, next) => {
  try {
    const { title, description, options, visibility, expiresAt, allowedUserIds } = req.body;

    // Validate expiry time
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const maxExpiry = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    if (expiryDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Poll expiry time must be in the future'
      });
    }

    if (expiryDate > maxExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Poll duration cannot exceed 2 hours'
      });
    }

    // Validate unique options
    const uniqueOptions = [...new Set(options)];
    if (uniqueOptions.length !== options.length) {
      return res.status(400).json({
        success: false,
        message: 'Poll options must be unique'
      });
    }

    // Create poll
    const poll = await Poll.create({
      title,
      description,
      options,
      visibility,
      expiresAt: expiryDate,
      createdById: req.user.id
    });

    // Handle private poll with allowed users
    if (visibility === 'private' && allowedUserIds && allowedUserIds.length > 0) {
      // Validate that all user IDs exist
      const users = await User.findAll({
        where: { id: { [Op.in]: allowedUserIds } }
      });

      if (users.length !== allowedUserIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Some of the specified users do not exist'
        });
      }

      // Add allowed users
      await poll.setAllowedUsers(users);
    }

    // Fetch the created poll with associations
    const createdPoll = await Poll.findByPk(poll.id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'allowedUsers',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: { poll: createdPoll }
    });
  } catch (error) {
    next(error);
  }
});

// Update poll (Admin only, active polls only)
router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const poll = await Poll.findByPk(id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id']
        }
      ]
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check ownership
    if (poll.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own polls'
      });
    }

    // Check if poll is expired
    if (poll.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit expired polls'
      });
    }

    // Validate expiry time if being updated
    if (updateData.expiresAt) {
      const expiryDate = new Date(updateData.expiresAt);
      const now = new Date();
      const maxExpiry = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      if (expiryDate <= now) {
        return res.status(400).json({
          success: false,
          message: 'Poll expiry time must be in the future'
        });
      }

      if (expiryDate > maxExpiry) {
        return res.status(400).json({
          success: false,
          message: 'Poll duration cannot exceed 2 hours'
        });
      }
    }

    // Remove fields that shouldn't be updated
    delete updateData.createdById;
    delete updateData.id;

    await poll.update(updateData);

    res.json({
      success: true,
      message: 'Poll updated successfully',
      data: { poll }
    });
  } catch (error) {
    next(error);
  }
});

// Delete poll (Admin only)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findByPk(id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id']
        }
      ]
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check ownership
    if (poll.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own polls'
      });
    }

    await poll.destroy();

    res.json({
      success: true,
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Vote on poll
router.post('/:id/vote', validateVote, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { selectedOption } = req.body;

    const poll = await Poll.findByPk(id, {
      include: [
        {
          model: User,
          as: 'allowedUsers',
          attributes: ['id'],
          through: { attributes: [] }
        },
        {
          model: Vote,
          as: 'votes',
          attributes: ['userId']
        }
      ]
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check access permissions
    const hasAccess = poll.visibility === 'public' || 
                     poll.createdById === req.user.id ||
                     poll.allowedUsers.some(user => user.id === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to vote on this poll'
      });
    }

    // Check if poll is active and not expired
    if (!poll.canVote()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on inactive or expired polls'
      });
    }

    // Validate selected option
    if (!poll.options.includes(selectedOption)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option selected'
      });
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({
      where: { userId: req.user.id, pollId: poll.id }
    });

    if (existingVote) {
      return res.status(409).json({
        success: false,
        message: 'You have already voted on this poll'
      });
    }

    // Create vote
    const vote = await Vote.create({
      selectedOption,
      userId: req.user.id,
      pollId: poll.id
    });

    res.status(201).json({
      success: true,
      message: 'Vote submitted successfully',
      data: { vote }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
