const { App, appTester, authBundle, api } = require('../helpers');

describe('triggers.new_job', () => {
  it('subscribes with job.created', async () => {
    api()
      .post('/v1/webhook_subscriptions', (body) => {
        expect(body).toEqual({
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['job.created'],
          description: 'Zapier: New Job',
        });
        return true;
      })
      .reply(201, {
        data: {
          id: 8,
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['job.created'],
          description: 'Zapier: New Job',
          status: 'active',
          secret: 'whsec_testsecret',
        },
      });

    const result = await appTester(
      App.triggers.new_job.operation.performSubscribe,
      authBundle({}, { targetUrl: 'https://hooks.zapier.com/hooks/standard/123/abc/' }),
    );
    expect(result.id).toBe(8);
    expect(result.events).toEqual(['job.created']);
  });
});
