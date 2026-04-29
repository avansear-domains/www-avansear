my website shoo

## Feed Uploads via Cloudflare Worker + R2

This repo uses a worker-based upload flow for `/feed-app/upload`.

- Next.js route `app/api/feed/upload/route.ts` sends files to `CLOUDFLARE_WORKER_URL`
- Worker code lives in `worker/src/index.ts`
- Worker stores files in an R2 bucket bound as `BUCKET`

### 1) Configure R2 bucket binding

Update `worker/wrangler.toml`:

- replace `bucket_name = "REPLACE_WITH_YOUR_BUCKET_NAME"` with your bucket name

### 2) Authenticate wrangler

```bash
bunx wrangler login
```

### 3) Deploy worker

```bash
bun run worker:deploy
```

Copy the deployed Worker URL (for example `https://avansear-feed-worker.<subdomain>.workers.dev`).

### 4) Add env var in app

In `.env.local`:

```bash
CLOUDFLARE_WORKER_URL="https://your-worker-url.workers.dev"
```

Then restart Next dev server.

### 5) Use upload page

- `/feed-app/upload`
- log in with `CUSTOM_PASS`
- choose file -> `upload file`
- returned URL is auto-filled into `media URL`
- submit item to add it to `/feed-app`
