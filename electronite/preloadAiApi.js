// Preload Script - set variables to be used by splash screen

const { ipcRenderer } = require('electronite');

console.log(`started preloadAiApi`);

// what this version's AI bridge supports, so the checking tools can tell it from an older one:
// `messages` - `query` sends `options.messages` (a list of chat messages) in place of
// `options.systemPrompt` and the query, when the list is valid (queryAiApisFromMainProcess.js)
// `localServer` - the llama-server bundled with tC (llamaServerManager.js), serving the models in
// ~/translationCore/models. Pass `localServer: true` in the options of `query` and `getAvailableModels` to use
// it (the server starts on demand), and `model` set to one of the model ids. `localServer.start/stop/getStatus/
// getModels` control it directly. Check `(await localServer.getStatus()).available` - it isn't bundled for
// every platform.
const AI_API_FEATURES = Object.freeze({ messages: true, localServer: true });

const localServer = Object.freeze({
  start: (options = {}) => ipcRenderer.invoke('ai-apis:local-server-start', options),
  stop: () => ipcRenderer.invoke('ai-apis:local-server-stop'),
  getStatus: () => ipcRenderer.invoke('ai-apis:local-server-status'),
  getModels: () => ipcRenderer.invoke('ai-apis:local-server-models'),
});

window.lmStudio = {
  getApi: (options = {}) => ipcRenderer.invoke('ai-apis:get-api', options),
  getAvailableModels: (options = {}) => ipcRenderer.invoke('ai-apis:get-available-models', options),
  query: (query, options = {}) => ipcRenderer.invoke('ai-apis:query', query, options),
  localServer,
  features: AI_API_FEATURES,
};

window.AiAPIs = {
  getApi: (options = {}) => ipcRenderer.invoke('ai-apis:get-api', options),
  getAvailableModels: (options = {}) => ipcRenderer.invoke('ai-apis:get-available-models', options),
  query: (query, options = {}) => ipcRenderer.invoke('ai-apis:query', query, options),
  localServer,
  features: AI_API_FEATURES,
};

