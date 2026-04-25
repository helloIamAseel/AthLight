/**
 * Global error handling middleware
 * Catches all errors and sends consistent error responses
 * Must be added LAST in server.js
 */
function errorHandler(err, req, res, next) {
  console.error('Error occurred:', err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed: ' + err.message;
  }

  if (err.code === 'auth/user-not-found') {
    statusCode = 404;
    message = 'User not found';
  }

  if (err.code === 'auth/wrong-password') {
    statusCode = 401;
    message = 'Invalid credentials';
  }

  if (err.code === 'auth/email-already-exists') {
    statusCode = 409;
    message = 'Email already registered';
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    // Include stack trace only in development mode
  });
}

module.exports = { errorHandler };