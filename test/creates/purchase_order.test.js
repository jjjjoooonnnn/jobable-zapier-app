const { App, appTester, authBundle, api } = require('../helpers');

describe('creates.purchase_order', () => {
  it('creates a purchase order with supplier and line items', async () => {
    api()
      .post('/v1/purchase_orders', {
        supplier_id: 4,
        line_items: [{ supplier_ref: 'PART-1', description: 'Compressor oil', sales_tax_id: 1 }],
      })
      .reply(201, {
        data: {
          id: 55,
          supplier_id: 4,
          number: 'PO55',
          line_items: [{ description: 'Compressor oil', sales_tax: { id: 1, rate: 0.2 } }],
        },
      });

    const result = await appTester(
      App.creates.create_purchase_order.operation.perform,
      authBundle({
        supplier_id: 4,
        line_items: [{ line_supplier_ref: 'PART-1', description: 'Compressor oil', sales_tax_id: 1 }],
      }),
    );
    expect(result.number).toBe('PO55');
  });

  it('wires supplier, job, and sales tax dropdowns', () => {
    const fields = Object.fromEntries(
      App.creates.create_purchase_order.operation.inputFields.map((field) => [field.key, field]),
    );
    expect(fields.supplier_id).toMatchObject({
      required: true,
      dynamic: 'list_suppliers.id.company',
      search: 'find_supplier.id',
    });
    expect(fields.job_id).toMatchObject({
      dynamic: 'list_jobs.id.number',
      search: 'find_job.id',
    });
    expect(fields.line_items.children.find((child) => child.key === 'sales_tax_id')).toMatchObject({
      dynamic: 'list_sales_taxes.id.name',
      search: 'find_sales_tax.id',
    });
    expect(
      App.creates.update_purchase_order.operation.inputFields.find((field) => field.key === 'supplier_id'),
    ).toBeUndefined();
  });
});
