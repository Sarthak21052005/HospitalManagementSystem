const { validationResult } = require('express-validator');

/**
 * Middleware to validate request data using express-validator
 * Usage: Add this middleware after validation rules in routes
 * 
 * Example:
 * router.post('/endpoint', [
 *   body('email').isEmail(),
 *   body('name').notEmpty()
 * ], validate, yourController);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Extract only the error messages
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));
    
    console.log('❌ Validation errors:', errorMessages);
    
    return res.status(400).json({
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  // If no errors, proceed to next middleware/controller
  next();
};

module.exports = validate;
