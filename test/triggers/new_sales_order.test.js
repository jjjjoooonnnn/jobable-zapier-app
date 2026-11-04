const { App, appTester, authBundle, api } = require('../helpers');

describe('triggers.new_sales_order', () => {
  it('subscribes with sales_order.created', async () => {
    api()
      .post('/v1/webhook_subscriptions', (body) => {
        expect(body).toEqual({
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['sales_order.created'],
          description: 'Zapier: New Sales Order',
        });
        return true;
      })
      .reply(201, {
        data: {
          id: 12,
          events: ['sales_order.created'],
          secret: 'whsec_testsecret',
        },
      });

    const result = await appTester(
      App.triggers.new_sales_order.operation.performSubscribe,
      authBundle({}, { targetUrl: 'https://hooks.zapier.com/hooks/standard/123/abc/' }),
    );
    expect(result.events).toEqual(['sales_order.created']);
  });
});
