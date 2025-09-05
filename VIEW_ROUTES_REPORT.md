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

## System architecture and working mechanism

### High-level architecture
- Platform: Node.js + Express server with EJS templating.
- Database: MySQL (mysql2 with a connection pool; promise API) via `config/database.js`.
- Auth: Admin-only authentication with JWT stored in httpOnly cookie (`adminToken`), middleware-guarded routes under `/admin/*`.
- Static/Uploads: `public/` served statically; uploaded media under `uploads/` (profiles, artworks, applications) served via `/uploads/*`.
- Frontend behavior: Progressive enhancement with vanilla JS (`public/js/main.js`, `public/js/cart.js`).
- Error handling: Central 404 and 500 handlers in Express; controllers render `views/error.ejs` for domain errors.

### Actors and identities
- Visitors (anonymous): browse artists, artworks, view details, add to cart (localStorage), checkout (creates an order without account), submit contact, track orders.
- Admins: authenticated users managing artists, artworks, orders, messages, and applications via `/admin/*`.
- Artists: data entities (rows in `artists`); no login in this build. Created directly by admins or via approval of public applications.

### Data model overview (from `chitram_db_schema.sql`)
- admin: id, username (unique), password_hash (bcrypt), last_login, created_at.
- artists: unique_id (PK), full_name, age, started_art_since, college_school, location (city, district), email (unique), phone, socials (JSON text), counts (arts_uploaded, arts_sold), bio, profile_picture, joined_at, status (active/inactive/deleted).
- arts: unique_id (PK), art_name, artist_unique_id (FK→artists), art_category, cost, art_image, art_description, work_hours, size_of_art, color_type (black_and_white|color), status (listed|ordered|sold|delivered), uploaded_at.
- contact_messages: unique_id, full_name, email, phone, subject, message, status (unread|read|archived), created_at.
- orders: unique_id, order_id (unique), customer_name/phone/email, shipping_address, customer_message, total_amount, item_count, item_list (JSON), timestamps (creation/received/delivered), status (placed|seen|contacted|sold|delivered|canceled).
- page_views: view_date (unique), view_count, sn.
- artist_applications: unique_id, applicant details (name, age, started_art_at, school_college, location), email (unique), phone, socials (JSON), message, profile_picture, bio, received_date, status (pending|under_review|approved|rejected), reviewed_by/date, rejection_reason, created/updated.
- Indexes: on key lookup/filter fields for performance (artist email, arts artist/category/status, orders status/date, messages status, applications status/date, page_views date).

### Authentication and session management (admin)
1) Admin visits `/admin/login` (GET) → `views/admin/login.ejs`.
2) POST `/admin/login` → `adminController.adminLogin`: looks up admin by username, compares bcrypt hash, updates `last_login`, issues JWT via `config/jwt.js` with `JWT_SECRET` and `JWT_EXPIRES_IN`, sets `adminToken` httpOnly cookie (secure in production), redirects to `/admin/dashboard`.
3) `middleware/auth.authenticateAdmin` checks/decodes `adminToken` on protected routes; clears cookie and redirects to login on failure.
4) Logout via `POST /admin/logout` or `GET /admin/logout` clears the cookie and redirects to login.

### Artist application intake workflow (public → admin)
1) Visitor opens `/apply` → `views/apply.ejs`.
2) Form submits to `/api/applications/apply` or `/api/applications/submit` (both handled by `applicationController.submitApplication`) with optional `profile_picture` (multer: 5MB limit, images only) and inputs like full_name, age, city, district, email, socials, bio, message.
3) Server validates required fields and email format, enforces unique email across `artist_applications`, normalizes `socials` to JSON if present, stores file to `uploads/applications/`.
4) Admin reviews in `/admin/applications` (default new/under_review), `/admin/applications/approved`, `/admin/applications/rejected`.
5) Status change via `PUT/POST /admin/applications/:id/status` updates status, sets reviewer/timestamp; if approved and no existing artist with same email, server copies the application `profile_picture` to `uploads/profiles/` and inserts a new record in `artists` (status active).
6) Admin can delete application `DELETE /admin/applications/:id` (attempts to remove associated image file if present).

### Artist management (admin)
- List: `GET /admin/artists` → `views/admin/artists.ejs` (excludes deleted). Search via `GET /admin/artists/search?q=` matches name/email/bio.
- Create: `POST /admin/artists` with `profile_picture` (multer 5MB; images only). Email uniqueness enforced.
- Read: `GET /admin/artists/:id` returns JSON details.
- Update: `PUT /admin/artists/:id` supports updating fields and replacing `profile_picture` (old file removed if exists). Required fields validated.
- Delete: `DELETE /admin/artists/:id` soft-deletes by setting status to `deleted`.

### Artwork lifecycle and catalog management
- Create: `POST /admin/artworks` with `art_image` (multer 10MB). Requires art_name, artist_unique_id (validated), category, cost. Inserts into `arts` and increments artist’s `arts_uploaded`.
- Read: `GET /admin/artworks` renders list; `GET /admin/artworks/:id` returns JSON; `GET /admin/artworks/categories` lists distinct categories; `GET /admin/artworks/api/artists` lists active artists for dropdown.
- Update: `PUT /admin/artworks/:id` can change fields and replace image (old file deleted). If artist changes, decrements old artist’s `arts_uploaded` and increments new artist’s count.
- Delete: `DELETE /admin/artworks/:id` soft-deletes (status → deleted) and decrements artist’s `arts_uploaded`.
- Status semantics: `listed` (visible publicly), `ordered` (customer initiated), `sold`/`delivered` (completed stages). Admin orders flow can reflect transitions; public pages generally show `listed` items.

