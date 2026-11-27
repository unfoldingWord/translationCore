// Preload Script - set variables to be used by splash screen

// TRICKY: use the built-in 'electron' module, not 'electronite' - preloads are copied into the build without
// bundling, and the packaged app has no node_modules (see preloadSplash.js)
const { ipcRenderer } = require('electron');

console.log(`started preloadAiApi`);

// what this version's AI bridge supports, so the checking tools can tell it from an older one:
// `messages` - `query` sends `options.messages` (a list of chat messages) in place of
// `options.systemPrompt` and the query, when the list is valid (queryAiApisFromMainProcess.js)
// `localServer` - the llama-server bundled with tC (llamaServerManager.js), serving the models in
// ~/translationCore/models. Pass `localServer: true` in the options of `query` and `getAvailableModels` to use
// it (the server starts on demand), and `model` set to one of the model ids. `localServer.start/stop/getStatus/
// getModels` control it directly. Check `(await localServer.getStatus()).available` - it isn't bundled for
// every platform.
// `modelUpdates` - `models.checkForUpdates()` compares ~/translationCore/models with the models in the GitHub release
// (modelUpdater.js), and `models.download(updates, onProgress)` downloads the chosen ones.
const AI_API_FEATURES = Object.freeze({
  messages: true, localServer: true, modelUpdates: true,
});

const localServer = Object.freeze({
  start: (options = {}) => ipcRenderer.invoke('ai-apis:local-server-start', options),
  stop: () => ipcRenderer.invoke('ai-apis:local-server-stop'),
  getStatus: () => ipcRenderer.invoke('ai-apis:local-server-status'),
  getModels: () => ipcRenderer.invoke('ai-apis:local-server-models'),
});

const models = Object.freeze({
  checkForUpdates: () => ipcRenderer.invoke('ai-apis:models-check-updates'),
  download: async (updates, onProgress) => {
    const listener = (event, progress) => onProgress && onProgress(progress);
    ipcRenderer.on('ai-apis:models-download-progress', listener);

    try {
      return await ipcRenderer.invoke('ai-apis:models-download', updates);
    } finally {
      ipcRenderer.removeListener('ai-apis:models-download-progress', listener);
    }
  },
  cancelDownload: () => ipcRenderer.invoke('ai-apis:models-cancel-download'),
});

window.lmStudio = {
  getApi: (options = {}) => ipcRenderer.invoke('ai-apis:get-api', options),
  getAvailableModels: (options = {}) => ipcRenderer.invoke('ai-apis:get-available-models', options),
  query: (query, options = {}) => ipcRenderer.invoke('ai-apis:query', query, options),
  localServer,
  models,
  features: AI_API_FEATURES,
};

window.AiAPIs = {
  getApi: (options = {}) => ipcRenderer.invoke('ai-apis:get-api', options),
  getAvailableModels: (options = {}) => ipcRenderer.invoke('ai-apis:get-available-models', options),
  query: (query, options = {}) => ipcRenderer.invoke('ai-apis:query', query, options),
  localServer,
  models,
  features: AI_API_FEATURES,
};

