# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

translationCore is an Electron-based desktop app for Bible translation checking. It provides an extensible platform for systematically checking translations against original language sources. The app integrates checking tools (translationWords, translationNotes, wordAlignment) as git submodules in `src/tC_apps/`.

## Setup

```bash
npm i --legacy-peer-deps
npm run load-apps       # Initialize submodule checking tools
npm start               # Runs React dev server + Electron concurrently
```

Node >=16.14.0 <16.15 and npm >=7.18.1 are required (enforced via engine-strict).

## Common Commands

```bash
npm test                # ESLint + Jest with coverage (excludes src/tC_apps/)
npm run ci-test         # CI version with 8GB memory limit, 4 workers
npm run test-one        # Run a single test file
npm run lint            # ESLint check
npm run lint:fix        # ESLint auto-fix
npm run build-macos     # Universal + x64 Mac build
npm run build-linux     # x64 + arm64 Linux build
npm run build-win       # ia32 + x64 Windows build
```

To run a single test, pass the path directly:
```bash
npx jest src/__tests__/path/to/test.test.js
```

After a Mac build, create the DMG:
```bash
./node_modules/.bin/gulp release-macos-universal --out=artifacts/universal/tCore-macos-universal.dmg
```

## Architecture

**Process model:** Standard Electron two-process architecture.
- `electronite/index.js` — Main process: window management, download manager, DCS (Door43 Content Service / git.door43.org) integration, ipcMain handlers.
- `src/index.js` — Renderer process React entry point.

**Frontend:** React + Redux. State is organized in `src/js/`:
- `actions/` — Redux action creators (thunks, async operations)
- `reducers/` — Redux reducers
- `selectors/` — Reselect selectors
- `components/` — Presentational React components
- `containers/` — Connected container components
- `helpers/` — Pure utility functions
- `middleware/` — Redux middleware

**Checking tools** (`src/tC_apps/`) are independent git submodules:
- `translationWords` — Word-level checking against translation word lists
- `translationNotes` — Verse-level notes checking
- `wordAlignment` — Source/target language word alignment tool

Tools communicate with the host app via a defined API documented in `API.md`.

**Build pipeline:**
1. `craco.config.js` overrides Create React App webpack to copy `tcResources`, `src/tC_apps`, `src/locale`, and other assets into the static build.
2. `electronite/webpack.config.js` bundles the main process separately (target: electron-main).
3. `electronite-packager` packages the combined output per platform.

**Resources:** `tcResources/` holds Bible resources (en, el-x-koine, hbo, hi). `npm run minimal-resources` loads just en + original languages; `npm run update-resources` refreshes all.

**Localization:** `src/locale/` contains 29 language JSON files. Use `npm run find:missing-locale` / `npm run find:extra-locale` to audit translation keys. Crowdin is used for community translations.

## Code Conventions

- 2-space indent, single quotes, LF line endings (enforced by `.editorconfig` and ESLint)
- Import order enforced: builtin → external → internal (eslint-plugin-import)
- No nested ternaries; prefer async/await over Promise chains
- JSDoc return types are warned on (not yet fully enforced)
- `.usfm` and `.txt` files preserve trailing whitespace

## Branch & PR Workflow

Branch naming: `feature-GITHUB_USERNAME-ISSUE_NUMBER` or `feature-GITHUB_USERNAME-SHORT_DESCRIPTION` off `develop`.

PRs target `develop`. Before submitting: merge `develop` locally, test thoroughly.

CI runs on push to `master`, `develop`, `release-*`, `sandbox-*` branches and on all PRs.