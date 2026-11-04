const { App, appTester, authBundle, api } = require('../helpers');

describe('searches.find_return', () => {
  it('finds a return by id', async () => {
    api()
      .get('/v1/returns/21')
      .reply(200, { data: { id: 21, supplier_id: 4, number: 'RN21', status: 'open' } });

    const results = await appTester(App.searches.find_return.operation.perform, authBundle({ id: 21 }));
    expect(results).toEqual([{ id: 21, supplier_id: 4, number: 'RN21', status: 'open' }]);
  });

  it('finds returns by status', async () => {
    api()
      .get('/v1/returns')
      .query({ 'filter[status]': 'goods_sent', per_page: 10 })
      .reply(200, { data: [{ id: 21, number: 'RN21', status: 'goods_sent' }] });

    const results = await appTester(
      App.searches.find_return.operation.perform,
      authBundle({ status: 'goods_sent' }),
    );
    expect(results).toEqual([{ id: 21, number: 'RN21', status: 'goods_sent' }]);
  });

  it('rejects an empty search', async () => {
    await expect(appTester(App.searches.find_return.operation.perform, authBundle({}))).rejects.toThrow(
      /at least one search filter/i,
    );
  });
});
