const ChecklistItem = require('../models/ChecklistItem');
const Company = require('../models/Company');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const dpdpChecklist = require('../data/dpdpChecklist');

const recalculateComplianceScore = async (companyId) => {
  const items = await ChecklistItem.find({ company: companyId });
  if (items.length === 0) return;

  const completed = items.filter((i) => i.isCompleted).length;
  const score = Math.round((completed / items.length) * 100);

  let status = 'not_started';
  if (score === 100) status = 'compliant';
  else if (score > 0) status = 'in_progress';

  // Flag "needs_attention" if high-priority items remain incomplete
  const incompleteHighPriority = items.some((i) => i.priority === 'high' && !i.isCompleted);
  if (incompleteHighPriority && score > 50) status = 'needs_attention';

  await Company.findByIdAndUpdate(companyId, { complianceScore: score, complianceStatus: status });
};

// Seed the DPDP checklist for a company (idempotent - skips items already present)
exports.seedForCompany = catchAsync(async (req, res, next) => {
  const companyId = req.user.company;

  const existingCount = await ChecklistItem.countDocuments({ company: companyId, framework: 'DPDP_INDIA' });
  if (existingCount > 0) {
    return res.status(200).json({ status: 'success', message: 'Checklist already seeded.' });
  }

  const docs = dpdpChecklist.map((item) => ({
    ...item,
    company: companyId,
    framework: 'DPDP_INDIA',
  }));

  await ChecklistItem.insertMany(docs);
  await recalculateComplianceScore(companyId);

  res.status(201).json({ status: 'success', message: 'Checklist seeded successfully.' });
});

exports.getChecklist = catchAsync(async (req, res) => {
  const items = await ChecklistItem.find({ company: req.user.company }).sort({ category: 1, priority: -1 });
  res.status(200).json({ status: 'success', results: items.length, data: { items } });
});

exports.toggleItem = catchAsync(async (req, res, next) => {
  const item = await ChecklistItem.findOne({ _id: req.params.id, company: req.user.company });
  if (!item) return next(new AppError('Checklist item not found.', 404));

  item.isCompleted = !item.isCompleted;
  item.completedAt = item.isCompleted ? new Date() : undefined;
  item.completedBy = item.isCompleted ? req.user._id : undefined;
  if (req.body && req.body.notes !== undefined) item.notes = req.body.notes;

  await item.save();
  await recalculateComplianceScore(req.user.company);

  res.status(200).json({ status: 'success', data: { item } });
});
