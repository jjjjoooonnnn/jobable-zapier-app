const sample = {
  id: 4,
  name: 'Booked',
  default: false,
  completes_job: false,
  display_name: 'Booked in',
  display_description: 'An engineer is booked to visit.',
};

const outputFields = [
  { key: 'id', label: 'ID', type: 'integer' },
  { key: 'name', label: 'Name' },
  { key: 'default', label: 'Default', type: 'boolean' },
  { key: 'completes_job', label: 'Completes job', type: 'boolean' },
  { key: 'display_name', label: 'Display name' },
  { key: 'display_description', label: 'Display description' },
];

module.exports = {
  key: 'job_status',
  noun: 'Job Status',
  plural: 'Job Statuses',
  path: 'job_statuses',
  idLabel: 'Job Status ID',
  displayField: 'name',
  listSort: 'id',
  operations: ['search', 'list'],
  sample,
  outputFields,
};
