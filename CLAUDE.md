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
- `electronite/queryAiApisFromMainProcess.js` — HTTP(S) calls: `getAiApiFromMainProcess`, `getAvailableAiApiModelsFromMainProcess`, `queryAiApiFromMainProcess` (streams chat via `streamChatMessageFromMainProcess` to the OpenAI-compatible `v1/chat/completions` endpoint). Each request is stateless. A repeated system prompt is reused through the server's prompt-prefix caching (automatic in LM Studio/llama.cpp, and in OpenAI for prompts of 1024+ tokens), so keep `systemPrompt` identical across calls and put per-check content in the user query. Models come from `v1/models?limit=500`. Each model gets a `size` in bytes from LM Studio's native `api/v1/models` (`size_bytes`, matched by `key` = id), if the server has that API. Otherwise there's no `size`. Adds an optional bearer `apiToken` and redacts it with `redactOptions` before logging.
- `electronite/index.js` → `exposeAiApiQueryToMainWindow()` registers the `ai-apis:query`, `ai-apis:get-available-models`, `ai-apis:get-api` and `ai-apis:local-server-start|stop|status|models` IPC handlers. They reject calls from any window other than the main window. When the options for `query` or `get-available-models` include `localServer: true`, the call is routed to the bundled llama-server (below).
- `electronite/preloadAiApi.js` — preload for the main window. It must be listed in `craco.config.js`'s copy patterns, or a packaged build can't load it ("Unable to load preload script"). Preloads aren't bundled, and the packaged app has no `node_modules`, so a preload must `require('electron')`, not `'electronite'`, and only built-in modules. In development the main process runs from `electronite/`, so both mistakes only show up in a build. It exposes `window.AiAPIs` (`getApi`, `getAvailableModels`, `query`, `localServer.{start, stop, getStatus, getModels}`, and `features` = `{ messages, localServer }`) and the legacy alias `window.lmStudio`. Callers check `features` to tell this bridge from older ones.
- `src/js/pages/app.js` — at startup, it creates `window.AiAPIs` and `window.lmStudio` if the preload didn't. Keep it the same as the preload, including the frozen `localServer` and `features`. If the "creating window.AiAPIs…" log appears, the preload didn't load.
- `electronite/llamaServerManager.js` — `LlamaServerManager` runs the bundled llama-server in **router mode** over `~/translationCore/models` (`--models-dir`, `--models-max 1`). `/v1/models` lists every model there, and the model named in a request is loaded on demand.
  - Model ids are the `.gguf` file name without the extension. A subfolder of `.gguf` files (for multimodal or split models) is one model named after the folder. `mmproj*` files and later shards aren't listed.
  - The server starts on demand. `query(text, { localServer: true, model })` fills in `baseUrl` and `apiToken` (`getClientOptions()`). With no `model` (or `'local-model'`) it uses the loaded model, otherwise the first one. An unknown model name throws an error listing the available ids.
  - `getAvailableModels({ localServer: true })` returns the server's `/v1/models` (with load `status`), or the scanned folder in the same shape while the server is stopped. Either way, each model has `size` in bytes from the folder; a split model's size is all of its parts.
  - It listens on `127.0.0.1` on a free port picked at each start. If another program takes the port first, it retries with a new port, up to 3 times. It's ready only when `/health` and an authenticated `/v1/models` both succeed.
  - A random API key is generated per start and passed in the `LLAMA_API_KEY` env var, so it isn't on the command line. The router passes it on to its per-model processes (verified).
  - The binary folder is chosen by platform/arch (`getTargetCandidates`). Apple Silicon uses `darwin-arm64` even under Rosetta. There is no build for Windows ia32 (`getStatus().available` is false). It loads from `process.resourcesPath/llama-server` when packaged and `vendor/llama-server` in development.
  - Stopping: `stopSync()` runs on `will-quit` and `process.on('exit')`. It kills the process group on Mac/Linux, or the process tree with `taskkill /t /f` on Windows, so the router's per-model processes go too. `<userData>/llama-server.pid` records the running server, and `cleanupOrphan()` on `ready` kills one left behind by a crash, but only if that pid is still a `llama-server`.
  - Tests: `src/__tests__/llamaServerManager.test.js` uses a fake spawn (an HTTP server standing in for llama-server), so no real binary runs.
