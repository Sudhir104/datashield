const mongoose = require('mongoose');

const policyDocumentSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: [
        'privacy_policy',
        'data_processing_agreement',
        'consent_form_template',
        'breach_response_plan',
        'employee_data_handling_policy',
      ],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true }, // markdown content
    version: { type: Number, default: 1 },
    generatedByAI: { type: Boolean, default: true },
    generationInputSnapshot: {
      // store what data-audit/company info was used to generate this,
      // so documents can be regenerated/audited later
      type: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['draft', 'reviewed', 'published'],
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PolicyDocument', policyDocumentSchema);
