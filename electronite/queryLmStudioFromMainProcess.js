const http = require('http');
const https = require('https');

/**
 * Builds the authorization headers for an LM Studio request.
 *
 * @param {string} [apiToken] - API token to send as a bearer token. Ignored when empty.
 * @returns {Object} Headers to merge into the request headers (empty when no token is given)
 */
function getAuthHeaders(apiToken) {
  const token = typeof apiToken === 'string' ? apiToken.trim() : '';

  if (!token) {
    return {};
  }

  // tokens may already carry a scheme prefix (e.g. 'Bearer abc')
  const value = /^\S+\s+\S/.test(token) ? token : `Bearer ${token}`;
  return { Authorization: value };
}

/**
 * Copies options with the API token masked so it is never written to the logs.
 *
 * @param {Object} [options={}] - Configuration options
 * @returns {Object} Options safe to log
 */
function redactOptions(options = {}) {
  if (!options.apiToken) {
    return options;
  }

  return {
    ...options,
    apiToken: '***',
  };
}

/**
 * Makes a GET request to an LM Studio API endpoint from the Electron main process.
 *
 * @param {Object} options - Request configuration options.
 * @param {string} [options.baseUrl='http://localhost:1234'] - Base URL of the LM Studio server.
 * @param {string} [options.apiToken] - Optional API token. Sent in the Authorization header as a bearer token unless it already includes an auth scheme.
 * @param {string} apiUrlPath - API endpoint path to request, such as '/v1/models'.
 * @returns {Promise<Object>} Promise that resolves with the data Object from the parsed API response.
 * @throws {Error} If the server cannot be reached, the response status is not 2xx, or the response body cannot be parsed as JSON.
 */
function getApiLmStudioFromMainProcess(options, apiUrlPath) {
  const {
    baseUrl = 'http://localhost:1234',
    apiToken,
  } = options;

  return new Promise((resolve, reject) => {
    const url = new URL(apiUrlPath, baseUrl);
    console.log('getApiLmStudioFromMainProcess - request parameters', { url, options: redactOptions(options) });

    const requestOptions = {
      method: 'GET',
      hostname: url.hostname,
      port: url.port,
      path: `${url.pathname}${url.search}`,
      headers: {
        Accept: 'application/json',
        ...getAuthHeaders(apiToken),
      },
    };

    const transport = url.protocol === 'https:' ? https : http;

    const req = transport.request(requestOptions, response => {
      let responseText = '';

      response.setEncoding('utf8');

      response.on('data', chunk => {
        responseText += chunk;
      });

      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`getApiLmStudioFromMainProcess - data request failed (${response.statusCode}): ${responseText}`));
          return;
        }

        try {
          const parsedResponse = JSON.parse(responseText);
          // console.log('getApiLmStudioFromMainProcess - response response:', parsedResponse);
          const responseData = parsedResponse && parsedResponse.data;
          // console.log('getApiLmStudioFromMainProcess - responseData:', responseData);
          resolve(responseData);
        } catch (error) {
          const message = `Failed to parse LM Studio response: ${error.message}`;
          console.error(`getApiLmStudioFromMainProcess - error: ${message}`, responseText);
          reject(new Error(message));
        }
      });
    });

    req.on('error', error => {
      reject(new Error(`Failed to reach LM Studio server at ${url.href}: ${error.message}`));
    });

    req.end();
  });
}

/**
 * Gets the list of available models from an LM Studio server.
 *
 * @param {Object} [options={}] - Configuration options
 * @param {string} [options.baseUrl='http://localhost:1234'] - Base URL of the LM Studio server
 * @param {string} [options.apiToken] - API token sent as a bearer token in the Authorization header
 * @returns {Promise<Array>} List of available LM Studio models
 * @throws {Error} If the request fails or the response shape is unexpected
 */
async function getAvailableLmStudioModelsFromMainProcess(options = {}) {
  let apiUrlPath = '/v1/models';
  // console.log('getAvailableLmStudioModelsFromMainProcess - request model with options', redactOptions(options));
  const models = await getApiLmStudioFromMainProcess(options, apiUrlPath);
  // console.log('getAvailableLmStudioModelsFromMainProcess - models:', models);

  if (!Array.isArray(models)) {
    throw new Error('getAvailableLmStudioModelsFromMainProcess - Unexpected LM Studio models response shape: expected data array', models);
  }

  // console.log('getAvailableLmStudioModelsFromMainProcess - SUCCESS:', models);
  return models;
}

/**
 * Streams a chat completion request to an LM Studio server from the Electron main process.
 *
 * @param {Object} options - Request options
 * @param {string} options.baseUrl - Base URL of the LM Studio server, e.g. 'http://localhost:1234'
 * @param {string} options.model - Model identifier configured in LM Studio
 * @param {string} options.systemPrompt - System prompt
 * @param {string} options.query - User prompt
 * @param {number} options.temperature - Sampling temperature
 * @param {number} options.maxTokens - Maximum response tokens
 * @param {boolean} options.enableThinking - Whether to enable thinking mode
 * @param {string} [options.apiToken] - API token sent as a bearer token in the Authorization header
 * @returns {Promise<{replyText: string, reasoningText: string, actualModel: string}>}
 */
