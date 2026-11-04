const { App, appTester, authBundle, api } = require('../helpers');

describe('searches.find_invoice', () => {
  it('finds an invoice by id', async () => {
    api()
      .get('/v1/invoices/30')
      .reply(200, { data: { id: 30, customer_id: 4, number: 'INV1001', status: 'draft' } });

    const results = await appTester(App.searches.find_invoice.operation.perform, authBundle({ id: 30 }));
    expect(results).toEqual([{ id: 30, customer_id: 4, number: 'INV1001', status: 'draft' }]);
  });

  it('finds invoices by status', async () => {
    api()
      .get('/v1/invoices')
      .query({ 'filter[status]': 'sent', per_page: 10 })
      .reply(200, { data: [{ id: 30, number: 'INV1001', status: 'sent' }] });

    const results = await appTester(
      App.searches.find_invoice.operation.perform,
      authBundle({ status: 'sent' }),
    );
    expect(results).toEqual([{ id: 30, number: 'INV1001', status: 'sent' }]);
  });

  it('rejects an empty search', async () => {
    await expect(appTester(App.searches.find_invoice.operation.perform, authBundle({}))).rejects.toThrow(
      /at least one search filter/i,
    );
  });
});
