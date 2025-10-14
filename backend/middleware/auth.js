// Authentication and authorization middleware

const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session?.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
// In middleware/auth.js
const allowedRoles = ['admin', 'doctor', 'nurse', 'lab_technician'];

module.exports = { requireAuth, requireRole };
