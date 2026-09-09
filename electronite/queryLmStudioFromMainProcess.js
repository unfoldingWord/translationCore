const http = require('http');
const https = require('https');

/**
 * Makes a GET request to the LM Studio API from the Electron main process.
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.baseUrl='http://localhost:1234'] - Base URL of the LM Studio server
 * @param {string} apiUrlPath - API endpoint path to request (e.g., '/v1/models')
 * @returns {Promise<Array>} Promise that resolves with the data array from the API response
 * @throws {Error} If the request fails, the response status is not 2xx, or the response shape is unexpected
 */
function getApiLmStudioFromMainProcess(options, apiUrlPath) {
  const {
    baseUrl = 'http://localhost:1234',
  } = options;

  return new Promise((resolve, reject) => {
    const url = new URL(apiUrlPath, baseUrl);
    console.log('getApiLmStudioFromMainProcess - request parameters', { url, options });

    const requestOptions = {
      method: 'GET',
      hostname: url.hostname,
      port: url.port,
      path: `${url.pathname}${url.search}`,
      headers: {
        Accept: 'application/json',
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
          reject(new Error(`LM Studio models request failed (${response.statusCode}): ${responseText}`));
          return;
        }

        try {
          const parsedResponse = JSON.parse(responseText);
          const models = parsedResponse?.data;

          if (!Array.isArray(models)) {
            reject(new Error('Unexpected LM Studio models response shape: expected data array'));
            return;
          }

          resolve(models);
        } catch (error) {
          reject(new Error(`Failed to parse LM Studio models response: ${error.message}`));
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
 * @returns {Promise<Array>} List of available LM Studio models
 * @throws {Error} If the request fails or the response shape is unexpected
 */
function getAvailableLmStudioModelsFromMainProcess(options = {}) {
  let apiUrlPath = '/v1/models';
  console.log('getAvailableLmStudioModelsFromMainProcess - request model with options', options);
  return getApiLmStudioFromMainProcess(options, apiUrlPath);
}

/**
 * Streams a chat completion request to an LM Studio server from the Electron main process.
 *
 * @param {string} baseUrl - Base URL of the LM Studio server, e.g. 'http://localhost:1234'
 * @param {string} model - Model identifier configured in LM Studio
 * @param {string} systemPrompt - System prompt
 * @param {string} query - User prompt
 * @param {number} temperature - Sampling temperature
 * @param {number} maxTokens - Maximum response tokens
 * @param {boolean} enableThinking - Whether to enable thinking mode
 * @returns {Promise<{replyText: string, actualModel: string}>}
 */
function streamChatMessageFromMainProcess(
  baseUrl,
  model,
  systemPrompt,
  query,
  temperature,
  maxTokens,
  enableThinking,
) {
  return new Promise((resolve, reject) => {
    const url = new URL('/v1/chat/completions', baseUrl);
    console.log( 'streamChatMessageFromMainProcess - request url', url);

    const body = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature,
      max_tokens: maxTokens,
      stream: true,
      chat_template_kwargs: { enable_thinking: enableThinking },
    });

    const requestOptions = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port,
      path: `${url.pathname}${url.search}`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const transport = url.protocol === 'https:' ? https : http;

    const req = transport.request(requestOptions, response => {
      let replyText = '';
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

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed || !trimmed.startsWith('data: ')) {
            continue;
          }

          const dataStr = trimmed.slice(6);

          if (dataStr === '[DONE]') {
            resolve({ replyText, actualModel });
            return;
          }

          try {
            const parsedChunk = JSON.parse(dataStr);
            actualModel = actualModel || parsedChunk?.model || '';

            const delta = parsedChunk?.choices?.[0]?.delta;
            const text = delta?.content || delta?.reasoning_content;

            if (text) {
              replyText += text;
            }
          } catch (error) {
            // Ignore malformed SSE chunks.
          }
        }
      });

      response.on('end', () => {
        resolve({ replyText, actualModel });
      });
    });

    req.on('error', error => {
      reject(new Error(`Failed to reach LM Studio server at ${url.href}: ${error.message}`));
    });

    req.write(body);
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
 * @returns {Promise<string>} The AI model's response text
 * @throws {Error} If the response is empty or the request fails
 */
async function queryLmStudioFromMainProcess(query, options = {}) {
  const {
    baseUrl,
    model,
    temperature,
    maxTokens,
    enableThinking,
    systemPrompt,
  } = options;

  console.log('Query with options', query, options);

  const finalQuery = enableThinking ? query : `${query}\n/no_think`;
  const startTime = Date.now();

  const {
    replyText,
    actualModel,
  } = await streamChatMessageFromMainProcess(
    baseUrl,
    model,
    systemPrompt,
    finalQuery,
    temperature,
    maxTokens,
    enableThinking,
  );

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Query using model "${actualModel || model}" took ${elapsed}s`);

  if (!replyText) {
    throw new Error('Unexpected LM Studio response shape: received empty content');
  }

  return {
    actualModel,
    elapsed,
    replyText,
  };
}

module.exports = {
  getApiLmStudioFromMainProcess,
  getAvailableLmStudioModelsFromMainProcess,
  queryLmStudioFromMainProcess,
};
