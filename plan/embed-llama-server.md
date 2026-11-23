# Plan: Embed llama-server in GitHub builds (all architectures)

Status: draft, updated 2026-11-23. Sizes measured from llama.cpp release `b12651`.

## Decisions

1. **Windows x64, Linux x64 and Linux arm64 use the upstream Vulkan builds, trimmed to 2 CPU variants.**
   - A GPU-only build isn't possible. llama.cpp won't load a model without a CPU backend, which it uses
     for tokenizing, sampling and some operations even when every layer runs on the GPU.
   - Keep only `ggml-cpu-x64` (baseline) and `ggml-cpu-haswell` (AVX2). Drop the other 13 variants.
   - With no usable Vulkan GPU, llama-server falls back to the CPU. One build per platform covers both cases.
   - Intel integrated GPUs support Vulkan reasonably well from Skylake (2015) on. They share system memory,
     so they're often not much faster than the CPU. Dedicated GPUs and Intel Arc/Xe gain the most.
2. **macOS uses Metal (arm64) and CPU (x64)**, exactly as upstream ships them.
3. **The macOS universal build bundles both the arm64 and x64 sets** and picks one at runtime (see step 3).
   No `lipo`.
   - Combining them with `lipo` was tested and works (58 MB, ~24 MB compressed), but it saves only ~2 MB.
     It also adds a combine step and a re-signing step.
   - Bundling both keeps the upstream files untouched, along with their ad-hoc signatures, and uses the
     same code path as the x64-only DMG.

## Size per installer

| Build target | What's bundled | Installed | Compressed |
|---|---|---|---|
| macOS x64 DMG | `darwin-x64` (CPU) | 28 MB | ~12 MB |
| macOS universal DMG | `darwin-arm64` (Metal) + `darwin-x64` | ~60 MB | ~24 MB |
| Linux x64 deb | Vulkan, 2 CPU variants | 72 MB | ~25 MB |
| Linux arm64 deb | Vulkan, `armv8.0_1` CPU variant only | 60 MB | ~20 MB (estimated) |
| Windows x64 | Vulkan, 2 CPU variants | 75 MB | ~26 MB |
| Windows ia32 | **none** (no upstream build) | — | — |

Server-only file set: `llama-server` executable, `libllama-server-impl`, `libllama`, `libllama-common`,
`libmtmd`, `libggml`, `libggml-base`, `libggml-cpu*` (trimmed), plus the backend library
(`libggml-metal` / `libggml-blas` on Mac, `ggml-vulkan` on Win/Linux; `libomp.dll` on Windows).
`libggml-rpc` is optional.

The model is the real size. A usable GGUF model is 1–5 GB, so download it at runtime; don't bundle it.

## Steps

### 1. Fetch script (`scripts/fetch-llama-server.js`) — implemented
Usage: `npm run fetch-llama-server` (targets for the host OS), `-- --all`, `-- --targets=linux-x64`,
`-- --force`, `-- --update-checksums` (after bumping `llamaCppTag`). Checksums are in
`scripts/llama-server-checksums.json`, taken from GitHub's published sha256 digests. Re-runs skip targets
that are already up to date (stamp file `.llama-server.json` in each folder). Found during implementation:
- The files to keep are chosen by pattern, not a fixed list: `llama-server`, `LICENSE*`, and every shared
  library except the other tools' `*-impl` libraries and the dropped CPU variants. Checked that every
  dependency of the kept files is present for all 5 targets.
- **Windows needs the MSVC runtime** (`msvcp140.dll`, `vcruntime140.dll`, `vcruntime140_1.dll`), which the
  upstream zip doesn't include. On Windows (CI) the script copies them from System32 next to
  `llama-server.exe` (app-local deployment). On other OSes it prints a warning.
- The Windows zip has no llama.cpp `LICENSE`, so the script downloads it from the tagged source.
- Measured: darwin-arm64 31.9 MB, darwin-x64 28.3 MB, linux-x64 71.7 MB, linux-arm64 59.6 MB,
  win32-x64 75.0 MB (plus ~1.5 MB of MSVC DLLs).

Original design notes:
- Pin the version in `package.json` (e.g. `"llamaCppTag": "b12651"`) and keep SHA-256 checksums in a
  committed file.
