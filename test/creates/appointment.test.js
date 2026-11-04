const { App, appTester, authBundle, api } = require('../helpers');

describe('creates.appointment', () => {
  it('creates a smart-booked appointment without date fields', async () => {
    api()
      .post('/v1/appointments', { job_id: 1042, smart: true })
      .reply(201, {
        data: {
          id: 3310,
          job_id: 1042,
          engineer_id: 7,
          date: '2026-08-10',
          time: '09:00',
        },
      });

    const result = await appTester(
      App.creates.create_appointment.operation.perform,
      authBundle({ job_id: 1042, smart: true }),
    );
    expect(result.id).toBe(3310);
    expect(result.job_id).toBe(1042);
  });

  it('rejects smart book together with a date', async () => {
    await expect(
      appTester(
        App.creates.create_appointment.operation.perform,
        authBundle({ job_id: 1042, smart: true, date: '2026-08-10' }),
      ),
    ).rejects.toThrow(/not both/i);
  });

  it('rejects a booking with neither smart book nor a full slot', async () => {
    await expect(
      appTester(
        App.creates.create_appointment.operation.perform,
        authBundle({ job_id: 1042, date: '2026-08-10' }),
      ),
    ).rejects.toThrow(/smart book, or date, time, and engineer/i);
  });

  it('deletes an appointment', async () => {
    api()
      .delete('/v1/appointments/3310')
      .reply(200, { data: { id: 3310, deleted: true } });

    const result = await appTester(
      App.creates.delete_appointment.operation.perform,
      authBundle({ id: 3310 }),
    );
    expect(result).toEqual({ id: 3310, deleted: true });
  });

  it('wires job and engineer dropdowns', () => {
    const fields = Object.fromEntries(
      App.creates.create_appointment.operation.inputFields.map((field) => [field.key, field]),
    );
    expect(fields.job_id).toMatchObject({
      required: true,
      dynamic: 'list_jobs.id.number',
      search: 'find_job.id',
    });
    expect(fields.engineer_id).toMatchObject({
      dynamic: 'list_users.id.name',
      search: 'find_user.id',
    });
    expect(App.creates.delete_appointment.display).toMatchObject({
      label: 'Delete Appointment',
      description: 'Deletes an appointment.',
    });
    expect(App.triggers.list_appointments.operation.inputFields).toEqual([
      { key: 'job_id', type: 'integer', required: false },
    ]);
  });
});
