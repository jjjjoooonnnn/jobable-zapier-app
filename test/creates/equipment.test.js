const { App, appTester, authBundle, api } = require('../helpers');

describe('creates.equipment', () => {
  it('creates equipment with customer, site, and category', async () => {
    api()
      .post('/v1/equipment', {
        customer_id: 3,
        site_id: 9,
        category_id: 10,
      })
      .reply(201, {
        data: {
          id: 42,
          customer_id: 3,
          site_id: 9,
          category: { id: 10, name: 'Condensing Unit', parent_id: 4, fgas: true },
        },
      });

    const result = await appTester(
      App.creates.create_equipment.operation.perform,
      authBundle({ customer_id: 3, site_id: 9, category_id: 10 }),
    );
    expect(result.id).toBe(42);
    expect(result.category.id).toBe(10);
  });

  it('posts custom fields as key/value pairs', async () => {
    api()
      .post('/v1/equipment', {
        customer_id: 3,
        site_id: 9,
        category_id: 10,
        custom_fields: [{ key: 'custom1', value: '240' }],
      })
      .reply(201, {
        data: {
          id: 42,
          custom_fields: [{ key: 'custom1', name: 'Voltage (V)', value: '240' }],
        },
      });

    const result = await appTester(
      App.creates.create_equipment.operation.perform,
      authBundle({
        customer_id: 3,
        site_id: 9,
        category_id: 10,
        custom_fields: [{ key: 'custom1', value: '240' }],
      }),
    );
    expect(result.custom_fields).toEqual([{ key: 'custom1', name: 'Voltage (V)', value: '240' }]);
  });

  it('wires customer, site, and category dropdowns', () => {
    const fields = Object.fromEntries(
      App.creates.create_equipment.operation.inputFields.map((field) => [field.key, field]),
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
    expect(fields.category_id).toMatchObject({
      required: true,
      dynamic: 'list_equipment_categories.id.name',
      search: 'find_equipment_category.id',
    });
    expect(fields.supplier_id).toMatchObject({
      label: 'Supplier',
      dynamic: 'list_suppliers.id.company',
      search: 'find_supplier.id',
    });
    expect(fields.custom_fields.children.map((child) => child.key)).toEqual(['key', 'value']);
    expect(App.creates.update_equipment.operation.inputFields.find((field) => field.key === 'customer_id')).toBeUndefined();
    expect(App.creates.create_equipment.display.description).toBe('Creates a new equipment record.');
  });
});
