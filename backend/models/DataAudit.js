const mongoose = require('mongoose');

// Each entry represents one "data flow": a category of personal data,
// where it comes from, why it's collected, where it's stored, and who it's shared with.
const dataFlowSchema = new mongoose.Schema(
  {
    dataCategory: {
      type: String,
      enum: [
        'name_contact',
        'financial',
        'health',
        'biometric',
        'location',
        'behavioral_analytics',
        'government_id',
        'employment',
        'other',
      ],
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    collectionSource: {
      type: String,
      enum: ['website_form', 'mobile_app', 'third_party', 'offline', 'other'],
      default: 'website_form',
    },
    storageLocation: {
      type: String,
      enum: ['india', 'outside_india', 'both'],
      default: 'india',
    },
    retentionPeriodDays: {
      type: Number,
      min: 0,
    },
    sharedWithThirdParties: {
      type: Boolean,
      default: false,
    },
    thirdPartyNames: [{ type: String, trim: true }],
    consentObtained: {
      type: Boolean,
      default: false,
    },
    encryptedAtRest: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true, timestamps: true }
);

const dataAuditSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    dataFlows: [dataFlowSchema],
    lastReviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'reviewed'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DataAudit', dataAuditSchema);
