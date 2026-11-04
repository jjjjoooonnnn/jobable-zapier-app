const { App, appTester, authBundle, api } = require('../helpers');

describe('searches.find_purchase_order', () => {
  it('finds a purchase order by id', async () => {
    api()
      .get('/v1/purchase_orders/55')
      .reply(200, { data: { id: 55, supplier_id: 4, number: 'PO55', status: 'placed' } });

    const results = await appTester(
      App.searches.find_purchase_order.operation.perform,
      authBundle({ id: 55 }),
    );
    expect(results).toEqual([{ id: 55, supplier_id: 4, number: 'PO55', status: 'placed' }]);
  });

  it('finds purchase orders by status', async () => {
    api()
      .get('/v1/purchase_orders')
      .query({ 'filter[status]': 'placed', per_page: 10 })
      .reply(200, { data: [{ id: 55, number: 'PO55', status: 'placed' }] });

    const results = await appTester(
      App.searches.find_purchase_order.operation.perform,
      authBundle({ status: 'placed' }),
    );
    expect(results).toEqual([{ id: 55, number: 'PO55', status: 'placed' }]);
  });

  it('rejects an empty search', async () => {
    await expect(
      appTester(App.searches.find_purchase_order.operation.perform, authBundle({})),
    ).rejects.toThrow(/at least one search filter/i);
  });
});
