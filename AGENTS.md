# Repository Guidelines

## Project Structure & Module Organization
- Frontend (React + Vite): `src/` (app), `public/` (static). Build in `dist/`.
- Backend (FastAPI): `backend/` (APIs, services, schemas, tests).
- E2E: `features/` (Cucumber features and step defs).
- Infra/config: `docker-compose*.yml`, `Makefile`, `serverless.yml`, `vite.config.ts`.
- Test/config: `jest.config.js`, `cucumber.cjs`; coverage in `coverage/`.

## Build, Test, and Development Commands
- Frontend dev: `npm run dev` (Vite). Preview build: `npm run preview`.
- Backend dev: `npm run dev:backend` (Uvicorn on 8000).
- Both: `npm run dev:all` (concurrently).
- Build frontend: `npm run build`. Backend deps/tests: `npm run backend:install`, `npm run backend:test`.
- Frontend tests: `npm test`, `npm run test:watch`, `npm run test:coverage`, `npm run test:ci`.
- E2E: `npm run test:e2e`; full suite incl. backend: `npm run test:full`.
- Docker workflow (optional): `make build`, `make up-dev`, `make test-backend`.

## Coding Style & Naming Conventions
- TypeScript/React: 2‑space indent, function components + hooks.
- Linting: `eslint-security.config.js` for security/quality.
  Example: `npx eslint . -c eslint-security.config.js`.
- Python: 4‑space indent; format with Black; lint with Pylint; types via Mypy.
  Example: `black backend && pylint backend && mypy backend`.
- Naming: `camelCase` (vars/functions), `PascalCase` (React components), `snake_case` (Python).

## Testing Guidelines
- Frontend unit tests under `src/` per `jest.config.js` (`*.test.tsx` or `__tests__`).
- E2E in `features/`; write independent, user‑visible flows.
- Backend tests with PyTest in `backend/` (`test_*.py`).
- Aim for meaningful coverage; verify with `npm run test:coverage` and `pytest --cov`.

## Commit & Pull Request Guidelines
- Use Conventional Commits (e.g., `feat:`, `fix:`, `refactor:`) as seen in `git-history.txt`.
- Keep commits small and scoped; include a clear summary and rationale.
- PRs must include: concise description, linked issues, tests/coverage updates, passing CI, and screenshots/GIFs for UI changes.

## Security & Configuration Tips
- Never commit secrets; use `.env.example` (root and `backend/`) as templates.
- Validate inputs on both sides; prefer TypeScript types and Pydantic models.
- Run linters and tests locally before pushing to ensure CI passes.
