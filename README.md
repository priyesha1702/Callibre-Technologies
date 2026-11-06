# ProjectHub

A responsive project discovery and submission site built with HTML, CSS, vanilla JavaScript, and Supabase. The enhanced public website is in [`website/`](website/).

## Pages
- `index.html` — landing page and live overview
- `projects.html` — searchable, filterable project library
- `project.html` — individual project details (`?id=...`)
- `enroll.html` — project submission form, including client name, email, and phone
- `team.html` — about the creators and the admin login link
- `admin-login.html` — Supabase admin sign-in
- `/admin/` — full admin workspace with dashboard, analytics, orders, products, and community submissions
- `admin.html` — compatibility redirect to `/admin/`

## Supabase setup
1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor. It creates the project/contact tables, the public submission RPC, and row-level security policies.
3. Copy the project URL and **anon/public key** into `assets/js/supabase-config.js`. The anon key is intended for browser use; never put a `service_role` key in this project.
4. In Supabase Authentication, create an admin user. Do not enable public sign-up unless you intend to support it.
5. In the SQL Editor, assign the admin role to that user's email, substituting the account email:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'admin@example.com';
   ```

   Sign out and back in after changing the role so the refreshed access token contains the new `app_metadata`.
6. Add the URL where the site is hosted to Supabase Authentication's allowed redirect/site URLs.
7. Serve the site over HTTP (for example, with VS Code Live Server); browser module imports and Supabase Auth do not work reliably from `file://`.

The admin UI checks the user's `app_metadata.role`, and database row-level security independently restricts client contact data and status updates to admin users. Public project details are readable for the project library; client contact information is stored separately and is not publicly readable. Project submissions are stored in Supabase so they can be reviewed across devices.

## Run and deploy

Install dependencies with `npm install` and `npm --prefix admin install`, then run `npm run dev` to serve the public website and full admin workspace at `http://localhost:5175/`. Open the dashboard at `http://localhost:5175/admin/`; the older `/admin.html` URL redirects there. Stop any already-running dev server and restart it after changing the command.

Run `npm run build` to build the public website in `dist/` and the admin app in `admin/dist/`. Deploy the public output as the Vercel build output and publish the admin output under `/admin/` (or configure equivalent host routing). Configure Supabase first to enable sign-in and live community submissions. Revenue charts and order/product examples in the admin UI are sample data until connected to commerce data.

## Data and customisation
- Built-in project entries are in `assets/js/data.js`.
- Team details are in `team.html`.
- Supabase schema and access policies are in `supabase/schema.sql`.
- Supabase's browser URL and anon key belong in `assets/js/supabase-config.js`; do not add privileged server keys there.
