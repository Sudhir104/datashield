const Company = require('../models/Company');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getMyCompany = catchAsync(async (req, res, next) => {
  const company = await Company.findById(req.user.company);
  if (!company) return next(new AppError('Company not found.', 404));
  res.status(200).json({ status: 'success', data: { company } });
});

exports.updateMyCompany = catchAsync(async (req, res, next) => {
  const allowedFields = ['name', 'industry', 'size', 'website', 'applicableFrameworks'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const company = await Company.findByIdAndUpdate(req.user.company, updates, {
    new: true,
    runValidators: true,
  });

  if (!company) return next(new AppError('Company not found.', 404));
  res.status(200).json({ status: 'success', data: { company } });
});
