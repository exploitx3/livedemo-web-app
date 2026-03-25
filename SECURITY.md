# Security Policy

## Supported Versions

Only the latest version on the `main` branch is actively maintained and receives security updates.

| Branch | Supported |
|---|---|
| `main` | ✅ Yes |
| older branches | ❌ No |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub Issues.**

If you discover a security vulnerability, please report it responsibly:

1. **Email** the maintainers directly (see commit history or `package.json` for contact).
2. Include as much detail as possible:
   - A clear description of the vulnerability and its potential impact
   - Steps to reproduce or a proof-of-concept
   - Any suggested mitigations
3. You will receive an acknowledgement within **48 hours** and a resolution timeline within **7 days**.

## Scope

Security concerns particularly relevant to this project:

- Cross-site scripting (XSS) in rendered demo or story content
- Authentication or session handling issues
- Insecure handling of Stripe publishable keys or OAuth tokens
- Sensitive data exposed in the client-side bundle
- Exposed credentials in committed files (e.g. `local.env`, `src/config.json`)
- Dependency vulnerabilities with known CVEs

## Out of scope

- Vulnerabilities in upstream services (Stripe, Google OAuth, reCAPTCHA) - report those to the respective vendors.
- Issues that require physical access to the user's machine.

## Security best practices for contributors

- Never commit real secrets to `local.env` or any tracked file - use `dev.env` (gitignored) for personal keys.
- Use `pk_test_` Stripe publishable keys in development.
- Keep dependencies up to date: `npm audit` and `npm update`.
- Avoid using `dangerouslySetInnerHTML` unless the content is explicitly sanitized.
- Review any new component that renders user-supplied content for XSS risks before submitting a PR.
