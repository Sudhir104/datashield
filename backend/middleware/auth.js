const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Verifies the access token and attaches the current user to req.user
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password was recently changed. Please log in again.', 401));
  }

  req.user = currentUser;
  next();
});

// Restrict a route to specific roles, e.g. restrictTo('owner', 'admin')
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

// Ensures the resource being accessed belongs to the logged-in user's company.
// Use after `protect`, on routes that include a company-scoped resource.
exports.ensureCompanyScope = (getResourceCompanyId) => {
  return catchAsync(async (req, res, next) => {
    const resourceCompanyId = await getResourceCompanyId(req);
    if (!resourceCompanyId || String(resourceCompanyId) !== String(req.user.company)) {
      return next(new AppError('You do not have access to this resource.', 403));
    }
    next();
  });
};
