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

**AI API bridge (suggestions support):** The renderer reaches OpenAI-compatible AI servers (e.g. LM Studio) through the main process over IPC (exposed to app through `window.AiAPIs`).
- `electronite/queryAiApisFromMainProcess.js` — HTTP(S) calls: `getAiApiFromMainProcess`, `getAvailableAiApiModelsFromMainProcess`, `queryAiApiFromMainProcess` (streams chat via `streamChatMessageFromMainProcess` to the OpenAI-compatible `v1/chat/completions` endpoint). Each request is stateless. A repeated system prompt is reused through the server's prompt-prefix caching (automatic in LM Studio/llama.cpp, and in OpenAI for prompts of 1024+ tokens), so keep `systemPrompt` identical across calls and put per-check content in the user query. Models come from `v1/models?limit=500`. Adds an optional bearer `apiToken` and redacts it with `redactOptions` before logging.
- `electronite/index.js` → `exposeAiApiQueryToMainWindow()` registers the `ai-apis:query`, `ai-apis:get-available-models` and `ai-apis:get-api` IPC handlers. They reject calls from any window other than the main window.
- `electronite/preloadAiApi.js` — preload for the main window. It exposes `window.AiAPIs` (`getApi`, `getAvailableModels`, `query`) and the legacy alias `window.lmStudio`.
- `src/js/pages/app.js` - on app startup has fallback check to make sure `window.AiAPIs` is initialized.  This may just be paranoia since it should already be set in `electronite/preloadAiApi.js`.
- The caller is `checking-tool-wrapper` (`lib/utils/autoCheckingUtils.js` in the installed build), not code in this repo.

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

**Resources:** `tcResources/` holds Bible resources per language (en, el-x-koine, hbo, hi, and other gateway languages). `npm run minimal-resources` loads just en + original languages; `npm run update-resources` refreshes all.

**Localization:** `src/locale/` contains 25 language JSON files. Use `npm run find:missing-locale` / `npm run find:extra-locale` to audit translation keys. Crowdin is used for community translations.

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

## Dependency Modules from unfoldingWord

These are regular `dependencies` in `package.json`. When behavior depends on one of them, read the installed code in `node_modules/<pkg>`, which matches the installed version. Don't assume the GitHub default branch matches. These modules are under our control and may need changes to implement features or fix bugs.

During feature work, `checking-tool-wrapper` and `tc-ui-toolkit` are often pinned to local `.tgz` builds (e.g. `/Users/.../checking-tool-wrapper-7.4.12-beta.N.tgz`). Recent commits bump both together. Reinstall with `npm i --legacy-peer-deps` after changing them.

| Package | Version | Imported in (outside `src/tC_apps/`) |
|---|---|---|
| [checking-tool-wrapper](https://github.com/unfoldingWord/checking-tool-wrapper) | local tgz (7.4.12-beta) | `actions/CSVExportActions.js`, `helpers/FeedbackHelpers.js`, `helpers/csvHelpers.js`; also used by the tW/tN tools |
| [tc-ui-toolkit](https://github.com/unfoldingWord/tc-ui-toolkit) | local tgz (6.2.11-beta) | `helpers/gatewayLanguageHelpers.js`, `helpers/WordAlignmentHelpers.js` |
| [tc-source-content-updater](https://github.com/unfoldingWord/tc-source-content-updater) | 1.4.34 | `actions/ResourcesActions.js`, `actions/SourceContentUpdatesActions.js`, `actions/ToolActions.js`, project-loading actions, tool cards |
| [usfm-js](https://github.com/unfoldingWord/usfm-js) | 3.5.0 | `helpers/usfmHelpers.js`, `actions/USFMExportActions.js`, import/merge/migration helpers |
| [word-aligner](https://github.com/unfoldingWord/word-aligner) | 1.1.1 | `helpers/WordAlignmentHelpers.js`, `helpers/ProjectValidation/MergeConflictHelpers.js`, `helpers/FileConversionHelpers/UsfmFileConversionHelpers.js` |
| [tc-electron-env](https://github.com/unfoldingWord/tc-electron-env) | 0.10.0 | `common/constants.js`, `pages/app.js`, several actions |
| [tsv-groupdata-parser](https://github.com/unfoldingWord/tsv-groupdata-parser) | 1.1.0 | `helpers/toolCardBoxesHelpers.js`, `helpers/migrateOriginalLanguageHelpers.js` |
| [string-punctuation-tokenizer](https://github.com/unfoldingWord/string-punctuation-tokenizer) | ^2.2.0 | `helpers/migrateOriginalLanguageHelpers.js` |
| [bible-reference-range](https://github.com/unfoldingWord/bible-reference-range) | 1.0.1 | `helpers/migrateOriginalLanguageHelpers.js` |
| [tc-tool](https://github.com/translationCoreApps/tc-tool) | 4.1.0 | Not imported directly in `src/js`; used by the checking tools in `src/tC_apps/` |
| [tc-strings](https://github.com/unfoldingWord/tc-strings) | 0.1.7 | Not imported directly in `src/js` |
| [wordmap](https://github.com/unfoldingWord/wordmap) / [wordmap-lexer](https://github.com/unfoldingWord/wordmap-lexer) | 0.8.2 / 0.3.6 | Not imported directly in `src/js`; used by `wordAlignment` |
