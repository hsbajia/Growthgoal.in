# Mriddul Handicraft — website

Next.js + Tailwind + shadcn. Home page: `app/page.tsx`. Admin panel: `/admin`.

## Run locally

```bash
npm install
npm run dev
```

Site: http://localhost:3000 · Admin: http://localhost:3000/admin (local password: `admin123`).

## Admin panel

From `/admin` you can change hero moortis (photos, names, sizes, prices, order), collection cards,
contact details (WhatsApp, phone, address…) and section photos. Press **Save changes** to publish.

Photos: background-removed PNGs work best — they are auto-trimmed and placed on the shelf.
Normal photos also work (they show as full photos in the collection cards).

### Settings needed when you put the site online

| Setting | What it does |
| --- | --- |
| `ADMIN_PASSWORD` | Password for `/admin`. **Required** — without it the admin login is off. |
| `ADMIN_SECRET` | Optional. Any long random text; signs the login cookie. |
| `BLOB_READ_WRITE_TOKEN` | Needed on **Vercel**: create a Blob store (Project → Storage → Blob → Connect). Vercel adds this automatically. |
| `CONTENT_DIR` | Optional, normal servers only: folder where changes and uploaded photos are kept (default `.content/`). |

On a normal Node server (VPS), changes are saved in `.content/` — back up that folder.
