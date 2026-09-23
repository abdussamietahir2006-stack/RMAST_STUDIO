# RMAST Studio

Marketing website and founder dashboard for RMAST Studio: digital systems for real estate and
cinematic AI content for brands. One project, deployed to Vercel.

- **Website:** React 19 + Vite + Tailwind v4
- **API:** one Express app (`src/server/app.ts`), served on Vercel as a single function (`api/index.ts`)
- **Data:** MongoDB Atlas (leads, dashboard accounts, sessions, media settings)
- **Media:** Vercel Blob (team photos and videos, uploaded straight from the browser)
- **Email:** Gmail SMTP notification for every inquiry
- **Assistant:** Gemini

## Dashboard (`/admin`)

- **Overview:** total leads, leads awaiting reply, last 7 days, top service, a leads-by-service
  scoreboard and a 30-day chart
- **Leads:** folders by division (Real Estate, AI Content, General) and by service or industry,
  with search, status and quick replies
- **Website media:** drag-and-drop replacement for the team photos, the AI Content service videos
  and the home page intro video
- **Settings:** change password, sign out everywhere

Security: scrypt-hashed passwords, random session tokens in `HttpOnly; Secure; SameSite=Strict`
cookies (12-hour expiry, stored hashed, revocable), lockout after 5 failed sign-ins per account,
same-origin checks on every state-changing request, and strict security headers (CSP, HSTS,
frame blocking).

## Run locally

**Prerequisites:** Node.js 20.11+

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in (at minimum `MONGODB_URI` for the dashboard)
3. Create your dashboard account: `npm run admin:create` (run it again to reset a password)
4. `npm run dev` and open http://localhost:3000 (dashboard at http://localhost:3000/admin)

## Deploy to Vercel

1. Import the repository in Vercel. `vercel.json` already configures the build, the API function,
   routing and security headers.
2. **Storage → Create → Blob** and connect it to the project (this adds `BLOB_READ_WRITE_TOKEN`).
3. Add environment variables: `MONGODB_URI`, `GEMINI_API_KEY`, `SMTP_USER`, `SMTP_PASS`.
4. In MongoDB Atlas → Network Access, allow connections from Vercel (`0.0.0.0/0`; Vercel
   functions have no fixed IP). Access stays protected by the database user's password.
5. Deploy, then create your account by running `npm run admin:create` locally against the same
   `MONGODB_URI`.

## Where things live

| Path | Purpose |
| --- | --- |
| `src/admin/` | Dashboard UI (loaded only on `/admin`) |
| `src/server/` | API: auth, leads, media, email, assistant |
| `src/config/contact.ts` | Email, WhatsApp, Instagram and LinkedIn used across the site |
| `src/config/mediaSlots.ts` | Which photos/videos the dashboard can replace |
| `src/data/` | Services, pricing, projects, process and team content |
| `api/index.ts` | Vercel function entry |
| `server.ts` | Local dev/production server |
| `scripts/create-admin.ts` | Create or reset a dashboard account |
