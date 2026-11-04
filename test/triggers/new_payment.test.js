const { App, appTester, authBundle, api } = require('../helpers');

describe('triggers.new_payment', () => {
  it('subscribes with payment.created', async () => {
    api()
      .post('/v1/webhook_subscriptions', (body) => {
        expect(body).toEqual({
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['payment.created'],
          description: 'Zapier: New Payment',
        });
        return true;
      })
      .reply(201, {
        data: { id: 14, events: ['payment.created'], secret: 'whsec_testsecret' },
      });

    const result = await appTester(
      App.triggers.new_payment.operation.performSubscribe,
      authBundle({}, { targetUrl: 'https://hooks.zapier.com/hooks/standard/123/abc/' }),
    );
    expect(result.events).toEqual(['payment.created']);
  });
});
