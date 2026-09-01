# Tooling and Runtime Conventions

## Dependency version policy

All direct npm dependencies and development dependencies use exact versions.
Do not use caret (`^`), tilde (`~`), wildcard, `latest`, or other floating
ranges in workspace manifests.

Add a root `.npmrc`:

```ini
save-exact=true
```

Use npm with explicit exact saving when adding packages:

```sh
npm install --save-exact <package>
npm install --save-dev --save-exact <package>
```

Additional rules:

- Commit the root `package-lock.json`.
- Use `npm ci` in CI and Docker builds.
- Declare an exact npm version in the root `packageManager` field.
- Pin Node.js 24.20.0 consistently in `.nvmrc` and Docker.
- Pin npm 11.19.0 in the root `packageManager` field.
- Upgrade dependencies intentionally in focused commits with validation results.
- Do not maintain nested lockfiles inside workspaces.

## Oxfmt

Use a root `.oxfmtrc.json` so every workspace and editor uses the same format.

```json
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "arrowParens": "always",
  "bracketSameLine": false,
  "objectWrap": "preserve",
  "bracketSpacing": true,
  "semi": true,
  "singleQuote": false,
  "jsxSingleQuote": false,
  "quoteProps": "as-needed",
  "trailingComma": "all",
  "singleAttributePerLine": false,
  "htmlWhitespaceSensitivity": "css",
  "vueIndentScriptAndStyle": false,
  "proseWrap": "preserve",
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "embeddedLanguageFormatting": "auto",
  "sortPackageJson": false
}
```

`sortPackageJson` stays disabled so workspace manifests retain deliberate
grouping. Oxfmt formats source, configuration, JSON, Markdown, and other
supported repository files through root scripts.

## Oxlint and TypeScript

- Keep one root Oxlint configuration unless a workspace has a demonstrated need
  for an override.
- Run Oxlint from the repository root.
- Use `oxlint --fix` only through the explicit fix script.
- Keep strict TypeScript compiler settings enabled.
- Treat linting and type-checking as separate gates; Oxlint does not replace
  `tsc`.
- Run both gates in CI and before committing through Lefthook.

## Docker base-image policy

Custom application images use stable Debian- or Ubuntu-based images. Avoid
Alpine images for the web build, API build/runtime, and migration target. A
glibc-based distribution reduces native-tooling compatibility surprises and
provides familiar debugging utilities when needed.

Image rules:

- Select an official stable Debian or Ubuntu variant during scaffolding.
- Pin image tags to an explicit runtime/release version; never use `latest`.
- Use Node.js 24.20.0 in web, API, and migration build stages.
- Use slim runtime variants when they provide all required shared libraries.
- Use multi-stage builds so compilers and development dependencies do not enter
  final runtime images.
- Run application processes as a non-root user.
- Install operating-system packages with `--no-install-recommends` and remove
  package-manager caches in the same layer.
- Build from the repository root so every image uses the same workspace manifest
  and lockfile.
- Copy workspace manifests before source files to preserve dependency-layer
  caching.
- Keep `.dockerignore` explicit and exclude `.git`, `node_modules`, build output,
  coverage, test artifacts, local environment files, and editor metadata.

Use a Debian-based stable Nginx image to serve the built frontend and proxy
`/api`. The database service uses the official pinned MySQL image required by
the project; the custom-image base policy does not replace the vendor database
image.

### Required multi-stage builds

The Dockerfiles must use separate build and runtime stages rather than running
the applications from a development image.

Web image:

1. `dependencies`: install the exact workspace lockfile with `npm ci`.
2. `build`: build shared contracts and the Vite web application.
3. `runtime`: copy only static build output and Nginx configuration into a
   pinned Debian-based stable Nginx image.

API image:

1. `dependencies`: install the exact workspace lockfile with `npm ci`.
2. `build`: build shared contracts and the NestJS application.
3. `production-dependencies`: retain only packages required at runtime.
4. `runtime`: copy compiled output and production dependencies into a pinned
   Debian-based Node.js runtime image and run as a non-root user.

Migration image target:

1. Reuse the dependency stage containing the npm-installed Dbmate executable.
2. Copy only the Dbmate runtime requirement and `db/migrations`.
3. Run as a one-shot Compose service before the API runtime starts.

Final web and API runtime stages must not contain source files, test files, Jest,
Playwright, compilers, or general development tooling. The migration target is
the deliberate exception for Dbmate and contains no application development
server.

## Docker version pinning

Docker reproducibility follows the same intent as npm dependency pinning:

- Pin the full selected image tag, including the distribution variant.
- Record deliberate image upgrades in focused commits.
- Consider digest pinning after confirming the target CI and reviewer platforms;
  do not introduce a single-architecture digest that breaks multi-platform use.
- Do not silently change base-image families between development and production
  stages.
