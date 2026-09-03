const http = require('http');
const https = require('https');

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
    baseUrl = 'http://localhost:1234',
    model = 'local-model',
    temperature = 0.7,
    maxTokens = 4096,
    enableThinking = false,
    systemPrompt = 'You are a helpful assistant.',
  } = options;

  console.log(`Query with options`, options);

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

  return replyText;
}

module.exports = {
  queryLmStudioFromMainProcess,
};