### Public browsing and discovery
- Home `/` → stats and latest artworks via `homeController.getHomePage` (counts from `page_views`, active artists, listed arts, total orders; updates today’s view).
- Gallery `/gallery` → full listing of listed artworks by active artists; supports client-side integrations with `GET /api/gallery/search` (q, category, sort) and `GET /api/gallery/categories`.
- Artists `/artists` → active artists with computed fields (short bio, experienceYears, location) and artwork counts.
- Artist profile `/artist/:id` → detailed view with artist info (socials parsed from JSON), validated image paths, computed experience; artworks across statuses displayed with formatted prices.
- Artwork details `/artwork/:id` → formatted currency, artist info, relative “time ago”, image validation with fallbacks.
- Optional/alternate client router: `routes/client.js` + `controllers/clientController.js` render `views/client/*` and expose additional APIs like `/api/arts/details`, `/api/arts/recommended`, `/api/orders/create`, `/api/orders/track` if that router is mounted.

### Cart and checkout
- Cart: implemented entirely client-side with `localStorage` key `chitram_cart` (`public/js/cart.js`).
   - Add/remove items, dedupe by `unique_id`, badge count updates, toast notifications, total calculation.
   - Can auto-extract artwork data from DOM on detail/profile pages when only ID is provided.
- Checkout page `/checkout`: server provides `POST /api/orders` (from `orderController.createOrder`) that validates required fields, ensures `item_list` is a non-empty array, checks duplicate `order_id`, then inserts to `orders` with status `placed`.
- Track orders:
   - Public page `/track-orders` (redirect from `/track`) → UI posts to `POST /api/track-order` with `{ order_id, email }`.
   - Server validates input/email, fetches order, parses `item_list`, formats dates, returns normalized payload.

### Contact messages
- Public contact submission: `POST /api/contact` stores records in `contact_messages` as `unread` with server-side validation.
- Admin messages: `/admin/messages` (inbox) and `/admin/messages/archive` (archived). JSON APIs to view one (auto-mark unread→read), update status (unread/read/archived), and delete.

### Page views tracking
- On selected page controllers, `recordPageView()` increments today’s counter in `page_views` (upsert). Aggregate totals and today’s views power home/client stats.

### File uploads and media management
- Multer configurations in `middleware/upload.js`:
   - Profiles: `uploads/profiles/`, filename `artist_<id>_<timestamp>.<ext>`, 5MB, images only.
   - Artworks: `uploads/artworks/`, filename `artwork_<timestamp>.<ext>`, 10MB, images only.
   - Applications: `uploads/applications/`, filename `application_<timestamp>.<ext>`, 5MB, images only.
- Directories are auto-created on server start and by upload module; static serving via `/uploads/*`.
- Controllers validate disk existence of images and fall back to placeholders where appropriate.

### Error handling strategy
- Express-level 404 returns simple HTML; 500 handler traps common file upload errors (`LIMIT_FILE_SIZE`, non-image) and generic server errors.
- Domain errors render `views/error.ejs` (e.g., missing artist/artwork) with user-friendly messages and titles.

### Security and validation
- JWT-based admin auth, cookie `httpOnly` and `secure` in production; protected routes under `/admin/*`.
- Parameterized SQL queries used throughout to prevent injection.
- Input validation for required fields and basic formats (e.g., email regex for applications, tracking, contact).
- Upload file type checks (MIME starts with `image/`) and size limits.
- Suggestions for hardening: rate limiting on public APIs (search/contact/order), CSRF protection for admin mutations, stronger password policy, content security policy (CSP), helmet, audit logs.

### Performance and scalability
- MySQL pool (`connectionLimit: 10`), lean queries with indexes on frequent filters/sorts.
- Pagination on arts list (`LIMIT/OFFSET`), and batched APIs (`loadMoreArts`).
- JSON columns (orders.item_list) parsed on-demand in controllers; consider normalization at scale.
- Image files stored on disk; consider CDN/object storage for production.

### Configuration and environment
- `.env` variables consumed by the app:
   - `PORT`: server port (defaults to 3000).
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: MySQL connection.
   - `JWT_SECRET`, `JWT_EXPIRES_IN`: admin auth token settings.
- Folders created/used: `public/`, `uploads/` (profiles, artworks, applications).

### Data integrity rules and transitions
- Applications: email unique; approval optionally creates artist and copies profile photo; status transitions tracked with reviewer and timestamps.
- Artists: email unique; soft-delete via status; profile picture replacement deletes old file.
- Artworks: status controls public visibility; artist change adjusts `arts_uploaded` counters; soft-delete removes from public and decrements counters.
- Orders: status transitions may update timestamps (seen/delivered); IDs are unique (either client-generated or server-generated depending on endpoint).

