const { App, appTester, authBundle, api } = require('../helpers');

describe('searches.find_equipment', () => {
  it('finds equipment by id', async () => {
    api()
      .get('/v1/equipment/42')
      .reply(200, {
        data: {
          id: 42,
          customer_id: 3,
          site_id: 9,
          make: 'Daikin',
          model: 'VRV IV',
          id_number: 'AHU-01',
        },
      });

    const results = await appTester(App.searches.find_equipment.operation.perform, authBundle({ id: 42 }));
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(42);
    expect(results[0].make).toBe('Daikin');
  });

  it('finds equipment by customer', async () => {
    api()
      .get('/v1/equipment')
      .query({ 'filter[customer_id]': 3, per_page: 10 })
      .reply(200, {
        data: [{ id: 42, customer_id: 3, make: 'Daikin' }],
      });

    const results = await appTester(
      App.searches.find_equipment.operation.perform,
      authBundle({ customer_id: 3 }),
    );
    expect(results).toEqual([{ id: 42, customer_id: 3, make: 'Daikin' }]);
  });

  it('rejects an empty search', async () => {
    await expect(
      appTester(App.searches.find_equipment.operation.perform, authBundle({})),
    ).rejects.toThrow(/at least one search filter/i);
  });

  it('uses Equipment as the hidden list label', () => {
    expect(App.triggers.list_equipment.display.label).toBe('List Equipment');
    expect(App.searches.find_equipment.display.description).toBe('Finds equipment.');
    expect(App.searches.find_equipment.operation.inputFields.find((field) => field.key === 'id').dynamic).toBe(
      'list_equipment.id.label',
    );
  });
});

describe('searches.find_equipment_category', () => {
  it('finds an equipment category by id', async () => {
    api()
      .get('/v1/equipment_categories/10')
      .reply(200, { data: { id: 10, name: 'Condensing Unit', parent_id: 4, fgas: true } });

    const results = await appTester(
      App.searches.find_equipment_category.operation.perform,
      authBundle({ id: 10 }),
    );
    expect(results).toEqual([{ id: 10, name: 'Condensing Unit', parent_id: 4, fgas: true }]);
    expect(App.triggers.list_equipment_categories.display.label).toBe('List Equipment Categories');
    expect(App.searches.find_equipment_category.display.description).toBe('Finds an equipment category.');
  });
});
