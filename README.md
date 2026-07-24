# Nexora Local Demo

This project has been updated to run locally without an external Supabase backend.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the local URL shown in the terminal.

## Demo credentials

- Email: `demo@nexora.com`
- Password: `password`

## Admin features added

- Add new products from the admin panel.
- Edit existing products in the admin product list.
- Delete products from the admin product list.
- Revenue trend graph for recent orders.

## Local database

The app stores its local database in the browser's `localStorage`.

- Open browser devtools.
- Go to the `Application` tab.
- Select `Local Storage` → `http://127.0.0.1:4173`.
- Inspect the keys:
  - `nimbus-local-db` for all seeded and created data.
  - `nimbus-local-auth` for the current auth session.

You can also inspect the data from the console:

```js
JSON.parse(localStorage.getItem('nimbus-local-db'))
```

## Notes

- No Supabase environment variables are required.
- The build was verified successfully with `npm run build`.
