const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (!req.body.password) {
      throw new Error('Password is required');
    }
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),
  handleValidationErrors,
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validatePollCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  body('options')
    .isArray({ min: 2 })
    .withMessage('Poll must have at least 2 options'),
  body('options.*')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Each option must be between 1 and 500 characters'),
  body('visibility')
    .isIn(['public', 'private'])
    .withMessage('Visibility must be either public or private'),
  body('expiresAt')
    .isISO8601()
    .withMessage('Expiry date must be a valid ISO 8601 date'),
  body('allowedUserIds')
    .optional()
    .isArray()
    .withMessage('Allowed user IDs must be an array'),
  handleValidationErrors,
];

const validateVote = [
  body('selectedOption')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Selected option must be between 1 and 500 characters'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validatePollCreation,
  validateVote,
};