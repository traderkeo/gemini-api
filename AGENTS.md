# Repository Guidelines

## Project Structure & Module Organization
- `src/` follows a layered DDD layout: `config/` for env + logger helpers, `application/` for use cases, `domain/` for core types, `infrastructure/` for Gemini/Redis adapters, `presentation/` for controllers/middlewares/routes, plus `app.ts`/`server.ts` to wire express. Keep new modules within these folders and mirror the `v1`/`test` route tree so imports stay predictable.
- `dist/` contains the transpiled output from `tsc`; never edit it directly. Run `npm run build` to regenerate before publishing.
- `examples/` holds TypeScript snippets (`generation-endpoints.examples.ts`) that illustrate how to call the public routes; keep them in sync when new endpoints land.
- `logs/` stores runtime logs; ensure any new log sinks append here or push to configured transports, and rotate or archive manually if needed.
- Support files: `TESTING.md` documents the browser-based sanity checks, `docker-compose.yml` boots a Redis service, and `.env` seeds the local env (never commit real secrets).

## Build, Test, and Development Commands
- `npm run build`: compiles `src/**` via `tsc` into `dist/` for production-ready `node dist/server.js`.
- `npm run dev`: starts `nodemon src/server.ts` for iterative development; monitors TypeScript and restarts on change.
- `npm start`: launches the compiled server; run only after `npm run build` or from CI.
- `npm run lint`: executes `eslint . --ext .ts`; fix violations before pushing.
- `docker compose up redis`: stands up the Redis cache defined in `docker-compose.yml` (map 6379) for rate limiting and caching adapters.
- `npm test`: currently a placeholder that exits with an error; mention in PRs that automated tests are not yet implemented when relying on manual verification.

## Coding Style & Naming Conventions
- TypeScript files use four-space indentation, consistent semicolons, and `camelCase` for functions/vars plus `PascalCase` for classes and controller names (e.g., `ModelsController`). Keep import statements grouped by category and alphabetical order when practical.
- Apply ESLint with the existing `npm run lint` script before merging changes to ensure whitespace, unused imports, and other standard rules remain green.
- When adding new routes, suffix routers with `.routes.ts` and services with `.service.ts` so the structure under `presentation/routes` and `application/services` stays predictable.

## Testing Guidelines
- Manual verification lives in `TESTING.md`. Use the browser endpoints (`/test/model` and `/test/prediction`) while the server runs via `npm run dev`; refreshing the page exercises random model selection.
- Document any additional validation steps performed and the HTTP responses observed in PR descriptions; there are no automated suites yet, so descriptive notes help reviewers trust the change.
- Keep `TESTING.md` up-to-date whenever new test helpers or endpoints land.

## Commit & Pull Request Guidelines
- Current history only shows simple commits such as `first push`, so adopt more descriptive messages moving forward (`feat(models): add streaming endpoint`, `fix(rate-limit): guard null response`). Prefer `type(scope): summary` with lowercase types (`feat`, `fix`, `chore`) to make future releases easier to parse.
- For PRs, provide a concise summary, list the manual tests you exercised (`npm run dev` + endpoint hit, lint results, `docker compose` status), note whether new environment variables are required, and mention related issues if any. Screenshots are optional since the project is API-only.

## Security & Configuration Tips
- `.env` contains sensitive keys (`GEMINI_API_KEY`); keep it local and never commit real values—use `.env.local` or CI secrets instead. Document any new env vars in this file along with acceptable defaults.
- Redis (configured via `docker-compose.yml`) backs rate limiting and caching. Point the `REDIS_URL` or adapter switch to `RedisCacheAdapter` only after verifying the service is reachable (default `redis://localhost:6379`).
- Ensure `NODE_ENV` is set appropriately when running `npm start` so production middleware paths (compression, helmet) behave as expected.

## Gem Library Expansion
- Add new Gemini API endpoint groups as distinct feature sets rather than lumping them under existing routes. Create separate controllers/services/routes within the layered folders (`presentation/routes/v1`, `application/services`, etc.) so that each capability (e.g., chat, multimodal) has its own feature namespace and shared middleware.
- Document the new group in `AGENTS.md` and `GENERATION_ENDPOINTS.md` so the intent is clear; keep entry points under `src/presentation/routes/v1/<feature>.routes.ts` so dependency injection remains composable.
- When wiring a new feature, instantiate its service/controller in `app.ts` alongside existing ones; avoid overloading `PredictionsController` with unrelated endpoints to keep each service focused and promote safer future expansion.
- The newly introduced `textGeneration` feature groups streaming and token-counting paths (`/v1/textGeneration/streamGenerateContent/:model` and `/v1/textGeneration/countTokens/:model`), so keep its controller/service pair separate from `PredictionsController`.
