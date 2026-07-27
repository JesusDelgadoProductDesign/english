# english

Two independent projects live in this repository:

| Path | What it is | Deploys via |
|---|---|---|
| [`worker/`](worker) | Minimal Cloudflare Worker starter | Cloudflare Workers |
| [`irregular-verbs-app/`](irregular-verbs-app) | Verbly — English irregular verbs trainer (React + Vite + Supabase) | Cloudflare Pages |

Each has its own `package.json`/config and should be worked on independently —
`cd` into the one you need.

## worker/

```bash
cd worker
npx wrangler dev      # local dev
npx wrangler deploy   # deploy directly (or connect this repo via the Cloudflare dashboard)
```

## irregular-verbs-app/

```bash
cd irregular-verbs-app
npm install
cp .env.example .env.local   # fill in your Supabase project's URL + anon key
npm run dev
```

See [irregular-verbs-app/README.md](irregular-verbs-app/README.md) for the full architecture, setup, and roadmap.

Deploy via Cloudflare Pages: connect this repo, set the project's **root directory** to `irregular-verbs-app`, build command `npm run build`, output directory `dist`, and add the `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` environment variables.
