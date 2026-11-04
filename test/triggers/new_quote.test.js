const { App, appTester, authBundle, api } = require('../helpers');

describe('triggers.new_quote', () => {
  it('subscribes with quote.created', async () => {
    api()
      .post('/v1/webhook_subscriptions', (body) => {
        expect(body).toEqual({
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['quote.created'],
          description: 'Zapier: New Quote',
        });
        return true;
      })
      .reply(201, {
        data: {
          id: 11,
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['quote.created'],
          description: 'Zapier: New Quote',
          status: 'active',
          secret: 'whsec_testsecret',
        },
      });

    const result = await appTester(
      App.triggers.new_quote.operation.performSubscribe,
      authBundle({}, { targetUrl: 'https://hooks.zapier.com/hooks/standard/123/abc/' }),
    );
    expect(result.id).toBe(11);
    expect(result.events).toEqual(['quote.created']);
  });
});
