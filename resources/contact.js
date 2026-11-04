const sample = {
  id: 12,
  customer_id: 4,
  site_id: 9,
  title: 'Ms',
  firstname: 'Alice',
  lastname: 'Mason',
  position: 'Operations',
  phone1: null,
  phone2: null,
  email: 'alice@acme.test',
  status: 'Active',
};

const outputFields = [
  { key: 'id', label: 'ID', type: 'integer' },
  { key: 'customer_id', label: 'Customer ID', type: 'integer' },
  { key: 'site_id', label: 'Site ID', type: 'integer' },
  { key: 'title', label: 'Title' },
  { key: 'firstname', label: 'First name' },
  { key: 'lastname', label: 'Last name' },
  { key: 'position', label: 'Position' },
  { key: 'phone1', label: 'Phone 1' },
  { key: 'phone2', label: 'Phone 2' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
];

const customerField = {
  key: 'customer_id',
  label: 'Customer',
  type: 'integer',
  required: true,
  dynamic: 'list_customers.id.company',
  search: 'find_customer.id',
  altersDynamicFields: true,
};

const siteField = {
  key: 'site_id',
  label: 'Site',
  type: 'integer',
  required: true,
  dynamic: 'list_sites.id.name',
  search: 'find_site.id',
};

const writeFields = [
  { key: 'title', label: 'Title', type: 'string' },
  { key: 'firstname', label: 'First name', type: 'string', required: true },
  { key: 'lastname', label: 'Last name', type: 'string' },
  { key: 'position', label: 'Position', type: 'string' },
  { key: 'phone1', label: 'Phone 1', type: 'string' },
  { key: 'phone2', label: 'Phone 2', type: 'string' },
  { key: 'email', label: 'Email', type: 'string' },
  {
    key: 'status',
    label: 'Status',
    type: 'string',
    choices: { Active: 'Active', Inactive: 'Inactive' },
    helpText: 'Defaults to Active if left blank.',
  },
];

const contactName = (record) => {
  const name = [record.firstname, record.lastname].filter(Boolean).join(' ').trim();
  return name || `Contact ${record.id}`;
};

module.exports = {
  key: 'contact',
  noun: 'Contact',
  path: 'contacts',
  event: 'contact',
  idLabel: 'Contact ID',
  displayField: 'name',
  listSort: 'lastname',
  hookListSort: '-id',
  listCustomerFilter: true,
  listLabel: { key: 'name', value: contactName },
  sample,
  outputFields,
  createFields: [customerField, siteField, ...writeFields],
  updateFields: [
    { ...siteField, required: false },
    ...writeFields.map((field) => ({ ...field, required: false })),
  ],
  updateExclude: ['customer_id'],
  searchFields: [
    {
      ...customerField,
      required: false,
      filter: 'customer_id',
    },
    {
      ...siteField,
      required: false,
      filter: 'site_id',
    },
    {
      key: 'status',
      filter: 'status',
      label: 'Status',
      type: 'string',
      choices: { Active: 'Active', Inactive: 'Inactive' },
    },
    {
      key: 'email',
      filter: 'email',
      label: 'Email',
      type: 'string',
      helpText: 'Exact match (case-insensitive).',
    },
    {
      key: 'phone',
      filter: 'phone',
      label: 'Phone',
      type: 'string',
      helpText: 'Exact match as stored — no normalisation.',
    },
    {
      key: 'q',
      filter: 'q',
      label: 'Search',
      type: 'string',
      helpText: 'Free-text across first name, last name, and email.',
    },
    {
      key: 'name_contains',
      filter: 'name_contains',
      label: 'Name contains',
      type: 'string',
      helpText: 'Case-insensitive substring match across first name and last name.',
    },
    {
      key: 'firstname',
      filter: 'firstname',
      label: 'First name',
      type: 'string',
      helpText: 'Exact match, case-insensitive.',
    },
    {
      key: 'lastname',
      filter: 'lastname',
      label: 'Last name',
      type: 'string',
      helpText: 'Exact match, case-insensitive.',
    },
  ],
  sortChoices: {
    lastname: 'Last name A–Z',
    '-lastname': 'Last name Z–A',
    firstname: 'First name A–Z',
    '-firstname': 'First name Z–A',
    id: 'ID (ascending)',
    '-id': 'ID (descending)',
  },
};
