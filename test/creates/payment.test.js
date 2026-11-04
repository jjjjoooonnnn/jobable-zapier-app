const { App, appTester, authBundle, api } = require('../helpers');

describe('creates.payment', () => {
  it('creates a payment with job and amount', async () => {
    api()
      .post('/v1/payments', { job_id: 12, amount: 90 })
      .reply(201, {
        data: {
          id: 401,
          job_id: 12,
          amount: 90,
          verified: false,
          paid_at: '2026-07-15 00:00:00',
        },
      });

    const result = await appTester(
      App.creates.create_payment.operation.perform,
      authBundle({ job_id: 12, amount: 90 }),
    );
    expect(result.id).toBe(401);
    expect(result.amount).toBe(90);
  });

  it('deletes a payment', async () => {
    api()
      .delete('/v1/payments/401')
      .reply(200, { data: { id: 401, deleted: true } });

    const result = await appTester(
      App.creates.delete_payment.operation.perform,
      authBundle({ id: 401 }),
    );
    expect(result).toEqual({ id: 401, deleted: true });
  });

  it('wires job, invoice, and payment method dropdowns', () => {
    const fields = Object.fromEntries(
      App.creates.create_payment.operation.inputFields.map((field) => [field.key, field]),
    );
    expect(fields.job_id).toMatchObject({
      required: true,
      dynamic: 'list_jobs.id.number',
      search: 'find_job.id',
    });
    expect(fields.invoice_id).toMatchObject({
      dynamic: 'list_invoices.id.number',
      search: 'find_invoice.id',
    });
    expect(fields.method).toMatchObject({
      dynamic: 'list_payment_methods.id.name',
      search: 'find_payment_method.id',
    });
    expect(App.creates.delete_payment.display).toMatchObject({
      label: 'Delete Payment',
      description: 'Deletes a payment.',
    });
  });
});
