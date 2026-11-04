const { App, appTester, authBundle, api } = require('../helpers');

describe('creates.quote', () => {
  it('creates a quote with customer and line items', async () => {
    api()
      .post('/v1/quotes', {
        customer_id: 4,
        line_items: [{ description: 'Annual filter service', sales_tax_id: 1 }],
      })
      .reply(201, {
        data: {
          id: 1234,
          customer_id: 4,
          number: 'Q1234',
          line_items: [
            {
              description: 'Annual filter service',
              sales_tax: { id: 1, rate: 0.2 },
            },
          ],
        },
      });

    const result = await appTester(
      App.creates.create_quote.operation.perform,
      authBundle({
        customer_id: 4,
        line_items: [{ description: 'Annual filter service', sales_tax_id: 1 }],
      }),
    );
    expect(result.id).toBe(1234);
    expect(result.number).toBe('Q1234');
    expect(result.line_items[0].sales_tax.id).toBe(1);
  });

  it('wires customer, job, sites, and sales tax dropdowns', () => {
    const fields = Object.fromEntries(
      App.creates.create_quote.operation.inputFields.map((field) => [field.key, field]),
    );
    expect(fields.customer_id).toMatchObject({
      required: true,
      dynamic: 'list_customers.id.company',
      search: 'find_customer.id',
      altersDynamicFields: true,
    });
    expect(fields.job_id).toMatchObject({
      dynamic: 'list_jobs.id.number',
      search: 'find_job.id',
    });
    expect(fields.sites).toMatchObject({
      list: true,
      dynamic: 'list_sites.id.name',
    });
    expect(fields.sites.search).toBeUndefined();
    const salesTax = fields.line_items.children.find((child) => child.key === 'sales_tax_id');
    expect(salesTax).toMatchObject({
      dynamic: 'list_sales_taxes.id.name',
      search: 'find_sales_tax.id',
    });
    expect(App.creates.update_quote.operation.inputFields.find((field) => field.key === 'customer_id')).toBeUndefined();
  });
});
