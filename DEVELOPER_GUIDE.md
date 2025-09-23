# Developer Guide: Chat Localhost Llama3

## Project Structure
- `frontend/` — React app (JSX, Vite, ESLint, Prettier)
- `backend/` — Fastify API (TypeScript, ESLint, Prettier)
- `nginx/` — Reverse proxy config
- `docker-compose.yml` — Full stack orchestration

## Setup
1. Clone repo and install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
2. Start with Docker Compose (recommended):
   ```bash
   docker compose up -d
   ```

## Code Quality
- Lint and format code before committing:
  ```bash
  # Frontend
  npx eslint src/**/*.jsx --fix
  npx prettier --write .
  # Backend
  npx eslint src/**/*.ts --fix
  npx prettier --write .
  ```
- All code must be well-commented and readable.
- Use meaningful variable and method names.

## Versioning
- Version is auto-bumped using `standard-version` on each release commit.
- Use `npm run release` for patch, `npm run release:minor` or `npm run release:major` as needed.

## Contribution
- Fork, branch, and submit PRs.
- Follow code style and documentation standards.
- Add/maintain comments for all logic and variables.

## Testing
- Add tests for new features (see `DOCS.md` for API and test examples).

## Contact
- For questions, open an issue or contact the maintainer.
