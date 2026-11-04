const { App, appTester, authBundle, api } = require('../helpers');

describe('searches.find_job', () => {
  it('finds a job by id', async () => {
    api()
      .get('/v1/jobs/1099')
      .reply(200, {
        data: {
          id: 1099,
          customer_id: 88,
          number: 'S1099',
          description: 'No hot water, boiler locked out F28',
          created_at: '2026-08-06 22:00:00',
        },
      });

    const results = await appTester(App.searches.find_job.operation.perform, authBundle({ id: 1099 }));
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(1099);
    expect(results[0].number).toBe('S1099');
    expect(results[0].created_at).toBe('2026-08-06T22:00:00Z');
  });

  it('finds jobs by customer', async () => {
    api()
      .get('/v1/jobs')
      .query({ 'filter[customer_id]': 88, per_page: 10 })
      .reply(200, {
        data: [{ id: 1099, customer_id: 88, number: 'S1099' }],
      });

    const results = await appTester(
      App.searches.find_job.operation.perform,
      authBundle({ customer_id: 88 }),
    );
    expect(results).toEqual([{ id: 1099, customer_id: 88, number: 'S1099' }]);
  });

  it('rejects an empty search', async () => {
    await expect(appTester(App.searches.find_job.operation.perform, authBundle({}))).rejects.toThrow(
      /at least one search filter/i,
    );
  });

  it('offers a job dropdown on the ID field', () => {
    const idField = App.searches.find_job.operation.inputFields.find((field) => field.key === 'id');
    expect(idField.dynamic).toBe('list_jobs.id.number');
  });
});
