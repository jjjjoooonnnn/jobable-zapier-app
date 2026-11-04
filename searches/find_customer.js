const perform = async (z, bundle) => {
  const options = {
    url: 'https://api.jobable.app/v1/customers',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    params: {
      api_key: bundle.authData.api_key,
      'filter[email]': bundle.inputData.email,
      'filter[phone]': bundle.inputData.phone,
      'filter[any_email]': bundle.inputData.any_email,
      'filter[any_phone]': bundle.inputData.any_phone,
      'filter[xero_customer_id]': bundle.inputData.xero_customer_id,
      'filter[quickbooks_customer_id]': bundle.inputData.quickbooks_customer_id,
      'filter[stripe_customer_id]': bundle.inputData.stripe_customer_id,
    },
    removeMissingValuesFrom: {
      body: true,
      params: true,
    },
  };

  return z.request(options).then((response) => {
    return response.json.data;
  });
};

module.exports = {
  operation: {
    perform: perform,
    inputFields: [
      {
        key: 'email',
        label: 'Email',
        type: 'string',
        helpText: 'Enter the customer email address',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'phone',
        label: 'Phone',
        type: 'string',
        helpText: 'Enter the customer phone number',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'any_email',
        label: 'Any Email',
        type: 'string',
        helpText: 'Enter an email address for the customer, site or contact',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'any_phone',
        label: 'Any Phone',
        type: 'string',
        helpText: 'Enter a phone number for the customer, site or contact',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'xero_customer_id',
        label: 'Xero Customer ID',
        type: 'string',
        helpText: "Enter the customer's connected Xero account ID",
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'quickbooks_customer_id',
        label: 'Quickbooks Customer ID',
        type: 'string',
        helpText: "Enter the customer's connected Quickbooks account ID",
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'stripe_customer_id',
        label: 'Stripe Customer ID',
        type: 'string',
        helpText: "Enter the customer's connected Stripe account ID",
        required: false,
        list: false,
        altersDynamicFields: false,
      },
    ],
    outputFields: [
      { key: 'id' },
      { key: 'company' },
      { key: 'address1' },
      { key: 'address2' },
      { key: 'town' },
      { key: 'county' },
      { key: 'postcode' },
      { key: 'phone1' },
      { key: 'phone2' },
      { key: 'phone3' },
      { key: 'fax' },
      { key: 'email1' },
      { key: 'email2' },
      { key: 'on_hold' },
      { key: 'created_date' },
      { key: 'xero_customer_id' },
      { key: 'quickbooks_customer_id' },
      { key: 'stripe_customer_id' },
    ],
  },
  display: {
    description: 'Finds a customer in Jobable.',
    hidden: false,
    label: 'Find Customer',
  },
  key: 'find_customer',
  noun: 'Customer',
};
