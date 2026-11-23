/* eslint-env jest */
import EventEmitter from 'events';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import {
  LlamaServerManager,
  getTargetCandidates,
  buildServerArgs,
  scanModelsDir,
} from '../../electronite/llamaServerManager';

/**
 * Creates a temp folder with fake llama-server builds for the given targets and an empty models folder.
 * @param {string[]} targets
 * @return {{root: string, serverRoot: string, modelsDir: string}}
 */
function makeFixture(targets) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'llama-server-test-'));
  const serverRoot = path.join(root, 'llama-server');
  const modelsDir = path.join(root, 'models');

  for (const target of targets) {
    fs.mkdirSync(path.join(serverRoot, target), { recursive: true });
    const exe = target.startsWith('win32') ? 'llama-server.exe' : 'llama-server';
    fs.writeFileSync(path.join(serverRoot, target, exe), '');
    fs.writeFileSync(path.join(serverRoot, target, '.llama-server.json'), JSON.stringify({ tag: 'b12651' }));
  }
  return {
    root, serverRoot, modelsDir,
  };
}

/**
 * @param {string} file
 * @param {number} [size=1]
 */
function writeFile(file, size = 1) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.alloc(size));
}

/**
 * A fake spawn that, instead of running llama-server, serves /health (503 for the first `loadingPolls`
 * requests, then 200) and /v1/models (requires the API key from LLAMA_API_KEY) on the requested port.
 * @param {object} behavior
 * @param {number} [behavior.loadingPolls=1]
 * @param {number} [behavior.exitCode] - exit with this code right away instead of serving
 * @param {Array} [behavior.models] - the /v1/models list
 * @return {{spawnFn: function, calls: Array}}
 */
function makeFakeSpawn({
  loadingPolls = 1, exitCode, models = [],
} = {}) {
  const calls = [];

  const spawnFn = (exe, args, options) => {
    const proc = new EventEmitter();
    proc.pid = 4242;
    proc.stdout = new EventEmitter();
    proc.stderr = new EventEmitter();
    calls.push({
      exe, args, options, proc,
    });

    if (exitCode !== undefined) {
      setTimeout(() => {
        proc.stderr.emit('data', 'error: failed to initialize router models\n');
        proc.emit('exit', exitCode, null);
      }, 10);
      return proc;
    }

    const port = Number(args[args.indexOf('--port') + 1]);
    let healthPolls = 0;
    const server = http.createServer((req, res) => {
      if (req.url === '/health') {
        healthPolls++;
        res.statusCode = healthPolls > loadingPolls ? 200 : 503;
        res.end();
      } else if (req.url === '/v1/models') {
        const authorized = req.headers.authorization === `Bearer ${options.env.LLAMA_API_KEY}`;
        res.statusCode = authorized ? 200 : 401;
        res.end(authorized ? JSON.stringify({ object: 'list', data: models }) : '');
      } else {
        res.statusCode = 404;
        res.end();
      }
    });
    server.listen(port, '127.0.0.1');
    proc.server = server;

    proc.kill = jest.fn(() => {
      server.close(() => proc.emit('exit', null, 'SIGTERM'));
      return true;
    });
    return proc;
  };
  return { spawnFn, calls };
}

describe('getTargetCandidates', () => {
  test('prefers the arm64 build on Apple Silicon, also under Rosetta', () => {
    expect(getTargetCandidates('darwin', 'arm64', false)).toEqual(['darwin-arm64', 'darwin-x64']);
    expect(getTargetCandidates('darwin', 'x64', true)).toEqual(['darwin-arm64', 'darwin-x64']);
    expect(getTargetCandidates('darwin', 'x64', false)).toEqual(['darwin-x64']);
  });

  test('maps Linux and Windows, with no build for Windows ia32', () => {
    expect(getTargetCandidates('linux', 'x64', false)).toEqual(['linux-x64']);
    expect(getTargetCandidates('linux', 'arm64', false)).toEqual(['linux-arm64']);
    expect(getTargetCandidates('win32', 'x64', false)).toEqual(['win32-x64']);
    expect(getTargetCandidates('win32', 'ia32', false)).toEqual([]);
  });
});

