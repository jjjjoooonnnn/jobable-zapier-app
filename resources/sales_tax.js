const sample = {
  id: 1,
  name: 'Standard Rate',
  rate: 0.2,
  default: true,
};

const outputFields = [
  { key: 'id', label: 'ID', type: 'integer' },
  { key: 'name', label: 'Name' },
  { key: 'rate', label: 'Rate', type: 'number' },
  { key: 'default', label: 'Default', type: 'boolean' },
];

module.exports = {
  key: 'sales_tax',
  noun: 'Sales Tax',
  plural: 'Sales Taxes',
  path: 'sales_taxes',
  idLabel: 'Sales Tax ID',
  displayField: 'name',
  listDefaults: { 'filter[status]': 'active' },
  operations: ['search', 'list'],
  searchDescription: 'Finds a sales tax.',
  sample,
  outputFields,
  searchFields: [
    {
      key: 'default',
      filter: 'default',
      label: 'Default',
      type: 'boolean',
      helpText: 'True returns only the account default rate.',
    },
    {
      key: 'status',
      filter: 'status',
      label: 'Status',
      type: 'string',
      choices: {
        active: 'Active',
        archived: 'Archived',
        'active,archived': 'Active and archived',
      },
      helpText: 'Defaults to active rates. Archived rates are hidden unless you ask for them.',
    },
  ],
};
