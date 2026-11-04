const client = require('./client');
const hooks = require('./hooks');

const DEFAULT_OPERATIONS = ['search', 'list', 'create', 'update', 'hooks'];

const INPUT_FIELD_KEYS = [
  'key',
  'label',
  'type',
  'required',
  'helpText',
  'choices',
  'dynamic',
  'search',
  'list',
  'dict',
  'altersDynamicFields',
  'computed',
  'placeholder',
  'default',
  'children',
];

const isBlank = (value) => value === undefined || value === null || value === '';

const hasOp = (resource, name) => (resource.operations || DEFAULT_OPERATIONS).includes(name);

const listFilterKeys = (resource) => {
  if (resource.listFilters) {
    return resource.listFilters;
  }
  return resource.listCustomerFilter ? ['customer_id'] : [];
};

const pluralize = (resource) => resource.plural || `${resource.noun}s`;

const toInputField = (field) => {
  const input = {};
  for (const key of INPUT_FIELD_KEYS) {
    if (field[key] === undefined) {
      continue;
    }
    input[key] = key === 'children' ? field.children.map(toInputField) : field[key];
  }
  return input;
};

const searchParams = (resource, inputData) => {
  const params = {};
  for (const field of resource.searchFields || []) {
    if (isBlank(inputData[field.key])) {
      continue;
    }
    params[`filter[${field.filter || field.key}]`] = inputData[field.key];
  }
  if (!isBlank(inputData.sort)) {
    params.sort = inputData.sort;
  }
  if (!isBlank(inputData.include)) {
    params.include = inputData.include;
  }
  if (!isBlank(inputData.limit)) {
    params.per_page = inputData.limit;
  }
  return params;
};

const hasSearchCriteria = (resource, inputData) => {
  if (!isBlank(inputData.id)) {
    return true;
  }
  return (resource.searchFields || []).some((field) => !isBlank(inputData[field.key]));
};

const writeBody = (fields, inputData, { exclude = [] } = {}) => {
  const body = {};
  for (const field of fields || []) {
    if (exclude.includes(field.key) || field.key === 'id') {
      continue;
    }
    if (!(field.key in inputData) || inputData[field.key] === '') {
      continue;
    }
    if (inputData[field.key] === undefined) {
      continue;
    }
    body[field.key] = inputData[field.key];
  }
  return body;
};

const findPerform = (resource) => async (z, bundle) => {
  if (!hasSearchCriteria(resource, bundle.inputData)) {
    throw new z.errors.Error(
      `Provide a ${resource.noun.toLowerCase()} ID or at least one search filter.`,
      'InvalidData',
      400,
    );
  }

  if (!isBlank(bundle.inputData.id)) {
    const params = {};
    if (!isBlank(bundle.inputData.include)) {
      params.include = bundle.inputData.include;
    }
    const record = await client.get(z, `/${resource.path}/${bundle.inputData.id}`, {
      params,
      notFoundEmpty: true,
    });
    return record ? [record] : [];
  }

  return client.list(z, `/${resource.path}`, searchParams(resource, bundle.inputData));
};

const createPerform = (resource) => {
  if (resource.createPerform) {
    return resource.createPerform;
  }
  return async (z, bundle) => {
    return client.create(z, `/${resource.path}`, writeBody(resource.createFields, bundle.inputData));
  };
};

const updatePerform = (resource) => {
  if (resource.updatePerform) {
    return resource.updatePerform;
  }
  return async (z, bundle) => {
    const body = writeBody(resource.updateFields, bundle.inputData, {
      exclude: resource.updateExclude || [],
    });
    if (Object.keys(body).length === 0) {
      throw new z.errors.Error(
        'Provide at least one field to update.',
        'InvalidData',
        400,
      );
    }
    return client.update(z, `/${resource.path}/${bundle.inputData.id}`, body);
  };
};

const deletePerform = (resource) => async (z, bundle) => {
  return client.remove(z, `/${resource.path}/${bundle.inputData.id}`);
};

const listPerform = (resource) => async (z, bundle) => {
  const params = {
    per_page: client.MAX_PER_PAGE,
    page: (bundle.meta && bundle.meta.page ? bundle.meta.page : 0) + 1,
    ...(resource.listSort ? { sort: resource.listSort } : {}),
    ...(resource.listDefaults || {}),
  };
  for (const key of listFilterKeys(resource)) {
    if (!isBlank(bundle.inputData[key])) {
      params[`filter[${key}]`] = bundle.inputData[key];
    }
  }
  const records = await client.list(z, `/${resource.path}`, params);
  if (!resource.listLabel) {
    return records;
  }
  return records.map((record) => ({
    ...record,
    [resource.listLabel.key]: resource.listLabel.value(record),
  }));
};

const idDropdown = (resource, { required, search }) => ({
  key: 'id',
  label: resource.idLabel,
  type: 'integer',
  required,
  dynamic: `list_${resource.path}.id.${resource.displayField}`,
  ...(search ? { search: `find_${resource.key}.id` } : {}),
});

