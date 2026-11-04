const { App, appTester, authBundle, api } = require('../helpers');

describe('searches.find_contact', () => {
  it('searches contacts by customer, site, and name, and requires those fields on create', async () => {
    api()
      .get('/v1/contacts')
      .query({
        'filter[customer_id]': 4,
        'filter[site_id]': 9,
        'filter[firstname]': 'Alice',
        per_page: 10,
      })
      .reply(200, {
        data: [{ id: 12, customer_id: 4, site_id: 9, firstname: 'Alice', lastname: 'Mason' }],
      });

    const results = await appTester(
      App.searches.find_contact.operation.perform,
      authBundle({ customer_id: 4, site_id: 9, firstname: 'Alice' }),
    );
    expect(results).toEqual([{ id: 12, customer_id: 4, site_id: 9, firstname: 'Alice', lastname: 'Mason' }]);

    const createFields = App.creates.create_contact.operation.inputFields;
    expect(createFields.find((field) => field.key === 'customer_id')).toMatchObject({
      required: true,
      label: 'Customer',
      dynamic: 'list_customers.id.company',
    });
    expect(createFields.find((field) => field.key === 'site_id')).toMatchObject({
      required: true,
      label: 'Site',
      dynamic: 'list_sites.id.name',
      search: 'find_site.id',
    });
    expect(createFields.find((field) => field.key === 'firstname').required).toBe(true);
    expect(App.searches.find_contact.operation.inputFields.find((field) => field.key === 'id').dynamic).toBe(
      'list_contacts.id.name',
    );
  });
});