describe('buildServerArgs', () => {
  test('runs the router over the models folder, one model at a time, on localhost', () => {
    const args = buildServerArgs({}, '/home/me/translationCore/models', 1234);

    expect(args).toEqual([
      '--models-dir', '/home/me/translationCore/models', '--models-max', '1',
      '--host', '127.0.0.1', '--port', '1234', '--no-ui',
    ]);
  });

  test('cpuOnly turns GPU offload off, and options are passed through', () => {
    const args = buildServerArgs({
      cpuOnly: true, gpuLayers: 99, contextSize: 8192, modelsMax: 2, extraArgs: ['--threads', 4],
    }, '/m', 1);
    expect(args.join(' ')).toContain('--models-max 2');
    expect(args).toEqual(expect.arrayContaining(['--ctx-size', '8192', '--threads', '4']));
    expect(args.join(' ')).toContain('--n-gpu-layers 0');
    expect(args.join(' ')).not.toContain('99');
  });
});

describe('scanModelsDir', () => {
  let fixture;

  beforeEach(() => {
    fixture = makeFixture([]);
  });

  afterEach(() => {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  });

  test('returns nothing when the folder does not exist', () => {
    expect(scanModelsDir(fixture.modelsDir)).toEqual([]);
  });

  test('lists .gguf files and model folders like the llama-server router', () => {
    const dir = fixture.modelsDir;
    writeFile(path.join(dir, 'qwen3-8b-Q4_K_M.gguf'), 10);
    writeFile(path.join(dir, 'mmproj-gemma.gguf'), 3); // projector, not a model
    writeFile(path.join(dir, 'notes.txt'));
    writeFile(path.join(dir, 'big-model-00001-of-00002.gguf'), 5); // split model, listed once
    writeFile(path.join(dir, 'big-model-00002-of-00002.gguf'), 5);
    writeFile(path.join(dir, 'gemma-3-4b', 'gemma-3-4b-Q4.gguf'), 7); // multimodal model folder
    writeFile(path.join(dir, 'gemma-3-4b', 'mmproj-F16.gguf'), 2);
    fs.mkdirSync(path.join(dir, 'empty-folder'));

    expect(scanModelsDir(dir)).toEqual([
      {
        id: 'big-model', path: path.join(dir, 'big-model-00001-of-00002.gguf'), size: 5,
      },
      {
        id: 'gemma-3-4b', path: path.join(dir, 'gemma-3-4b'), size: 7,
      },
      {
        id: 'qwen3-8b-Q4_K_M', path: path.join(dir, 'qwen3-8b-Q4_K_M.gguf'), size: 10,
      },
    ]);
  });
});

