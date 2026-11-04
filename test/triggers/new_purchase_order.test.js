const { App, appTester, authBundle, api } = require('../helpers');

describe('triggers.new_purchase_order', () => {
  it('subscribes with purchase_order.created', async () => {
    api()
      .post('/v1/webhook_subscriptions', (body) => {
        expect(body).toEqual({
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['purchase_order.created'],
          description: 'Zapier: New Purchase Order',
        });
        return true;
      })
      .reply(201, {
        data: {
          id: 13,
          events: ['purchase_order.created'],
          secret: 'whsec_testsecret',
        },
      });

    const result = await appTester(
      App.triggers.new_purchase_order.operation.performSubscribe,
      authBundle({}, { targetUrl: 'https://hooks.zapier.com/hooks/standard/123/abc/' }),
    );
    expect(result.events).toEqual(['purchase_order.created']);
  });
});
