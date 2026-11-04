const crypto = require('crypto');
const nock = require('nock');
const zapier = require('zapier-platform-core');

const App = require('../index');
const customer = require('../resources/customer');
const site = require('../resources/site');
const contact = require('../resources/contact');

const appTester = zapier.createAppTester(App);
const API = 'https://api.jobable.app';
const API_KEY = 'test-api-key';

const authBundle = (inputData = {}, extra = {}) => ({
  authData: { api_key: API_KEY },
  inputData,
  meta: { page: 0 },
  ...extra,
});

const sign = (rawBody, secret, timestamp = String(Math.floor(Date.now() / 1000))) => {
  const signature = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  return {
    timestamp,
    header: `sha256=${signature}`,
  };
};

const api = () => nock(API).matchHeader('X-API-Key', API_KEY);

beforeEach(() => {
  nock.cleanAll();
  nock.disableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

module.exports = {
  App,
  appTester,
  API,
  API_KEY,
  authBundle,
  sign,
  api,
  customer,
  site,
  contact,
};
