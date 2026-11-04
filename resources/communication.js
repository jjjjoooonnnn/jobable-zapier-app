const sample = {
  id: 5502,
  job_id: 1042,
  description: "Called customer to confirm access for tomorrow's visit.",
  created_at: '2026-07-20T09:20:00Z',
  author_id: 7,
  author_type: 'staff',
  published: false,
};

const outputFields = [
  { key: 'id', label: 'ID', type: 'integer' },
  { key: 'job_id', label: 'Job ID', type: 'integer' },
  { key: 'description', label: 'Description' },
  { key: 'created_at', label: 'Created at', type: 'datetime' },
  { key: 'author_id', label: 'Author ID', type: 'integer' },
  { key: 'author_type', label: 'Author type' },
  { key: 'published', label: 'Published', type: 'boolean' },
];

module.exports = {
  key: 'communication',
  noun: 'Communication',
  path: 'communications',
  idLabel: 'Communication ID',
  displayField: 'description',
  operations: ['create'],
  sample,
  outputFields,
  createFields: [
    {
      key: 'job_id',
      label: 'Job',
      type: 'integer',
      required: true,
      dynamic: 'list_jobs.id.number',
      search: 'find_job.id',
    },
    {
      key: 'description',
      label: 'Description',
      type: 'text',
      required: true,
    },
    {
      key: 'published',
      label: 'Published',
      type: 'boolean',
      helpText: 'Whether the customer can see this note. Defaults to false.',
    },
  ],
};
