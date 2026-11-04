const client = require('../lib/client');

const API_ORIGIN = 'https://api.jobable.app';

const isBlank = (value) => value === undefined || value === null || value === '';

const resolveUrl = (z, input) => {
  const trimmed = String(input || '').trim();
  if (!trimmed) {
    throw new z.errors.Error('Enter a path such as /v1/customers, or a full Jobable API URL.', 'InvalidData', 400);
  }

  if (/^https?:\/\//i.test(trimmed)) {
    let parsed;
    try {
      parsed = new URL(trimmed);
    } catch (_error) {
      throw new z.errors.Error('Enter a valid URL or a path such as /v1/customers.', 'InvalidData', 400);
    }
    if (parsed.origin !== API_ORIGIN) {
      throw new z.errors.Error('API Request can only call https://api.jobable.app.', 'InvalidData', 400);
    }
    return parsed.toString();
  }

  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${API_ORIGIN}${path}`;
};

const parseBody = (body) => {
  if (isBlank(body)) {
    return undefined;
  }
  if (typeof body === 'object') {
    return body;
  }
  const text = String(body).trim();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch (_error) {
    return text;
  }
};

const perform = async (z, bundle) => {
  const method = (bundle.inputData.method || 'GET').toUpperCase();
  const options = {
    url: resolveUrl(z, bundle.inputData.url),
    method,
    params: bundle.inputData.query_params,
    headers: bundle.inputData.headers,
  };

  const body = parseBody(bundle.inputData.body);
  if (body !== undefined) {
    options.body = body;
  }

  const response = await z.request(options);
  const payload = response.json !== undefined ? client.present(response.json) : response.content;
  const record = payload && payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? payload.data
    : payload;

  return {
    ...(record && record.id != null ? { id: record.id } : {}),
    status_code: response.status,
    headers: response.headers,
    body: payload,
  };
};

module.exports = {
  key: 'api_request',
  noun: 'API Request',
  display: {
    label: 'API Request',
    description: 'Sends an authenticated request to any Jobable API path. Use this for endpoints that do not have a dedicated action.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'url',
        label: 'URL',
        type: 'string',
        required: true,
        helpText:
          'A path relative to `https://api.jobable.app`, for example `/v1/customers`, or a full Jobable API URL. See the [API documentation](https://api.jobable.app/docs).',
      },
      {
        key: 'method',
        label: 'Method',
        type: 'string',
        required: true,
        choices: {
          GET: 'GET',
          POST: 'POST',
          PUT: 'PUT',
          PATCH: 'PATCH',
          DELETE: 'DELETE',
        },
        default: 'GET',
      },
      {
        key: 'headers',
        label: 'Headers',
        dict: true,
        helpText: 'You do not need authorization headers; the API key is already sent.',
      },
      {
        key: 'query_params',
        label: 'Query String',
        dict: true,
      },
      {
        key: 'body',
        label: 'Body',
        type: 'text',
        helpText: 'JSON body for POST, PUT, or PATCH. Leave blank for GET.',
      },
    ],
    sample: {
      id: 42,
      status_code: 200,
      headers: { 'content-type': 'application/json' },
      body: { data: { id: 42, company: 'Acme Ltd' } },
    },
    outputFields: [
      { key: 'id', label: 'ID', type: 'integer' },
      { key: 'status_code', label: 'Status code', type: 'integer' },
    ],
  },
};
