const { App, appTester, authBundle, api } = require('../helpers');

describe('searches.find_sales_order', () => {
  it('finds a sales order by id', async () => {
    api()
      .get('/v1/sales_orders/88')
      .reply(200, { data: { id: 88, customer_id: 4, number: 'SO88', status: 'preparing' } });

    const results = await appTester(App.searches.find_sales_order.operation.perform, authBundle({ id: 88 }));
    expect(results).toEqual([{ id: 88, customer_id: 4, number: 'SO88', status: 'preparing' }]);
  });

  it('finds sales orders by status', async () => {
    api()
      .get('/v1/sales_orders')
      .query({ 'filter[status]': 'ready', per_page: 10 })
      .reply(200, { data: [{ id: 88, number: 'SO88', status: 'ready' }] });

    const results = await appTester(
      App.searches.find_sales_order.operation.perform,
      authBundle({ status: 'ready' }),
    );
    expect(results).toEqual([{ id: 88, number: 'SO88', status: 'ready' }]);
  });

  it('rejects an empty search', async () => {
    await expect(
      appTester(App.searches.find_sales_order.operation.perform, authBundle({})),
    ).rejects.toThrow(/at least one search filter/i);
  });
});
