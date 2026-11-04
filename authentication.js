const test = async (z, bundle) => {
  const options = {
    url: 'https://api.jobable.app/v1/me',
    method: 'GET',
    headers: {
      'X-API-Key': bundle.authData.api_key,
    },
    params: {},
    removeMissingValuesFrom: {
      body: false,
      params: false,
    },
  };

  return z.request(options).then((response) => {
    const results = response.json;

    // You can do any parsing you need for results here before returning them

    return results;
  });
};

module.exports = {
  type: 'custom',
  test: test,
  fields: [
    {
      helpText:
        'Create a key in Jobable Admin under **Settings → API Access & Webhooks**. See the [API documentation](https://api.jobable.app/docs) for details.',
      computed: false,
      key: 'api_key',
      required: true,
      label: 'API Key',
      type: 'password',
    },
  ],
  connectionLabel: '{{data.key.name}}',
  customConfig: {},
};
