// Preload Script - set variables to be used by splash screen

const { ipcRenderer } = require('electronite');

console.log(`started preloadAiApi`);

window.lmStudio = {
  getApi: (options = {}) => ipcRenderer.invoke('ai-apis:get-api', options),
  getAvailableModels: (options = {}) => ipcRenderer.invoke('ai-apis:get-available-models', options),
  query: (query, options = {}) => ipcRenderer.invoke('ai-apis:query', query, options),
};

window.AiAPIs = {
  getApi: (options = {}) => ipcRenderer.invoke('ai-apis:get-api', options),
  getAvailableModels: (options = {}) => ipcRenderer.invoke('ai-apis:get-available-models', options),
  query: (query, options = {}) => ipcRenderer.invoke('ai-apis:query', query, options),
};

