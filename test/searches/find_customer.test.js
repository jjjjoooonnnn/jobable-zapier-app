const { App, appTester, authBundle, api, customer } = require('../helpers');

describe('searches.find_customer', () => {
  it('sends the API key as a header and not a query param', async () => {
    const scope = api()
      .get('/v1/customers/42')
      .query({})
      .reply(function reply() {
        expect(this.req.path).not.toMatch(/api_key=/);
        expect(this.req.headers['x-api-key']).toEqual(expect.arrayContaining(['test-api-key']));
        return [200, { data: { id: 42, company: 'Acme Ltd', created_date: '2021-03-04 09:12:00' } }];
      });

    const results = await appTester(App.searches.find_customer.operation.perform, authBundle({ id: 42 }));
    expect(results).toEqual([
      { id: 42, company: 'Acme Ltd', created_date: '2021-03-04T09:12:00Z' },
    ]);
    scope.done();
  });

  it('finds a customer by id', async () => {
    api()
      .get('/v1/customers/42')
      .reply(200, { data: { ...customer.sample, created_date: '2021-03-04 09:12:00' } });

    const results = await appTester(App.searches.find_customer.operation.perform, authBundle({ id: 42 }));
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(42);
    expect(results[0].company).toBe('Acme Refrigeration Ltd');
  });

  it('returns an empty array when the id is not found', async () => {
    api()
      .get('/v1/customers/99')
      .reply(404, { error: { code: 'customer_not_found', message: 'No customer exists with this id.' } });

    const results = await appTester(App.searches.find_customer.operation.perform, authBundle({ id: 99 }));
    expect(results).toEqual([]);
  });

  it('finds customers using the documented filters', async () => {
    api()
      .get('/v1/customers')
      .query({
        'filter[q]': 'Foreman Bristol',
        'filter[company_contains]': 'Foreman',
        'filter[postcode]': 'BS1',
        'filter[on_hold]': 'false',
        sort: '-created_at',
        include: 'sites,contacts',
        per_page: 10,
      })
      .reply(200, {
        data: [{ id: 1, company: 'Foreman Ltd', on_hold: false }],
        pagination: { page: 1, per_page: 10, total: 1 },
      });

    const results = await appTester(
      App.searches.find_customer.operation.perform,
      authBundle({
        q: 'Foreman Bristol',
        company_contains: 'Foreman',
        postcode: 'BS1',
        on_hold: false,
        sort: '-created_at',
        include: 'sites,contacts',
      }),
    );
    expect(results).toEqual([{ id: 1, company: 'Foreman Ltd', on_hold: false }]);
  });

  it('offers a customer dropdown on the ID field', () => {
    const idField = App.searches.find_customer.operation.inputFields.find((field) => field.key === 'id');
    expect(idField.dynamic).toBe('list_customers.id.company');
  });

  it('rejects an empty search so Find or Create cannot match an unrelated row', async () => {
    await expect(
      appTester(App.searches.find_customer.operation.perform, authBundle({})),
    ).rejects.toThrow(/at least one search filter/i);
  });
});
