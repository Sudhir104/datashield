// Master checklist of DPDP Act (India) compliance requirements.
// This is a practical, plain-language checklist for SMBs - not a substitute for legal advice.
// Each company gets its own copy of these items (see checklistController.seedForCompany).

module.exports = [
  {
    requirementKey: 'consent_notice_before_collection',
    title: 'Give a clear notice before collecting personal data',
    description:
      'Users must be told, in plain language, what data you collect, why, and how to withdraw consent - before you collect it.',
    category: 'consent_management',
    priority: 'high',
  },
  {
    requirementKey: 'consent_free_specific_informed',
    title: 'Ensure consent is free, specific, and informed',
    description:
      'No pre-ticked checkboxes or bundled consent. Each purpose should have its own clear opt-in.',
    category: 'consent_management',
    priority: 'high',
  },
  {
    requirementKey: 'consent_withdrawal_mechanism',
    title: 'Provide an easy way to withdraw consent',
    description: 'Withdrawing consent should be as easy as giving it (e.g. a settings toggle or support request).',
    category: 'consent_management',
    priority: 'high',
  },
  {
    requirementKey: 'data_minimization',
    title: 'Collect only the data you actually need',
    description: 'Avoid collecting personal data "just in case" - map each field to a specific purpose.',
    category: 'data_minimization',
    priority: 'medium',
  },
  {
    requirementKey: 'retention_limits_defined',
    title: 'Define and enforce data retention periods',
    description: 'Personal data should not be kept longer than necessary for its stated purpose.',
    category: 'data_minimization',
    priority: 'medium',
  },
  {
    requirementKey: 'breach_notification_process',
    title: 'Have a data breach notification process',
    description: 'Define how you will detect, assess, and report a personal data breach to the Data Protection Board and affected users.',
    category: 'breach_notification',
    priority: 'high',
  },
  {
    requirementKey: 'user_right_to_access',
    title: 'Support user requests to access their data',
    description: 'Users have the right to know what personal data you hold about them.',
    category: 'user_rights',
    priority: 'high',
  },
  {
    requirementKey: 'user_right_to_correction_erasure',
    title: 'Support correction and erasure requests',
    description: 'Users can ask you to correct inaccurate data or delete their data (subject to legal retention needs).',
    category: 'user_rights',
    priority: 'high',
  },
  {
    requirementKey: 'grievance_officer_appointed',
    title: 'Appoint a Grievance Officer / contact point',
    description: 'Have a named contact for users to raise data protection complaints, with a defined response timeline.',
    category: 'grievance_redressal',
    priority: 'medium',
  },
  {
    requirementKey: 'security_safeguards_technical',
    title: 'Implement reasonable technical security safeguards',
    description: 'Encryption at rest/in transit, access controls, and regular security reviews for systems storing personal data.',
    category: 'security_safeguards',
    priority: 'high',
  },
  {
    requirementKey: 'vendor_dpa_agreements',
    title: 'Have Data Processing Agreements with vendors/third parties',
    description: 'Any third party processing personal data on your behalf should be bound by a written data protection agreement.',
    category: 'documentation',
    priority: 'medium',
  },
  {
    requirementKey: 'privacy_policy_published',
    title: 'Publish a clear, accessible Privacy Policy',
    description: 'Your privacy policy should be easy to find and written in plain language, not just legalese.',
    category: 'documentation',
    priority: 'high',
  },
  {
    requirementKey: 'children_data_parental_consent',
    title: 'Obtain verifiable parental consent for children\'s data',
    description: 'If your service may be used by children (under 18), you need verifiable parental consent before processing their data.',
    category: 'children_data',
    priority: 'high',
  },
  {
    requirementKey: 'data_processing_records',
    title: 'Maintain records of data processing activities',
    description: 'Keep an internal log of what personal data you process, why, and for how long - useful for audits and breach response.',
    category: 'documentation',
    priority: 'medium',
  },
];
