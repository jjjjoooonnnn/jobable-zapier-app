const crypto = require('crypto');
const client = require('./client');

const SIGNATURE_TOLERANCE_SECONDS = 300;
const DELIVERY_CACHE_TTL_SECONDS = 60 * 60 * 24;

const headerValue = (headers, name) => {
  if (!headers) {
    return '';
  }
  const wanted = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    const normalised = String(key)
      .toLowerCase()
      .replace(/^http_/, '')
      .replace(/_/g, '-');
    if (normalised === wanted || String(key).toLowerCase() === wanted) {
      return Array.isArray(value) ? String(value[0] || '') : String(value || '');
    }
  }
  return '';
};

const verifySignature = (rawBody, headers, secret) => {
  const timestamp = headerValue(headers, 'x-jobable-timestamp');
  const signatureHeader = headerValue(headers, 'x-jobable-signature');
  if (!timestamp || !signatureHeader.startsWith('sha256=')) {
    return false;
  }
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > SIGNATURE_TOLERANCE_SECONDS) {
    return false;
  }

  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const given = signatureHeader.slice('sha256='.length);
  const expectedBuf = Buffer.from(expected, 'utf8');
  const givenBuf = Buffer.from(given, 'utf8');
  if (expectedBuf.length !== givenBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, givenBuf);
};

const seenDelivery = async (z, deliveryId) => {
  if (!deliveryId || !z.cache || typeof z.cache.get !== 'function') {
    return false;
  }
  const cacheKey = `jobable:delivery:${deliveryId}`;
  try {
    const previous = await z.cache.get(cacheKey);
    if (previous) {
      return true;
    }
    if (typeof z.cache.set === 'function') {
      await z.cache.set(cacheKey, '1', DELIVERY_CACHE_TTL_SECONDS);
    }
  } catch (err) {
    z.console && z.console.log && z.console.log('Delivery cache unavailable', err && err.message);
  }
  return false;
};

const subscribe = async (z, bundle, { event, label }) => {
  return client.create(z, '/webhook_subscriptions', {
    url: bundle.targetUrl,
    events: [event],
    description: `Zapier: ${label}`,
  });
};

const unsubscribe = async (z, bundle) => {
  const id = bundle.subscribeData && bundle.subscribeData.id;
  if (!id) {
    return;
  }
  return client.remove(z, `/webhook_subscriptions/${id}`, { notFoundOk: true });
};

const perform = async (z, bundle, { event }) => {
  const payload = bundle.cleanedRequest || {};
  if (payload.event !== event) {
    return [];
  }

  const headers = (bundle.rawRequest && bundle.rawRequest.headers) || {};
  const secret = bundle.subscribeData && bundle.subscribeData.secret;
  if (secret) {
    const rawBody = bundle.rawRequest && bundle.rawRequest.content != null
      ? String(bundle.rawRequest.content)
      : JSON.stringify(payload);
    if (!verifySignature(rawBody, headers, secret)) {
      throw new z.errors.Error('Webhook signature is invalid.', 'InvalidSignature', 401);
    }
  }

  const deliveryId = headerValue(headers, 'x-jobable-delivery');
  if (await seenDelivery(z, deliveryId)) {
    return [];
  }

  const data = payload.data && typeof payload.data === 'object' ? payload.data : {};
  return [
    client.present({
      event: payload.event,
      occurred_at: payload.occurred_at,
      delivery_id: deliveryId || undefined,
      ...data,
    }),
  ];
};

const performList = async (z, bundle, { path, sort }) => {
  const params = {
    per_page: 3,
    page: 1,
  };
  if (sort) {
    params.sort = sort;
  }
  return client.list(z, path, params);
};

module.exports = {
  headerValue,
  verifySignature,
  subscribe,
  unsubscribe,
  perform,
  performList,
};