- Upstream assets per target:
  - `darwin-arm64` ← `llama-<tag>-bin-macos-arm64.tar.gz`
  - `darwin-x64` ← `llama-<tag>-bin-macos-x64.tar.gz`
  - `linux-x64` ← `llama-<tag>-bin-ubuntu-vulkan-x64.tar.gz`
  - `linux-arm64` ← `llama-<tag>-bin-ubuntu-vulkan-arm64.tar.gz`
  - `win32-x64` ← `llama-<tag>-bin-win-vulkan-x64.zip`
- Download, verify, and extract only the server file set (above) into
  `vendor/llama-server/<platform>-<arch>/`. Drop the CPU variants other than the two kept.
  Include llama.cpp's MIT `LICENSE`.
- Keep the `.dylib` / `.so` version symlinks (e.g. `libllama.1.dylib → libllama.1.0.0.dylib`).
  Recreate them if the copy method doesn't keep them.
- `/vendor` is already in `.gitignore` and in the packager ignore list in `gulpfile.js`, so the fetched files
  never go through the packager. `vendor/` is also where the Windows installer picks up the Git installer
  (`scripts/win_installer.iss`), so keep everything under the `vendor/llama-server/` subfolder.

### 2. Packaging: copy after packaging (`scripts/add-llama-server.js`)
The llama-server files are copied into each packaged app **after** `electronite-packager` finishes and
**before** the gulp `release-*` tasks build the DMG, deb or Windows installer.

Why this way:
- **No change to the packager calls.** The `electronite-build-*` scripts in `package.json` stay as they are,
  multi-arch (`--arch=x64,arm64`, `--arch=universal,x64`, `--arch=ia32,x64`). There's no per-arch split and
  no `--extra-resource`.
- **No `x64ArchFiles` rule.** The files are added after `@electron/universal` merges the two halves, so its
  identical-Mach-O check never sees them.

How it works:
- Append it to the build scripts, e.g. `"build-macos": "npm run prebuild && npm run electronite-build-macos && node scripts/add-llama-server.js"`
  (same for `build-linux` and `build-win`). The CI build steps (`npm run build-*`) then need no change.
- Walk the `dist/translationCore-<platform>-<arch>/` folders that exist (`BUILD_DIR` + `p.name` in
  `gulpfile.js`) and copy:

  | Packaged folder | Copied from `vendor/llama-server/` | Destination inside the app |
  |---|---|---|
  | `translationCore-darwin-x64` | `darwin-x64` | `translationCore.app/Contents/Resources/llama-server/darwin-x64/` |
  | `translationCore-darwin-universal` | `darwin-arm64` + `darwin-x64` | `translationCore.app/Contents/Resources/llama-server/<each>/` |
  | `translationCore-darwin-arm64` (if ever built) | `darwin-arm64` | same pattern |
  | `translationCore-linux-x64` | `linux-x64` | `resources/llama-server/linux-x64/` |
  | `translationCore-linux-arm64` | `linux-arm64` | `resources/llama-server/linux-arm64/` |
  | `translationCore-win32-x64` | `win32-x64` | `resources/llama-server/win32-x64/` |
  | `translationCore-win32-ia32` | — | skipped (no upstream build) |

  Find the `.app` name by listing the folder instead of hard-coding `translationCore.app`.
- Copy with `fs-extra` `copy` (keeps symlinks by default) and set the exec bit on `llama-server` on
  macOS/Linux. Fail the build if a source folder is missing for a packaged folder that should have one.
- **Smoke test** (open question 3): after copying, run `llama-server --version` for whichever copies the
  CI runner can execute. That's `darwin-arm64` on `macos-latest` (plus `darwin-x64` if Rosetta is installed),
  `linux-x64` on the Linux job, and `win32-x64` on Windows. `linux-arm64` can't run on the x64 runner, so only
  check its files are present and the right architecture (`file`). Fail the build on a non-zero exit.
- Downstream release steps, already checked:
  - The deb tasks (`release-linux-deb*`) copy the whole build folder with `ncp`, which keeps symlinks and
    file modes.
  - `scripts/osx/makedmg.sh` packs the whole `.app`.
  - The Windows installer (`scripts/win_installer.iss`) includes `{#BuildPath}` with `recursesubdirs`.
