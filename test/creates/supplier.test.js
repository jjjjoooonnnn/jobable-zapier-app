const { App, appTester, authBundle, api } = require('../helpers');

describe('creates.supplier', () => {
  it('creates a supplier with company', async () => {
    api()
      .post('/v1/suppliers', { company: 'Parts Co' })
      .reply(201, {
        data: {
          id: 87,
          company: 'Parts Co',
          created_date: '2024-06-01 10:00:00',
        },
      });

    const result = await appTester(
      App.creates.create_supplier.operation.perform,
      authBundle({ company: 'Parts Co' }),
    );
    expect(result.id).toBe(87);
    expect(result.company).toBe('Parts Co');
    expect(result.created_date).toBe('2024-06-01T10:00:00Z');
  });
});
