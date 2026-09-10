// Preload Script - set variables to be used by splash screen

const { ipcRenderer } = require('electronite');

console.log(`started preloadLmStudio`);

window.lmStudio = {
  getApi: (options = {}) => ipcRenderer.invoke('lm-studio:get-api', options),
  getAvailableModels: (options = {}) => ipcRenderer.invoke('lm-studio:get-available-models', options),
  query: (query, options = {}) => ipcRenderer.invoke('lm-studio:query', query, options),
};
