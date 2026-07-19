const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    framework: {
      type: String,
      enum: ['DPDP_INDIA', 'GDPR_EU', 'CCPA_US'],
      required: true,
    },
    requirementKey: {
      // stable machine key so we can seed/update the master checklist without duplicating
      type: String,
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: [
        'consent_management',
        'data_minimization',
        'breach_notification',
        'user_rights',
        'documentation',
        'security_safeguards',
        'grievance_redressal',
        'children_data',
      ],
    },
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

checklistItemSchema.index({ company: 1, requirementKey: 1 }, { unique: true });

module.exports = mongoose.model('ChecklistItem', checklistItemSchema);
