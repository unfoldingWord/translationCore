/* eslint-env jest */
import http from 'http';
import { getAvailableAiApiModelsFromMainProcess } from '../../electronite/queryAiApisFromMainProcess';

/**
 * Starts a local server with an OpenAI-compatible `/v1/models`, and optionally LM Studio's native
 * `/api/v1/models` (which has the sizes).
 * @param {boolean} lmStudio - serve the native API too (otherwise it's a 404)
 * @return {Promise<{baseUrl: string, close: function}>}
 */
async function startServer(lmStudio) {
  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.url.startsWith('/v1/models')) {
      res.end(JSON.stringify({
        object: 'list',
        data: [
          {
            id: 'qwen/qwen3-4b-2507', object: 'model', owned_by: 'organization_owner',
          },
          {
            id: 'not-in-native-list', object: 'model', owned_by: 'organization_owner',
          },
        ],
      }));
    } else if (lmStudio && req.url === '/api/v1/models') {
      res.end(JSON.stringify({
        models: [
          { key: 'qwen/qwen3-4b-2507', size_bytes: 2279153300 },
          { key: 'other-model', size_bytes: 1 },
        ],
      }));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'not found' }));
    }
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise(resolve => server.close(resolve)),
  };
}

describe('getAvailableAiApiModelsFromMainProcess', () => {
  let server;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(async () => {
    server && await server.close();
    server = null;
    jest.restoreAllMocks();
  });

  test('adds the sizes from LM Studio\'s native API', async () => {
    server = await startServer(true);

    const models = await getAvailableAiApiModelsFromMainProcess({ baseUrl: server.baseUrl });

    expect(models).toEqual([
      {
        id: 'qwen/qwen3-4b-2507', object: 'model', owned_by: 'organization_owner', size: 2279153300,
      },
      { // no size reported for it
        id: 'not-in-native-list', object: 'model', owned_by: 'organization_owner',
      },
    ]);
  });

  test('lists the models without sizes when the server has no native API', async () => {
    server = await startServer(false);

    const models = await getAvailableAiApiModelsFromMainProcess({ baseUrl: server.baseUrl });

    expect(models.map(model => model.id)).toEqual(['qwen/qwen3-4b-2507', 'not-in-native-list']);
    expect(models.every(model => model.size === undefined)).toBe(true);
  });
});
