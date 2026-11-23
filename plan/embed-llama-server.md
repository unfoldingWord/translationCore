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
| Linux arm64 deb | Vulkan, 2 CPU variants (arm64 variants differ; pick baseline + one) | ~55 MB (estimated) | ~20 MB |
| Windows x64 | Vulkan, 2 CPU variants | 75 MB | ~26 MB |
| Windows ia32 | **none** (no upstream build) | — | — |

Server-only file set: `llama-server` executable, `libllama-server-impl`, `libllama`, `libllama-common`,
`libmtmd`, `libggml`, `libggml-base`, `libggml-cpu*` (trimmed), plus the backend library
(`libggml-metal` / `libggml-blas` on Mac, `ggml-vulkan` on Win/Linux; `libomp.dll` on Windows).
`libggml-rpc` is optional.

The model is the real size. A usable GGUF model is 1–5 GB, so download it at runtime; don't bundle it.

## Steps

### 1. Fetch script (`scripts/fetch-llama-server.js`)
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
- Add `vendor/` to `.gitignore`. It is already in the packager ignore list in `gulpfile.js`, which is fine
  because the files go in through `--extra-resource`.

### 2. Packaging
- Right now `electronite-build-*` in `package.json` packages several archs in one call (`--arch=x64,arm64`),
  and `--extra-resource` can't change per arch. Split these into one packager call per arch:
  - Linux/Windows: `--extra-resource=vendor/llama-server/<plat>-<arch>`, which becomes
    `resources/<plat>-<arch>/` (or stage into a `llama-server/` parent first so the path is
    `resources/llama-server/<plat>-<arch>/`).
  - macOS x64: just `darwin-x64`.
  - macOS universal: **both** `darwin-arm64` and `darwin-x64`, identical in the arm64 and x64 halves of the
    app. Files present in only one half make `@electron/universal` fail.
- **macOS universal needs an `x64ArchFiles` rule.** `@electron/universal` 1.3.4 (installed) throws
  `Detected file "..." that's the same in both x64 and arm64 builds and not covered by the x64ArchFiles rule`
  for any Mach-O file that is identical in both halves. Pass
  `osxUniversal: { x64ArchFiles: 'Contents/Resources/llama-server/**' }` (`electronite-packager`
  `src/universal.js` forwards `osxUniversal`). Check whether the CLI accepts
  `--osx-universal.x64ArchFiles=...`. If not, switch the macOS build to the packager API, as `gulpfile.js`
  already does. Note: a `lipo`-combined set would hit the same check, so this rule is needed either way.
- Check that the gulp `release-*` tasks (dmg, deb, Windows installer) still find the `dist/` folders under
  the same names, and that the deb keeps the executable bit.
- Linux deb: add `libvulkan1` and `mesa-vulkan-drivers` to the deb's dependencies (recommends).
  `libggml-vulkan.so` links `libvulkan.so.1`.

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
2. Does the `electronite-packager` CLI accept `--osx-universal.x64ArchFiles`, or does the macOS build
   need to move to the packager API?
3. Unverified: the downloaded binaries weren't run locally (the auto-mode safety check blocked it).
   Smoke-test `llama-server --version` on each platform in CI.
