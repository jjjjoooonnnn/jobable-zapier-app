const { App, appTester, authBundle, api } = require('../helpers');

describe('triggers.new_supplier', () => {
  it('subscribes with supplier.created', async () => {
    api()
      .post('/v1/webhook_subscriptions', (body) => {
        expect(body).toEqual({
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['supplier.created'],
          description: 'Zapier: New Supplier',
        });
        return true;
      })
      .reply(201, {
        data: {
          id: 10,
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['supplier.created'],
          description: 'Zapier: New Supplier',
          status: 'active',
          secret: 'whsec_testsecret',
        },
      });

    const result = await appTester(
      App.triggers.new_supplier.operation.performSubscribe,
      authBundle({}, { targetUrl: 'https://hooks.zapier.com/hooks/standard/123/abc/' }),
    );
    expect(result.id).toBe(10);
    expect(result.events).toEqual(['supplier.created']);
  });
});
