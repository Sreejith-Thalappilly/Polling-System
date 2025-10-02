const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: 'Internal Server Error',
    status: 500
  };

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    error.status = 400;
    error.message = 'Validation Error';
    error.errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    error.status = 409;
    error.message = 'Duplicate entry';
    error.errors = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} already exists`
    }));
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error.status = 400;
    error.message = 'Invalid reference';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

  // Custom application errors
  if (err.status) {
    error.status = err.status;
  }

  if (err.message) {
    error.message = err.message;
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && error.status === 500) {
    error.message = 'Something went wrong';
    delete error.errors;
  }

  res.status(error.status).json(error);
};

module.exports = errorHandler;
