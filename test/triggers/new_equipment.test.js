const { App, appTester, authBundle, api } = require('../helpers');

describe('triggers.new_equipment', () => {
  it('subscribes with equipment.created', async () => {
    api()
      .post('/v1/webhook_subscriptions', (body) => {
        expect(body).toEqual({
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['equipment.created'],
          description: 'Zapier: New Equipment',
        });
        return true;
      })
      .reply(201, {
        data: {
          id: 9,
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['equipment.created'],
          description: 'Zapier: New Equipment',
          status: 'active',
          secret: 'whsec_testsecret',
        },
      });

    const result = await appTester(
      App.triggers.new_equipment.operation.performSubscribe,
      authBundle({}, { targetUrl: 'https://hooks.zapier.com/hooks/standard/123/abc/' }),
    );
    expect(result.id).toBe(9);
    expect(result.events).toEqual(['equipment.created']);
    expect(App.triggers.new_equipment.display.description).toBe('Triggers when new equipment is created.');
  });
});
