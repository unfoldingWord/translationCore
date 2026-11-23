// Preload Script - set variables to be used by splash screen

const { ipcRenderer } = require('electronite');

console.log(`started preloadAiApi`);

// what this version's AI bridge supports, so the checking tools can tell it from an older one:
// `messages` - `query` sends `options.messages` (a list of chat messages) in place of
// `options.systemPrompt` and the query, when the list is valid (queryAiApisFromMainProcess.js)
const AI_API_FEATURES = Object.freeze({ messages: true });

window.lmStudio = {
  getApi: (options = {}) => ipcRenderer.invoke('ai-apis:get-api', options),
  getAvailableModels: (options = {}) => ipcRenderer.invoke('ai-apis:get-available-models', options),
  query: (query, options = {}) => ipcRenderer.invoke('ai-apis:query', query, options),
  features: AI_API_FEATURES,
};

window.AiAPIs = {
  getApi: (options = {}) => ipcRenderer.invoke('ai-apis:get-api', options),
  getAvailableModels: (options = {}) => ipcRenderer.invoke('ai-apis:get-available-models', options),
  query: (query, options = {}) => ipcRenderer.invoke('ai-apis:query', query, options),
  features: AI_API_FEATURES,
};

