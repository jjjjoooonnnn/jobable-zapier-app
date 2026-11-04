const { App, appTester, authBundle, api } = require('../helpers');

describe('triggers.new_invoice', () => {
  it('subscribes with invoice.created', async () => {
    api()
      .post('/v1/webhook_subscriptions', (body) => {
        expect(body).toEqual({
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['invoice.created'],
          description: 'Zapier: New Invoice',
        });
        return true;
      })
      .reply(201, {
        data: { id: 13, events: ['invoice.created'], secret: 'whsec_testsecret' },
      });

    const result = await appTester(
      App.triggers.new_invoice.operation.performSubscribe,
      authBundle({}, { targetUrl: 'https://hooks.zapier.com/hooks/standard/123/abc/' }),
    );
    expect(result.events).toEqual(['invoice.created']);
  });
});
