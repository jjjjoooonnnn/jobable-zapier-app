const sample = {
  id: 10,
  name: 'Condensing Unit',
  parent_id: 4,
  fgas: true,
};

const outputFields = [
  { key: 'id', label: 'ID', type: 'integer' },
  { key: 'name', label: 'Name' },
  { key: 'parent_id', label: 'Parent ID', type: 'integer' },
  { key: 'fgas', label: 'F-gas', type: 'boolean' },
];

module.exports = {
  key: 'equipment_category',
  noun: 'Equipment Category',
  plural: 'Equipment Categories',
  path: 'equipment_categories',
  idLabel: 'Equipment Category ID',
  displayField: 'name',
  listSort: 'id',
  operations: ['search', 'list'],
  searchDescription: 'Finds an equipment category.',
  sample,
  outputFields,
  searchFields: [
    {
      key: 'parent_id',
      filter: 'parent_id',
      label: 'Parent',
      type: 'integer',
      dynamic: 'list_equipment_categories.id.name',
      search: 'find_equipment_category.id',
      helpText: 'Return only sub-categories of this category.',
    },
    {
      key: 'top_level',
      filter: 'top_level',
      label: 'Top level',
      type: 'boolean',
      helpText: 'True returns only categories with no parent; false returns only sub-categories.',
    },
    {
      key: 'name',
      filter: 'name',
      label: 'Name',
      type: 'string',
      helpText: 'Exact match, case-insensitive.',
    },
    {
      key: 'name_contains',
      filter: 'name_contains',
      label: 'Name contains',
      type: 'string',
      helpText: 'Case-insensitive substring match on name.',
    },
  ],
};
