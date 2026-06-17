# Alendent

Dental supply storefront (React via in-browser Babel) with a self-hosted database backend.

## Running the site

You now run a small local server (it serves the site **and** stores products/brands in a real database):

```bash
node server.js
```

Then open **http://localhost:3000**

> Don't open `Alendent Website.html` directly anymore — image upload and the
> database only work when the page is served by `server.js`.

## Admin panel

Go to **http://localhost:3000/#admin**

- **Products tab** — add / edit / delete products, upload a product image, toggle
  Featured / New / Sale, set stock. Everything saves to the database.
- **Brands tab** — add / edit / delete brands, upload a brand logo.

## How storage works

| Thing | Where it lives |
|-------|----------------|
| Products & brands | `alendent.db` (SQLite file, created on first run) |
| Uploaded images | `uploads/` folder, served at `/uploads/...` |
| Cart & favorites | the visitor's browser (localStorage) — per device |
| Translations, categories | `data.js` (static config) |

The database (`alendent.db`) is seeded once from `data.js` on first launch.
Delete `alendent.db` to reseed from scratch.

## API (used by the admin panel)

```
GET    /api/products
POST   /api/products          { ...product }
DELETE /api/products/:id
GET    /api/brands
POST   /api/brands            { name, country, logo }
DELETE /api/brands/:name
POST   /api/upload            { dataUrl }  -> { url }
```

## Requirements

Node.js 22+ (uses the built-in `node:sqlite` module — no `npm install` needed).
