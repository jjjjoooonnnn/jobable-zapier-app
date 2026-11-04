const { App, appTester, authBundle, api } = require('../helpers');

describe('creates.api_request', () => {
  it('GETs a relative Jobable path', async () => {
    api()
      .get('/v1/customers/42')
      .reply(200, { data: { id: 42, company: 'Acme Ltd' } });

    const result = await appTester(
      App.creates.api_request.operation.perform,
      authBundle({ url: '/v1/customers/42', method: 'GET' }),
    );
    expect(result).toMatchObject({
      id: 42,
      status_code: 200,
      body: { data: { id: 42, company: 'Acme Ltd' } },
    });
  });

  it('POSTs a JSON body to a full Jobable URL', async () => {
    api()
      .post('/v1/purchase_orders', { supplier_id: 4 })
      .reply(201, { data: { id: 55, number: 'PO55' } });

    const result = await appTester(
      App.creates.api_request.operation.perform,
      authBundle({
        url: 'https://api.jobable.app/v1/purchase_orders',
        method: 'POST',
        body: '{"supplier_id":4}',
      }),
    );
    expect(result.id).toBe(55);
    expect(result.status_code).toBe(201);
    expect(result.body.data.number).toBe('PO55');
  });

  it('sends query string params', async () => {
    api()
      .get('/v1/customers')
      .query({ 'filter[email]': 'a@acme.test' })
      .reply(200, { data: [{ id: 42, company: 'Acme Ltd' }] });

    const result = await appTester(
      App.creates.api_request.operation.perform,
      authBundle({
        url: '/v1/customers',
        method: 'GET',
        query_params: { 'filter[email]': 'a@acme.test' },
      }),
    );
    expect(result.status_code).toBe(200);
    expect(result.body.data).toEqual([{ id: 42, company: 'Acme Ltd' }]);
    expect(result.id).toBeUndefined();
  });

  it('rejects URLs off api.jobable.app', async () => {
    await expect(
      appTester(
        App.creates.api_request.operation.perform,
        authBundle({ url: 'https://example.com/v1/customers', method: 'GET' }),
      ),
    ).rejects.toThrow(/api\.jobable\.app/i);
  });

  it('is labelled API Request', () => {
    expect(App.creates.api_request.display).toMatchObject({
      label: 'API Request',
      description: expect.stringMatching(/authenticated request/i),
    });
  });
});
