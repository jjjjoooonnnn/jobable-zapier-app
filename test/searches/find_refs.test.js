const { App, appTester, authBundle, api } = require('../helpers');

describe('reference searches', () => {
  it('finds a user by id', async () => {
    api()
      .get('/v1/users/3')
      .reply(200, { data: { id: 3, name: 'Ada Lovelace', email: 'ada@acme.test', status: 'Active' } });

    const results = await appTester(App.searches.find_user.operation.perform, authBundle({ id: 3 }));
    expect(results).toEqual([{ id: 3, name: 'Ada Lovelace', email: 'ada@acme.test', status: 'Active' }]);
  });

  it('finds a department by id', async () => {
    api()
      .get('/v1/departments/1')
      .reply(200, { data: { id: 1, code: 'S', default: true } });

    const results = await appTester(App.searches.find_department.operation.perform, authBundle({ id: 1 }));
    expect(results).toEqual([{ id: 1, code: 'S', default: true }]);
  });

  it('finds a job status by id', async () => {
    api()
      .get('/v1/job_statuses/4')
      .reply(200, { data: { id: 4, name: 'Booked', completes_job: false } });

    const results = await appTester(App.searches.find_job_status.operation.perform, authBundle({ id: 4 }));
    expect(results).toEqual([{ id: 4, name: 'Booked', completes_job: false }]);
  });

  it('uses Job Statuses as the hidden list label', () => {
    expect(App.triggers.list_job_statuses.display.label).toBe('List Job Statuses');
    expect(App.triggers.list_users.display.hidden).toBe(true);
    expect(App.triggers.list_departments.display.hidden).toBe(true);
  });
});

describe('searches.find_visit', () => {
  it('finds visits by job', async () => {
    api()
      .get('/v1/visits')
      .query({ 'filter[job_id]': 1042, per_page: 10 })
      .reply(200, {
        data: [{ id: 900, job_id: 1042, date: '2026-08-03', completed: true }],
      });

    const results = await appTester(
      App.searches.find_visit.operation.perform,
      authBundle({ job_id: 1042 }),
    );
    expect(results).toEqual([{ id: 900, job_id: 1042, date: '2026-08-03', completed: true }]);
    expect(App.creates.create_visit).toBeUndefined();
    expect(App.searches.find_visit.operation.inputFields.find((field) => field.key === 'job_id')).toMatchObject({
      dynamic: 'list_jobs.id.number',
      search: 'find_job.id',
    });
  });
});
