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

## Snapshot QA (Dual-Agent Enforcement)
- Single source of truth only: do not duplicate defaults/config/constants; update the canonical module.
- Remove duplication: files, lines, imports, types, and helpers must not be repeated.
- TypeScript: zero TS errors; use `npm run build:check`; keep `@/` paths consistent.
- Python: stay compatible with `backend/requirements.txt`; avoid breaking ABI/runtime.
- Security/CI: no secrets; ESLint (security config) clean; GitLab CI green; respect Sonar rules.
- Attribution: do not add AI co-author footers or vendor tags to code, commits, or PRs.
- Docs hygiene: avoid new redundant docs; update `.claude/*`, `PLANNING.md`, or `TASK.md` instead.

## Ops Shortcuts
- Stop local dev quickly: `stop-dev.bat` (kills ports 5173 and 8000).
- Compose workflow: `build-and-deploy.bat` or `Makefile` targets (`make up-dev`, `make logs-backend`).
- Fast AWS deploy: `aws-deploy-quick.ps1` (ECR push + App Runner; writes `aws-deployment-info.txt`).

## Coordination With Claude
- Treat `.claude/CLAUDE.md` and `.claude/INDEX.md` as authoritative. For snapshots and enforcement, see `.claude/commands/codex-snapshot.md` and `codex-enforce.md`.