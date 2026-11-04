const BASE_URL = 'https://api.jobable.app/v1';
const MAX_PER_PAGE = 100;
const DEFAULT_PER_PAGE = 10;

const NAIVE_DATETIME = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

const payload = (response) => {
  if (response.data !== undefined && response.data !== null) {
    return response.data;
  }
  return response.json;
};

const errorInfo = (response) => {
  const body = payload(response) || {};
  const error = body.error || {};
  return {
    message: error.message || response.content || `Jobable API error (${response.status})`,
    code: error.code || 'http_error',
  };
};

const toIsoDateTime = (value) => {
  if (typeof value !== 'string' || !NAIVE_DATETIME.test(value)) {
    return value;
  }
  return `${value.replace(' ', 'T')}Z`;
};

const presentValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(presentValue);
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = key.endsWith('_date') || key.endsWith('_at') ? toIsoDateTime(nested) : presentValue(nested);
    }
    return out;
  }
  return value;
};

const present = (record) => (record == null ? record : presentValue(record));

const afterResponse = (response, z) => {
  if (response.status < 400) {
    return response;
  }

  if (response.status === 404 && response.request && response.request.skipThrowForStatus) {
    return response;
  }

  const { message, code } = errorInfo(response);

  if (response.status === 401 || response.status === 403) {
    throw new z.errors.Error(message, 'AuthenticationError', response.status);
  }

  if (response.status === 429) {
    const retryAfterHeader = response.getHeader('retry-after');
    const retryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : 60;
    throw new z.errors.ThrottledError(message, Number.isFinite(retryAfter) ? retryAfter : 60);
  }

  throw new z.errors.Error(message, code, response.status);
};

const request = async (z, { method = 'GET', path, params, body, skipThrowForStatus = false }) => {
  return z.request({
    url: `${BASE_URL}${path}`,
    method,
    params,
    body,
    skipThrowForStatus,
  });
};

const list = async (z, path, params = {}) => {
  const perPage = Math.min(Number(params.per_page) || DEFAULT_PER_PAGE, MAX_PER_PAGE);
  const response = await request(z, {
    path,
    params: { ...params, per_page: perPage },
  });
  const body = payload(response) || {};
  return Array.isArray(body.data) ? body.data.map(present) : [];
};

const get = async (z, path, { params, notFoundEmpty = false } = {}) => {
  const response = await request(z, {
    path,
    params,
    skipThrowForStatus: notFoundEmpty,
  });
  if (notFoundEmpty && response.status === 404) {
    return null;
  }
  const body = payload(response) || {};
  return present(body.data);
};

const create = async (z, path, body) => {
  const response = await request(z, { method: 'POST', path, body });
  const json = payload(response) || {};
  return present(json.data);
};

const update = async (z, path, body) => {
  const response = await request(z, { method: 'PUT', path, body });
  const json = payload(response) || {};
  return present(json.data);
};

const remove = async (z, path, { notFoundOk = false } = {}) => {
  const response = await request(z, {
    method: 'DELETE',
    path,
    skipThrowForStatus: notFoundOk,
  });
  if (notFoundOk && response.status === 404) {
    return { deleted: true };
  }
  const json = payload(response) || {};
  return json.data || { deleted: true };
};

module.exports = {
  BASE_URL,
  DEFAULT_PER_PAGE,
  MAX_PER_PAGE,
  afterResponse,
  present,
  list,
  get,
  create,
  update,
  remove,
};
