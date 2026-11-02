# Deploying to a VPS

Instructions for whoever puts this site live on a Linux VPS (Ubuntu/Debian assumed).

## What this is

- Next.js 15 app (App Router, TypeScript, Tailwind CSS v4). Runs as a Node server (`next start`).
- Public site at `/`, password-protected admin panel at `/admin`.
- No database. Admin changes are saved as a JSON file and uploaded photos are saved as files,
  both inside one folder (`CONTENT_DIR`). **That folder is the client's data — keep it outside
  the app folder and back it up.**

## Requirements

- Node.js **20 or newer** (built and tested with Node 22) and npm.
- Internet access during `npm run build` (fonts are downloaded from Google Fonts at build time).
- A domain with **HTTPS**. The admin login cookie is marked `Secure` in production, so
  **admin login will not work over plain http**.

## 1. Get the code

Either unzip the project archive or clone the repository, then:

```bash
cd /var/www/mriddul-handicraft
npm ci
```

## 2. Environment variables

Create `.env.production.local` in the project root **before building** (it is git-ignored):

```bash
ADMIN_PASSWORD=choose-a-strong-password
ADMIN_SECRET=paste-a-long-random-string-here
CONTENT_DIR=/var/lib/mriddul-handicraft
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | **Yes** | Password for `/admin`. Without it the admin login is disabled in production. |
| `ADMIN_SECRET` | Recommended | Signs the login cookie. Generate with `openssl rand -hex 32`. If missing, the password is used. Changing it logs everyone out. |
| `CONTENT_DIR` | Recommended | Absolute path where saved content (`site-content.json`) and photos (`uploads/`) are stored. Default is `.content/` inside the app folder — risky, because redeploying or deleting the folder would lose the client's data. |
| `BLOB_READ_WRITE_TOKEN` | **No — do not set on a VPS** | Only for Vercel hosting. If set, storage switches to Vercel Blob. |

Create the content folder and give it to the user that runs the app:

```bash
sudo mkdir -p /var/lib/mriddul-handicraft
sudo chown -R $USER:$USER /var/lib/mriddul-handicraft
```

## 3. Build and run

```bash
npm run build
npm install -g pm2
pm2 start npm --name mriddul-handicraft -- start -- -p 3000
pm2 save
pm2 startup   # follow the printed command so it restarts after a reboot
```

The app now listens on `http://127.0.0.1:3000`.

## 4. Nginx reverse proxy + HTTPS

`/etc/nginx/sites-available/mriddul-handicraft`:

```nginx
server {
    server_name example.com www.example.com;

    # Photo uploads go through the app; the app itself accepts up to 4 MB per image.
    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mriddul-handicraft /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d example.com -d www.example.com
```

Replace `example.com` with the real domain.

## 5. Check it works

1. Open `https://<domain>/`. The home page should load with the moorti shelf.
2. Open `https://<domain>/admin`. It should redirect to the login page. Log in with `ADMIN_PASSWORD`.
3. Change any text, press **Save changes**, and reload the home page. The change should show.
4. Upload a photo in the admin and save. `CONTENT_DIR/uploads/` should now contain the file,
   and the photo should appear on the site.

## Updating the site later

```bash
cd /var/www/mriddul-handicraft
git pull            # or replace the files with a new archive (keep .env.production.local)
npm ci
npm run build
pm2 restart mriddul-handicraft
```

The content in `CONTENT_DIR` is not touched by updates.

## Backups

Back up `CONTENT_DIR` (for example a daily `tar` or `rsync` to another machine). That folder holds
everything edited in the admin panel. Everything else can be rebuilt from the code.

## Notes

- Running only one app instance is assumed (content is a single JSON file). Do not run it in
  pm2 cluster mode with several instances.
- `components/ui/product-rail-gallery.tsx` and `components/product-rail-gallery-demo.tsx` are
  not used by the site; they can be ignored.
