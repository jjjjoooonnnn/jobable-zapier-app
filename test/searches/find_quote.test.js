const { App, appTester, authBundle, api } = require('../helpers');

describe('searches.find_quote', () => {
  it('finds a quote by id', async () => {
    api()
      .get('/v1/quotes/1234')
      .reply(200, {
        data: {
          id: 1234,
          customer_id: 4,
          number: 'Q1234',
          status: 'draft',
        },
      });

    const results = await appTester(App.searches.find_quote.operation.perform, authBundle({ id: 1234 }));
    expect(results).toHaveLength(1);
    expect(results[0].number).toBe('Q1234');
  });

  it('finds quotes by status', async () => {
    api()
      .get('/v1/quotes')
      .query({ 'filter[status]': 'sent', per_page: 10 })
      .reply(200, {
        data: [{ id: 1234, number: 'Q1234', status: 'sent' }],
      });

    const results = await appTester(
      App.searches.find_quote.operation.perform,
      authBundle({ status: 'sent' }),
    );
    expect(results).toEqual([{ id: 1234, number: 'Q1234', status: 'sent' }]);
  });

  it('rejects an empty search', async () => {
    await expect(appTester(App.searches.find_quote.operation.perform, authBundle({}))).rejects.toThrow(
      /at least one search filter/i,
    );
  });
});

describe('searches.find_sales_tax', () => {
  it('finds a sales tax by id', async () => {
    api()
      .get('/v1/sales_taxes/1')
      .reply(200, { data: { id: 1, name: 'Standard Rate', rate: 0.2, default: true } });

    const results = await appTester(App.searches.find_sales_tax.operation.perform, authBundle({ id: 1 }));
    expect(results).toEqual([{ id: 1, name: 'Standard Rate', rate: 0.2, default: true }]);
    expect(App.triggers.list_sales_taxes.display.label).toBe('List Sales Taxes');
  });
});
