# livedemo-web-app

React frontend for the livedemo platform - the web-app demo editor at [app.livedemo.ai](https://app.livedemo.ai).

![livedemo](https://github.com/exploitx3/livedemo-deploy/blob/main/screenshots/2.png?raw=true)

## Stack

- **Framework** - React 18 + Redux
- **Bundler** - Vite (dev & prod), Webpack (inject script bundle)
- **Styling** - Styled Components, SASS
- **Routing** - React Router
- **Payments** - Stripe
- **Auth** - Google OAuth2, reCAPTCHA

---

## Prerequisites

- Node.js 18+
- npm 9+

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

`local.env` is the committed template with placeholder values. Create your personal `dev.env` from it and fill in your own secrets:

```bash
cp local.env dev.env
```

> `dev.env` is listed in `.gitignore` - your secrets will never be committed.

Key variables to update in `dev.env`:

| Variable | Description |
|---|---|
| `API_URL` | Backend API base URL (default: `http://localhost:3005`) |
| `SERVER_URL` | Frontend server URL |
| `STRIPE_PUBLISHABLE` | Stripe publishable key (use `pk_test_` for dev) |
| `CAPTCHA_SITE_KEY` | reCAPTCHA site key (optional) |
| `GOOGLE_FONT_API_KEY` | Google Fonts API key (optional) |
| `LIVEDEMO_CDN_URL` | CDN base URL for assets |

### 3. Start the dev server

```bash
npm run start-vite
```

The app will be available at [http://localhost:5000](http://localhost:5000).

> This command sources `local.env`, runs `configEnv.js` to generate `src/config.json`, then starts the Vite dev server on port `5000`.

---

## Available scripts

| Script | Description |
|---|---|
| `npm run start-vite` | Start Vite dev server (sources `local.env`) |
| `npm run build-vite` | Production build via Vite |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run bundle` | Build the inject script bundle (Webpack) |
| `npm run bundle-inject` | Dev server for inject script (Webpack) |

---

## Project structure

```
src/
  index.js           # App entry point
  index.html         # HTML template
  actions/           # Redux action creators
  components/        # Shared React components
  pages/             # Page-level components
  reducers/          # Redux reducers
  store/             # Redux store setup
  styles/            # Global SASS styles
  constants/         # App-wide constants
  utils/             # Shared utility functions
  injectScript/      # Embeddable inject script bundle
configEnv.js         # Generates src/config.json from env vars
vite.config.js       # Vite configuration
```

---

## Building for production

```bash
npm run build-vite
```

Output is placed in `dist/`. Deploy `dist/` to S3 or any static host.

---

## License

MIT License (see [`LICENSE`](LICENSE)).
