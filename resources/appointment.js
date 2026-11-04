const client = require('../lib/client');
const { isBlank, writeBody } = require('../lib/operations');

const sample = {
  id: 3310,
  job_id: 1042,
  engineer_id: 7,
  date: '2026-08-03',
  time: '09:00',
  end_time: '10:30',
  duration_hours: 1.5,
  signed_in_time: null,
  access_info: 'Key safe by the side gate',
  no_charge: false,
  fixed_price: false,
  quote_id: null,
  quote_amount: null,
  booked_by: { id: 7, type: 'user' },
  updated_at: '2026-07-20T09:20:00Z',
  label: 'Appointment 3310',
};

const outputFields = [
  { key: 'id', label: 'ID', type: 'integer' },
  { key: 'job_id', label: 'Job ID', type: 'integer' },
  { key: 'engineer_id', label: 'Engineer ID', type: 'integer' },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'end_time', label: 'End time' },
  { key: 'duration_hours', label: 'Duration hours', type: 'number' },
  { key: 'signed_in_time', label: 'Signed in time' },
  { key: 'access_info', label: 'Access info' },
  { key: 'no_charge', label: 'No charge', type: 'boolean' },
  { key: 'fixed_price', label: 'Fixed price', type: 'boolean' },
  { key: 'quote_id', label: 'Quote ID', type: 'integer' },
  { key: 'quote_amount', label: 'Quote amount', type: 'number' },
  { key: 'booked_by__id', label: 'Booked by ID', type: 'integer' },
  { key: 'booked_by__type', label: 'Booked by type' },
  { key: 'updated_at', label: 'Updated at', type: 'datetime' },
];

const jobField = {
  key: 'job_id',
  label: 'Job',
  type: 'integer',
  required: true,
  dynamic: 'list_jobs.id.number',
  search: 'find_job.id',
};

const engineerField = {
  key: 'engineer_id',
  label: 'Engineer',
  type: 'integer',
  dynamic: 'list_users.id.name',
  search: 'find_user.id',
};

const customerField = {
  key: 'customer_id',
  label: 'Customer',
  type: 'integer',
  dynamic: 'list_customers.id.company',
  search: 'find_customer.id',
};

const optionalFields = [
  {
    key: 'duration_hours',
    label: 'Duration hours',
    type: 'number',
    helpText: 'Length of the slot in hours, for example 1.5. Defaults to the account setting if left blank.',
  },
  { key: 'access_info', label: 'Access info', type: 'text' },
  { key: 'no_charge', label: 'No charge', type: 'boolean' },
  { key: 'fixed_price', label: 'Fixed price', type: 'boolean' },
  {
    key: 'quote_id',
    label: 'Quote',
    type: 'integer',
    dynamic: 'list_quotes.id.number',
    search: 'find_quote.id',
    helpText: 'An accepted quote this visit is carrying out.',
  },
  { key: 'quote_amount', label: 'Quote amount', type: 'number' },
];

const slotFields = [
  {
    key: 'date',
    label: 'Date',
    type: 'string',
    helpText: 'Local calendar date, YYYY-MM-DD. Required with time and engineer unless you use smart book.',
  },
  {
    key: 'time',
    label: 'Time',
    type: 'string',
    helpText: 'Local start time, HH:MM — not UTC. Required with date and engineer unless you use smart book.',
  },
  engineerField,
];

const createFields = [
  jobField,
  {
    key: 'smart',
    label: 'Smart book',
    type: 'boolean',
    helpText:
      'Let Jobable pick the next available slot. Do not send date, time, or engineer with smart book. The job site must have coordinates.',
  },
  ...slotFields,
  ...optionalFields,
];

const updateFields = [
  {
    key: 'smart',
    label: 'Smart book',
    type: 'boolean',
    helpText: 'Re-run the scheduler for this job. Do not send date, time, or engineer with smart book.',
  },
  ...slotFields,
  ...optionalFields,
];

const isSmart = (value) => value === true || value === 'true';

const hasAnySlot = (inputData) =>
  !isBlank(inputData.date) || !isBlank(inputData.time) || !isBlank(inputData.engineer_id);

const hasFullSlot = (inputData) =>
  !isBlank(inputData.date) && !isBlank(inputData.time) && !isBlank(inputData.engineer_id);

const appointmentBody = (z, fields, inputData, options) => {
  if (isSmart(inputData.smart) && hasAnySlot(inputData)) {
    throw new z.errors.Error(
      'Choose either smart book or date, time, and engineer — not both.',
      'InvalidData',
      400,
    );
  }
  const body = writeBody(fields, inputData, options);
  if (isSmart(inputData.smart)) {
    body.smart = true;
    delete body.date;
    delete body.time;
    delete body.engineer_id;
  } else {
    delete body.smart;
  }
  return body;
};

const createPerform = async (z, bundle) => {
  if (!isSmart(bundle.inputData.smart) && !hasFullSlot(bundle.inputData)) {
    throw new z.errors.Error(
      'Provide smart book, or date, time, and engineer together.',
      'InvalidData',
      400,
    );
  }
  return client.create(z, '/appointments', appointmentBody(z, createFields, bundle.inputData));
};

const updatePerform = async (z, bundle) => {
  const body = appointmentBody(z, updateFields, bundle.inputData);
  if (Object.keys(body).length === 0) {
    throw new z.errors.Error('Provide at least one field to update.', 'InvalidData', 400);
  }
  return client.update(z, `/appointments/${bundle.inputData.id}`, body);
};

const appointmentLabel = (record) => {
  const slot = [record.date, record.time].filter(Boolean).join(' at ');
  return slot ? `#${record.id} ${slot}` : `Appointment ${record.id}`;
};

module.exports = {
  key: 'appointment',
  noun: 'Appointment',
  path: 'appointments',
  event: 'appointment',
  idLabel: 'Appointment ID',
  displayField: 'label',
  listSort: '-date',
  hookListSort: '-id',
  listFilters: ['job_id'],
  listLabel: { key: 'label', value: appointmentLabel },
  operations: ['search', 'list', 'create', 'update', 'delete', 'hooks'],
  deleteDescription: 'Deletes an appointment.',
  deleteHelpText:
    'This permanently deletes the appointment and cannot be undone. A signed-in appointment, or one that already has a visit, returns an error and is left in place.',
  sample,
  outputFields,
  createFields,
  updateFields,
  createPerform,
  updatePerform,
  searchFields: [
    { ...jobField, required: false, filter: 'job_id' },
    { ...engineerField, filter: 'engineer_id' },
    { ...customerField, filter: 'customer_id' },
    {
      key: 'date',
      filter: 'date',
      label: 'Date',
      type: 'string',
      helpText: 'Appointments on exactly this date (YYYY-MM-DD).',
    },
    {
      key: 'date_from',
      filter: 'date_from',
      label: 'Date from',
      type: 'string',
      helpText: 'YYYY-MM-DD. Appointments on or after this date.',
    },
    {
      key: 'date_to',
      filter: 'date_to',
      label: 'Date to',
      type: 'string',
      helpText: 'YYYY-MM-DD. Appointments on or before this date.',
    },
  ],
  sortChoices: {
    date: 'Date (oldest first)',
    '-date': 'Date (newest first)',
    updated_at: 'Updated (oldest first)',
    '-updated_at': 'Updated (newest first)',
    id: 'ID (ascending)',
    '-id': 'ID (descending)',
  },
};
