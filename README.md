v4

# XCTL · Twitter Control Terminal

A self-hosted, multi-account X control surface in the style of apps like the one at
`twitter2-jet.vercel.app`: sign in with X (OAuth 2.0 + PKCE), connect **multiple X
accounts**, then compose posts and manage connections from one dashboard.

Stack: Next.js (App Router) · X API v2 · `jose`-signed session cookies.

```
npm run dev        # local dev on http://localhost:3000
npm run build      # production build
npm start          # run production build
```

## 1. Prerequisites

- An **X (Twitter) developer account** — sign up at https://developer.x.com
  (or https://developer.twitter.com). Note: X now uses pay-per-use billing for new
  developers and the old free tier is gone; writing a post costs ~$0.015 per request
  (see https://docs.x.com/x-api/getting-started/pricing). Check your current plan in
  the developer portal.
- **Node.js 18+** (20 recommended).
- Optional: a **Vercel** account to deploy.

## 2. Create the X app (developer portal)

1. developer.x.com → **Projects & Apps** → create a Project and an App.
2. Open your app → **User authentication settings** → **Set up**:
   - App permissions: choose **Read, Write, and Direct Messages** if you want DM /
     media scopes, or **Read and Write** for posts only. (Requesting a scope your app
     permission does not allow makes the whole authorize request fail, so pick and
     keep them consistent with `X_SCOPES`.)
   - Type of app: **Web App** (for this dashboard).
   - **Callback URI / Redirect URI** — must EXACTLY equal:
     - local: `http://localhost:3000/api/auth/callback/twitter`
     - production: `https://<your-domain>/api/auth/callback/twitter`
   - Website URL: your site URL. Save.
3. Under **Keys and tokens**, copy the **OAuth 2.0 Client ID** and **Client Secret**.

## 3. Configure the app

Copy `.env.example` to `.env.local` and fill in:

| Variable | Value |
|---|---|
| `APP_URL` | Your public origin, e.g. `http://localhost:3000` or `https://my-ctl.vercel.app`. Must match the domain of the redirect URI above. |
| `X_CLIENT_ID` | OAuth 2.0 Client ID from the X portal. |
| `X_CLIENT_SECRET` | Client Secret from the X portal. |
| `AUTH_SECRET` | Long random string (≥32 chars). `openssl rand -hex 32` |
| `NEXT_PUBLIC_APP_NAME` | Brand text (optional). |

Optional `X_SCOPES` overrides the default scope list in `lib/xoauth.js`.

## 4. Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000` → you are redirected to `/login` → **Continue with X** →
approve in X → you land on the dashboard signed in. Then open **Settings** and click
**+ Connect another X account** to add more identities.

## 5. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Vercel → **New Project** → import the repo (framework: Next.js auto-detected).
3. Add the same env vars under **Settings → Environment Variables** (use the real
   deployment URL for `APP_URL`, e.g. `https://<project>.vercel.app`).
4. In the X portal, update the app's **Callback URI** to
   `https://<project>.vercel.app/api/auth/callback/twitter`.
5. Deploy.

> ⚠️ **Serverless storage caveat.** The default store (`lib/store.js`) persists to a
> local JSON file under `./data` — fine locally or on a single Node host. On Vercel
> the filesystem is ephemeral and shared across instances, so accounts/tokens would
> be lost. Swap the store's internals for a hosted DB (Vercel Postgres / Neon /
> Turso / Upstash KV) keeping the same function signatures, or run this app on a
> small VPS instead.

## Routes / endpoints

| Path | Purpose |
|---|---|
| `/` | Dashboard (auth required): account list + quick composer |
| `/login` | Landing / sign-in |
| `/settings` | Manage connected accounts, session info, OAuth details |
| `/api/auth/twitter` | Start OAuth2 PKCE flow → redirect to x.com |
| `/api/auth/callback/twitter` | Exchange code, store account, set session |
| `/api/auth/logout` | Clear session |
| `/api/accounts` · `/api/accounts/:id` | List / disconnect accounts (401 without session) |
| `/api/tweets` | POST a tweet as a connected account |

## Security notes

- Session cookie is signed (HS256, `AUTH_SECRET`) and `httpOnly`.
- PKCE `state` + `code_verifier` are set as short-lived `httpOnly` cookies and checked
  on callback (CSRF protection).
- X access/refresh tokens are stored server-side only — never sent to the browser
  (`/api/accounts` returns sanitized entries). For real deployments encrypt the store
  and keep `X_CLIENT_SECRET` / `AUTH_SECRET` out of git.
- Requested scopes are broad by design (that's what a multi-account tool needs).
  Trim `X_SCOPES` to the minimum you actually use.
