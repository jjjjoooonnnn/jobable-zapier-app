const { App, appTester, authBundle, api } = require('../helpers');

describe('searches.find_site', () => {
  it('searches sites with the customer filter and required name on create', async () => {
    api()
      .get('/v1/sites')
      .query({
        'filter[customer_id]': 4,
        'filter[name_contains]': 'Head',
        per_page: 10,
      })
      .reply(200, {
        data: [{ id: 9, customer_id: 4, name: 'Head office' }],
      });

    const results = await appTester(
      App.searches.find_site.operation.perform,
      authBundle({ customer_id: 4, name_contains: 'Head' }),
    );
    expect(results).toEqual([{ id: 9, customer_id: 4, name: 'Head office' }]);

    expect(App.creates.create_site.operation.inputFields.find((field) => field.key === 'customer_id')).toMatchObject({
      required: true,
      label: 'Customer',
      dynamic: 'list_customers.id.company',
      search: 'find_customer.id',
    });
    expect(App.creates.create_site.operation.inputFields.find((field) => field.key === 'name').required).toBe(true);
    expect(App.searches.find_site.operation.inputFields.find((field) => field.key === 'id').dynamic).toBe(
      'list_sites.id.name',
    );
  });
});
