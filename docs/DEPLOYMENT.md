# Deployment

## Local
```bash
cp .env.example .env
npm install
npm run dev        # Vite :5173 proxying /api to Express :4000
npm test
npm run build      # type-check + frontend dist + server dist-server
npm start          # Express serves API + built frontend on $PORT
```

## Production (e.g. Render / Fly / any Node host)
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Env: `NODE_ENV=production`, `ENABLE_MOCK_PROVIDER=false` once at least one
  real provider is configured (leaving it on shows the DEMO DATA banner —
  honest, but not a launch state), plus that provider's credentials.
- Database: run `db/migrations/001_init.sql` on PostgreSQL 14+ for the
  shared catalog; wire the ingestion jobs to your approved feeds. The demo
  catalog is in-memory and needs no DB.
- Put a CDN/reverse proxy in front for static assets; the API sets no
  cookies and needs no sticky sessions.
- Health check: `GET /api/health` returns provider configured status.

## Security checklist
- Secrets only in env; rotate on any leak. Input capped (200-char queries,
  32kb bodies), 120 req/min/IP rate limit, SSRF guard on all user URLs
  (`shared/urlSafety.ts`), safe external links, no query strings in logs.
