const authentication = require('./authentication');
const client = require('./lib/client');
const { buildAll } = require('./lib/operations');
const customer = require('./resources/customer');
const site = require('./resources/site');
const contact = require('./resources/contact');

const built = [customer, site, contact].map(buildAll);

const merge = (section) => Object.assign({}, ...built.map((part) => part[section]));

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication,
  requestTemplate: {
    headers: {
      'X-API-Key': '{{bundle.authData.api_key}}',
      Accept: 'application/json',
    },
    removeMissingValuesFrom: { params: true, body: true },
  },
  afterResponse: [client.afterResponse],
  flags: {
    cleanInputData: false,
  },
  triggers: merge('triggers'),
  searches: merge('searches'),
  creates: merge('creates'),
};
