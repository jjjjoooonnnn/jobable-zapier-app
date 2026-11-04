const { App, appTester, authBundle, api } = require('../helpers');

describe('creates.customer', () => {
  it('creates a customer and returns the object', async () => {
    api()
      .post('/v1/customers', { company: 'Acme Ltd', email1: 'ops@acme.test', on_hold: false })
      .reply(201, {
        data: {
          id: 124,
          company: 'Acme Ltd',
          email1: 'ops@acme.test',
          on_hold: false,
          created_date: '2026-07-03 22:05:00',
        },
      });

    const result = await appTester(
      App.creates.create_customer.operation.perform,
      authBundle({ company: 'Acme Ltd', email1: 'ops@acme.test', on_hold: false }),
    );
    expect(result.id).toBe(124);
    expect(result.company).toBe('Acme Ltd');
    expect(result.on_hold).toBe(false);
    expect(result.created_date).toBe('2026-07-03T22:05:00Z');
    expect(Array.isArray(result)).toBe(false);
  });

  it('updates a customer with only the provided fields', async () => {
    api()
      .put('/v1/customers/42', { town: 'Leeds', on_hold: true })
      .reply(200, {
        data: { id: 42, company: 'Acme Ltd', town: 'Leeds', on_hold: true },
      });

    const result = await appTester(
      App.creates.update_customer.operation.perform,
      authBundle({ id: 42, town: 'Leeds', on_hold: true, company: '' }),
    );
    expect(result).toEqual({ id: 42, company: 'Acme Ltd', town: 'Leeds', on_hold: true });
  });
});
