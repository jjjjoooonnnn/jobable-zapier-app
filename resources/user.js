const sample = {
  id: 3,
  name: 'Ada Lovelace',
  email: 'ada@acme.test',
  status: 'Active',
};

const outputFields = [
  { key: 'id', label: 'ID', type: 'integer' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
];

module.exports = {
  key: 'user',
  noun: 'User',
  path: 'users',
  idLabel: 'User ID',
  displayField: 'name',
  listSort: 'name',
  listDefaults: { 'filter[status]': 'active' },
  operations: ['search', 'list'],
  sample,
  outputFields,
  searchFields: [
    {
      key: 'status',
      filter: 'status',
      label: 'Status',
      type: 'string',
      choices: {
        active: 'Active',
        suspended: 'Suspended',
        'active,suspended': 'Active and suspended',
      },
      helpText: 'Defaults to active users. Suspended users are hidden unless you ask for them.',
    },
    {
      key: 'q',
      filter: 'q',
      label: 'Search',
      type: 'string',
      helpText: 'Free-text across name and email.',
    },
    {
      key: 'name_contains',
      filter: 'name_contains',
      label: 'Name contains',
      type: 'string',
      helpText: 'Case-insensitive substring match across name and email.',
    },
  ],
  sortChoices: {
    name: 'Name A–Z',
    '-name': 'Name Z–A',
    id: 'ID (ascending)',
    '-id': 'ID (descending)',
  },
};
