const { App, appTester, authBundle, api } = require('../helpers');

describe('searches.find_payment', () => {
  it('finds a payment by id', async () => {
    api()
      .get('/v1/payments/401')
      .reply(200, {
        data: {
          id: 401,
          job_id: 12,
          amount: 90,
          method: '1',
          method_name: 'Card',
          paid_at: '2026-07-15 10:00:00',
        },
      });

    const results = await appTester(App.searches.find_payment.operation.perform, authBundle({ id: 401 }));
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(401);
    expect(results[0].paid_at).toBe('2026-07-15T10:00:00Z');
  });

  it('finds payments by job', async () => {
    api()
      .get('/v1/payments')
      .query({ 'filter[job_id]': 12, per_page: 10 })
      .reply(200, { data: [{ id: 401, job_id: 12, amount: 90 }] });

    const results = await appTester(
      App.searches.find_payment.operation.perform,
      authBundle({ job_id: 12 }),
    );
    expect(results).toEqual([{ id: 401, job_id: 12, amount: 90 }]);
  });

  it('rejects an empty search', async () => {
    await expect(appTester(App.searches.find_payment.operation.perform, authBundle({}))).rejects.toThrow(
      /at least one search filter/i,
    );
  });
});

describe('searches.find_payment_method', () => {
  it('finds a payment method by id', async () => {
    api()
      .get('/v1/payment_methods/1')
      .reply(200, { data: { id: 1, name: 'Card', default: true } });

    const results = await appTester(
      App.searches.find_payment_method.operation.perform,
      authBundle({ id: 1 }),
    );
    expect(results).toEqual([{ id: 1, name: 'Card', default: true }]);
    expect(App.triggers.list_payment_methods.display.label).toBe('List Payment Methods');
    expect(App.searches.find_payment_method.display.description).toBe('Finds a payment method.');
  });
});
