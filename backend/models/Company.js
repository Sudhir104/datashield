const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 150,
    },
    industry: {
      type: String,
      enum: [
        'ecommerce',
        'fintech',
        'healthcare',
        'edtech',
        'saas',
        'retail',
        'manufacturing',
        'other',
      ],
      default: 'other',
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      default: '1-10',
    },
    website: { type: String, trim: true },

    // High-level compliance status, computed from audits/checklist completion
    complianceStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'compliant', 'needs_attention'],
      default: 'not_started',
    },
    complianceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Which data protection frameworks this company needs to track
    applicableFrameworks: [
      {
        type: String,
        enum: ['DPDP_INDIA', 'GDPR_EU', 'CCPA_US'],
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
