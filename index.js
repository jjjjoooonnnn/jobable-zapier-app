const authentication = require('./authentication');
const findCustomerSearch = require('./searches/find_customer.js');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication: authentication,
  requestTemplate: {
    params: { api_key: '{{bundle.authData.api_key}}' },
    headers: { 'X-API-Key': '{{bundle.authData.api_key}}' },
    removeMissingValuesFrom: { params: true, body: true },
  },
  searches: { [findCustomerSearch.key]: findCustomerSearch },
};
