# Contributing

Thank you for your interest in contributing to livedemo-web-app!

## Prerequisites

- Node.js 18+
- npm 9+
- A running instance of [livedemo-backend](../livedemo-backend) on port `3005`

## Getting started

1. **Fork** this repository and clone your fork.
2. Create a **feature branch** from `main`:
   ```bash
   git checkout -b feat/your-change
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create your personal environment file from the template:
   ```bash
   cp local.env dev.env
   ```
   Fill in your secrets in `dev.env` (it is gitignored and will never be committed).
5. Start the dev server:
   ```bash
   npm run start-vite
   ```
6. Make your changes, then **open a Pull Request** against `main`.

## Branch naming

| Prefix | Use for |
|---|---|
| `feat/` | New features or improvements |
| `fix/` | Bug fixes |
| `docs/` | Documentation-only changes |
| `refactor/` | Code restructuring without behavior change |
| `chore/` | Maintenance (dependency bumps, config tweaks) |

## Commit style

Use short, imperative-mood commit messages:

```
fix: correct story preview loading state
feat: add keyboard shortcut for step navigation
docs: update env variable table in README
refactor: extract shared modal component
```

## Code conventions

- React functional components with hooks — no class components
- One component per file; filename matches the component name
- Styles via Styled Components (preferred) or SASS modules
- Redux for global state; local state via `useState`/`useReducer` where appropriate
- Use semicolons and single quotes
- 2-space indentation (enforced via `.editorconfig`)

## Adding a new page

1. Create the page component under `src/pages/`
2. Register the route in the appropriate router config
3. Add any required Redux actions in `src/actions/` and reducers in `src/reducers/`
4. Add new environment variables to `local.env` (with placeholder values) and document them in `README.md`

## Running tests

```bash
npm test
```

## Linting

```bash
npm run lint
```

ESLint runs automatically on `npm run start-vite`. Fix all lint errors before opening a PR.

## Pull request checklist

Before submitting, please ensure:

- [ ] Your branch is up to date with `main`
- [ ] `npm run start-vite` starts the app without errors
- [ ] `npm test` passes
- [ ] `npm run lint` reports no errors
- [ ] No secrets or credentials committed (check `dev.env` is not staged)
- [ ] New environment variables are added to `local.env` as placeholders and documented in `README.md`

## Reporting issues

Open a [GitHub Issue](../../issues) using the appropriate template. Please include:

- Node.js version (`node --version`)
- Browser and version
- Steps to reproduce
- Screenshots or console errors if applicable

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.
