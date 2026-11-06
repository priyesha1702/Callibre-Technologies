# ProjectHub Admin

React + Vite dashboard for managing ProjectHub workspace data and reviewing public submissions.

## Run both apps locally

Install the root and Admin dependencies, then run from the repository root:

```sh
npm install
npm --prefix admin install
npm run dev
```

This builds the Vite dashboard and serves both apps from one origin: the public website is at `http://localhost:5175/` and the full admin dashboard is at `http://localhost:5175/admin/`. The legacy `/admin.html` URL redirects to the full dashboard. The dashboard is rebuilt on each `dev` start, so rerun the command after edits.

Build the admin app with:

```sh
npm --prefix admin run build
```

The app uses the browser-safe Supabase URL and anon key in `src/supabase-config.ts`. Keep it aligned with `website/assets/js/supabase-config.js`; do not use a service-role key. Admin users must have `app_metadata.role = 'admin'`, and the database policies in `../supabase/schema.sql` enforce access to contact information and status updates.

For deployment, publish the contents of `admin/dist` at `/admin`.
