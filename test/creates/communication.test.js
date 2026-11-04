const { App, appTester, authBundle, api } = require('../helpers');

describe('creates.communication', () => {
  it('creates a communication with job and description', async () => {
    api()
      .post('/v1/communications', {
        job_id: 1042,
        description: "Called customer to confirm access for tomorrow's visit.",
      })
      .reply(201, {
        data: {
          id: 5502,
          job_id: 1042,
          description: "Called customer to confirm access for tomorrow's visit.",
          published: false,
        },
      });

    const result = await appTester(
      App.creates.create_communication.operation.perform,
      authBundle({
        job_id: 1042,
        description: "Called customer to confirm access for tomorrow's visit.",
      }),
    );
    expect(result.id).toBe(5502);
    expect(result.published).toBe(false);
  });

  it('is create-only', () => {
    expect(App.searches.find_communication).toBeUndefined();
    expect(App.creates.update_communication).toBeUndefined();
    expect(App.triggers.list_communications).toBeUndefined();
    expect(App.creates.create_communication.operation.inputFields.find((field) => field.key === 'job_id')).toMatchObject({
      required: true,
      dynamic: 'list_jobs.id.number',
      search: 'find_job.id',
    });
  });
});
