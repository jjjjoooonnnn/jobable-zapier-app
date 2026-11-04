const { App, appTester, authBundle, api } = require('../helpers');

describe('creates.return', () => {
  it('creates a return with supplier, lines, and embedded sites', async () => {
    api()
      .post('/v1/returns', {
        supplier_id: 4,
        purchase_order_id: 55,
        line_items: [{ description: 'Faulty valve', return_reason: 'Leaking' }],
        sites: [{ name: 'Warehouse', address1: '1 Depot Rd' }],
      })
      .reply(201, {
        data: {
          id: 21,
          supplier_id: 4,
          number: 'RN21',
          purchase_order_id: 55,
        },
      });

    const result = await appTester(
      App.creates.create_return.operation.perform,
      authBundle({
        supplier_id: 4,
        purchase_order_id: 55,
        line_items: [{ description: 'Faulty valve', return_reason: 'Leaking' }],
        sites: [{ name: 'Warehouse', address1: '1 Depot Rd' }],
      }),
    );
    expect(result.number).toBe('RN21');
  });

  it('wires supplier and purchase order dropdowns; sites are addresses not ids', () => {
    const fields = Object.fromEntries(
      App.creates.create_return.operation.inputFields.map((field) => [field.key, field]),
    );
    expect(fields.supplier_id).toMatchObject({
      required: true,
      dynamic: 'list_suppliers.id.company',
      search: 'find_supplier.id',
      altersDynamicFields: true,
    });
    expect(fields.purchase_order_id).toMatchObject({
      dynamic: 'list_purchase_orders.id.number',
      search: 'find_purchase_order.id',
    });
    expect(fields.sites.list).toBeUndefined();
    expect(fields.sites.dynamic).toBeUndefined();
    expect(fields.sites.children.find((child) => child.key === 'name')).toMatchObject({
      required: true,
    });
    expect(App.triggers.list_returns.display.label).toBe('List Returns');
  });
});