const buildSearch = (resource) => ({
  key: `find_${resource.key}`,
  noun: resource.noun,
  display: {
    label: `Find ${resource.noun}`,
    description: resource.searchDescription || `Finds a ${resource.noun.toLowerCase()}.`,
  },
  operation: {
    perform: findPerform(resource),
    inputFields: [
      {
        ...idDropdown(resource, { required: false }),
        helpText: `Select a ${resource.noun.toLowerCase()} or map an ID from a previous step. You can also use the filters below.`,
      },
      ...(resource.searchFields || []).map(toInputField),
      ...(resource.sortChoices
        ? [{
            key: 'sort',
            label: 'Sort',
            type: 'string',
            required: false,
            choices: resource.sortChoices,
            helpText: 'Used when searching by filter rather than ID.',
          }]
        : []),
      ...(resource.includeChoices
        ? [{
            key: 'include',
            label: 'Include related records',
            type: 'string',
            required: false,
            choices: resource.includeChoices,
          }]
        : []),
      {
        key: 'limit',
        label: 'Limit',
        type: 'integer',
        required: false,
        helpText: 'Number of records to return when searching by filter. Defaults to 10, maximum 100.',
      },
    ],
    sample: resource.sample,
    outputFields: resource.outputFields,
  },
});

const buildCreate = (resource) => ({
  key: `create_${resource.key}`,
  noun: resource.noun,
  display: {
    label: `Create ${resource.noun}`,
    description: resource.createDescription || `Creates a new ${resource.noun.toLowerCase()}.`,
  },
  operation: {
    perform: createPerform(resource),
    inputFields: (resource.createFields || []).map(toInputField),
    sample: resource.sample,
    outputFields: resource.outputFields,
  },
});

const buildUpdate = (resource) => ({
  key: `update_${resource.key}`,
  noun: resource.noun,
  display: {
    label: `Update ${resource.noun}`,
    description: resource.updateDescription || `Updates an existing ${resource.noun.toLowerCase()}.`,
  },
  operation: {
    perform: updatePerform(resource),
    inputFields: [
      {
        ...idDropdown(resource, { required: true, search: true }),
      },
      ...(resource.updateFields || []).map(toInputField),
    ],
    sample: resource.sample,
    outputFields: resource.outputFields,
  },
});

const buildDelete = (resource) => ({
  key: `delete_${resource.key}`,
  noun: resource.noun,
  display: {
    label: `Delete ${resource.noun}`,
    description: resource.deleteDescription || `Deletes a ${resource.noun.toLowerCase()}.`,
  },
  operation: {
    perform: deletePerform(resource),
    inputFields: [
      {
        ...idDropdown(resource, { required: true, search: true }),
      },
      {
        key: 'warning',
        type: 'copy',
        helpText: resource.deleteHelpText
          || 'This permanently deletes the record and cannot be undone.',
      },
    ],
    sample: { id: resource.sample.id, deleted: true },
    outputFields: [
      { key: 'id', label: 'ID', type: 'integer' },
      { key: 'deleted', label: 'Deleted', type: 'boolean' },
    ],
  },
});

const buildListTrigger = (resource) => ({
  key: `list_${resource.path}`,
  noun: resource.noun,
  display: {
    label: `List ${pluralize(resource)}`,
    description: `Lists ${pluralize(resource).toLowerCase()} for dropdowns.`,
    hidden: true,
  },
  operation: {
    canPaginate: true,
    perform: listPerform(resource),
    inputFields: listFilterKeys(resource).map((key) => ({
      key,
      type: 'integer',
      required: false,
    })),
    sample: resource.sample,
    outputFields: resource.outputFields,
  },
});

const buildHookTrigger = (resource, { action, key, label, description }) => ({
  key,
  noun: resource.noun,
  display: {
    label,
    description,
  },
  operation: {
    type: 'hook',
    performSubscribe: (z, bundle) => hooks.subscribe(z, bundle, { event: `${resource.event}.${action}`, label }),
    performUnsubscribe: (z, bundle) => hooks.unsubscribe(z, bundle),
    perform: (z, bundle) => hooks.perform(z, bundle, { event: `${resource.event}.${action}` }),
    performList: (z, bundle) => hooks.performList(z, bundle, { path: `/${resource.path}`, sort: resource.hookListSort }),
    sample: {
      ...resource.sample,
      event: `${resource.event}.${action}`,
      occurred_at: '2026-07-15T16:42:03Z',
    },
    outputFields: [
      { key: 'event', label: 'Event' },
      { key: 'occurred_at', label: 'Occurred at' },
      { key: 'delivery_id', label: 'Delivery ID' },
      ...resource.outputFields,
    ],
  },
});

const buildAll = (resource) => {
  const searches = {};
  const creates = {};
  const triggers = {};

  if (hasOp(resource, 'search')) {
    searches[`find_${resource.key}`] = buildSearch(resource);
  }
  if (hasOp(resource, 'create')) {
    creates[`create_${resource.key}`] = buildCreate(resource);
  }
  if (hasOp(resource, 'update')) {
    creates[`update_${resource.key}`] = buildUpdate(resource);
  }
  if (hasOp(resource, 'delete')) {
    creates[`delete_${resource.key}`] = buildDelete(resource);
  }
  if (hasOp(resource, 'list')) {
    triggers[`list_${resource.path}`] = buildListTrigger(resource);
  }
  if (hasOp(resource, 'hooks')) {
    triggers[`new_${resource.key}`] = buildHookTrigger(resource, {
      action: 'created',
      key: `new_${resource.key}`,
      label: `New ${resource.noun}`,
      description: resource.newDescription || `Triggers when a new ${resource.noun.toLowerCase()} is created.`,
    });
    triggers[`updated_${resource.key}`] = buildHookTrigger(resource, {
      action: 'updated',
      key: `updated_${resource.key}`,
      label: `Updated ${resource.noun}`,
      description: resource.updatedDescription || `Triggers when a ${resource.noun.toLowerCase()} is updated.`,
    });
  }

  return { searches, creates, triggers };
};

module.exports = {
  buildAll,
  hasSearchCriteria,
  writeBody,
  isBlank,
};
