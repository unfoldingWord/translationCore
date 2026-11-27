/**
 * Starts, monitors and stops the llama-server bundled with the app (see scripts/fetch-llama-server.js and
 * scripts/add-llama-server.js), so AI suggestions can run on a local model without LM Studio.
 *
 * llama-server runs in router mode over the models folder (~/translationCore/models): `/v1/models` lists every
 * model there, and the model named in a chat request is loaded on demand (one at a time by default, the least
 * recently used one is unloaded to make room).
 *
 * The server listens on 127.0.0.1 on a free port and requires a random API key generated at each start, so
 * other programs and web pages on the machine can't use it. Callers either pass `localServer: true` in the
 * AiAPIs options (electronite/index.js fills in the URL and key), or take `baseUrl` and `apiToken` from
 * `getStatus()`.
 *
 * The server is stopped when tC quits (`stopSync()` from electronite/index.js). If tC crashes or is killed
 * before it can do that, the PID file lets `cleanupOrphan()` stop the leftover server on the next launch.
 */
const { spawn, spawnSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');

const HOST = '127.0.0.1';
const DEFAULT_START_TIMEOUT_MS = 60 * 1000; // router mode doesn't load a model at startup
const DEFAULT_MODELS_MAX = 1; // models loaded at once - each can take several GB of (GPU) memory
const HEALTH_POLL_INTERVAL_MS = 500;
const STOP_TIMEOUT_MS = 5000;
const LOG_LINES_KEPT = 200;
const SHARD_PATTERN = /-(\d{5})-of-\d{5}$/; // split models: name-00001-of-00003.gguf
// model name clients send when they don't care which model (the LM Studio convention)
const GENERIC_MODEL_NAME = 'local-model';

/**
 * @param {object} model - entry from llama-server's router /v1/models
 * @return {boolean} true if the router reports the model as loaded
 */
function isModelLoaded(model) {
  const status = model && model.status;
  return (status && typeof status === 'object' ? status.value : status) === 'loaded';
}

// another program can take the free port between picking it and llama-server binding it; then try a new port
const MAX_START_ATTEMPTS = 3;
const PORT_IN_USE_PATTERN = /address already in use|couldn't bind|could not bind|failed to bind/i;

/**
 * @param {number} port
 * @return {Promise<boolean>} true if nothing is listening on the port on 127.0.0.1
 */
function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once('error', () => resolve(false));
    server.listen(port, HOST, () => server.close(() => resolve(true)));
  });
}

/**
 * @param {number} pid
 * @return {boolean} true if a process with this pid exists
 */
function isProcessAlive(pid) {
  try {
    process.kill(pid, 0); // signal 0 only checks
    return true;
  } catch (e) {
    return e.code === 'EPERM'; // exists, but belongs to someone else
  }
}

/**
 * @param {number} pid
 * @param {string} platform
 * @return {string} the process's command line (or image name on Windows), '' if unknown
 */