- Linux deb: add `Recommends: libvulkan1, mesa-vulkan-drivers` to `scripts/deb/DEBIAN/control`
  (`libggml-vulkan.so` links `libvulkan.so.1`), and raise `Installed-Size`.
- **Future macOS signing:** the copy has to happen before signing, so packager-driven signing (`osxSign`)
  won't cover these files. Signing would become its own step after this script, signing the nested
  binaries first and then the `.app`.

### 3. Main process (`electronite/llamaServerManager.js`)
- Find the binary folder:
  - Packaged builds: `path.join(process.resourcesPath, 'llama-server', <platform>-<arch>)`.
  - Dev: `vendor/llama-server/<platform>-<arch>`.
  - On macOS, choose arm64 when `process.arch === 'arm64' || app.runningUnderARM64Translation`
    (Electron 25 has it). That way an Apple Silicon Mac gets Metal even when the user forces the app to run
    under Rosetta. Otherwise use `darwin-x64`. If that folder doesn't exist (x64-only DMG), use the one
    that does.
  - Windows ia32: no folder; report the local server as unavailable.
- Start it with `--host 127.0.0.1 --port <free port>` and either `-m <model>` or a models directory.
  Wait for `/health` to respond. Kill it on `before-quit`, when the window closes, and if it crashes.
  Let Vulkan offload layers by default (`-ngl` auto), and fall back cleanly when no GPU is found.
- Add IPC handlers next to `exposeAiApiQueryToMainWindow()` in `electronite/index.js`, such as
  `ai-apis:local-start`, `local-stop` and `local-status`, limited to the main window like the existing ones.
  Expose them through `electronite/preloadAiApi.js`.
- The current OpenAI-compatible client (`electronite/queryAiApisFromMainProcess.js`) then just points at
  `http://127.0.0.1:<port>`. Prompt-prefix caching already works with llama-server.

### 4. Model management (separate piece of work)
- Download a GGUF model into the user data folder, with progress and resume. The existing download manager
  in `electronite/index.js` might be reusable.

### 5. CI (`.github/workflows/main.yml`)
- Add a step before `npm run build-*` in each of the three build jobs (`build-linux`, `build-windows`,
  `build-macos`) to run the fetch script, cached with `actions/cache` keyed on the pinned version.
- The copy and smoke test run inside `npm run build-*` (step 2), so the existing build steps need no change.

## Platform risks
- **Windows ia32:** no upstream build. Building it from source for x86 isn't officially supported.
  The local server is turned off on ia32.
- **Linux:** the upstream builds are made on a recent Ubuntu, so they may need a newer glibc than older
  distros have. Test on the oldest distro you support, or build from source in the existing
  `photonomad/github_build` Docker image.
- **Old or buggy Vulkan drivers** (Intel GPUs from before Skylake, some Linux setups) may crash or produce
  garbage. Give users a setting to force CPU-only (`-ngl 0` or `--device none`).
- **macOS:** CI doesn't sign builds now, so the nested binaries are unsigned too (upstream ad-hoc
  signatures only). Signing or notarizing later would need these binaries signed with hardened-runtime
  entitlements.
- **Windows:** Defender or SmartScreen may flag a new `.exe` that opens a port. Binding to localhost only helps.

## Open questions
1. Which arm64 CPU variants to keep for Linux arm64. Check the `ubuntu-vulkan-arm64` file list.
  - answer: support the variant the Electron supports.
2. Does the `electronite-packager` CLI accept `--osx-universal.x64ArchFiles`, or does the macOS build
   need to move to the packager API?
  - answer: no longer relevant. The plan switched to copying after packaging (step 2), so no
    `x64ArchFiles` rule is needed. For the record, the CLI does accept
    `--osx-universal.x64ArchFiles=...` (verified against the installed `electronite-packager`), if adding
    files during packaging is ever needed again.
3. Unverified: the downloaded binaries weren't run locally (the auto-mode safety check blocked it).
   Smoke-test `llama-server --version` on each platform in CI.
  - answer: yes add this on build.
