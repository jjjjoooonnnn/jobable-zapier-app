const { App, appTester, authBundle, api, sign, customer } = require('../helpers');

const payload = {
  event: 'customer.created',
  occurred_at: '2026-07-15T16:42:03Z',
  data: {
    id: 42,
    company: 'Acme Refrigeration Ltd',
    created_date: '2021-03-04 09:12:00',
  },
};

describe('triggers.new_customer', () => {
  it('subscribes with the Zapier URL, event, and description, and keeps id and secret', async () => {
    api()
      .post('/v1/webhook_subscriptions', (body) => {
        expect(body).toEqual({
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['customer.created'],
          description: 'Zapier: New Customer',
        });
        return true;
      })
      .reply(201, {
        data: {
          id: 7,
          url: 'https://hooks.zapier.com/hooks/standard/123/abc/',
          events: ['customer.created'],
          description: 'Zapier: New Customer',
          status: 'active',
          secret: 'whsec_testsecret',
        },
      });

    const result = await appTester(
      App.triggers.new_customer.operation.performSubscribe,
      authBundle({}, { targetUrl: 'https://hooks.zapier.com/hooks/standard/123/abc/' }),
    );
    expect(result.id).toBe(7);
    expect(result.secret).toBe('whsec_testsecret');
    expect(result.events).toEqual(['customer.created']);
  });

  it('unsubscribes by deleting the stored subscription id', async () => {
    api().delete('/v1/webhook_subscriptions/7').reply(200, { data: { id: 7, deleted: true } });

    const result = await appTester(
      App.triggers.new_customer.operation.performUnsubscribe,
      authBundle({}, { subscribeData: { id: 7, secret: 'whsec_testsecret' } }),
    );
    expect(result).toEqual({ id: 7, deleted: true });
  });

  it('treats an already-deleted subscription as unsubscribed', async () => {
    api()
      .delete('/v1/webhook_subscriptions/7')
      .reply(404, { error: { code: 'webhook_subscription_not_found', message: 'No webhook subscription exists with this id.' } });

    const result = await appTester(
      App.triggers.new_customer.operation.performUnsubscribe,
      authBundle({}, { subscribeData: { id: 7, secret: 'whsec_testsecret' } }),
    );
    expect(result).toEqual({ deleted: true });
  });

  it('accepts a correctly signed customer.created payload', async () => {
    const rawBody = JSON.stringify(payload);
    const { timestamp, header } = sign(rawBody, 'whsec_testsecret');

    const results = await appTester(
      App.triggers.new_customer.operation.perform,
      authBundle(
        {},
        {
          cleanedRequest: payload,
          rawRequest: {
            content: rawBody,
            headers: {
              'x-jobable-signature': header,
              'x-jobable-timestamp': timestamp,
              'x-jobable-delivery': '55',
              'x-jobable-event': 'customer.created',
            },
          },
          subscribeData: { id: 7, secret: 'whsec_testsecret' },
        },
      ),
    );

    expect(results).toEqual([
      {
        event: 'customer.created',
        occurred_at: '2026-07-15T16:42:03Z',
        delivery_id: '55',
        id: 42,
        company: 'Acme Refrigeration Ltd',
        created_date: '2021-03-04T09:12:00Z',
      },
    ]);
  });

  it('ignores ping and other events', async () => {
    const ping = { event: 'ping', occurred_at: '2026-07-15T16:42:03Z', data: { message: 'This is a test event from Jobable.' } };
    const results = await appTester(
      App.triggers.new_customer.operation.perform,
      authBundle({}, { cleanedRequest: ping, rawRequest: { content: JSON.stringify(ping), headers: {} } }),
    );
    expect(results).toEqual([]);

    const updated = { ...payload, event: 'customer.updated' };
    const other = await appTester(
      App.triggers.new_customer.operation.perform,
      authBundle({}, { cleanedRequest: updated, rawRequest: { content: JSON.stringify(updated), headers: {} } }),
    );
    expect(other).toEqual([]);
  });

  it('rejects a bad signature when a secret is stored', async () => {
    const rawBody = JSON.stringify(payload);
    await expect(
      appTester(
        App.triggers.new_customer.operation.perform,
        authBundle(
          {},
          {
            cleanedRequest: payload,
            rawRequest: {
              content: rawBody,
              headers: {
                'x-jobable-signature': 'sha256=deadbeef',
                'x-jobable-timestamp': String(Math.floor(Date.now() / 1000)),
              },
            },
            subscribeData: { id: 7, secret: 'whsec_testsecret' },
          },
        ),
      ),
    ).rejects.toThrow(/signature/i);
  });

  it('lists recent customers when testing the trigger', async () => {
    api()
      .get('/v1/customers')
      .query({ sort: '-created_at', per_page: 3, page: 1 })
      .reply(200, { data: [customer.sample] });

    const results = await appTester(App.triggers.new_customer.operation.performList, authBundle());
    expect(results[0].id).toBe(42);
  });
});
