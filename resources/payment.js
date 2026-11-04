const sample = {
  id: 401,
  job_id: 12,
  customer_id: 4,
  invoice_id: 30,
  paid_at: '2026-07-15T10:00:00Z',
  amount: 90,
  method: '1',
  method_name: 'Card',
  verified: true,
  description: null,
  label: 'Payment 401',
};

const outputFields = [
  { key: 'id', label: 'ID', type: 'integer' },
  { key: 'job_id', label: 'Job ID', type: 'integer' },
  { key: 'customer_id', label: 'Customer ID', type: 'integer' },
  { key: 'invoice_id', label: 'Invoice ID', type: 'integer' },
  { key: 'paid_at', label: 'Paid at', type: 'datetime' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'method', label: 'Method' },
  { key: 'method_name', label: 'Method name' },
  { key: 'verified', label: 'Verified', type: 'boolean' },
  { key: 'description', label: 'Description' },
];

const jobField = {
  key: 'job_id',
  label: 'Job',
  type: 'integer',
  required: true,
  dynamic: 'list_jobs.id.number',
  search: 'find_job.id',
};

const invoiceField = {
  key: 'invoice_id',
  label: 'Invoice',
  type: 'integer',
  dynamic: 'list_invoices.id.number',
  search: 'find_invoice.id',
};

const methodField = {
  key: 'method',
  label: 'Method',
  type: 'string',
  dynamic: 'list_payment_methods.id.name',
  search: 'find_payment_method.id',
  helpText: 'Pick a payment method or type a free-text label such as Accounts.',
};

const writeFields = [
  invoiceField,
  {
    key: 'paid_at',
    label: 'Paid at',
    type: 'string',
    helpText: 'YYYY-MM-DD, or a datetime. Defaults to today if left blank.',
  },
  { key: 'amount', label: 'Amount', type: 'number', required: true },
  methodField,
  { key: 'verified', label: 'Verified', type: 'boolean' },
  { key: 'description', label: 'Description', type: 'string' },
];

const paymentLabel = (record) => {
  const bits = [record.method_name || record.method, record.amount != null ? String(record.amount) : null].filter(
    Boolean,
  );
  return bits.length ? `#${record.id} ${bits.join(' · ')}` : `Payment ${record.id}`;
};

module.exports = {
  key: 'payment',
  noun: 'Payment',
  path: 'payments',
  event: 'payment',
  idLabel: 'Payment ID',
  displayField: 'label',
  listSort: '-paid_at',
  hookListSort: '-id',
  listFilters: ['job_id', 'invoice_id'],
  listLabel: { key: 'label', value: paymentLabel },
  operations: ['search', 'list', 'create', 'update', 'delete', 'hooks'],
  deleteDescription: 'Deletes a payment.',
  deleteHelpText: 'This permanently deletes the payment and cannot be undone.',
  sample,
  outputFields,
  createFields: [jobField, ...writeFields],
  updateFields: [
    { ...jobField, required: false },
    ...writeFields.map((field) => ({ ...field, required: false })),
  ],
  searchFields: [
    { ...jobField, required: false, filter: 'job_id' },
    {
      key: 'customer_id',
      filter: 'customer_id',
      label: 'Customer',
      type: 'integer',
      dynamic: 'list_customers.id.company',
      search: 'find_customer.id',
    },
    { ...invoiceField, filter: 'invoice_id' },
    {
      key: 'unassigned',
      filter: 'unassigned',
      label: 'Unassigned',
      type: 'boolean',
      helpText: 'True returns only payments with no invoice.',
    },
    {
      key: 'paid_at_from',
      filter: 'paid_at_from',
      label: 'Paid from',
      type: 'string',
      helpText: 'YYYY-MM-DD. Payments paid on or after this date.',
    },
    {
      key: 'paid_at_to',
      filter: 'paid_at_to',
      label: 'Paid to',
      type: 'string',
      helpText: 'YYYY-MM-DD. Payments paid on or before this date.',
    },
    { ...methodField, filter: 'method' },
    { key: 'verified', filter: 'verified', label: 'Verified', type: 'boolean' },
  ],
  sortChoices: {
    '-paid_at': 'Paid (newest first)',
    paid_at: 'Paid (oldest first)',
    '-amount': 'Amount (highest first)',
    amount: 'Amount (lowest first)',
    '-id': 'ID (newest first)',
    id: 'ID (oldest first)',
  },
};
