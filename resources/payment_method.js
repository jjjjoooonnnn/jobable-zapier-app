const sample = {
  id: 1,
  name: 'Card',
  default: true,
};

const outputFields = [
  { key: 'id', label: 'ID', type: 'integer' },
  { key: 'name', label: 'Name' },
  { key: 'default', label: 'Default', type: 'boolean' },
];

module.exports = {
  key: 'payment_method',
  noun: 'Payment Method',
  plural: 'Payment Methods',
  path: 'payment_methods',
  idLabel: 'Payment Method ID',
  displayField: 'name',
  operations: ['search', 'list'],
  searchDescription: 'Finds a payment method.',
  sample,
  outputFields,
};
