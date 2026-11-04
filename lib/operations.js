const client = require('./client');
const hooks = require('./hooks');

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

const toInputField = (field) => {
  const input = {};
  for (const key of INPUT_FIELD_KEYS) {
    if (field[key] !== undefined) {
      input[key] = field[key];
    }
  }
  return input;
};

const searchParams = (resource, inputData) => {
  const params = {};
  for (const field of resource.searchFields) {
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
  return resource.searchFields.some((field) => !isBlank(inputData[field.key]));
};

const writeBody = (fields, inputData, { exclude = [] } = {}) => {
  const body = {};
  for (const field of fields) {
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

const createPerform = (resource) => async (z, bundle) => {
  return client.create(z, `/${resource.path}`, writeBody(resource.createFields, bundle.inputData));
};

const updatePerform = (resource) => async (z, bundle) => {
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

const listPerform = (resource) => async (z, bundle) => {
  const params = {
    per_page: client.MAX_PER_PAGE,
    page: (bundle.meta && bundle.meta.page ? bundle.meta.page : 0) + 1,
    sort: resource.listSort,
  };
  if (resource.listCustomerFilter && !isBlank(bundle.inputData.customer_id)) {
    params['filter[customer_id]'] = bundle.inputData.customer_id;
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

const buildSearch = (resource) => ({
  key: `find_${resource.key}`,
  noun: resource.noun,
  display: {
    label: `Find ${resource.noun}`,
    description: `Finds a ${resource.noun.toLowerCase()}.`,
  },
  operation: {
    perform: findPerform(resource),
    inputFields: [
      {
        key: 'id',
        label: resource.idLabel,
        type: 'integer',
        required: false,
        helpText: `Provide an ID or at least one filter below.`,
      },
      ...resource.searchFields.map(toInputField),
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
    description: `Creates a new ${resource.noun.toLowerCase()}.`,
  },
  operation: {
    perform: createPerform(resource),
    inputFields: resource.createFields.map(toInputField),
    sample: resource.sample,
    outputFields: resource.outputFields,
  },
});

const buildUpdate = (resource) => ({
  key: `update_${resource.key}`,
  noun: resource.noun,
  display: {
    label: `Update ${resource.noun}`,
    description: `Updates an existing ${resource.noun.toLowerCase()}.`,
  },
  operation: {
    perform: updatePerform(resource),
    inputFields: [
      {
        key: 'id',
        label: resource.idLabel,
        type: 'integer',
        required: true,
        dynamic: `list_${resource.path}.id.${resource.displayField}`,
        search: `find_${resource.key}.id`,
      },
      ...resource.updateFields.map(toInputField),
    ],
    sample: resource.sample,
    outputFields: resource.outputFields,
  },
});

const buildListTrigger = (resource) => ({
  key: `list_${resource.path}`,
  noun: resource.noun,
  display: {
    label: `List ${resource.noun}s`,
    description: `Lists ${resource.noun.toLowerCase()}s for dropdowns.`,
    hidden: true,
  },
  operation: {
    canPaginate: true,
    perform: listPerform(resource),
    inputFields: resource.listCustomerFilter
      ? [{ key: 'customer_id', type: 'integer', required: false }]
      : [],
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

const buildAll = (resource) => ({
  searches: {
    [`find_${resource.key}`]: buildSearch(resource),
  },
  creates: {
    [`create_${resource.key}`]: buildCreate(resource),
    [`update_${resource.key}`]: buildUpdate(resource),
  },
  triggers: {
    [`list_${resource.path}`]: buildListTrigger(resource),
    [`new_${resource.key}`]: buildHookTrigger(resource, {
      action: 'created',
      key: `new_${resource.key}`,
      label: `New ${resource.noun}`,
      description: `Triggers when a new ${resource.noun.toLowerCase()} is created.`,
    }),
    [`updated_${resource.key}`]: buildHookTrigger(resource, {
      action: 'updated',
      key: `updated_${resource.key}`,
      label: `Updated ${resource.noun}`,
      description: `Triggers when a ${resource.noun.toLowerCase()} is updated.`,
    }),
  },
});

module.exports = {
  buildAll,
  hasSearchCriteria,
  writeBody,
};
