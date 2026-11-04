const sample = {
  id: 1,
  code: 'S',
  default: true,
  callout_charge: 60,
  labour_charge: 45,
  labour_charge_increment: 1,
  minimum_labour_charge: 45,
  return_visit_charge: 30,
};

const outputFields = [
  { key: 'id', label: 'ID', type: 'integer' },
  { key: 'code', label: 'Code' },
  { key: 'default', label: 'Default', type: 'boolean' },
  { key: 'callout_charge', label: 'Callout charge', type: 'number' },
  { key: 'labour_charge', label: 'Labour charge', type: 'number' },
  { key: 'labour_charge_increment', label: 'Labour charge increment', type: 'number' },
  { key: 'minimum_labour_charge', label: 'Minimum labour charge', type: 'number' },
  { key: 'return_visit_charge', label: 'Return visit charge', type: 'number' },
];

module.exports = {
  key: 'department',
  noun: 'Department',
  path: 'departments',
  idLabel: 'Department ID',
  displayField: 'code',
  listSort: 'id',
  operations: ['search', 'list'],
  sample,
  outputFields,
};
