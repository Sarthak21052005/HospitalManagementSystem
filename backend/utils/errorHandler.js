/**
 * Centralized error handling utility
 * Provides consistent error responses across all controllers
 */
class ErrorHandler {
  /**
   * Handle server errors
   * @param {Object} res - Express response object
   * @param {Error} error - Error object
   * @param {String} customMessage - Custom error message
   */
  static handle(res, error, customMessage = 'Server error') {
    console.error(`❌ ${customMessage}:`, error);
    
    res.status(500).json({ 
      message: customMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {String} message - Success message
   * @param {Number} statusCode - HTTP status code (default: 200)
   */
  static success(res, data, message = 'Success', statusCode = 200) {
    res.status(statusCode).json({ 
      success: true, 
      message, 
      data 
    });
  }

  /**
   * Send created response (201)
   * @param {Object} res - Express response object
   * @param {*} data - Created resource data
   * @param {String} message - Success message
   */
  static created(res, data, message = 'Created successfully') {
    res.status(201).json({ 
      success: true, 
      message, 
      data 
    });
  }

  /**
   * Send not found response (404)
   * @param {Object} res - Express response object
   * @param {String} message - Not found message
   */
  static notFound(res, message = 'Resource not found') {
    res.status(404).json({ 
      success: false, 
      message 
    });
  }

  /**
   * Send bad request response (400)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static badRequest(res, message = 'Bad request') {
    res.status(400).json({ 
      success: false, 
      message 
    });
  }

  /**
   * Send unauthorized response (401)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static unauthorized(res, message = 'Unauthorized') {
    res.status(401).json({ 
      success: false, 
      message 
    });
  }

  /**
   * Send forbidden response (403)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static forbidden(res, message = 'Forbidden') {
    res.status(403).json({ 
      success: false, 
      message 
    });
  }
}

module.exports = ErrorHandler;
