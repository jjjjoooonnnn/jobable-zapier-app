const sample = {
  id: 21,
  supplier_id: 4,
  number: 'RN21',
  date: '2026-07-12',
  notes: null,
  purchase_order_id: 55,
  supplier_invoice_ref: 'INV-900',
  supplier_rma: 'RMA-12',
  action_required: null,
  goods_sent: false,
  credit_received: false,
  complete: false,
  cancelled: false,
  status: 'open',
  line_items: [
    {
      supplier_ref: 'PART-1',
      description: 'Faulty valve',
      quantity: 1,
      return_reason: 'Leaking',
      sequence: 0,
    },
  ],
  sites: [
    {
      name: 'Warehouse',
      address1: '1 Depot Rd',
      address2: null,
      town: 'Leeds',
      county: null,
      postcode: 'LS1 1AA',
    },
  ],
};

const outputFields = [
  { key: 'id', label: 'ID', type: 'integer' },
  { key: 'number', label: 'Number' },
  { key: 'supplier_id', label: 'Supplier ID', type: 'integer' },
  { key: 'date', label: 'Date' },
  { key: 'notes', label: 'Notes' },
  { key: 'purchase_order_id', label: 'Purchase order ID', type: 'integer' },
  { key: 'supplier_invoice_ref', label: 'Supplier invoice ref' },
  { key: 'supplier_rma', label: 'Supplier RMA' },
  { key: 'action_required', label: 'Action required' },
  { key: 'goods_sent', label: 'Goods sent', type: 'boolean' },
  { key: 'credit_received', label: 'Credit received', type: 'boolean' },
  { key: 'complete', label: 'Complete', type: 'boolean' },
  { key: 'cancelled', label: 'Cancelled', type: 'boolean' },
  { key: 'status', label: 'Status' },
  { key: 'line_items[]supplier_ref', label: 'Line supplier ref' },
  { key: 'line_items[]description', label: 'Line description' },
  { key: 'line_items[]quantity', label: 'Line quantity', type: 'number' },
  { key: 'line_items[]return_reason', label: 'Line return reason' },
  { key: 'line_items[]sequence', label: 'Line sequence', type: 'integer' },
  { key: 'sites[]name', label: 'Site name' },
  { key: 'sites[]address1', label: 'Site address line 1' },
  { key: 'sites[]address2', label: 'Site address line 2' },
  { key: 'sites[]town', label: 'Site town' },
  { key: 'sites[]county', label: 'Site county' },
  { key: 'sites[]postcode', label: 'Site postcode' },
];

const supplierField = {
  key: 'supplier_id',
  label: 'Supplier',
  type: 'integer',
  required: true,
  dynamic: 'list_suppliers.id.company',
  search: 'find_supplier.id',
  altersDynamicFields: true,
};

const purchaseOrderField = {
  key: 'purchase_order_id',
  label: 'Purchase Order',
  type: 'integer',
  dynamic: 'list_purchase_orders.id.number',
  search: 'find_purchase_order.id',
};

const lineItemsField = {
  key: 'line_items',
  label: 'Line items',
  children: [
    { key: 'supplier_ref', label: 'Supplier ref', type: 'string' },
    {
      key: 'description',
      label: 'Description',
      type: 'text',
      required: true,
    },
    { key: 'quantity', label: 'Quantity', type: 'number' },
    { key: 'return_reason', label: 'Return reason', type: 'string' },
    {
      key: 'sequence',
      label: 'Sequence',
      type: 'integer',
      helpText: 'Display order. Defaults to array order if omitted.',
    },
  ],
};

const sitesHelpField = {
  key: 'sites_help',
  type: 'copy',
  helpText: 'Embedded return addresses, not Jobable site IDs.',
};

const sitesField = {
  key: 'sites',
  label: 'Sites',
  children: [
    { key: 'name', label: 'Name', type: 'string', required: true },
    { key: 'address1', label: 'Address line 1', type: 'string' },
    { key: 'address2', label: 'Address line 2', type: 'string' },
    { key: 'town', label: 'Town', type: 'string' },
    { key: 'county', label: 'County', type: 'string' },
    { key: 'postcode', label: 'Postcode', type: 'string' },
  ],
};

const writeFields = [
  {
    key: 'date',
    label: 'Date',
    type: 'string',
    helpText: 'YYYY-MM-DD. Defaults to today if left blank.',
  },
  { key: 'notes', label: 'Notes', type: 'text' },
  purchaseOrderField,
  { key: 'supplier_invoice_ref', label: 'Supplier invoice ref', type: 'string' },
  { key: 'supplier_rma', label: 'Supplier RMA', type: 'string' },
  { key: 'action_required', label: 'Action required', type: 'string' },
  { key: 'goods_sent', label: 'Goods sent', type: 'boolean' },
  { key: 'credit_received', label: 'Credit received', type: 'boolean' },
  { key: 'complete', label: 'Complete', type: 'boolean' },
  { key: 'cancelled', label: 'Cancelled', type: 'boolean' },
  lineItemsField,
  sitesHelpField,
  sitesField,
];

module.exports = {
  key: 'return',
  noun: 'Return',
  plural: 'Returns',
  path: 'returns',
  event: 'return',
  idLabel: 'Return ID',
  displayField: 'number',
  listSort: '-date',
  hookListSort: '-id',
  listFilters: ['supplier_id'],
  sample,
  outputFields,
  createFields: [supplierField, ...writeFields],
  updateFields: [
    {
      key: 'replace_warning',
      type: 'copy',
      helpText:
        'Sending Line items or Sites replaces the whole set. Omit them to leave the current set. Sites are return addresses, not Jobable site IDs. A complete or cancelled return rejects a body that includes line items.',
    },
    { ...supplierField, required: false },
    ...writeFields.filter((field) => field.key !== 'sites_help'),
  ],
  updateExclude: ['replace_warning', 'sites_help'],
  searchFields: [
    { ...supplierField, required: false, filter: 'supplier_id' },
    {
      key: 'status',
      filter: 'status',
      label: 'Status',
      type: 'string',
      choices: {
        open: 'Open',
        goods_sent: 'Goods sent',
        credit_received: 'Credit received',
        complete: 'Complete',
        cancelled: 'Cancelled',
      },
    },
    { key: 'goods_sent', filter: 'goods_sent', label: 'Goods sent', type: 'boolean' },
    {
      key: 'credit_received',
      filter: 'credit_received',
      label: 'Credit received',
      type: 'boolean',
    },
    { key: 'complete', filter: 'complete', label: 'Complete', type: 'boolean' },
    { key: 'cancelled', filter: 'cancelled', label: 'Cancelled', type: 'boolean' },
    {
      key: 'date_from',
      filter: 'date_from',
      label: 'Date from',
      type: 'string',
      helpText: 'YYYY-MM-DD. Returns dated on or after this date.',
    },
    {
      key: 'date_to',
      filter: 'date_to',
      label: 'Date to',
      type: 'string',
      helpText: 'YYYY-MM-DD. Returns dated on or before this date.',
    },
  ],
  sortChoices: {
    '-date': 'Date (newest first)',
    date: 'Date (oldest first)',
    '-id': 'ID (newest first)',
    id: 'ID (oldest first)',
  },
};