function getProcessCommand(pid, platform) {
  const result = platform === 'win32' ?
    spawnSync('tasklist', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'], { encoding: 'utf8', windowsHide: true }) :
    spawnSync('ps', ['-p', String(pid), '-o', 'command='], { encoding: 'utf8' });
  return (result.stdout || '').trim();
}

/**
 * Picks the vendor/llama-server target folder name for this machine.
 * @param {string} platform - process.platform
 * @param {string} arch - process.arch
 * @param {boolean} runningUnderARM64Translation - app.runningUnderARM64Translation (macOS/Windows)
 * @return {string[]} target folder names, best first
 */
function getTargetCandidates(platform, arch, runningUnderARM64Translation) {
  if (platform === 'darwin') {
    // under Rosetta process.arch is x64 on an Apple Silicon Mac, but the arm64 build (with Metal) runs natively
    const isArmMac = arch === 'arm64' || runningUnderARM64Translation;
    return isArmMac ? ['darwin-arm64', 'darwin-x64'] : ['darwin-x64'];
  }

  if (platform === 'linux' && (arch === 'x64' || arch === 'arm64')) {
    return [`linux-${arch}`];
  }

  if (platform === 'win32') {
    if (arch === 'arm64') {
      return ['win32-arm64'];
    }

    if (arch === 'x64') {
      // the x64 app on an arm64 PC (under emulation) only bundles the x64 build, which also runs emulated
      return runningUnderARM64Translation ? ['win32-arm64', 'win32-x64'] : ['win32-x64'];
    }
  }
  return []; // e.g. Windows ia32 has no upstream build
}

/**
 * @param {string} platform
 * @return {string} llama-server executable file name
 */
function getExeName(platform) {
  return platform === 'win32' ? 'llama-server.exe' : 'llama-server';
}

/**
 * Builds the llama-server command line (router mode over the models folder).
 * @param {object} options - see LlamaServerManager.start()
 * @param {string} modelsDir
 * @param {number} port
 * @return {string[]}
 */
function buildServerArgs(options, modelsDir, port) {
  const args = [
    '--models-dir', modelsDir,
    '--models-max', String(options.modelsMax || DEFAULT_MODELS_MAX),
    '--host', HOST,
    '--port', String(port),
    '--no-ui', // the built-in web UI isn't needed
  ];

  if (options.contextSize) {
    args.push('--ctx-size', String(options.contextSize));
  }

  if (options.cpuOnly) {
    args.push('--n-gpu-layers', '0'); // for GPUs or drivers that crash or give garbage
  } else if (options.gpuLayers !== undefined && options.gpuLayers !== null) {
    args.push('--n-gpu-layers', String(options.gpuLayers));
  }

  if (Array.isArray(options.extraArgs)) {
    args.push(...options.extraArgs.map(String));
  }
  return args;
}

/**
 * Lists the models in the models folder the way llama-server's router finds them: .gguf files at the top
 * level (multimodal projector files and the later parts of split models excluded), and sub folders holding
 * .gguf files (multimodal or split models).
 * @param {string} modelsDir
 * @return {Array<{id: string, path: string, size: number}>} sorted by id
 */
function scanModelsDir(modelsDir) {
  let entries;

  try {
    entries = fs.readdirSync(modelsDir, { withFileTypes: true });
  } catch (e) {
    return []; // no models folder yet
  }

  const isModelFile = name => name.toLowerCase().endsWith('.gguf') && !name.toLowerCase().startsWith('mmproj');
  const models = [];

  for (const entry of entries) {
    const fullPath = path.join(modelsDir, entry.name);

    if (entry.isDirectory()) {
      let files = [];

      try {
        files = fs.readdirSync(fullPath).filter(isModelFile);
      } catch (e) {
        // unreadable folder
      }

      if (files.length) {
        const size = files.reduce((sum, f) => sum + fs.statSync(path.join(fullPath, f)).size, 0);

        models.push({
          id: entry.name, path: fullPath, size,
        });
      }
    } else if (entry.isFile() && isModelFile(entry.name)) {
      const base = entry.name.slice(0, -'.gguf'.length);
      const shard = base.match(SHARD_PATTERN);

      if (shard && shard[1] !== '00001') {
        continue; // only list a split model once
      }

      const id = shard ? base.replace(SHARD_PATTERN, '') : base;
      // a split model's size is all of its parts
      const files = shard ?
        entries.filter(other => other.isFile() && isModelFile(other.name) &&
          other.name.slice(0, -'.gguf'.length).replace(SHARD_PATTERN, '') === id &&
          SHARD_PATTERN.test(other.name.slice(0, -'.gguf'.length))) :
        [entry];
      const size = files.reduce((sum, f) => sum + fs.statSync(path.join(modelsDir, f.name)).size, 0);

      models.push({
        id, path: fullPath, size,
      });
    }
  }
  return models.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * @return {Promise<number>} a free TCP port on 127.0.0.1
 */
function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, HOST, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

/**
 * GET a path from the local server.
 * @param {number} port
 * @param {string} urlPath
 * @param {string|null} apiToken
 * @param {number} [timeout=2000]
 * @return {Promise<{status: number, body: string}>} status 0 if the server can't be reached
 */
function httpGet(port, urlPath, apiToken, timeout = 2000) {
  return new Promise((resolve) => {
    const headers = apiToken ? { Authorization: `Bearer ${apiToken}` } : {};
    const req = http.get({
      host: HOST, port, path: urlPath, headers, timeout,
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('timeout', () => req.destroy());
    req.on('error', () => resolve({ status: 0, body: '' }));
  });
}

/**
 * @param {number} ms
 * @return {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class LlamaServerManager {
  /**
   * @param {object} config
   * @param {string} config.serverRoot - folder holding the <platform>-<arch> llama-server folders
   *   (process.resourcesPath/llama-server when packaged, vendor/llama-server in development)
   * @param {string} config.modelsDir - folder holding the .gguf models (~/translationCore/models)
   * @param {string} [config.platform=process.platform]
   * @param {string} [config.arch=process.arch]
   * @param {boolean} [config.runningUnderARM64Translation=false]
   * @param {function} [config.spawnFn=child_process.spawn] - for tests
   * @param {boolean} [config.useProcessGroup=true] - start llama-server in its own process group (not on
   *   Windows), so stopping it also stops the per-model processes the router starts. Off in tests.
   * @param {string} [config.pidFile] - where to record the running server's pid, so a server left behind by
   *   a crash can be stopped on the next launch (see cleanupOrphan())
   */
  constructor({
    serverRoot,
    modelsDir,
    platform = process.platform,
    arch = process.arch,
    runningUnderARM64Translation = false,
    spawnFn = spawn,
    useProcessGroup = true,
    pidFile = null,
  }) {
    this.serverRoot = serverRoot;
    this.modelsDir = modelsDir;
    this.pidFile = pidFile;
    this.platform = platform;
    this.arch = arch;
    this.runningUnderARM64Translation = !!runningUnderARM64Translation;
    this.spawnFn = spawnFn;
    this.useProcessGroup = useProcessGroup && platform !== 'win32';

    this.proc = null;
    this.state = 'stopped'; // 'stopped' | 'starting' | 'running' | 'stopping'
    this.port = null;
    this.apiToken = null;
    this.options = null;
    this.lastError = null;
    this.logLines = [];
    this.startPromise = null;
    this.version = undefined;
  }

  /**
   * @return {string|null} folder holding llama-server for this machine, or null if none is bundled
   */
  getServerDir() {
    const candidates = getTargetCandidates(this.platform, this.arch, this.runningUnderARM64Translation);
    const exe = getExeName(this.platform);

    for (const target of candidates) {
      const dir = path.join(this.serverRoot, target);

      if (fs.existsSync(path.join(dir, exe))) {
        return dir;
      }
    }
    return null;
  }

  /**
   * @return {string|null} full path of the llama-server executable, or null if none is bundled
   */
  getExePath() {
    const dir = this.getServerDir();
    return dir ? path.join(dir, getExeName(this.platform)) : null;
  }

  /**
   * @return {boolean} true if a llama-server build is bundled for this machine
   */
  isAvailable() {
    return !!this.getServerDir();
  }

  /**
   * Reads the bundled llama.cpp version from the stamp file written by scripts/fetch-llama-server.js.
   * @return {string|null} e.g. 'b12651'
   */
  getVersion() {
    if (this.version === undefined) {
      this.version = null;
      const dir = this.getServerDir();

      try {
        if (dir) {
          this.version = JSON.parse(fs.readFileSync(path.join(dir, '.llama-server.json'), 'utf8')).tag || null;
        }
      } catch (e) {
        // no stamp file (e.g. a hand-copied build)
      }
    }
    return this.version;
  }

  /**
   * @return {{available: boolean, state: string, baseUrl: string|null, apiToken: string|null,
   *   modelsDir: string, models: Array<{id: string, path: string, size: number}>, pid: number|null,
   *   version: string|null, lastError: string|null, log: string[]}}
   */
  getStatus() {
    const running = this.state === 'running';
    return {
      available: this.isAvailable(),
      state: this.state,
      baseUrl: running ? `http://${HOST}:${this.port}` : null,
      apiToken: running ? this.apiToken : null,
      modelsDir: this.modelsDir,
      models: scanModelsDir(this.modelsDir),
      pid: this.proc ? this.proc.pid : null,
      version: this.getVersion(),
      lastError: this.lastError,
      log: this.logLines.slice(-50),
    };
  }

  /**
   * Lists the models. While the server is running this is its `/v1/models` list (which also reports whether
   * each model is loaded); otherwise the models found in the models folder, in the same shape. Either way each
   * model has `size` (bytes, all parts of a split model) when its file is in the models folder.
   * @return {Promise<Array<object>>} OpenAI-style model objects with at least `id`
   */
  async getModels() {
    if (this.state === 'running') {
      const { status, body } = await httpGet(this.port, '/v1/models', this.apiToken, 10000);

      if (status === 200) {
        try {
          const data = JSON.parse(body).data;

          if (Array.isArray(data)) {
            // the server doesn't report sizes, so add them from the models folder
            const scanned = scanModelsDir(this.modelsDir);

            return data.map((model) => {
              const found = scanned.find(m => m.id === (model && model.id));
              return found && model.size === undefined ? { ...model, size: found.size } : model;
            });
          }
        } catch (e) {
          // fall back to scanning the folder
        }
      }
      this.log(`couldn't get /v1/models (HTTP ${status}), listing the models folder instead`);
    }

    return scanModelsDir(this.modelsDir).map(model => ({
      id: model.id,
      object: 'model',
      owned_by: 'llamacpp',
      path: model.path,
      size: model.size,
    }));
  }

  /**
   * Starts llama-server over the models folder, or returns the running server if it already has the same
   * options. A server running with different options is restarted.
   * @param {object} [options]
   * @param {number} [options.modelsMax=1] - models loaded at once
   * @param {number} [options.contextSize] - context size in tokens (default: from the model)
   * @param {number|string} [options.gpuLayers] - layers to offload to the GPU (default: llama-server's choice)
   * @param {boolean} [options.cpuOnly] - don't use the GPU
   * @param {string[]} [options.extraArgs] - more llama-server command line arguments
   * @param {number} [options.startTimeoutMs] - how long to wait for the server to be ready
   * @return {Promise<object>} status (see getStatus()) once the server is ready
   */
  async start(options = {}) {
    const normalized = this.validateOptions(options);

    if (this.state === 'starting' && this.startPromise && this.sameOptions(normalized)) {
      return this.startPromise;
    }

    if (this.state === 'running' && this.sameOptions(normalized)) {
      return this.getStatus();
    }

    if (this.proc) {
      await this.stop();
    }

    this.startPromise = this.launchWithRetries(normalized);

    try {
      return await this.startPromise;
    } finally {
      this.startPromise = null;
    }
  }

  /**
   * Launches the server, trying a new port if another program took the chosen one before llama-server
   * could bind it.
   * @param {object} options
   * @return {Promise<object>} status
   */
  async launchWithRetries(options) {
    for (let attempt = 1; ; attempt++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        return await this.launch(options);
      } catch (err) {
        if (!err.portInUse || attempt >= MAX_START_ATTEMPTS) {
          throw err;
        }
        this.log(`port was taken, retrying with a new port (attempt ${attempt + 1} of ${MAX_START_ATTEMPTS})`);
      }
    }
  }

  /**
   * Starts the server with the current options (or defaults) unless it's already running or starting.
   * @return {Promise<object>} status
   */
  ensureRunning() {
    if (this.state === 'running') {
      return Promise.resolve(this.getStatus());
    }

    if (this.state === 'starting' && this.startPromise) {
      return this.startPromise;
    }
    return this.start(this.options || {});
  }

  /**
   * Turns AiAPIs options with `localServer: true` into options for the OpenAI-compatible client: starts the
   * server if needed and fills in `baseUrl` and `apiToken`.
   *
   * llama-server's router needs a model name in every request. When `model` is missing (or the generic
   * 'local-model'), the model that is already loaded is used, otherwise the first model in the list.
   * @param {object} options - AiAPIs options
   * @return {Promise<object>} options for queryAiApisFromMainProcess.js
   * @throws {Error} if there are no models, or `model` names one that isn't in the models folder
   */
  async getClientOptions(options = {}) {
    const { localServer, ...clientOptions } = options; // eslint-disable-line no-unused-vars
    const status = await this.ensureRunning();
    const models = await this.getModels(); // the server's own ids, so they match what it accepts
    const ids = models.map(m => m.id);
    const requested = clientOptions.model;

    if (!ids.length) {
      throw new Error(`No models found in ${this.modelsDir}. Add a .gguf model file there.`);
    }

    if (requested && requested !== GENERIC_MODEL_NAME) {
      if (!ids.includes(requested)) {
        throw new Error(`Model "${requested}" is not in ${this.modelsDir}. Available models: ${ids.join(', ')}`);
      }
    } else {
      const loaded = models.find(isModelLoaded);
      clientOptions.model = (loaded || models[0]).id;
      this.log(`no model requested, using ${clientOptions.model}`);
    }
    return {
      ...clientOptions, baseUrl: status.baseUrl, apiToken: status.apiToken,
    };
  }

  /**
   * @param {object} options
   * @return {object} options to use
   * @throws {Error} if llama-server isn't bundled or the options are invalid
   */
  validateOptions(options) {
    if (!this.isAvailable()) {
      throw new Error(`llama-server is not available for ${this.platform}-${this.arch}`);
    }

    if (!this.modelsDir) {
      throw new Error('No models folder configured for llama-server');
    }

    if (options.extraArgs !== undefined && !Array.isArray(options.extraArgs)) {
      throw new Error('options.extraArgs must be an array of strings');
    }
    return { ...options };
  }

  /**
   * @param {object} options
   * @return {boolean} true if the current/starting server uses the same options
   */
  sameOptions(options) {
    const { startTimeoutMs, ...a } = options; // eslint-disable-line no-unused-vars
    const { startTimeoutMs: _, ...b } = this.options || {}; // eslint-disable-line no-unused-vars
    return JSON.stringify(a) === JSON.stringify(b);
  }

  /**
   * Spawns llama-server and waits until /health reports it ready.
   * @param {object} options
   * @return {Promise<object>} status
   */
  async launch(options) {
    const exe = this.getExePath();
    fs.mkdirSync(this.modelsDir, { recursive: true }); // so users can find where to put models
    const port = await getFreePort();
    const apiToken = crypto.randomBytes(24).toString('hex');
    const args = buildServerArgs(options, this.modelsDir, port);

    this.options = options;
    this.port = port;
    this.apiToken = apiToken;
    this.lastError = null;
    this.logLines = [];
    this.state = 'starting';
    this.log(`starting ${exe} ${args.join(' ')}`);

    const proc = this.spawnFn(exe, args, {
      cwd: path.dirname(exe),
      // the key goes in the environment rather than on the command line, which other users can see
      env: { ...process.env, LLAMA_API_KEY: apiToken },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      detached: this.useProcessGroup,
    });
    this.proc = proc;
    this.writePidFile(proc, exe);

    const onOutput = (data) => {
      String(data).split(/\r?\n/).filter(Boolean).forEach(line => this.log(line));
    };

    if (proc.stdout) {
      proc.stdout.on('data', onOutput);
    }

    if (proc.stderr) {
      proc.stderr.on('data', onOutput);
    }

    let exitInfo = null;

    proc.on('error', (err) => {
      exitInfo = { error: err };
      this.log(`failed to start: ${err.message}`);
    });
    proc.on('exit', (code, signal) => {
      exitInfo = exitInfo || { code, signal };
      this.onExit(proc, code, signal);
    });

    const timeoutMs = options.startTimeoutMs || DEFAULT_START_TIMEOUT_MS;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      if (exitInfo || this.proc !== proc) {
        let reason = 'was stopped';

        if (exitInfo && exitInfo.error) {
          reason = exitInfo.error.message;
        } else if (exitInfo) {
          reason = `exited with ${exitInfo.signal ? `signal ${exitInfo.signal}` : `code ${exitInfo.code}`}`;
        }

        const error = new Error(`llama-server ${reason} while starting.\n${this.logLines.slice(-20).join('\n')}`);

        if (exitInfo && !exitInfo.error) {
          // it couldn't bind the port if it says so, or if something else is listening there now
          // eslint-disable-next-line no-await-in-loop
          error.portInUse = PORT_IN_USE_PATTERN.test(this.logLines.join('\n')) || !(await isPortFree(port));
        }
        this.lastError = error.message;
        throw error;
      }

      // polling until the server is up, so these waits are sequential on purpose
      // eslint-disable-next-line no-await-in-loop
      const { status } = await httpGet(port, '/health', null);
      // make sure it's our server answering, not another program that took the port: only ours has the key
      // eslint-disable-next-line no-await-in-loop
      const isOurs = status === 200 && (await httpGet(port, '/v1/models', apiToken, 10000)).status === 200;

      if (isOurs) {
        if (this.proc !== proc || exitInfo) {
          continue; // stopped or exited while we were checking
        }
        this.state = 'running';
        this.log(`ready at http://${HOST}:${port}`);
        return this.getStatus();
      }
      // eslint-disable-next-line no-await-in-loop
      await delay(HEALTH_POLL_INTERVAL_MS);
    }

    await this.stop();
    this.lastError = `llama-server did not become ready within ${Math.round(timeoutMs / 1000)}s`;
    throw new Error(this.lastError);
  }

  /**
   * @param {ChildProcess} proc
   * @param {number|null} code
   * @param {string|null} signal
   */
  onExit(proc, code, signal) {
    if (this.proc !== proc) {
      return; // an older process we already replaced
    }

    const expected = this.state === 'stopping';
    this.log(`exited (${signal ? `signal ${signal}` : `code ${code}`})`);

    if (!expected && this.state === 'running') {
      this.lastError = `llama-server stopped unexpectedly (${signal ? `signal ${signal}` : `code ${code}`})`;
    }
    this.proc = null;
    this.state = 'stopped';
    this.port = null;
    this.apiToken = null;
    this.removePidFile(proc.pid);
  }

  /**
   * Records the running server so a crash of tC doesn't leave it running unnoticed.
   * @param {ChildProcess} proc
   * @param {string} exe
   */
  writePidFile(proc, exe) {
    if (!this.pidFile || !proc.pid) {
      return;
    }

    try {
      fs.mkdirSync(path.dirname(this.pidFile), { recursive: true });
      fs.writeFileSync(this.pidFile, JSON.stringify({
        pid: proc.pid, exe, processGroup: this.useProcessGroup, startedAt: new Date().toISOString(),
      }));
    } catch (e) {
      this.log(`couldn't write ${this.pidFile}: ${e.message}`);
    }
  }

  /**
   * @param {number} [pid] - only remove the file if it is for this pid
   */
  removePidFile(pid) {
    if (!this.pidFile) {
      return;
    }

    try {
      if (pid) {
        const recorded = JSON.parse(fs.readFileSync(this.pidFile, 'utf8'));

        if (recorded.pid !== pid) {
          return;
        }
      }
      fs.unlinkSync(this.pidFile);
    } catch (e) {
      // no file
    }
  }

  /**
   * Stops a llama-server left running by an earlier tC session that crashed or was killed before it could
   * stop it. Only kills the recorded process if it is still a llama-server (pids get reused). Call it once at
   * startup, before starting the server.
   * @return {boolean} true if a leftover server was stopped
   */
  cleanupOrphan() {
    if (!this.pidFile || !fs.existsSync(this.pidFile)) {
      return false;
    }

    let recorded = null;

    try {
      recorded = JSON.parse(fs.readFileSync(this.pidFile, 'utf8'));
    } catch (e) {
      // unreadable, just remove it
    }

    const pid = recorded && recorded.pid;
    let killed = false;

    if (pid && pid !== process.pid && !(this.proc && this.proc.pid === pid) && isProcessAlive(pid) &&
      getProcessCommand(pid, this.platform).toLowerCase().includes('llama-server')) {
      this.log(`stopping llama-server (pid ${pid}) left running by an earlier session`);

      try {
        if (this.platform === 'win32') {
          spawnSync('taskkill', ['/pid', String(pid), '/t', '/f'], { windowsHide: true });
        } else {
          process.kill(recorded.processGroup ? -pid : pid, 'SIGKILL');
        }
        killed = true;
      } catch (e) {
        this.log(`couldn't stop pid ${pid}: ${e.message}`);
      }
    }
    this.removePidFile();
    return killed;
  }

  /**
   * Signals llama-server and the model processes it started (its process group, or its process tree on
   * Windows).
   * @param {ChildProcess} proc
   * @param {string} [signal='SIGTERM']
   */
  signal(proc, signal = 'SIGTERM') {
    if (this.platform === 'win32' && proc.pid) {
      // Windows has no signals: end the whole tree, or the router's model processes would be left running
      const result = spawnSync('taskkill', ['/pid', String(proc.pid), '/t', '/f'], { windowsHide: true });

      if (result.status === 0) {
        return;
      }
    }

    if (this.useProcessGroup && proc.pid) {
      try {
        process.kill(-proc.pid, signal); // negative pid: the whole process group
        return;
      } catch (e) {
        // group already gone, fall through to the main process
      }
    }
    proc.kill(signal);
  }

  /**
   * Stops the server, waiting for it to exit (force-killing it if it doesn't exit in time).
   * @return {Promise<object>} status
   */
  async stop() {
    const proc = this.proc;

    if (!proc) {
      this.state = 'stopped';
      return this.getStatus();
    }

    this.state = 'stopping';
    const exited = new Promise(resolve => proc.once('exit', resolve));
    this.signal(proc, 'SIGTERM'); // on Windows this terminates the process

    const timedOut = await Promise.race([
      exited.then(() => false),
      delay(STOP_TIMEOUT_MS).then(() => true),
    ]);

    if (timedOut && this.proc === proc) {
      this.log('did not exit in time, killing');
      this.signal(proc, 'SIGKILL');
      await Promise.race([exited, delay(STOP_TIMEOUT_MS)]);
    }

    if (this.proc === proc) { // no exit event (shouldn't happen), clean up anyway
      this.onExit(proc, null, 'SIGKILL');
    }
    return this.getStatus();
  }

  /**
   * Kills the server and its model processes immediately, for use while the app is quitting.
   */
  stopSync() {
    const proc = this.proc;

    if (!proc) {
      return;
    }
    this.state = 'stopping';

    try {
      this.signal(proc, 'SIGKILL'); // on Windows: taskkill of the whole tree
    } catch (e) {
      // already gone
    }
    // the app is exiting, so there may be no exit event to clean up after
    this.removePidFile(proc.pid);
  }

  /**
   * @param {string} line
   */
  log(line) {
    console.log(`llama-server: ${line}`);
    this.logLines.push(line);

    if (this.logLines.length > LOG_LINES_KEPT) {
      this.logLines.splice(0, this.logLines.length - LOG_LINES_KEPT);
    }
  }
}

module.exports = {
  LlamaServerManager,
  getTargetCandidates,
  buildServerArgs,
  scanModelsDir,
};
