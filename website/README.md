# ProjectHub public website

This folder is the isolated, enhanced HTML/CSS/JavaScript website. Its entry page is `index.html`; the other public pages are `projects.html`, `project.html`, `enroll.html`, and `team.html`. The home page is a forest-green digital showroom with a browser-ready version of the supplied hero video in `assets/video/projecthub-showroom.mp4`.

The showroom embeds live ProjectHub project-detail pages where matching projects already exist. The supplied repository had no website screenshots, so the remaining category cards are clearly labeled concepts rather than fabricated screenshots.

For local development, run `npm --prefix admin run dev` from the project root. It builds the Vite dashboard and serves both apps from `http://localhost:5175/`; the Admin link opens `/admin` on the same origin. To serve only this static site, use `python3 -m http.server 5175 --directory website`; that standalone server does not include the admin route.

For deployment, serve this folder as the website document root and publish the output of the Vite app in `../admin/dist` at `/admin` (or configure the host to rewrite `/admin` and `/admin/*` to its built `index.html`).

The shared forest-green visual system is in `assets/css/showroom.css`; home-page 3D windows use `assets/js/showroom.js`. Existing theme, motion, and interaction helpers remain in `assets/css/public.css` and `assets/js/public-effects.js`. Project submissions and Admin access continue to use Supabase. Only a browser-safe anon key belongs in `assets/js/supabase-config.js`; never put a service-role key in the browser app.
