const { App, appTester, authBundle, api } = require('../helpers');

describe('creates.invoice', () => {
  it('creates an invoice with customer and line items', async () => {
    api()
      .post('/v1/invoices', {
        customer_id: 4,
        line_items: [{ description: 'Annual filter service', sales_tax_id: 1 }],
      })
      .reply(201, {
        data: {
          id: 30,
          customer_id: 4,
          number: 'INV1001',
          line_items: [{ description: 'Annual filter service', sales_tax: { id: 1, rate: 0.2 } }],
        },
      });

    const result = await appTester(
      App.creates.create_invoice.operation.perform,
      authBundle({
        customer_id: 4,
        line_items: [{ description: 'Annual filter service', sales_tax_id: 1 }],
      }),
    );
    expect(result.number).toBe('INV1001');
  });

  it('wires customer, sales order, jobs, and payment dropdowns', () => {
    const fields = Object.fromEntries(
      App.creates.create_invoice.operation.inputFields.map((field) => [field.key, field]),
    );
    expect(fields.customer_id).toMatchObject({
      required: true,
      dynamic: 'list_customers.id.company',
      search: 'find_customer.id',
    });
    expect(fields.sales_order_id).toMatchObject({
      dynamic: 'list_sales_orders.id.number',
      search: 'find_sales_order.id',
    });
    expect(fields.jobs).toMatchObject({ list: true, dynamic: 'list_jobs.id.number' });
    expect(fields.jobs.search).toBeUndefined();
    expect(fields.payment_ids).toMatchObject({ list: true, dynamic: 'list_payments.id.label' });
    expect(fields.payment_ids.search).toBeUndefined();
    expect(App.creates.update_invoice.operation.inputFields.find((field) => field.key === 'customer_id')).toBeUndefined();
  });
});
