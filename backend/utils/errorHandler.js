// Centralized error handling
class ErrorHandler {
  static handle(res, error, customMessage = 'Server error') {
    console.error(`❌ ${customMessage}:`, error);
    res.status(500).json({ 
      message: customMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  static success(res, data, message, statusCode = 200) {
    res.status(statusCode).json({ success: true, message, data });
  }

  static created(res, data, message = 'Created successfully') {
    res.status(201).json({ success: true, message, data });
  }
}

module.exports = ErrorHandler;
