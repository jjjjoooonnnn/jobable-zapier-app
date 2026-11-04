const { App, appTester, authBundle, api } = require('../helpers');

describe('triggers.new_return', () => {
  it('subscribes with return.created', async () => {
    api()
      .post('/v1/webhook_subscriptions', (body) => {
        expect(body).toEqual({
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['return.created'],
          description: 'Zapier: New Return',
        });
        return true;
      })
      .reply(201, {
        data: {
          id: 14,
          events: ['return.created'],
          secret: 'whsec_testsecret',
        },
      });

    const result = await appTester(
      App.triggers.new_return.operation.performSubscribe,
      authBundle({}, { targetUrl: 'https://hooks.zapier.com/hooks/standard/123/abc/' }),
    );
    expect(result.events).toEqual(['return.created']);
  });
});
