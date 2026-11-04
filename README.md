# Jobable Zapier app

Field service management — schedule jobs, then connect Jobable to other apps in Zapier.

This version covers the Jobable API resources that have list/get endpoints: customers, sites, contacts, jobs, appointments, visits, communications, equipment, suppliers, quotes, sales orders, invoices, payments, purchase orders, and returns, plus dropdown references (users, departments, job statuses, sales taxes, payment methods, equipment categories). Actions are Find / Create / Update where the API allows it, instant New/Updated REST Hooks, Delete for appointments and payments, and an **API Request** escape hatch for any `https://api.jobable.app` path.

Authentication uses an API key from Jobable Admin (Settings → API Access & Webhooks).

```bash
npm test
npx zapier-platform validate
```