function streamChatMessageFromMainProcess({
  baseUrl,
  model,
  systemPrompt,
  query,
  temperature,
  maxTokens,
  enableThinking,
  apiToken,
  repeatedChat = false,
}) {
  return new Promise((resolve, reject) => {
    let url = null;

    try {
      if (repeatedChat) {
        url = new URL('/api/v1/chat', baseUrl); // LM Studio API
      } else { // single chat
        url = new URL('/v1/chat/completions', baseUrl); // open AI compatible
      }
      // console.log( 'streamChatMessageFromMainProcess - URL :', url.toString());
    } catch (e) {
      console.log( 'streamChatMessageFromMainProcess - URL error baseUrl:', baseUrl, e);
      throw e;
    }

    const body = {
      model,
      temperature,
      stream: true,
    };

    if (repeatedChat) {
      body.input = query;
      body.max_output_tokens = maxTokens;
      // body.reasoning = enableThinking ? 'on' : 'off';

      if (systemPrompt) {
        body.system_prompt = systemPrompt;
      }
    } else { // single chat
      body.max_tokens = maxTokens;
      body.chat_template_kwargs = { enable_thinking: enableThinking };
      // body.reasoning = enableThinking ? 'on' : 'off';

      body.messages = [ ];

      if (systemPrompt) {
        body.messages.push({ role: 'system', content: systemPrompt });
      }

      body.messages.push({ role: 'user', content: query });
    }

    const bodyStr = JSON.stringify(body);

    // console.log('streamChatMessageFromMainProcess - request bodyStr', bodyStr);

    const requestOptions = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port,
      path: `${url.pathname}${url.search}`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        ...getAuthHeaders(apiToken),
      },
    };

    const transport = url.protocol === 'https:' ? https : http;

    const req = transport.request(requestOptions, response => {
      let replyText = '';
      let reasoningText = '';
      let buffer = '';
      let actualModel = '';
      let errorText = '';

      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.setEncoding('utf8');

        response.on('data', chunk => {
          errorText += chunk;
        });

        response.on('end', () => {
          reject(new Error(`AI request failed (${response.statusCode}): ${errorText}`));
        });

        return;
      }

      response.setEncoding('utf8');

      response.on('data', chunk => {
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        // console.log(`${lines.length} lines`);

        for (const line of lines) {
          const trimmed = line.trim();

          // console.log(trimmed);

          if (!trimmed || !trimmed.startsWith('data: ')) {
            continue;
          }

          const dataStr = trimmed.slice(6);

          if (dataStr === '[DONE]') {
            resolve({
              replyText, reasoningText, actualModel,
            });
            return;
          }

          try {
            const parsedChunk = JSON.parse(dataStr);
            actualModel = actualModel || (parsedChunk && parsedChunk.model) || '';

            const delta = parsedChunk
              && parsedChunk.choices
              && parsedChunk.choices[0]
              && parsedChunk.choices[0].delta;

            if (delta && delta.content) {
              replyText += delta.content;
              // console.log(`delta.content = ${delta.content}`, replyText);
            }

            if (delta && delta.reasoning_content) {
              reasoningText += delta.reasoning_content;
              // console.log(`delta.reasoning_content = ${delta.reasoning_content}`, reasoningText);
            }

            if (delta && delta.reasoning) {
              reasoningText += delta.reasoning;
              // console.log(`delta.reasoning = ${delta.reasoning}`, reasoningText);
            }
          } catch (error) {
            // Ignore malformed SSE chunks.
          }
        }
      });

      response.on('end', () => {
        resolve({
          replyText, reasoningText, actualModel,
        });
      });
    });

    req.on('error', error => {
      reject(new Error(`Failed to reach LM Studio server at ${url.href}: ${error.message}`));
    });

    req.write(bodyStr);
    req.end();
  });
}

/**
 * Queries an LM Studio server from the Electron main process.
 *
 * @param {string} query - User query to send to the AI model
 * @param {Object} [options={}] - Configuration options
 * @param {string} [options.baseUrl='http://localhost:1234'] - Base URL of the LM Studio server
 * @param {string} [options.model='local-model'] - Model identifier configured in LM Studio
 * @param {number} [options.temperature=0.7] - Sampling temperature (0-2)
 * @param {number} [options.maxTokens=4096] - Maximum response tokens
 * @param {boolean} [options.enableThinking=false] - Whether to enable thinking mode
 * @param {string} [options.systemPrompt='You are a helpful assistant.'] - System prompt
 * @param {string} [options.apiToken] - API token sent as a bearer token in the Authorization header
 * @returns {Promise<string>} The AI model's response text
 * @throws {Error} If the response is empty or the request fails
 */
async function queryLmStudioFromMainProcess(query, options = {}) {
  const {
    baseUrl,
    model,
    temperature,
    maxTokens,
    enable_thinking,
    systemPrompt,
    apiToken,
  } = options;

  // console.log('queryLmStudioFromMainProcess - Query with options', query, options);
  const startTime = Date.now();

  const {
    replyText,
    reasoningText,
    actualModel,
  } = await streamChatMessageFromMainProcess({
    baseUrl,
    model,
    systemPrompt,
    query,
    temperature,
    maxTokens,
    enableThinking: enable_thinking,
    apiToken,
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  // console.log(`Query finished using model "${actualModel || model}" took ${elapsed}s, reply`, replyText);
  // console.log(`queryLmStudioFromMainProcess - finished using model "${actualModel || model}" took ${elapsed}s`);

  const replyText_ = replyText || reasoningText;

  if (!replyText_) {
    const message = 'Unexpected LM Studio response shape: received empty content';
    console.error(message);
    throw new Error(message);
  }

  return {
    actualModel,
    elapsed,
    reasoningText,
    replyText: replyText_,
  };
}

module.exports = {
  getApiLmStudioFromMainProcess,
  getAvailableLmStudioModelsFromMainProcess,
  queryLmStudioFromMainProcess,
};
