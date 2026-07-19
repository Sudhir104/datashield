const User = require('../models/User');
const Company = require('../models/Company');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { generateAccessToken, generateRefreshToken, hashToken } = require('../utils/tokens');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 30 * 60 * 1000; // 30 minutes

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth/refresh',
};

const issueTokensAndRespond = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken();

  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Cap stored sessions per user to prevent unbounded growth
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(statusCode).json({
    status: 'success',
    accessToken,
    data: { user },
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, companyName, industry } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email already exists.', 409));
  }

  const user = await User.create({ name, email, password, role: 'owner' });

  const company = await Company.create({
    name: companyName,
    industry: industry || 'other',
    createdBy: user._id,
    applicableFrameworks: ['DPDP_INDIA'],
  });

  user.company = company._id;
  await user.save({ validateBeforeSave: false });

  await issueTokensAndRespond(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  const user = await User.findOne({ email }).select('+password +refreshTokens');

  if (!user) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  if (user.isLocked) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return next(new AppError(`Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`, 423));
  }

  const isCorrect = await user.comparePassword(password);

  if (!isCorrect) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
    }
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Incorrect email or password.', 401));
  }

  // Successful login: reset attempts
  user.loginAttempts = 0;
  user.lockUntil = undefined;

  await issueTokensAndRespond(user, 200, res);
});

exports.refresh = catchAsync(async (req, res, next) => {
  const incomingToken = req.cookies?.refreshToken;
  if (!incomingToken) {
    return next(new AppError('No refresh token provided.', 401));
  }

  const tokenHash = hashToken(incomingToken);
  const user = await User.findOne({ 'refreshTokens.tokenHash': tokenHash }).select('+refreshTokens');

  if (!user) {
    // Token reuse or invalid token - treat as potential compromise
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    return next(new AppError('Invalid or expired session. Please log in again.', 401));
  }

  const storedToken = user.refreshTokens.find((t) => t.tokenHash === tokenHash);
  if (!storedToken || storedToken.expiresAt < new Date()) {
    return next(new AppError('Session expired. Please log in again.', 401));
  }

  // Rotate: remove old refresh token, issue a new one
  user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);

  await issueTokensAndRespond(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  const incomingToken = req.cookies?.refreshToken;
  if (incomingToken) {
    const tokenHash = hashToken(incomingToken);
    await User.updateOne(
      { 'refreshTokens.tokenHash': tokenHash },
      { $pull: { refreshTokens: { tokenHash } } }
    );
  }
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
});

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
});
