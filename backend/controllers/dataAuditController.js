const DataAudit = require('../models/DataAudit');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Each company has exactly one running DataAudit document containing many dataFlows.
const findOrCreateAudit = async (companyId) => {
  let audit = await DataAudit.findOne({ company: companyId });
  if (!audit) {
    audit = await DataAudit.create({ company: companyId, dataFlows: [] });
  }
  return audit;
};

exports.getAudit = catchAsync(async (req, res) => {
  const audit = await findOrCreateAudit(req.user.company);
  res.status(200).json({ status: 'success', data: { audit } });
});

exports.addDataFlow = catchAsync(async (req, res) => {
  const audit = await findOrCreateAudit(req.user.company);

  const allowedFields = [
    'dataCategory',
    'purpose',
    'collectionSource',
    'storageLocation',
    'retentionPeriodDays',
    'sharedWithThirdParties',
    'thirdPartyNames',
    'consentObtained',
    'encryptedAtRest',
  ];
  const newFlow = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) newFlow[field] = req.body[field];
  });

  audit.dataFlows.push(newFlow);
  audit.status = 'draft';
  await audit.save();

  res.status(201).json({ status: 'success', data: { audit } });
});

exports.updateDataFlow = catchAsync(async (req, res, next) => {
  const audit = await DataAudit.findOne({ company: req.user.company });
  if (!audit) return next(new AppError('Data audit not found.', 404));

  const flow = audit.dataFlows.id(req.params.flowId);
  if (!flow) return next(new AppError('Data flow entry not found.', 404));

  Object.assign(flow, req.body);
  await audit.save();

  res.status(200).json({ status: 'success', data: { audit } });
});

exports.deleteDataFlow = catchAsync(async (req, res, next) => {
  const audit = await DataAudit.findOne({ company: req.user.company });
  if (!audit) return next(new AppError('Data audit not found.', 404));

  audit.dataFlows.id(req.params.flowId)?.deleteOne();
  await audit.save();

  res.status(200).json({ status: 'success', data: { audit } });
});
