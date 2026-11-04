const sample = {
  id: 1099,
  customer_id: 88,
  number: 'S1099',
  department_id: 1,
  title: null,
  description: 'No hot water, boiler locked out F28',
  notes: null,
  customer_ref: null,
  status: { id: 1, name: 'New', completes_job: false },
  completed: false,
  created_at: '2026-08-06T22:00:00Z',
  created_by: null,
  admin_contact_email: null,
};

const outputFields = [
  { key: 'id', label: 'ID', type: 'integer' },
  { key: 'customer_id', label: 'Customer ID', type: 'integer' },
  { key: 'number', label: 'Number' },
  { key: 'department_id', label: 'Department ID', type: 'integer' },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'notes', label: 'Notes' },
  { key: 'customer_ref', label: 'Customer ref' },
  { key: 'status__id', label: 'Status ID', type: 'integer' },
  { key: 'status__name', label: 'Status name' },
  { key: 'status__completes_job', label: 'Status completes job', type: 'boolean' },
  { key: 'completed', label: 'Completed', type: 'boolean' },
  { key: 'created_at', label: 'Created at', type: 'datetime' },
  { key: 'created_by', label: 'Created by', type: 'integer' },
  { key: 'admin_contact_email', label: 'Admin contact email' },
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

const contactField = {
  key: 'contact_id',
  label: 'Contact',
  type: 'integer',
  required: true,
  dynamic: 'list_contacts.id.name',
  search: 'find_contact.id',
};

const departmentField = {
  key: 'department_id',
  label: 'Department',
  type: 'integer',
  dynamic: 'list_departments.id.code',
  search: 'find_department.id',
};

const statusField = {
  key: 'status_id',
  label: 'Job Status',
  type: 'integer',
  dynamic: 'list_job_statuses.id.name',
  search: 'find_job_status.id',
};

const writeFields = [
  { key: 'description', label: 'Description', type: 'text', required: true },
  { key: 'title', label: 'Title', type: 'string' },
  { key: 'notes', label: 'Notes', type: 'text' },
  { key: 'customer_ref', label: 'Customer ref', type: 'string' },
  departmentField,
  statusField,
  { key: 'admin_contact_email', label: 'Admin contact email', type: 'string' },
  {
    key: 'equipment_ids',
    label: 'Equipment',
    type: 'integer',
    list: true,
    dynamic: 'list_equipment.id.label',
    helpText: 'Select one or more records. To search by make, serial, or ID number, use Find Equipment in an earlier step.',
  },
];

module.exports = {
  key: 'job',
  noun: 'Job',
  path: 'jobs',
  event: 'job',
  idLabel: 'Job ID',
  displayField: 'number',
  listSort: '-created_at',
  hookListSort: '-created_at',
  sample,
  outputFields,
  createFields: [customerField, siteField, contactField, ...writeFields],
  updateFields: [
    { ...siteField, required: false },
    { ...contactField, required: false },
    ...writeFields.map((field) => ({ ...field, required: false })),
  ],
  updateExclude: ['customer_id'],
  searchFields: [
    { ...customerField, required: false, filter: 'customer_id' },
    { ...siteField, required: false, filter: 'site_id' },
    { ...contactField, required: false, filter: 'contact_id' },
    {
      key: 'equipment_id',
      filter: 'equipment_id',
      label: 'Equipment',
      type: 'integer',
      dynamic: 'list_equipment.id.label',
      search: 'find_equipment.id',
    },
    { ...statusField, filter: 'status_id' },
    { ...departmentField, filter: 'department_id' },
    {
      key: 'completed',
      filter: 'completed',
      label: 'Completed',
      type: 'boolean',
    },
    {
      key: 'scheduled_date',
      filter: 'scheduled_date',
      label: 'Scheduled date',
      type: 'string',
      helpText: 'Jobs with an appointment on this date (YYYY-MM-DD).',
    },
    {
      key: 'scheduled_date_from',
      filter: 'scheduled_date_from',
      label: 'Scheduled date from',
      type: 'string',
      helpText: 'YYYY-MM-DD. Jobs with an appointment on or after this date.',
    },
    {
      key: 'scheduled_date_to',
      filter: 'scheduled_date_to',
      label: 'Scheduled date to',
      type: 'string',
      helpText: 'YYYY-MM-DD. Jobs with an appointment on or before this date.',
    },
    {
      key: 'created_from',
      filter: 'created_from',
      label: 'Created from',
      type: 'string',
      helpText: 'YYYY-MM-DD. Jobs created on or after this date.',
    },
    {
      key: 'created_to',
      filter: 'created_to',
      label: 'Created to',
      type: 'string',
      helpText: 'YYYY-MM-DD. Jobs created on or before this date.',
    },
    {
      key: 'q',
      filter: 'q',
      label: 'Search',
      type: 'string',
      helpText: 'Free-text across title, description, notes, and customer ref.',
    },
    {
      key: 'description_contains',
      filter: 'description_contains',
      label: 'Description contains',
      type: 'string',
    },
    {
      key: 'title_contains',
      filter: 'title_contains',
      label: 'Title contains',
      type: 'string',
    },
    {
      key: 'notes_contains',
      filter: 'notes_contains',
      label: 'Notes contains',
      type: 'string',
    },
  ],
  sortChoices: {
    '-created_at': 'Date created (newest first)',
    created_at: 'Date created (oldest first)',
    id: 'ID (ascending)',
    '-id': 'ID (descending)',
  },
  includeChoices: {
    sites: 'Sites',
    contacts: 'Contacts',
    equipment: 'Equipment',
    appointments: 'Appointments',
    visits: 'Visits',
    communications: 'Communications',
    stock: 'Stock',
    'sites,contacts': 'Sites and contacts',
    'appointments,visits': 'Appointments and visits',
    all: 'All related records',
  },
};
