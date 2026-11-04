const { App, appTester, authBundle, api } = require('../helpers');

describe('searches.find_supplier', () => {
  it('finds a supplier by id', async () => {
    api()
      .get('/v1/suppliers/87')
      .reply(200, {
        data: {
          id: 87,
          company: 'Parts Co',
          email1: 'orders@parts.test',
          created_date: '2024-06-01 10:00:00',
        },
      });

    const results = await appTester(App.searches.find_supplier.operation.perform, authBundle({ id: 87 }));
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(87);
    expect(results[0].company).toBe('Parts Co');
    expect(results[0].created_date).toBe('2024-06-01T10:00:00Z');
  });

  it('finds suppliers by email', async () => {
    api()
      .get('/v1/suppliers')
      .query({ 'filter[email]': 'orders@parts.test', per_page: 10 })
      .reply(200, {
        data: [{ id: 87, company: 'Parts Co', email1: 'orders@parts.test' }],
      });

    const results = await appTester(
      App.searches.find_supplier.operation.perform,
      authBundle({ email: 'orders@parts.test' }),
    );
    expect(results).toEqual([{ id: 87, company: 'Parts Co', email1: 'orders@parts.test' }]);
  });

  it('rejects an empty search', async () => {
    await expect(
      appTester(App.searches.find_supplier.operation.perform, authBundle({})),
    ).rejects.toThrow(/at least one search filter/i);
  });
});