describe('LlamaServerManager', () => {
  let fixture;

  /**
   * @param {object} config
   * @return {LlamaServerManager}
   */
  const makeManager = (config = {}) => new LlamaServerManager({
    serverRoot: fixture.serverRoot,
    modelsDir: fixture.modelsDir,
    platform: 'linux',
    arch: 'x64',
    useProcessGroup: false,
    ...config,
  });

  beforeEach(() => {
    fixture = makeFixture(['darwin-x64', 'linux-x64']);
  });

  afterEach(() => {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  });

  test('finds the bundled build, falling back to darwin-x64 when only that is bundled', () => {
    writeFile(path.join(fixture.modelsDir, 'tiny.gguf'));
    const manager = makeManager({ platform: 'darwin', arch: 'arm64' });
    expect(manager.getServerDir()).toBe(path.join(fixture.serverRoot, 'darwin-x64'));
    expect(manager.getStatus()).toEqual(expect.objectContaining({
      available: true,
      state: 'stopped',
      baseUrl: null,
      version: 'b12651',
      modelsDir: fixture.modelsDir,
      models: [expect.objectContaining({ id: 'tiny' })],
    }));
  });

  test('is unavailable when nothing is bundled for the platform', async () => {
    const manager = makeManager({ platform: 'win32', arch: 'ia32' });
    expect(manager.isAvailable()).toBe(false);
    await expect(manager.start()).rejects.toThrow('not available for win32-ia32');
  });

  test('lists the models folder while the server is stopped', async () => {
    writeFile(path.join(fixture.modelsDir, 'qwen3-8b.gguf'), 4);
    const models = await makeManager().getModels();

    expect(models).toEqual([{
      id: 'qwen3-8b', object: 'model', owned_by: 'llamacpp', path: path.join(fixture.modelsDir, 'qwen3-8b.gguf'), size: 4,
    }]);
  });

  test('starts the router, creates the models folder, lists models from the server, and stops', async () => {
    const serverModels = [{
      id: 'qwen3-8b', object: 'model', status: { value: 'unloaded' },
    }];
    const { spawnFn, calls } = makeFakeSpawn({ loadingPolls: 2, models: serverModels });
    const manager = makeManager({ spawnFn });

    const status = await manager.start();
    expect(status.state).toBe('running');
    expect(status.baseUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
    expect(status.apiToken).toMatch(/^[0-9a-f]{48}$/);
    expect(fs.existsSync(fixture.modelsDir)).toBe(true);
    expect(calls[0].exe).toBe(path.join(fixture.serverRoot, 'linux-x64', 'llama-server'));
    expect(calls[0].args.join(' ')).toContain(`--models-dir ${fixture.modelsDir}`);
    // the API key goes in the environment, not on the command line
    expect(calls[0].options.env.LLAMA_API_KEY).toBe(status.apiToken);
    expect(calls[0].args).not.toContain(status.apiToken);

    // /v1/models from the running server, using the API key
    expect(await manager.getModels()).toEqual(serverModels);

    // same options: no restart
    const again = await manager.start();
    expect(again.baseUrl).toBe(status.baseUrl);
    expect(calls).toHaveLength(1);

    const stopped = await manager.stop();
    expect(stopped.state).toBe('stopped');
    expect(stopped.baseUrl).toBeNull();
    expect(calls[0].proc.kill).toHaveBeenCalled();
  });

  test('getClientOptions starts the server and fills in the URL, key and only model', async () => {
    writeFile(path.join(fixture.modelsDir, 'qwen3-8b.gguf'));
    const { spawnFn, calls } = makeFakeSpawn({ loadingPolls: 0 });
    const manager = makeManager({ spawnFn });

    const options = await manager.getClientOptions({
      localServer: true, model: 'local-model', temperature: 0.2,
    });

    expect(options).toEqual({
      model: 'qwen3-8b', temperature: 0.2, baseUrl: manager.getStatus().baseUrl, apiToken: manager.getStatus().apiToken,
    });

    // a named model is kept when there are several
    writeFile(path.join(fixture.modelsDir, 'gemma-3-4b.gguf'));
    expect((await manager.getClientOptions({ localServer: true, model: 'gemma-3-4b' })).model).toBe('gemma-3-4b');
    expect(calls).toHaveLength(1);
    await manager.stop();
  });

  test('restarts when the options change', async () => {
    const { spawnFn, calls } = makeFakeSpawn({ loadingPolls: 0 });
    const manager = makeManager({ spawnFn });

    await manager.start();
    const status = await manager.start({ cpuOnly: true });
    expect(calls).toHaveLength(2);
    expect(calls[0].proc.kill).toHaveBeenCalled();
    expect(calls[1].args.join(' ')).toContain('--n-gpu-layers 0');
    expect(status.state).toBe('running');
    await manager.stop();
  });

  test('reports the log when llama-server exits while starting', async () => {
    const { spawnFn } = makeFakeSpawn({ exitCode: 1 });
    const manager = makeManager({ spawnFn });

    await expect(manager.start()).rejects.toThrow(/exited with code 1[\s\S]*failed to initialize router models/);
    expect(manager.getStatus()).toEqual(expect.objectContaining({ state: 'stopped' }));
    expect(manager.getStatus().lastError).toContain('failed to initialize router models');
  });

  test('records an unexpected exit after starting', async () => {
    const { spawnFn, calls } = makeFakeSpawn({ loadingPolls: 0 });
    const manager = makeManager({ spawnFn });

    await manager.start();
    await new Promise(resolve => calls[0].proc.server.close(resolve));
    calls[0].proc.emit('exit', null, 'SIGSEGV');
    expect(manager.getStatus()).toEqual(expect.objectContaining({ state: 'stopped', lastError: expect.stringContaining('SIGSEGV') }));
  });
});