- `electronite/modelUpdater.js` — "Check for model updates" in the Actions menu (`AppMenu`). It compares the `.gguf` files in `~/translationCore/models` with the `.gguf` assets of a GitHub release (`MODELS_RELEASE`: `unfoldingWord/checking-tool-wrapper` `v0.9.0-beta`; bump the tag to publish new models). `EXTRA_MODELS` lists other models to offer, hard-coded with size, SHA-256 and a commit-pinned URL. For now that's `Qwen3-4B-Instruct-2507-Q4_K_M.gguf`, LM Studio's `qwen/qwen3-4b-2507`, from Hugging Face. A release model with the same name wins.
  - A model needs updating when it's missing or its SHA-256 differs from the asset's `digest` (size only, if there's no digest). Local hashes are cached in `<models>/.model-digests.json` by size and mtime.
  - Downloads go to `<name>.download`, are checked against the size and digest, and then renamed into place. llama-server is stopped before an existing model is replaced. It's also stopped after any download, because the router only scans `--models-dir` at startup (verified). Otherwise its `/v1/models` wouldn't list the new models. The next query starts it again.
  - IPC: `ai-apis:models-check-updates`, `ai-apis:models-download` (progress on `ai-apis:models-download-progress`) and `ai-apis:models-cancel-download`. These are exposed as `AiAPIs.models.{checkForUpdates, download(updates, onProgress), cancelDownload}` with `features.modelUpdates`.
  - UI: `actions/ModelUpdatesActions.js`, `containers/ModelUpdatesDialogContainer.js` and `components/dialogComponents/ModelUpdateDialog.js`.
  - Tests: `src/__tests__/modelUpdater.test.js` uses a local HTTP server in place of GitHub.
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
1. `craco.config.js` overrides the Create React App webpack config. It copies `tcResources`, `src/tC_apps`, `src/locale`, the preload scripts (`preloadSplash.js`, `preloadAiApi.js`) and other assets into `build/`. A new preload or other file that the main process loads at runtime must be added there. Run with Node 16: Node 20 fails with `ERR_OSSL_EVP_UNSUPPORTED`.
2. `electronite/webpack.config.js` bundles the main process into `build/main.js` (target: electron-main). Modules it `require`s are bundled, but files it loads by path (preloads) are not.
3. `electronite-packager` packages the combined output per platform.

**Resources:** `tcResources/` holds Bible resources per language (en, el-x-koine, hbo, hi, and other gateway languages). `npm run minimal-resources` loads just en + original languages; `npm run update-resources` refreshes all.

**Localization:** `src/locale/` contains 25 language JSON files. `English-en_US.json` is the reference, and Crowdin is used for community translations. Each checking tool has its own locale folder at `src/tC_apps/<tool>/src/locale/`.

After adding, renaming or removing strings:
1. Edit only `English-en_US.json`. Call strings as `translate('section.key')` with a literal key, so the find scripts can see them.
2. `npm run find:missing-locale` lists `translate('…')` keys in `src/js` that aren't in the English file. `npm run find:extra-locale` lists English keys that no code uses. Keys used only from strings built at runtime show up as "extra", so check before deleting them.
3. `npm run locales:tc-copy-missing` copies any key missing from the other `src/locale/*.json` files over from English, as English text for Crowdin to translate later. It rewrites those files in English key order and logs to `locale-check-tC.log`. Extra keys are only reported, never removed.
   - After changing a tool's English file, run `locales:wa-copy-missing`, `locales:tw-copy-missing` or `locales:tn-copy-missing`. Those edit the submodule, so commit there.
   - `npm run locales:update-all` runs all four.
   - `npm run locales:do-compare` reports missing and extra keys without changing anything. It exits with 1 if any are found.
4. Commit the changed locale files. Don't commit the `locale-check-*.log` files, which are written to the repo root and aren't gitignored.

**Fonts:** Font files are in `src/fonts/` (complex-script fonts in `src/fonts/complexScript/`). They are loaded by `@font-face` rules in `src/css/styles.css` and in `public/previewStyles-*.css` (one stylesheet per print-preview font). `src/js/common/complexScriptFonts.js` maps the complex-script fonts. `styles.css` also imports vendored CSS from `src/css/` (Bootstrap 3.3.6 with Glyphicons Halflings, hint.css). `font-awesome.min.css` is not imported and its fonts aren't in the repo.

**License attributions (About → Licenses screen):** `src/js/components/home/license/attributionData.json` is generated. Don't edit it by hand. Edit `scripts/attributions/attributionHelpers.js` and run `npm run update-attributions`.
- `staticPackages`: things not found in npm dependencies: Electron (version read from the installed `electronite`), llama.cpp (version from `llamaCppTag` in `package.json`), the LLVM OpenMP runtime (Windows `libomp.dll`), and the vendored CSS libraries.
- `staticFonts`: every bundled font. Versions are from the font files' name tables. Add an entry whenever a font is added to `src/fonts/`.
- npm packages are collected automatically from `package.json` dependencies, from `src/tC_apps/*/package.json`, and from the dependencies of our own packages. Our own packages (in `ignorePackages`, or with a `unfoldingWord`, `unfoldingWord-dev` or `translationCoreApps` GitHub repository) aren't listed themselves. Build/test-only packages are skipped (`buildOnlyPackages`, `@types/*`). Use `packageRename` for forks.
- Re-run `npm run update-attributions` after adding or upgrading dependencies, fonts, vendored CSS or bundled binaries. `src/__tests__/Licenses.test.js` checks that the rendered screen matches.

**Bundled llama-server (build):** `build-macos|linux|win` run `prebuild → fetch-llama-server → electronite-build-* → add-llama-server`.
- `scripts/fetch-llama-server.js` (`npm run fetch-llama-server`, `-- --all`, `-- --targets=…`, `-- --force`) downloads the pinned llama.cpp release (`llamaCppTag` in `package.json`) into `vendor/llama-server/<platform>-<arch>/`. It verifies checksums against `scripts/llama-server-checksums.json` (refresh with `-- --update-checksums` after bumping the tag) and keeps only the server, its libraries and licenses.
- Builds per platform:
  - Windows x64, Linux x64 and Linux arm64 use the Vulkan builds, trimmed to baseline CPU variants. On Windows, the script adds the MSVC runtime DLLs from System32.
  - macOS uses the upstream arm64 (Metal) and x64 builds. The universal app bundles both, and the manager picks one at runtime.
- `scripts/add-llama-server.js` copies them into each packaged app in `dist/` after packaging: `Contents/Resources/llama-server/` on Mac, `resources/llama-server/` elsewhere. Copying after packaging means the universal-app merge never sees them. It then smoke-tests `llama-server --version` for the binaries the machine can run (`--no-smoke-test` or `LLAMA_SERVER_SKIP_SMOKE_TEST=1` to skip).
- The upstream Linux builds need glibc 2.34+, `libssl3` and `libgomp1` (Ubuntu 22.04+, Debian 12+). The deb recommends those plus `libvulkan1` and `mesa-vulkan-drivers`. The CI container (Debian buster) can't run them, so on Linux the smoke test only warns when a system library is missing or too old. Re-run `npm run update-attributions` after bumping llama.cpp. See `plan/embed-llama-server.md` for decisions and status.

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
