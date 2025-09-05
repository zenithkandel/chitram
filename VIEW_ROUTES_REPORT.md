# Chitram (चित्रम्) — Pages, Routes, and Features Map

This report maps all EJS view pages that are rendered by the app to their URL routes and summarizes key features available on each page.

## Views directory overview

```
views/
├─ about.ejs                  # Public about page (used)
├─ apply.ejs                  # Public artist application form (used)
├─ artist-detail.ejs          # Legacy/alternate public artist page (present, not routed)
├─ artist-profile.ejs         # Public single artist profile (used)
├─ artists.ejs                # Public artists listing (used)
├─ artwork-details.ejs        # Public single artwork view (used)
├─ cart.ejs                   # Public shopping cart (used)
├─ checkout.ejs               # Public checkout (used)
├─ error.ejs                  # Generic error page (used from controllers)
├─ gallery.ejs                # Public gallery/all artworks (used)
├─ home.ejs                   # Public homepage (used)
├─ home-backup.ejs            # Backup (present)
├─ index.ejs                  # Present (not routed directly)
├─ track-orders.ejs           # Public order tracking page (used)
├─ admin/                     # Admin panel views (all used except dashboard_new)
│  ├─ applications.ejs        # Admin applications management
│  ├─ artists.ejs             # Admin artists management
│  ├─ artworks.ejs            # Admin artworks management
│  ├─ dashboard.ejs           # Admin dashboard
│  ├─ dashboard_new.ejs       # Present (not routed)
│  ├─ login.ejs               # Admin login
│  └─ messages.ejs            # Admin messages management
└─ client/                    # Alternate client views (present, not routed in current server.js)
   ├─ about.ejs
   ├─ apply.ejs
   ├─ art-detail.ejs
   ├─ artist-detail.ejs
   ├─ artists.ejs
   ├─ arts.ejs
   ├─ cart.ejs
   ├─ checkout.ejs
   ├─ error.ejs
   ├─ home.ejs
   └─ track.ejs
```

Notes
- “Used” indicates the view is rendered by an active route in `server.js` and controllers wired there.
- `views/client/*` pages are present for an alternate client UI via `routes/client.js`, but that router is not mounted in `server.js` in this codebase snapshot.
- Some error flows render `views/error.ejs` or client error variants.

## Public site pages

| Page file | Route(s) | Rendered by | Features and data (detailed) |
|---|---|---|---|
| `views/home.ejs` | `/` | `homeController.getHomePage` | Shows site stats: daily page views, total active artists, total listed arts, total orders. Updates today’s page view counter. Displays latest 5 artworks (name, cost, image, category, artist name) pulled with a LEFT JOIN. Provides a welcoming landing section for the art platform. |
| `views/about.ejs` | `/about` | Inline in `server.js` | Static info about the platform. Minimal dynamic data. Page view tracked globally via other controllers only; this route renders directly without controller logic. |
| `views/apply.ejs` | `/apply` | Inline in `server.js` | Public artist application form page. Expected to POST to the API mounted at `/api/applications` (`routes/applications.js`): endpoints include `POST /api/applications/apply` and `POST /api/applications/submit` with image upload support (multer). Includes fields such as name, age, start year, school/college, location, socials, bio, message, and profile picture. Validation on server ensures email uniqueness and basic format. |
| `views/artists.ejs` | `/artists` | `artistController.getPublicArtists` | Lists active artists with derived data: short bio (first 5 words + …), years of experience (current year − started), location string (city, district fallback), counts of total/available/sold artworks. Optimized grouping query and aggregation. Likely supports basic navigation and “view profile” actions. |
| `views/artist-profile.ejs` | `/artist/:id` | `artistProfileController.getArtistProfile` | Detailed public profile for a single active artist. Shows profile info (name, district, school/college, bio, social links parsed from JSON), computed experience years, safe profile pictures (validated against uploads folder with graceful fallback), and the artist’s artworks across statuses (listed/ordered/sold). Artworks include formatted cost (₹), image path validation, size, color type (mapped to user-friendly label), and upload dates. Errors render `views/error.ejs`. |
| `views/gallery.ejs` | `/gallery` | `galleryController.getGalleryArtworks` | Gallery of all listed artworks by active artists, sorted newest first. Each item has id, name, image, cost, category, description, work hours, size, color type, upload time, and artist info. Page can integrate front-end filtering/search with APIs: `GET /api/gallery/search?q=&sortBy=&category=` and `GET /api/gallery/categories` for dynamic dropdown options. Error states display a friendly message. |
| `views/artwork-details.ejs` | `/artwork/:id` | `artworkController.getArtworkDetails` | Single artwork detail with joined artist info. Server formats currency, validates images, computes relative “time ago,” and exposes artist id/name/profile image for linking to their profile. Error cases render a descriptive error page. |
| `views/cart.ejs` | `/cart` | Inline in `server.js` | Client-side cart powered by `public/js/cart.js` using `localStorage` under key `chitram_cart`. Features: add/remove, badge count updates, total calculation, and toast-style notifications. Items store `unique_id`, `art_name`, `cost`, `art_image`, artist info. The helper can also extract artwork data from DOM on detail pages. |
| `views/checkout.ejs` | `/checkout` | Inline in `server.js` | Checkout UI. In this build, server exposes `POST /api/orders` (from `orderController.createOrder`) to place orders with server-side validation of fields and item array. Some alternate endpoints exist in `clientController` (`/api/orders/create`) but are not mounted here. |
| `views/track-orders.ejs` | `/track-orders` (and `/track` → redirect) | `trackOrderController.getTrackOrdersPage` | Order tracking UI. Front-end should call `POST /api/track-order` with `{ order_id, email }`. Server validates, fetches order, parses JSON items, formats date/time, and returns a normalized order payload. Friendly errors for invalid input or not found. |
| `views/error.ejs` | Used by several controllers for 4xx/5xx | Multiple controllers | Generic error page with `title` and `error` message. Rendered on missing or invalid IDs (e.g., artist/artwork) and on unhandled exceptions. |

