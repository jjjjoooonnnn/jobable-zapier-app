const { App, appTester, authBundle, api } = require('../helpers');

describe('creates.sales_order', () => {
  it('creates a sales order with customer and line items', async () => {
    api()
      .post('/v1/sales_orders', {
        customer_id: 4,
        line_items: [{ description: 'Annual filter service', sales_tax_id: 1 }],
      })
      .reply(201, {
        data: {
          id: 88,
          customer_id: 4,
          number: 'SO88',
          line_items: [{ description: 'Annual filter service', sales_tax: { id: 1, rate: 0.2 } }],
        },
      });

    const result = await appTester(
      App.creates.create_sales_order.operation.perform,
      authBundle({
        customer_id: 4,
        line_items: [{ description: 'Annual filter service', sales_tax_id: 1 }],
      }),
    );
    expect(result.number).toBe('SO88');
  });

  it('wires customer, job, sites, and sales tax dropdowns', () => {
    const fields = Object.fromEntries(
      App.creates.create_sales_order.operation.inputFields.map((field) => [field.key, field]),
    );
    expect(fields.customer_id).toMatchObject({
      required: true,
      dynamic: 'list_customers.id.company',
      search: 'find_customer.id',
    });
    expect(fields.job_id).toMatchObject({
      dynamic: 'list_jobs.id.number',
      search: 'find_job.id',
    });
    expect(fields.sites).toMatchObject({ list: true, dynamic: 'list_sites.id.name' });
    expect(fields.sites.search).toBeUndefined();
    expect(fields.line_items.children.find((child) => child.key === 'sales_tax_id')).toMatchObject({
      dynamic: 'list_sales_taxes.id.name',
      search: 'find_sales_tax.id',
    });
  });
});
