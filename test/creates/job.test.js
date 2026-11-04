const { App, appTester, authBundle, api } = require('../helpers');

describe('creates.job', () => {
  it('creates a job with customer, site, contact, and description', async () => {
    api()
      .post('/v1/jobs', {
        customer_id: 88,
        site_id: 12,
        contact_id: 305,
        description: 'No hot water, boiler locked out F28',
      })
      .reply(201, {
        data: {
          id: 1099,
          customer_id: 88,
          number: 'S1099',
          description: 'No hot water, boiler locked out F28',
          created_at: '2026-08-06 22:00:00',
        },
      });

    const result = await appTester(
      App.creates.create_job.operation.perform,
      authBundle({
        customer_id: 88,
        site_id: 12,
        contact_id: 305,
        description: 'No hot water, boiler locked out F28',
      }),
    );
    expect(result.id).toBe(1099);
    expect(result.number).toBe('S1099');
    expect(result.created_at).toBe('2026-08-06T22:00:00Z');
  });

  it('wires customer, site, contact, department, and job status dropdowns', () => {
    const fields = Object.fromEntries(
      App.creates.create_job.operation.inputFields.map((field) => [field.key, field]),
    );
    expect(fields.customer_id).toMatchObject({
      required: true,
      dynamic: 'list_customers.id.company',
      search: 'find_customer.id',
      altersDynamicFields: true,
    });
    expect(fields.site_id).toMatchObject({
      required: true,
      dynamic: 'list_sites.id.name',
      search: 'find_site.id',
    });
    expect(fields.contact_id).toMatchObject({
      required: true,
      dynamic: 'list_contacts.id.name',
      search: 'find_contact.id',
    });
    expect(fields.department_id).toMatchObject({
      dynamic: 'list_departments.id.code',
      search: 'find_department.id',
    });
    expect(fields.status_id).toMatchObject({
      dynamic: 'list_job_statuses.id.name',
      search: 'find_job_status.id',
    });
    expect(fields.equipment_ids).toMatchObject({
      label: 'Equipment',
      list: true,
      dynamic: 'list_equipment.id.label',
    });
    expect(fields.equipment_ids.search).toBeUndefined();
    expect(App.creates.update_job.operation.inputFields.find((field) => field.key === 'customer_id')).toBeUndefined();
  });
});