## Admin pages

Base admin path is `/admin`; protected routes use `middleware/auth.authenticateAdmin`, with JWT stored in `adminToken` cookie.

| Page file | Route(s) | Rendered by | Features and data (detailed) |
|---|---|---|---|
| `views/admin/login.ejs` | `GET /admin/login`, `POST /admin/login` | Inline for GET, `adminController.adminLogin` for POST | Login screen for admins. POST verifies username/password (bcrypt), updates last login, generates JWT, sets `adminToken` httpOnly cookie, and redirects to dashboard. Shows error messages for invalid creds or exceptions. Logout clears cookie and redirects to login. |
| `views/admin/dashboard.ejs` | `GET /admin/dashboard` | `adminController.getDashboardData` | KPI overview: total artists, total arts, arts sold/delivered, total and new/processing orders, total/unread contact messages, total/today page views. All computed via aggregate queries and rendered together. |
| `views/admin/artists.ejs` | `GET /admin/artists` (+ JSON APIs) | `artistController.getAllArtists` | Admin list of artists (non-deleted), with columns like name, age, start year, education, location, email/phone, socials, counts (uploaded/sold), bio snippet, status, joined date. Related JSON APIs: `GET /admin/artists/search` (search by name/email/bio with ranking), `GET /admin/artists/:id`, `POST /admin/artists` (create with optional profile picture upload), `PUT /admin/artists/:id` (update with optional new picture and safe deletion of old), `DELETE /admin/artists/:id` (soft delete). |
| `views/admin/artworks.ejs` | `GET /admin/artworks` (+ JSON APIs) | `artworkController.getAllArtworks` | Admin artworks grid/list with joined artist info. JSON utilities: `GET /admin/artworks/search` (search/filter by name/artist/category/description, status, sort), `GET /admin/artworks/categories` (distinct categories), `GET /admin/artworks/api/artists` (for dropdown), `GET /admin/artworks/:id`, `POST /admin/artworks` (create; image required), `PUT /admin/artworks/:id` (update; optional new image, cleans old), `DELETE /admin/artworks/:id` (soft delete with artist counts update). |
| `views/admin/orders.ejs` | `GET /admin/orders` (+ JSON APIs) | `orderController.getAllOrders` | Orders table with parsed `item_list` JSON, showing customer details, amounts, item count, timestamps, and status. JSON endpoints: `GET /admin/orders/:id` (details), `PUT /admin/orders/:id/status` (transitions with timestamp updates for seen/delivered), `DELETE /admin/orders/:id`. |
| `views/admin/messages.ejs` | `GET /admin/messages`, `GET /admin/messages/archive` (+ JSON APIs) | `messageController.getAllMessages`, `getArchivedMessages` | Contact messages inbox/archive. Each entry includes name, email/phone, subject, message, status, and created_at. JSON endpoints: `GET /admin/messages/:id` (auto-marks unread as read), `PUT /admin/messages/:id/status` (unread/read/archived), `DELETE /admin/messages/:id`. |
| `views/admin/applications.ejs` | `GET /admin/applications`, `GET /admin/applications/approved`, `GET /admin/applications/rejected` (+ JSON APIs) | `applicationController.*` | Manage artist applications. Lists pending/under_review (default), approved, and rejected. Actions update status (with optional rejection reason) via `PUT/POST /admin/applications/:id/status`. On approval, server attempts to create an `artists` record and copies profile picture from `uploads/applications` to `uploads/profiles` with safe directory creation. `GET /admin/applications/:id` returns full JSON. `DELETE /admin/applications/:id` removes record (and tries to remove image file if present). |

## API endpoints used by pages (quick reference)

Public/Client
- Search/filter gallery: `GET /api/gallery/search`, `GET /api/gallery/categories`
- Contact: `POST /api/contact`
- Order create: `POST /api/orders` (server.js) — for checkout
- Track order: `POST /api/track-order` — for track-orders page
- Artist application: `POST /api/applications/apply` or `POST /api/applications/submit` (with image upload)

Admin
- Nested under `/admin/*` as detailed in the Admin pages table.

## Observations and notes
- Two parallel client view sets exist: top-level `views/*.ejs` (actively used) and `views/client/*.ejs` (not wired in `server.js`). The `routes/client.js` and `controllers/clientController.js` correspond to the `views/client/*` pages and expose additional JSON endpoints like `/api/arts/details`, `/api/arts/recommended`, `/api/orders/create`, `/api/orders/track`. They’re unused unless that router is mounted.
- `views/admin/dashboard_new.ejs` is present but not routed; admin dashboard uses `views/admin/dashboard.ejs`.
- Error handling: controllers often render `views/error.ejs` with friendly messages and status-specific titles; the Express 404/500 handlers in `server.js` return plain HTML strings.
- Static assets served from `public/` and `uploads/` (profiles, artworks, applications). Image paths in detail pages are validated with disk existence checks and fallbacks to placeholders.
- Cart is entirely client-side via `public/js/cart.js` and data extraction utilities, showing toasts and keeping a badge count in the navbar.

---
Generated from current code (controllers/routes/server) to reflect the actual pages being rendered and their features.
