const authentication = require('./authentication');
const client = require('./lib/client');
const { buildAll } = require('./lib/operations');
const customer = require('./resources/customer');
const site = require('./resources/site');
const contact = require('./resources/contact');
const job = require('./resources/job');
const appointment = require('./resources/appointment');
const visit = require('./resources/visit');
const communication = require('./resources/communication');
const user = require('./resources/user');
const department = require('./resources/department');
const jobStatus = require('./resources/job_status');
const equipment = require('./resources/equipment');
const equipmentCategory = require('./resources/equipment_category');
const supplier = require('./resources/supplier');
const quote = require('./resources/quote');
const salesTax = require('./resources/sales_tax');

const built = [
  customer,
  site,
  contact,
  job,
  appointment,
  visit,
  communication,
  user,
  department,
  jobStatus,
  equipment,
  equipmentCategory,
  supplier,
  quote,
  salesTax,
].map(buildAll);

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
