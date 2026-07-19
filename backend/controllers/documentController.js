const PolicyDocument = require('../models/PolicyDocument');
const Company = require('../models/Company');
const DataAudit = require('../models/DataAudit');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const DOCUMENT_PROMPTS = {
  privacy_policy: (company, dataFlows) => `You are a compliance assistant helping an Indian business draft a Privacy Policy that aligns with India's Digital Personal Data Protection (DPDP) Act, 2023.

Company name: ${company.name}
Industry: ${company.industry}
Website: ${company.website || 'not provided'}

Data this company collects (from their internal audit):
${JSON.stringify(dataFlows, null, 2)}

Write a clear, plain-language Privacy Policy in Markdown format. Include sections for: what data is collected, purpose of collection, how consent is obtained and withdrawn, data retention, third-party sharing, user rights (access/correction/erasure), security measures, grievance officer contact placeholder, and how to contact for complaints.

Important: Include a placeholder like [GRIEVANCE OFFICER NAME] and [CONTACT EMAIL] instead of inventing contact details. Do not use overly complex legal jargon - write for a small business's end customers to understand.`,

  data_processing_agreement: (company) => `Draft a Data Processing Agreement (DPA) template in Markdown for an Indian business named "${company.name}" (industry: ${company.industry}) to use with its third-party vendors/processors, aligned with India's DPDP Act, 2023 principles.

Include: definitions, scope of processing, obligations of the processor, security requirements, sub-processing conditions, data breach notification obligations, data return/deletion on termination, and audit rights. Use placeholders like [VENDOR NAME] and [EFFECTIVE DATE] where specific details would go.`,

  breach_response_plan: (company) => `Draft a Data Breach Response Plan in Markdown for an Indian business named "${company.name}" (industry: ${company.industry}), aligned with India's DPDP Act, 2023 breach notification requirements.

Include: breach detection steps, internal escalation process, assessment/severity classification, notification timeline and template for notifying the Data Protection Board and affected users, containment and remediation steps, and post-incident review process.`,

  employee_data_handling_policy: (company) => `Draft an internal Employee Data Handling Policy in Markdown for an Indian company named "${company.name}" (industry: ${company.industry}), covering how HR and management should handle employee personal data in line with DPDP Act, 2023 principles.

Include: what employee data is collected and why, access controls (who can view HR data), retention after employee exit, background check data handling, and employee rights to access their own data.`,

  consent_form_template: (company) => `Draft a plain-language Consent Form template in Markdown that "${company.name}" (industry: ${company.industry}) can use to collect specific, informed consent from users/customers before collecting their personal data, aligned with India's DPDP Act, 2023.

Include: clear statement of what data is collected and why, an explicit opt-in checkbox description (not pre-ticked), how to withdraw consent, and a plain-language summary at the top before the details.`,
};

exports.generateDocument = catchAsync(async (req, res, next) => {
  const { documentType } = req.body;

  if (!DOCUMENT_PROMPTS[documentType]) {
    return next(new AppError('Invalid document type requested.', 400));
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return next(new AppError('AI document generation is not configured on this server.', 503));
  }

  const company = await Company.findById(req.user.company);
  if (!company) return next(new AppError('Company not found.', 404));

  const audit = await DataAudit.findOne({ company: company._id });
  const dataFlows = audit ? audit.dataFlows : [];

  const prompt = DOCUMENT_PROMPTS[documentType](company, dataFlows);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.ANTHROPIC_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Groq API error:', errText);
    return next(new AppError('Failed to generate document. Please try again.', 502));
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  const titleMap = {
    privacy_policy: 'Privacy Policy',
    data_processing_agreement: 'Data Processing Agreement',
    breach_response_plan: 'Data Breach Response Plan',
    employee_data_handling_policy: 'Employee Data Handling Policy',
    consent_form_template: 'Consent Form Template',
  };

  const document = await PolicyDocument.create({
    company: company._id,
    documentType,
    title: titleMap[documentType],
    content,
    generatedByAI: true,
    generationInputSnapshot: { companySnapshot: company.toObject(), dataFlows },
    createdBy: req.user._id,
  });

  res.status(201).json({ status: 'success', data: { document } });
});

exports.listDocuments = catchAsync(async (req, res) => {
  const documents = await PolicyDocument.find({ company: req.user.company })
    .select('-generationInputSnapshot -content')
    .sort('-createdAt');
  res.status(200).json({ status: 'success', results: documents.length, data: { documents } });
});

exports.getDocument = catchAsync(async (req, res, next) => {
  const document = await PolicyDocument.findOne({ _id: req.params.id, company: req.user.company });
  if (!document) return next(new AppError('Document not found.', 404));
  res.status(200).json({ status: 'success', data: { document } });
});